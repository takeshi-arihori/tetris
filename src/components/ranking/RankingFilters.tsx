'use client'

import type { RankType } from '@/lib/ranking/ranking-service'

interface RankingFiltersProps {
  selectedRankType: RankType
  onRankTypeChange: (rankType: RankType) => void
}

export function RankingFilters({ selectedRankType, onRankTypeChange }: RankingFiltersProps) {
  const rankTypes = [
    { key: 'overall' as const, name: '総合', icon: '🏆', desc: '史上最高記録' },
    { key: 'weekly' as const, name: '週間', icon: '📅', desc: '今週の記録' },
    { key: 'monthly' as const, name: '月間', icon: '📊', desc: '今月の記録' },
    { key: 'yearly' as const, name: '年間', icon: '🗓️', desc: '今年の記録' }
  ]

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rankTypes.map(({ key, name, icon, desc }) => (
          <button
            key={key}
            onClick={() => onRankTypeChange(key)}
            className={`p-4 rounded-xl transition-all duration-200 ${
              selectedRankType === key
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-bold">{name}</div>
            <div className="text-xs opacity-80">{desc}</div>
          </button>
        ))}
      </div>

      {/* 選択中の期間情報 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          {getPeriodDescription(selectedRankType)}
        </p>
      </div>
    </div>
  )
}

function getPeriodDescription(rankType: RankType): string {
  const now = new Date()
  
  switch (rankType) {
    case 'overall':
      return 'サービス開始以降の全期間での最高記録'
    
    case 'weekly':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}の記録`
    
    case 'monthly':
      return `${now.getFullYear()}年${now.getMonth() + 1}月の記録`
    
    case 'yearly':
      return `${now.getFullYear()}年の記録`
    
    default:
      return ''
  }
}