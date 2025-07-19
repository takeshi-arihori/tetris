'use client';

import React, { useState, useCallback } from 'react';
import { useGameRecord } from '@/hooks/useGameRecord';
import type { GameRecord, GameRecordFilters, GameRecordSort, GameMode } from '@/types/game-records';

interface ScoreHistoryProps {
  className?: string;
  showFilters?: boolean;
  pageSize?: number;
}

export const ScoreHistory: React.FC<ScoreHistoryProps> = ({
  className = '',
  showFilters = true,
  pageSize = 20
}) => {
  const {
    records,
    pagination,
    loading,
    error,
    fetchRecords,
    deleteRecord,
    setFilters,
    setSort,
    filters,
    sort,
    clearError
  } = useGameRecord({
    autoFetch: true,
    pageSize
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // フィルター状態
  const [tempFilters, setTempFilters] = useState<GameRecordFilters>(filters);

  // 時間をフォーマット
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // スコアをフォーマット
  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  // ソート変更
  const handleSortChange = (field: GameRecordSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    setSort({ field, direction: newDirection });
  };

  // フィルター適用
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  // フィルタークリア
  const clearFilters = () => {
    const emptyFilters = {};
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  // 削除確認
  const handleDeleteClick = (recordId: string) => {
    setShowDeleteConfirm(recordId);
  };

  // 削除実行
  const handleDeleteConfirm = async (recordId: string) => {
    await deleteRecord(recordId);
    setShowDeleteConfirm(null);
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    fetchRecords(page);
  };

  // ゲームモードの表示名
  const getGameModeLabel = (mode: GameMode): string => {
    const labels: Record<GameMode, string> = {
      classic: 'クラシック',
      speed: 'スピード',
      marathon: 'マラソン'
    };
    return labels[mode] || mode;
  };

  // レベルに応じた色
  const getLevelColor = (level: number): string => {
    if (level >= 8) return 'text-red-600';
    if (level >= 6) return 'text-orange-600';
    if (level >= 4) return 'text-yellow-600';
    if (level >= 2) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">プレイ履歴</h2>
          <div className="text-sm text-gray-600">
            {pagination && `${pagination.total}件中 ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}件`}
          </div>
        </div>
      </div>

      {/* フィルター */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ゲームモード
              </label>
              <select
                value={tempFilters.game_mode || ''}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  game_mode: e.target.value as GameMode || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">全て</option>
                <option value="classic">クラシック</option>
                <option value="speed">スピード</option>
                <option value="marathon">マラソン</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最小スコア
              </label>
              <input
                type="number"
                value={tempFilters.min_score || ''}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  min_score: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                レベル
              </label>
              <select
                value={tempFilters.level || ''}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  level: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <option key={level} value={level}>レベル {level}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                適用
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            読み込み中...
          </div>
        </div>
      )}

      {/* データなし */}
      {!loading && records.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <div className="text-4xl mb-2">🎮</div>
          <p>プレイ履歴がありません</p>
          <p className="text-sm">ゲームをプレイしてスコアを記録しましょう！</p>
        </div>
      )}

      {/* テーブル */}
      {!loading && records.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('score')}
                  >
                    <div className="flex items-center">
                      スコア
                      {sort.field === 'score' && (
                        <span className="ml-1">
                          {sort.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('level')}
                  >
                    <div className="flex items-center">
                      レベル
                      {sort.field === 'level' && (
                        <span className="ml-1">
                          {sort.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('lines_cleared')}
                  >
                    <div className="flex items-center">
                      ライン
                      {sort.field === 'lines_cleared' && (
                        <span className="ml-1">
                          {sort.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('duration')}
                  >
                    <div className="flex items-center">
                      時間
                      {sort.field === 'duration' && (
                        <span className="ml-1">
                          {sort.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    モード
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('created_at')}
                  >
                    <div className="flex items-center">
                      日時
                      {sort.field === 'created_at' && (
                        <span className="ml-1">
                          {sort.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatScore(record.score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getLevelColor(record.level)}`}>
                        {record.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.lines_cleared}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDuration(record.duration)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getGameModeLabel(record.game_mode)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(record.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  ページ {pagination.page} / {pagination.total_pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              削除の確認
            </h3>
            <p className="text-gray-600 mb-4">
              この記録を削除してもよろしいですか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                削除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};