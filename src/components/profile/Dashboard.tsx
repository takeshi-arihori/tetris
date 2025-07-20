'use client'

import { useState } from 'react'
import { useProfile, useStatistics } from '@/hooks/useProfile'
import { useUserRank } from '@/hooks/useRanking'
import { useAuthStore } from '@/lib/auth/store'
import { StatisticsChart } from './StatisticsChart'
import { GameHistory } from './GameHistory'
import { PersonalBests } from './PersonalBests'

export function Dashboard() {
  const { user } = useAuthStore()
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const { 
    profile, 
    settings, 
    loading: profileLoading, 
    error: profileError 
  } = useProfile({ 
    userId: user?.id || null,
    autoRefresh: true,
    refreshInterval: 300000 // 5分間隔
  })

  const { 
    statistics, 
    trendData, 
    loading: statsLoading, 
    error: statsError,
    refreshTrends 
  } = useStatistics({ 
    userId: user?.id || null,
    autoRefresh: true,
    refreshInterval: 300000
  })

  const { 
    userRanks, 
    loading: rankLoading 
  } = useUserRank({ 
    userId: user?.id || null,
    autoRefresh: true,
    refreshInterval: 60000 // 1分間隔
  })

  const handlePeriodChange = async (days: number) => {
    setSelectedPeriod(days)
    await refreshTrends(days)
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">ログインが必要です</h2>
          <p className="text-gray-400 mb-6">
            ダッシュボードを表示するにはログインしてください
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            ログイン
          </button>
        </div>
      </div>
    )
  }

  if (profileLoading || statsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  if (profileError || statsError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">エラーが発生しました</h3>
          <p className="text-red-300">{profileError || statsError}</p>
        </div>
      </div>
    )
  }

  const formatPlaytime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  const formatScore = (score: number) => {
    return score.toLocaleString('ja-JP')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {profile?.avatarUrl && (
              <img 
                src={profile.avatarUrl} 
                alt="アバター" 
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {profile?.username}のダッシュボード
              </h1>
              <p className="text-gray-400">
                {new Date(profile?.createdAt || '').toLocaleDateString('ja-JP')}からプレイ中
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a 
              href="/profile/edit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              編集
            </a>
            <a 
              href="/profile/settings"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              設定
            </a>
          </div>
        </div>
      </div>

      {/* 概要統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="総ゲーム数"
          value={statistics?.totalGames || 0}
          icon="🎮"
          color="blue"
        />
        <StatCard
          title="最高スコア"
          value={formatScore(statistics?.bestScore || 0)}
          icon="🏆"
          color="yellow"
        />
        <StatCard
          title="総プレイ時間"
          value={formatPlaytime(statistics?.totalPlaytime || 0)}
          icon="⏱️"
          color="green"
        />
        <StatCard
          title="平均スコア"
          value={formatScore(statistics?.averageScore || 0)}
          icon="📊"
          color="purple"
        />
      </div>

      {/* ランキング情報 */}
      {userRanks && (
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🏅 あなたのランキング</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RankCard title="総合" rank={userRanks.overall} />
            <RankCard title="週間" rank={userRanks.weekly} />
            <RankCard title="月間" rank={userRanks.monthly} />
            <RankCard title="年間" rank={userRanks.yearly} />
          </div>
        </div>
      )}

      {/* チャートと履歴 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 統計チャート */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">📈 成長チャート</h2>
            <select 
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
            >
              <option value={7}>過去7日</option>
              <option value={30}>過去30日</option>
              <option value={90}>過去90日</option>
            </select>
          </div>
          <StatisticsChart 
            trendData={trendData}
            loading={false}
          />
        </div>

        {/* 個人ベスト */}
        <PersonalBests statistics={statistics} />
      </div>

      {/* ゲーム履歴 */}
      <GameHistory 
        recentGames={statistics?.recentGames || []} 
        loading={false}
      />
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    yellow: 'from-yellow-600 to-yellow-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700'
  }

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

function RankCard({ title, rank }: { title: string; rank: number | null }) {
  const getRankDisplay = (rank: number | null) => {
    if (rank === null) return '未ランク'
    if (rank === 1) return '🥇 1位'
    if (rank === 2) return '🥈 2位'
    if (rank === 3) return '🥉 3位'
    return `${rank}位`
  }

  const getRankColor = (rank: number | null) => {
    if (rank === null) return 'text-gray-500'
    if (rank <= 3) return 'text-yellow-400'
    if (rank <= 10) return 'text-blue-400'
    return 'text-white'
  }

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className={`font-bold ${getRankColor(rank)}`}>
        {getRankDisplay(rank)}
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
        <div>
          <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
        ))}
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-700 rounded-xl"></div>
        <div className="h-96 bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  )
}