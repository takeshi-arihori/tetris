'use client';

import React from 'react';
import { useStatistics } from '@/hooks/useStatistics';

interface PersonalBestProps {
  className?: string;
  showDetails?: boolean;
}

export const PersonalBest: React.FC<PersonalBestProps> = ({
  className = '',
  showDetails = true
}) => {
  const { personalBests, statistics, loading, error, refresh } = useStatistics();

  // 時間をフォーマット
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // スコアをフォーマット
  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  // 統計計算
  const getAverageStats = () => {
    if (!statistics || statistics.total_games === 0) return null;

    return {
      averageScore: Math.round(statistics.average_score),
      averageDuration: Math.round(statistics.average_duration),
      gamesPerDay: statistics.total_games / Math.max(1, Math.floor((Date.now() - new Date(statistics.created_at).getTime()) / (1000 * 60 * 60 * 24))),
      linesPerGame: Math.round(statistics.total_lines / statistics.total_games)
    };
  };

  const averageStats = getAverageStats();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={refresh}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!personalBests || !statistics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🎮</div>
          <p>データがありません</p>
          <p className="text-sm">ゲームをプレイして記録を作成しましょう！</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">個人ベスト記録</h2>
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            🔄 更新
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ベスト記録 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">🏆 最高記録</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatScore(personalBests.best_score)}
              </div>
              <div className="text-sm text-gray-600 mt-1">最高スコア</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {personalBests.best_level}
              </div>
              <div className="text-sm text-gray-600 mt-1">最高レベル</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {personalBests.best_lines}
              </div>
              <div className="text-sm text-gray-600 mt-1">最多ライン</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(personalBests.longest_play)}
              </div>
              <div className="text-sm text-gray-600 mt-1">最長プレイ</div>
            </div>
          </div>
        </div>

        {/* 詳細統計 */}
        {showDetails && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">📊 累計統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">
                    {statistics.total_games}
                  </div>
                  <div className="text-sm text-gray-600">総プレイ回数</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">
                    {formatScore(statistics.total_score)}
                  </div>
                  <div className="text-sm text-gray-600">総スコア</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">
                    {statistics.total_lines.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">総ライン数</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">
                    {formatDuration(statistics.total_playtime)}
                  </div>
                  <div className="text-sm text-gray-600">総プレイ時間</div>
                </div>
              </div>
            </div>

            {/* 平均統計 */}
            {averageStats && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">📈 平均統計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-semibold text-blue-600">
                      {formatScore(averageStats.averageScore)}
                    </div>
                    <div className="text-sm text-gray-600">平均スコア</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">
                      {averageStats.linesPerGame}
                    </div>
                    <div className="text-sm text-gray-600">平均ライン/ゲーム</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-semibold text-orange-600">
                      {formatDuration(averageStats.averageDuration)}
                    </div>
                    <div className="text-sm text-gray-600">平均プレイ時間</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-semibold text-purple-600">
                      {Math.round(averageStats.gamesPerDay * 10) / 10}
                    </div>
                    <div className="text-sm text-gray-600">平均ゲーム/日</div>
                  </div>
                </div>
              </div>
            )}

            {/* プログレスバー */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">🎯 目標達成度</h3>
              <div className="space-y-3">
                {/* スコア目標 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>スコア目標 (100,000点)</span>
                    <span>{Math.round((personalBests.best_score / 100000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((personalBests.best_score / 100000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* レベル目標 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>レベル目標 (レベル9)</span>
                    <span>{Math.round((personalBests.best_level / 9) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((personalBests.best_level / 9) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* ライン目標 */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>ライン目標 (1,000ライン)</span>
                    <span>{Math.round((personalBests.best_lines / 1000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((personalBests.best_lines / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 最終更新 */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          最終更新: {new Date(personalBests.updated_at).toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
};