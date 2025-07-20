'use client'

import type { UserRankInfo, RankType } from '@/lib/ranking/ranking-service'

interface UserRankCardProps {
  userRanks: UserRankInfo | null
  loading: boolean
  error: string | null
  selectedRankType: RankType
}

export function UserRankCard({ userRanks, loading, error, selectedRankType }: UserRankCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!userRanks) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg text-gray-400 mb-2">順位なし</h3>
        <p className="text-gray-500 text-sm">
          ゲームをプレイして順位を獲得しましょう！
        </p>
      </div>
    )
  }

  const getRankDisplay = (rank: number | null, rankType: string) => {
    if (rank === null) return '未ランク'
    if (rank === 1) return '🥇 1位'
    if (rank === 2) return '🥈 2位'
    if (rank === 3) return '🥉 3位'
    return `${rank}位`
  }

  const getRankColor = (rank: number | null) => {
    if (rank === null) return 'text-gray-500'
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-amber-600'
    if (rank <= 10) return 'text-blue-400'
    return 'text-white'
  }

  const rankTypes = [
    { key: 'overall' as const, name: '総合' },
    { key: 'weekly' as const, name: '週間' },
    { key: 'monthly' as const, name: '月間' },
    { key: 'yearly' as const, name: '年間' }
  ]

  const currentRank = userRanks[selectedRankType]

  return (
    <div className="space-y-4">
      {/* 現在選択中のランキングでの順位を強調表示 */}
      <div className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {rankTypes.find(rt => rt.key === selectedRankType)?.name}ランキング
          </span>
          <span className={`font-bold text-lg ${getRankColor(currentRank)}`}>
            {getRankDisplay(currentRank, selectedRankType)}
          </span>
        </div>
      </div>

      {/* 全ランキング一覧 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400 mb-3">全ランキング</h3>
        {rankTypes.map(({ key, name }) => {
          const rank = userRanks[key]
          const isSelected = key === selectedRankType
          
          return (
            <div 
              key={key}
              className={`flex justify-between items-center p-3 rounded ${
                isSelected ? 'bg-blue-900/30' : 'bg-gray-700/30'
              }`}
            >
              <span className={`text-sm ${isSelected ? 'text-blue-300' : 'text-gray-300'}`}>
                {name}
              </span>
              <span className={`font-medium ${getRankColor(rank)}`}>
                {getRankDisplay(rank, key)}
              </span>
            </div>
          )
        })}
      </div>

      {/* 改善のヒント */}
      {currentRank !== null && currentRank > 10 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium text-sm mb-2">💡 ランクアップのコツ</h4>
          <ul className="text-yellow-200 text-xs space-y-1">
            <li>• より高いレベルに到達する</li>
            <li>• T-Spinテクニックを習得する</li>
            <li>• ライン消去の効率を上げる</li>
          </ul>
        </div>
      )}

      {/* 上位入賞の場合の祝福メッセージ */}
      {currentRank !== null && currentRank <= 3 && (
        <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-500 rounded-lg p-4">
          <h4 className="text-yellow-400 font-bold text-sm mb-2">
            🎉 素晴らしい成績！
          </h4>
          <p className="text-yellow-200 text-xs">
            {currentRank === 1 && '王者の座に輝いています！'}
            {currentRank === 2 && '準優勝の素晴らしい成績です！'}
            {currentRank === 3 && '3位入賞おめでとうございます！'}
          </p>
        </div>
      )}
    </div>
  )
}