'use client'

import type { DetailedStatistics } from '@/lib/profile/statistics'

interface PersonalBestsProps {
  statistics: DetailedStatistics | null
}

export function PersonalBests({ statistics }: PersonalBestsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!statistics) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🏆 個人ベスト</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const bestRecords = [
    {
      title: '最高スコア',
      value: statistics.bestScore.toLocaleString('ja-JP'),
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: '最高レベル',
      value: `Level ${statistics.bestLevel}`,
      icon: '🎯',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: '最多ライン消去',
      value: `${statistics.bestLines.toLocaleString('ja-JP')}ライン`,
      icon: '🧱',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: '最長プレイ時間',
      value: formatDuration(statistics.longestPlay),
      icon: '⏱️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '最多テトロミノ',
      value: `${statistics.mostTetrominos.toLocaleString('ja-JP')}個`,
      icon: '🎮',
      color: 'from-red-500 to-rose-500'
    }
  ]

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">🏆 個人ベスト</h2>
      
      <div className="space-y-4">
        {bestRecords.map((record, index) => (
          <div key={index} className="relative overflow-hidden">
            {/* 背景グラデーション */}
            <div className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-10 rounded-lg`}></div>
            
            <div className="relative bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{record.icon}</div>
                  <div>
                    <h3 className="font-medium text-white">{record.title}</h3>
                    <p className="text-sm text-gray-400">過去最高記録</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{record.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 改善可能性のヒント */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium text-sm mb-2">💡 記録更新のコツ</h4>
        <ul className="text-blue-200 text-xs space-y-1">
          <li>• T-Spinテクニックを習得してスコアアップ</li>
          <li>• より高いレベルを目指してスピードアップ</li>
          <li>• 連続プレイで集中力と持久力を向上</li>
          <li>• 効率的なライン消去で記録更新</li>
        </ul>
      </div>

      {/* 最近の成長 */}
      {statistics.improvementRate > 0 && (
        <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-medium text-sm mb-2">📈 成長中！</h4>
          <p className="text-green-200 text-sm">
            最近のパフォーマンスが{statistics.improvementRate.toFixed(1)}%向上しています。
            この調子で頑張りましょう！
          </p>
        </div>
      )}

      {/* 一貫性スコア */}
      <div className="mt-4 bg-gray-700/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">一貫性スコア</span>
          <span className="text-white font-bold">{statistics.consistency}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${statistics.consistency}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {statistics.consistency >= 80 && 'とても安定したプレイです！'}
          {statistics.consistency >= 60 && statistics.consistency < 80 && '安定感があります'}
          {statistics.consistency >= 40 && statistics.consistency < 60 && 'まずまずの安定感です'}
          {statistics.consistency < 40 && 'もう少し安定感を高めましょう'}
        </p>
      </div>
    </div>
  )
}