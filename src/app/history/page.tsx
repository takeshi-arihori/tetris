'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScoreHistory } from '@/components/game/ScoreHistory';
import { PersonalBest } from '@/components/game/PersonalBest';
import { StatisticsChart } from '@/components/game/StatisticsChart';
import { useAuth } from '@/hooks/useAuth';

type TabType = 'history' | 'statistics' | 'charts';

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('history');

  // 認証チェック
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ナビゲーション */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="mr-2">←</span>
              トップページに戻る
            </Link>
          </div>

          {/* 未認証メッセージ */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ログインが必要です
            </h1>
            <p className="text-gray-600 mb-6">
              プレイ履歴や統計を確認するには、アカウントにログインしてください。
            </p>
            <div className="space-y-3">
              <Link
                href="/auth"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                ログイン・新規登録
              </Link>
              <div>
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-700"
                >
                  ゲストとしてプレイ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'history' as TabType, label: 'プレイ履歴', icon: '📋' },
    { id: 'statistics' as TabType, label: '個人記録', icon: '🏆' },
    { id: 'charts' as TabType, label: '統計チャート', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
              >
                <span className="mr-2">←</span>
                トップページに戻る
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">
                プレイ履歴・統計
              </h1>
              <p className="text-gray-600 mt-2">
                あなたのテトリスゲームの記録と成長を確認できます
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">ログイン中</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-8">
          {activeTab === 'history' && (
            <div>
              <ScoreHistory 
                showFilters={true}
                pageSize={20}
              />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <PersonalBest 
                showDetails={true}
              />
            </div>
          )}

          {activeTab === 'charts' && (
            <div>
              <StatisticsChart 
                defaultPeriod={30}
              />
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            データは自動的に保存されます。
            <Link href="/auth" className="text-blue-600 hover:text-blue-700 ml-1">
              アカウント設定
            </Link>
            でデータのエクスポートや削除が可能です。
          </p>
        </div>

        {/* ショートカット */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">クイックアクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🎮</span>
              <div>
                <div className="font-medium text-gray-800">新しいゲーム</div>
                <div className="text-sm text-gray-600">今すぐプレイ</div>
              </div>
            </Link>

            <Link
              href="/canvas-demo"
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🎨</span>
              <div>
                <div className="font-medium text-gray-800">Canvas デモ</div>
                <div className="text-sm text-gray-600">描画システム確認</div>
              </div>
            </Link>

            <Link
              href="/audio-test"
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🎵</span>
              <div>
                <div className="font-medium text-gray-800">音響テスト</div>
                <div className="text-sm text-gray-600">サウンド確認</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}