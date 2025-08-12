import React, { useEffect, useState } from 'react';

interface GameStatsData {
  totalGames: number;
  playerWins: number;
  aiWins: number;
  draws: number;
  lastPlayed: string | null;
}

export const GameStats: React.FC = () => {
  const [stats, setStats] = useState<GameStatsData>({
    totalGames: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    lastPlayed: null,
  });

  useEffect(() => {
    // ローカルストレージから統計を読み込む
    const loadStats = () => {
      const savedStats = localStorage.getItem('tictactoe-stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };

    loadStats();

    // イベントリスナーを設定して統計の更新を監視
    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tictactoe-stats-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'tictactoe-stats-updated',
        handleStorageChange
      );
    };
  }, []);

  const getWinRate = (wins: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((wins / total) * 100).toFixed(1)}%`;
  };

  const resetStats = () => {
    const newStats: GameStatsData = {
      totalGames: 0,
      playerWins: 0,
      aiWins: 0,
      draws: 0,
      lastPlayed: null,
    };
    setStats(newStats);
    localStorage.setItem('tictactoe-stats', JSON.stringify(newStats));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* 統計サマリー */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">📊 ゲーム統計</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalGames}
              </p>
              <p className="text-sm text-gray-600">総ゲーム数</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.playerWins}
              </p>
              <p className="text-sm text-gray-600">プレイヤー勝利</p>
            </div>

            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.aiWins}</p>
              <p className="text-sm text-gray-600">AI勝利</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.draws}</p>
              <p className="text-sm text-gray-600">引き分け</p>
            </div>
          </div>
        </div>

        {/* 勝率 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">勝率</h3>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>プレイヤー</span>
                <span className="font-semibold">
                  {getWinRate(stats.playerWins, stats.totalGames)}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.playerWins / stats.totalGames) * 100}%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>AI (Claude)</span>
                <span className="font-semibold">
                  {getWinRate(stats.aiWins, stats.totalGames)}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.aiWins / stats.totalGames) * 100}%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>引き分け</span>
                <span className="font-semibold">
                  {getWinRate(stats.draws, stats.totalGames)}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gray-500 transition-all duration-300"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.draws / stats.totalGames) * 100}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* その他の情報 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">その他の情報</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">最終プレイ日時</span>
              <span className="font-medium">
                {stats.lastPlayed
                  ? new Date(stats.lastPlayed).toLocaleString('ja-JP')
                  : 'まだプレイしていません'}
              </span>
            </div>

            {stats.totalGames > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">最多結果</span>
                  <span className="font-medium">
                    {stats.playerWins >= stats.aiWins &&
                    stats.playerWins >= stats.draws
                      ? 'プレイヤー勝利'
                      : stats.aiWins >= stats.draws
                        ? 'AI勝利'
                        : '引き分け'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">平均ゲーム結果</span>
                  <span className="font-medium">
                    {stats.playerWins > stats.aiWins
                      ? `プレイヤー優勢 (+${stats.playerWins - stats.aiWins})`
                      : stats.aiWins > stats.playerWins
                        ? `AI優勢 (+${stats.aiWins - stats.playerWins})`
                        : '互角'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* リセットボタン */}
        <div className="flex justify-center">
          <button
            onClick={resetStats}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600">
            統計をリセット
          </button>
        </div>
      </div>
    </div>
  );
};
