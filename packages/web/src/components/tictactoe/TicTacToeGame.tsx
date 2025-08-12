import React, { useState, useEffect, useCallback } from 'react';
import useChatApi from '../../hooks/useChatApi';
import type { Model } from 'generative-ai-use-cases';

import Button from '../Button';
import LoadingOverlay from '../LoadingOverlay';

type Player = 'O' | 'X' | null;
type Board = Player[];
type GameState = 'playing' | 'playerWin' | 'aiWin' | 'draw';

interface GameHistory {
  board: Board;
  aiMessage: string;
}

export const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('O');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [aiMessage, setAiMessage] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const { predictStream } = useChatApi();

  const checkWinner = useCallback(
    (squares: Board): { winner: Player; line: number[] | null } => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // 横
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // 縦
        [0, 4, 8],
        [2, 4, 6], // 斜め
      ];

      for (const line of lines) {
        const [a, b, c] = line;
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          return { winner: squares[a], line };
        }
      }
      return { winner: null, line: null };
    },
    []
  );

  const checkDraw = (squares: Board): boolean => {
    return squares.every((square) => square !== null);
  };

  const getGameStatus = (squares: Board): GameState => {
    const { winner } = checkWinner(squares);
    if (winner === 'O') return 'playerWin';
    if (winner === 'X') return 'aiWin';
    if (checkDraw(squares)) return 'draw';
    return 'playing';
  };

  const updateStats = (result: 'playerWin' | 'aiWin' | 'draw') => {
    const statsKey = 'tictactoe-stats';
    const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{}');

    const newStats = {
      totalGames: (currentStats.totalGames || 0) + 1,
      playerWins: currentStats.playerWins || 0,
      aiWins: currentStats.aiWins || 0,
      draws: currentStats.draws || 0,
      lastPlayed: new Date().toISOString(),
    };

    if (result === 'playerWin') {
      newStats.playerWins++;
    } else if (result === 'aiWin') {
      newStats.aiWins++;
    } else if (result === 'draw') {
      newStats.draws++;
    }

    localStorage.setItem(statsKey, JSON.stringify(newStats));

    // カスタムイベントを発火して統計コンポーネントに通知
    window.dispatchEvent(new Event('tictactoe-stats-updated'));
  };

  const callAI = async (prompt: string): Promise<string> => {
    try {
      const model: Model = {
        modelId: 'amazon.nova-micro-v1:0',
        type: 'bedrock',
      };

      let fullText = '';
      const generator = predictStream({
        id: Date.now().toString(),
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const chunk of generator) {
        const lines = chunk.split('\n').filter((line) => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line as string);
            if (data.text) {
              fullText += data.text;
            }
          } catch (e) {
            // JSON解析エラーは無視
          }
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error('AI応答の生成に失敗:', error);
      throw error;
    }
  };

  const generateAiResponse = async (
    squares: Board,
    gameStatus: GameState,
    moveIndex: number | null
  ) => {
    const boardDisplay = `
    ${squares[0] || '_'} | ${squares[1] || '_'} | ${squares[2] || '_'}
    ---------
    ${squares[3] || '_'} | ${squares[4] || '_'} | ${squares[5] || '_'}
    ---------
    ${squares[6] || '_'} | ${squares[7] || '_'} | ${squares[8] || '_'}
    `;

    const positionMap: { [key: number]: string } = {
      0: '左上',
      1: '上',
      2: '右上',
      3: '左',
      4: '中央',
      5: '右',
      6: '左下',
      7: '下',
      8: '右下',
    };

    let prompt = `あなたは3目並べゲームのAIプレイヤーです。現在の盤面:\n${boardDisplay}\n\n`;

    if (gameStatus === 'aiWin') {
      prompt += 'あなたの勝利です！勝利の喜びを30字以内で表現してください。';
    } else if (gameStatus === 'playerWin') {
      prompt +=
        'プレイヤーの勝利です！悔しさと再戦への意欲を30字以内で表現してください。';
    } else if (gameStatus === 'draw') {
      prompt +=
        '引き分けです！引き分けについてのコメントと再戦を促す言葉を30字以内で返してください。';
    } else if (moveIndex !== null) {
      const emptyCount = squares.filter((s) => s === null).length;
      prompt += `あなたは${positionMap[moveIndex]}に手を置きました。現在の盤面の状況（残り${emptyCount}マス）を踏まえて、プレイヤーに対して戦略的な挑発やコメントを30字以内で返してください。`;
    } else {
      prompt +=
        'ゲーム開始です！最初の挨拶と意気込みを30字以内で返してください。';
    }

    try {
      const response = await callAI(prompt);
      return response;
    } catch (error) {
      console.error('AI応答の生成に失敗:', error);
      return moveIndex !== null ? 'いい手だね！' : 'さあ、始めよう！';
    }
  };

  const getAiMove = async (squares: Board): Promise<number> => {
    const boardDisplay = `
    ${squares[0] || '_'} | ${squares[1] || '_'} | ${squares[2] || '_'}
    ---------
    ${squares[3] || '_'} | ${squares[4] || '_'} | ${squares[5] || '_'}
    ---------
    ${squares[6] || '_'} | ${squares[7] || '_'} | ${squares[8] || '_'}
    `;

    const emptyIndices = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null) as number[];

    const prompt = `あなたは3目並べゲームのAIプレイヤーです。プレイヤーは「○」、あなたは「×」です。

現在の盤面（0-8の番号で各マスを表現）:
    0 | 1 | 2
    ---------
    3 | 4 | 5
    ---------
    6 | 7 | 8

現在の状態:
${boardDisplay}

空いているマス: ${emptyIndices.join(', ')}

戦略的に最適な手を選んでください。勝利を目指しつつ、プレイヤーの勝利も阻止してください。

回答は番号のみ（例: 4）`;

    try {
      const response = await callAI(prompt);
      const move = parseInt(response.trim());
      if (emptyIndices.includes(move)) {
        return move;
      }

      // フォールバック：ランダムに選択
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } catch (error) {
      console.error('AI手の生成に失敗:', error);
      // エラー時はランダムに選択
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
  };

  const handleCellClick = async (index: number) => {
    if (
      board[index] ||
      gameState !== 'playing' ||
      isAiThinking ||
      currentPlayer !== 'O'
    ) {
      return;
    }

    // プレイヤーの手
    const newBoard = [...board];
    newBoard[index] = 'O';
    setBoard(newBoard);

    // ゲーム状態をチェック
    const newGameState = getGameStatus(newBoard);

    if (newGameState !== 'playing') {
      const { line } = checkWinner(newBoard);
      setWinLine(line);
      setGameState(newGameState);
      updateStats(newGameState);
      const message = await generateAiResponse(newBoard, newGameState, null);
      setAiMessage(message);
      setGameHistory([...gameHistory, { board: newBoard, aiMessage: message }]);
      return;
    }

    // AIのターン
    setCurrentPlayer('X');
    setIsAiThinking(true);

    try {
      const aiMove = await getAiMove(newBoard);
      const aiBoard = [...newBoard];
      aiBoard[aiMove] = 'X';
      setBoard(aiBoard);

      const aiGameState = getGameStatus(aiBoard);
      const { line } = checkWinner(aiBoard);
      setWinLine(line);

      if (aiGameState !== 'playing') {
        setGameState(aiGameState);
        updateStats(aiGameState);
      }

      const message = await generateAiResponse(
        aiBoard,
        aiGameState,
        aiGameState === 'playing' ? aiMove : null
      );
      setAiMessage(message);
      setGameHistory([...gameHistory, { board: aiBoard, aiMessage: message }]);

      if (aiGameState === 'playing') {
        setCurrentPlayer('O');
      }
    } catch (error) {
      console.error('AIの手番でエラーが発生しました:', error);
      setAiMessage('エラーが発生しました。もう一度お試しください。');
      setCurrentPlayer('O');
    } finally {
      setIsAiThinking(false);
    }
  };

  const resetGame = async () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('O');
    setGameState('playing');
    setWinLine(null);
    setGameHistory([]);

    const initialMessage = await generateAiResponse(
      Array(9).fill(null),
      'playing',
      null
    );
    setAiMessage(initialMessage);
  };

  // 初期メッセージを設定
  useEffect(() => {
    const initializeGame = async () => {
      const initialMessage = await generateAiResponse(
        Array(9).fill(null),
        'playing',
        null
      );
      setAiMessage(initialMessage);
    };
    initializeGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getCellClassName = (index: number) => {
    const baseClasses =
      'w-24 h-24 border-2 border-gray-300 text-4xl font-bold flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors';

    const isWinningCell = winLine && winLine.includes(index);
    const cellValue = board[index];

    let colorClasses = '';
    if (isWinningCell) {
      if (cellValue === 'O') {
        colorClasses = 'bg-blue-200 text-blue-600';
      } else if (cellValue === 'X') {
        colorClasses = 'bg-red-200 text-red-600';
      }
    } else {
      if (cellValue === 'O') {
        colorClasses = 'text-blue-600';
      } else if (cellValue === 'X') {
        colorClasses = 'text-red-600';
      }
    }

    return `${baseClasses} ${colorClasses}`;
  };

  const getStatusMessage = () => {
    switch (gameState) {
      case 'playerWin':
        return '🎉 あなたの勝利です！';
      case 'aiWin':
        return '🤖 AIの勝利です！';
      case 'draw':
        return '🤝 引き分けです！';
      default:
        return currentPlayer === 'O' ? 'あなたのターン' : 'AIが考え中...';
    }
  };

  const getStatusColor = () => {
    switch (gameState) {
      case 'playerWin':
        return 'text-blue-600';
      case 'aiWin':
        return 'text-red-600';
      case 'draw':
        return 'text-yellow-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 rounded-lg bg-white p-6 shadow-lg">
      {isAiThinking && (
        <LoadingOverlay>
          <span>AI思考中...</span>
        </LoadingOverlay>
      )}

      <div className="text-center">
        <h2 className={`mb-2 text-2xl font-bold ${getStatusColor()}`}>
          {getStatusMessage()}
        </h2>
        {aiMessage && (
          <div className="mb-4 min-h-[60px] rounded-lg bg-gray-100 p-3">
            <p className="text-gray-700">{aiMessage}</p>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-0 bg-gray-200">
          {board.map((cell, index) => (
            <div
              key={index}
              className={getCellClassName(index)}
              onClick={() => handleCellClick(index)}>
              {cell}
            </div>
          ))}
        </div>
      </div>

      {gameState !== 'playing' && (
        <Button onClick={resetGame} className="px-6 py-2">
          もう一度プレイ
        </Button>
      )}

      {gameHistory.length > 0 && (
        <div className="w-full max-w-md">
          <h3 className="mb-2 text-lg font-semibold">ゲーム履歴</h3>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {gameHistory.map((history, index) => (
              <div key={index} className="border-b pb-1 text-sm text-gray-600">
                <span className="font-medium">手 {index + 1}:</span>{' '}
                {history.aiMessage}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
