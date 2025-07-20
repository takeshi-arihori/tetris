'use client'

import { useState } from 'react'
import { useRanking, useUserRank } from '@/hooks/useRanking'
import { useAuthStore } from '@/lib/auth/store'
import { RankingCard } from './RankingCard'
import { UserRankCard } from './UserRankCard'
import { RankingFilters } from './RankingFilters'
import type { RankType } from '@/lib/ranking/ranking-service'

interface RankingBoardProps {
  initialRankType?: RankType
  showUserRank?: boolean
  limit?: number
}

export function RankingBoard({ 
  initialRankType = 'overall', 
  showUserRank = true,
  limit = 100 
}: RankingBoardProps) {
  const [selectedRankType, setSelectedRankType] = useState<RankType>(initialRankType)
  const { user } = useAuthStore()
  
  const { 
    rankings, 
    loading: rankingsLoading, 
    error: rankingsError, 
    refresh: refreshRankings 
  } = useRanking({ 
    rankType: selectedRankType, 
    limit,
    autoRefresh: true,
    refreshInterval: 60000 // 1分間隔で自動更新
  })

  const { 
    userRanks, 
    loading: userRankLoading, 
    error: userRankError,
    refresh: refreshUserRanks 
  } = useUserRank({ 
    userId: user?.id || null,
    autoRefresh: true,
    refreshInterval: 60000
  })

  const handleRefresh = async () => {
    await Promise.all([
      refreshRankings(),
      showUserRank && user ? refreshUserRanks() : Promise.resolve()
    ])
  }

  const currentUserRank = userRanks ? userRanks[selectedRankType] : null

  if (rankingsLoading && rankings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (rankingsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">エラーが発生しました</h3>
          <p className="text-red-300 mb-4">{rankingsError}</p>
          <button 
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-4 sm:mb-0">
          🏆 ランキング
        </h1>
        <button 
          onClick={handleRefresh}
          disabled={rankingsLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {rankingsLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </>
          ) : (
            <>
              🔄 更新
            </>
          )}
        </button>
      </div>

      {/* フィルター */}
      <RankingFilters 
        selectedRankType={selectedRankType}
        onRankTypeChange={setSelectedRankType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインランキング */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {getRankTypeName(selectedRankType)}ランキング
              </h2>
              <span className="text-sm text-gray-400">
                {rankings.length}人
              </span>
            </div>

            {rankings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl text-gray-400 mb-2">まだランキングがありません</h3>
                <p className="text-gray-500">最初のプレイヤーになりましょう！</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.map((ranking, index) => (
                  <RankingCard 
                    key={`${ranking.userId}-${selectedRankType}`}
                    ranking={ranking}
                    isCurrentUser={user?.id === ranking.userId}
                    showPeriod={selectedRankType !== 'overall'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ユーザー情報サイドバー */}
        {showUserRank && (
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">あなたの順位</h2>
              
              {user ? (
                <UserRankCard 
                  userRanks={userRanks}
                  loading={userRankLoading}
                  error={userRankError}
                  selectedRankType={selectedRankType}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg text-gray-400 mb-2">ログインが必要です</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    ランキングを確認するにはログインしてください
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    ログイン
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getRankTypeName(rankType: RankType): string {
  const names = {
    overall: '総合',
    weekly: '週間',
    monthly: '月間',
    yearly: '年間'
  }
  return names[rankType]
}