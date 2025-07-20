'use client';

import React, { useState, useEffect } from 'react';
import { useGameRecord } from '@/hooks/useGameRecord';
import { useStatistics } from '@/hooks/useStatistics';
import type { CreateGameRecordData } from '@/types/game-records';

interface GameResultProps {
  gameData: CreateGameRecordData;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onViewHistory: () => void;
  isGuest?: boolean;
  sessionId?: string;
}

export const GameResult: React.FC<GameResultProps> = ({
  gameData,
  onPlayAgain,
  onMainMenu,
  onViewHistory,
  isGuest = false,
  sessionId
}) => {
  const { createRecord } = useGameRecord();
  const { personalBests, fetchPersonalBests } = useStatistics(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPersonalBest, setIsPersonalBest] = useState({
    score: false,
    level: false,
    lines: false,
    duration: false
  });

  // ゲーム結果を保存
  useEffect(() => {
    const saveGameResult = async () => {
      setSaving(true);
      
      try {
        // 現在の個人ベストを取得
        await fetchPersonalBests();
        
        // ゲーム記録を保存
        const result = await createRecord(gameData, isGuest, sessionId);
        
        if (result.success) {
          setSaved(true);
          
          // 個人ベスト判定
          if (personalBests) {
            setIsPersonalBest({
              score: gameData.score > personalBests.best_score,
              level: gameData.level > personalBests.best_level,
              lines: gameData.lines_cleared > personalBests.best_lines,
              duration: gameData.duration > personalBests.longest_play
            });
          } else {
            // 初回プレイの場合は全て個人ベスト
            setIsPersonalBest({
              score: true,
              level: true,
              lines: true,
              duration: true
            });
          }
        }
      } catch (error) {
        console.error('Failed to save game result:', error);
      } finally {
        setSaving(false);
      }
    };

    saveGameResult();
  }, [gameData, createRecord, isGuest, sessionId, fetchPersonalBests, personalBests]);

  // 時間を分:秒形式でフォーマット
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // スコアをフォーマット
  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ゲーム終了</h2>
          {saving && (
            <p className="text-blue-600">結果を保存中...</p>
          )}
          {saved && (
            <p className="text-green-600">✅ 結果を保存しました</p>
          )}
        </div>

        {/* スコア表示 */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatScore(gameData.score)}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  スコア
                  {isPersonalBest.score && (
                    <span className="ml-1 text-yellow-500">🏆</span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {gameData.level}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  レベル
                  {isPersonalBest.level && (
                    <span className="ml-1 text-yellow-500">🏆</span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {gameData.lines_cleared}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  ライン
                  {isPersonalBest.lines && (
                    <span className="ml-1 text-yellow-500">🏆</span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(gameData.duration)}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  時間
                  {isPersonalBest.duration && (
                    <span className="ml-1 text-yellow-500">🏆</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 個人ベスト通知 */}
          {Object.values(isPersonalBest).some(Boolean) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center text-yellow-800">
                <span className="text-lg">🎉</span>
                <span className="ml-2 font-semibold">個人ベスト更新！</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {isPersonalBest.score && '• 最高スコア '}
                {isPersonalBest.level && '• 最高レベル '}
                {isPersonalBest.lines && '• 最多ライン '}
                {isPersonalBest.duration && '• 最長プレイ時間 '}
              </div>
            </div>
          )}

          {/* ゲスト向けメッセージ */}
          {isGuest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-800">
                <span className="text-lg">💡</span>
                <span className="ml-2 font-semibold">アカウント作成のご案内</span>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                アカウントを作成すると、スコアの保存や履歴の確認ができます！
              </div>
            </div>
          )}
        </div>

        {/* 統計情報 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">今回のプレイ</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">テトロミノ:</span>
              <span className="ml-1 font-medium">{gameData.tetrominos_dropped}個</span>
            </div>
            <div>
              <span className="text-gray-600">モード:</span>
              <span className="ml-1 font-medium">{gameData.game_mode || 'classic'}</span>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            もう一度プレイ
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            {!isGuest && (
              <button
                onClick={onViewHistory}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                履歴を見る
              </button>
            )}
            
            <button
              onClick={onMainMenu}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              メインメニュー
            </button>
          </div>

          {/* ゲスト向け会員登録ボタン */}
          {isGuest && (
            <button
              onClick={() => window.location.href = '/auth'}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              🚀 アカウント作成でスコア保存
            </button>
          )}
        </div>

        {/* SNSシェア */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">結果をシェア</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => {
                  const text = `テトリスで${formatScore(gameData.score)}点を獲得！レベル${gameData.level}まで到達しました！`;
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                }}
                className="px-3 py-1 bg-blue-400 hover:bg-blue-500 text-white text-sm rounded transition-colors"
              >
                Twitter
              </button>
              
              <button
                onClick={() => {
                  const text = `テトリス結果: ${formatScore(gameData.score)}点、レベル${gameData.level}`;
                  if (navigator.share) {
                    navigator.share({ title: 'テトリス結果', text });
                  } else {
                    navigator.clipboard.writeText(text);
                    alert('結果をコピーしました！');
                  }
                }}
                className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded transition-colors"
              >
                コピー
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};