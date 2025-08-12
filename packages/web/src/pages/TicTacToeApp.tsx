import React, { useState } from 'react';
import { TicTacToeGame } from '../components/tictactoe/TicTacToeGame';
import { GameStats } from '../components/tictactoe/GameStats';
import { useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';

export const TicTacToeApp: React.FC = () => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('AI対戦3目並べ');
  }, [setPageTitle]);

  const [activeTab, setActiveTab] = useState<'game' | 'stats'>('game');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🎮 AI対戦3目並べ
            </h1>
            <p className="mt-2 text-gray-600">
              Claude AIと対戦しながら会話を楽しもう！
            </p>
          </div>

          <div className="flex space-x-1 border-t pt-4">
            <button
              onClick={() => setActiveTab('game')}
              className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'game'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              🎯 ゲーム
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              📊 統計
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {activeTab === 'game' ? <TicTacToeGame /> : <GameStats />}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">遊び方:</h3>
          <ol className="list-inside list-decimal space-y-1 text-blue-800">
            <li>マス目をクリックして「○」を置きます</li>
            <li>AI（Claude）が「×」で応戦します</li>
            <li>縦・横・斜めのいずれかに3つ揃えば勝利！</li>
            <li>AIは状況に応じて様々な会話をしてくれます</li>
            <li>新しいゲームを始めるには「新しいゲーム」ボタンをクリック</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
