'use client'

import type { RankingData } from '@/lib/ranking/ranking-service'

interface RankingCardProps {
  ranking: RankingData
  isCurrentUser?: boolean
  showPeriod?: boolean
}

export function RankingCard({ ranking, isCurrentUser = false, showPeriod = false }: RankingCardProps) {
  const getRankDisplay = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return position
  }

  const getRankColor = (position: number) => {
    if (position === 1) return 'text-yellow-400'
    if (position === 2) return 'text-gray-300'
    if (position === 3) return 'text-amber-600'
    if (position <= 10) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getBgColor = () => {
    if (isCurrentUser) return 'bg-blue-900/30 border border-blue-500'
    if (ranking.rankPosition <= 3) return 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20'
    return 'bg-gray-700/50 hover:bg-gray-700/70'
  }

  const formatScore = (score: number) => {
    return score.toLocaleString('ja-JP')
  }

  const formatPeriod = () => {
    if (!showPeriod || !ranking.periodStart || !ranking.periodEnd) return null
    
    const start = new Date(ranking.periodStart)
    const end = new Date(ranking.periodEnd)
    
    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
  }

  return (
    <div className={`${getBgColor()} rounded-lg p-4 transition-all duration-200`}>
      <div className="flex items-center justify-between">
        {/* 順位とユーザー情報 */}
        <div className="flex items-center gap-4 flex-1">
          {/* 順位 */}
          <div className={`text-2xl font-bold ${getRankColor(ranking.rankPosition)} min-w-[3rem] text-center`}>
            {getRankDisplay(ranking.rankPosition)}
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                {ranking.username}
              </h3>
              {isCurrentUser && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  あなた
                </span>
              )}
            </div>
            
            {showPeriod && (
              <p className="text-sm text-gray-400">
                {formatPeriod()}
              </p>
            )}
          </div>
        </div>

        {/* スコア情報 */}
        <div className="text-right">
          <div className="text-xl font-bold text-white">
            {formatScore(ranking.score)}
          </div>
          <div className="text-sm text-gray-400">
            Level {ranking.level}
          </div>
        </div>
      </div>

      {/* 追加情報（トップ3の場合） */}
      {ranking.rankPosition <= 3 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">達成レベル</span>
            <span className="text-white font-medium">Level {ranking.level}</span>
          </div>
        </div>
      )}
    </div>
  )
}