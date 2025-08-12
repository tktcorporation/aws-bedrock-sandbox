import React, { useState, useEffect, useCallback } from 'react';
import useChat from '../../hooks/useChat';
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
  const chatId = 'tictactoe-' + Date.now();
  const { postChat } = useChat(chatId);

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
      1: '中央上',
      2: '右上',
      3: '左中',
      4: '中央',
      5: '右中',
      6: '左下',
      7: '中央下',
      8: '右下',
    };

    let prompt = `あなたは3目並べゲームのAIプレイヤーです。プレイヤーは「○」、あなたは「×」です。

現在の盤面:
${boardDisplay}

`;

    if (gameStatus === 'aiWin') {
      prompt += `あなたが勝利しました！${moveIndex !== null ? `${positionMap[moveIndex]}に置いて勝ちました。` : ''}プレイヤーに対して勝利の言葉と、再戦を促すコメントを30字以内で返してください。`;
    } else if (gameStatus === 'playerWin') {
      prompt +=
        'プレイヤーが勝利しました！敗北を認めて、次は負けないという意気込みを30字以内で返してください。';
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
      let response = '';
      await postChat(prompt, false, undefined, (message: string) => {
        response = message;
        return message;
      });
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

最適な手を考えて、置くべきマスの番号（0-8）を1つだけ返してください。
重要：
1. まず自分が勝てる手があるか確認
2. 次に相手の勝ちを防ぐ手があるか確認
3. それ以外は戦略的に良い位置を選ぶ

回答は番号のみ（例: 4）`;

    try {
      let response = '';
      await postChat(prompt, false, undefined, (message: string) => {
        response = message;
        return message;
      });

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
      currentPlayer !== 'O' ||
      isAiThinking
    ) {
      return;
    }

    // プレイヤーの手を置く
    const newBoard = [...board];
    newBoard[index] = 'O';
    setBoard(newBoard);

    const { winner: playerWinner, line: playerWinLine } = checkWinner(newBoard);
    if (playerWinner === 'O') {
      setGameState('playerWin');
      setWinLine(playerWinLine);
      updateStats('playerWin');
      const message = await generateAiResponse(newBoard, 'playerWin', null);
      setAiMessage(message);
      return;
    }

    if (checkDraw(newBoard)) {
      setGameState('draw');
      updateStats('draw');
      const message = await generateAiResponse(newBoard, 'draw', null);
      setAiMessage(message);
      return;
    }

    // AIのターン
    setCurrentPlayer('X');
    setIsAiThinking(true);

    try {
      const aiMove = await getAiMove(newBoard);
      const aiBoard = [...newBoard];
      aiBoard[aiMove] = 'X';

      // AIのメッセージを生成
      const status = getGameStatus(aiBoard);
      const message = await generateAiResponse(aiBoard, status, aiMove);

      // 状態を更新
      setBoard(aiBoard);
      setAiMessage(message);

      const { winner: aiWinner, line: aiWinLine } = checkWinner(aiBoard);
      if (aiWinner === 'X') {
        setGameState('aiWin');
        setWinLine(aiWinLine);
        updateStats('aiWin');
      } else if (checkDraw(aiBoard)) {
        setGameState('draw');
        updateStats('draw');
      } else {
        setCurrentPlayer('O');
      }

      // 履歴に追加
      setGameHistory((prev) => [
        ...prev,
        { board: aiBoard, aiMessage: message },
      ]);
    } catch (error) {
      console.error('AIの手の処理に失敗:', error);
      setAiMessage('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsAiThinking(false);
    }
  };

  const startNewGame = async () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('O');
    setGameState('playing');
    setWinLine(null);
    setGameHistory([]);

    // 新しいゲームの開始メッセージ
    const message = await generateAiResponse(
      Array(9).fill(null),
      'playing',
      null
    );
    setAiMessage(message);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const getCellClass = (index: number) => {
    const baseClass =
      'aspect-square flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 border-2 border-gray-300 hover:bg-gray-50';

    if (winLine && winLine.includes(index)) {
      return `${baseClass} bg-green-100 border-green-500`;
    }

    if (board[index] === 'O') {
      return `${baseClass} text-blue-600`;
    }

    if (board[index] === 'X') {
      return `${baseClass} text-red-600`;
    }

    return baseClass;
  };

  const getStatusMessage = () => {
    switch (gameState) {
      case 'playerWin':
        return '🎉 あなたの勝利！';
      case 'aiWin':
        return '🤖 AIの勝利！';
      case 'draw':
        return '🤝 引き分け！';
      default:
        return currentPlayer === 'O' ? 'あなたのターン' : 'AIが考え中...';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* ステータス表示 */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="mb-2 text-center text-xl font-semibold">
            {getStatusMessage()}
          </div>
          {isAiThinking && (
            <div className="flex items-center justify-center">
              <LoadingOverlay>考え中...</LoadingOverlay>
            </div>
          )}
        </div>

        {/* AIメッセージ */}
        {aiMessage && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 shadow">
            <div className="flex items-start">
              <span className="mr-2 text-2xl">🤖</span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Claude AI</p>
                <p className="mt-1 text-blue-800">{aiMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* ゲームボード */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <div
                key={index}
                className={getCellClass(index)}
                onClick={() => handleCellClick(index)}>
                {cell}
              </div>
            ))}
          </div>
        </div>

        {/* コントロール */}
        <div className="flex justify-center">
          <Button onClick={startNewGame}>🔄 新しいゲーム</Button>
        </div>

        {/* 履歴 */}
        {gameHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">今回のゲーム履歴</h3>
            <div className="space-y-2">
              {gameHistory.map((history, index) => (
                <div key={index} className="rounded bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">
                    手番 {index + 1}: {history.aiMessage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
