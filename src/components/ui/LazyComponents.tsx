'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// 遅延読み込み用のローディングコンポーネント
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    <div className="h-32 bg-gray-700 rounded"></div>
  </div>
)

// ランキング関連コンポーネントの遅延読み込み
export const LazyRankingBoard = dynamic(
  () => import('@/components/ranking/RankingBoard').then(mod => ({ default: mod.RankingBoard })),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// プロフィール関連コンポーネントの遅延読み込み
export const LazyDashboard = dynamic(
  () => import('@/components/profile/Dashboard').then(mod => ({ default: mod.Dashboard })),
  {
    loading: () => (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const LazyProfileForm = dynamic(
  () => import('@/components/profile/ProfileForm').then(mod => ({ default: mod.ProfileForm })),
  {
    loading: () => (
      <div className="bg-gray-800 rounded-xl p-6">
        <LoadingSkeleton />
      </div>
    ),
    ssr: false
  }
)

export const LazySettings = dynamic(
  () => import('@/components/profile/Settings').then(mod => ({ default: mod.Settings })),
  {
    loading: () => (
      <div className="space-y-8">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    ),
    ssr: false
  }
)

// 統計・チャート関連コンポーネント（重い計算処理を含む）
export const LazyStatisticsChart = dynamic(
  () => import('@/components/profile/StatisticsChart').then(mod => ({ default: mod.StatisticsChart })),
  {
    loading: () => (
      <div className="w-full">
        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-16 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const LazyGameHistory = dynamic(
  () => import('@/components/profile/GameHistory').then(mod => ({ default: mod.GameHistory })),
  {
    loading: () => (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

export const LazyPersonalBests = dynamic(
  () => import('@/components/profile/PersonalBests').then(mod => ({ default: mod.PersonalBests })),
  {
    loading: () => (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// ゲーム関連の重いコンポーネント（将来の実装用）
export const LazyGameCanvas = dynamic(
  () => import('@/components/game/GameCanvas').then(mod => ({ default: mod.GameCanvas })),
  {
    loading: () => (
      <div className="bg-black rounded-lg aspect-[10/20] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
)

// 音声関連（将来の実装用）
export const LazyAudioManager = dynamic(
  () => Promise.resolve({ default: () => null }),
  {
    loading: () => null,
    ssr: false
  }
)

// ユーティリティ関数：動的インポートのヘルパー
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: () => ReactNode
) => {
  return dynamic(importFn, {
    loading: fallback || LoadingSpinner,
    ssr: false
  })
}

// 条件付き遅延読み込み
export const createConditionalLazyComponent = <T extends ComponentType<any>>(
  condition: boolean,
  importFn: () => Promise<{ default: T }>,
  fallback?: () => ReactNode
) => {
  if (!condition) {
    return fallback || (() => null)
  }
  return createLazyComponent(importFn, fallback)
}

// プリロード関数（将来的に必要になった場合）
export const preloadComponents = {
  ranking: () => import('@/components/ranking/RankingBoard'),
  profile: () => import('@/components/profile/Dashboard'),
  settings: () => import('@/components/profile/Settings'),
  statistics: () => import('@/components/profile/StatisticsChart'),
}