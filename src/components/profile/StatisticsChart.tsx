'use client'

import { useState } from 'react'
import type { TrendData } from '@/lib/profile/statistics'

interface StatisticsChartProps {
  trendData: TrendData | null
  loading: boolean
}

type ChartType = 'score' | 'level' | 'playtime'

export function StatisticsChart({ trendData, loading }: StatisticsChartProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>('score')

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (!trendData || trendData.dates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg text-gray-400 mb-2">データが不足しています</h3>
        <p className="text-gray-500 text-sm">
          もっとゲームをプレイしてチャートを表示させましょう！
        </p>
      </div>
    )
  }

  const getChartData = () => {
    switch (selectedChart) {
      case 'score':
        return {
          data: trendData.scores,
          color: '#3B82F6',
          label: 'スコア',
          unit: '',
          format: (value: number) => value.toLocaleString('ja-JP')
        }
      case 'level':
        return {
          data: trendData.levels,
          color: '#10B981',
          label: 'レベル',
          unit: 'Lv',
          format: (value: number) => `Lv${value}`
        }
      case 'playtime':
        return {
          data: trendData.playtime,
          color: '#8B5CF6',
          label: 'プレイ時間',
          unit: '分',
          format: (value: number) => `${value}分`
        }
    }
  }

  const chartData = getChartData()
  const maxValue = Math.max(...chartData.data)
  const minValue = Math.min(...chartData.data)

  // チャート座標計算
  const chartWidth = 400
  const chartHeight = 200
  const padding = 40

  const points = chartData.data.map((value, index) => {
    const x = padding + (index / (chartData.data.length - 1)) * (chartWidth - padding * 2)
    const y = chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - padding * 2)
    return { x, y, value }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="w-full">
      {/* チャート選択タブ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedChart('score')}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            selectedChart === 'score' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          スコア
        </button>
        <button
          onClick={() => setSelectedChart('level')}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            selectedChart === 'level' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          レベル
        </button>
        <button
          onClick={() => setSelectedChart('playtime')}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            selectedChart === 'playtime' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          プレイ時間
        </button>
      </div>

      {/* チャート */}
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <div className="min-w-[500px]">
          <svg 
            width={chartWidth} 
            height={chartHeight} 
            className="w-full h-auto"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* グリッド線 */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

            {/* Y軸ラベル */}
            <text 
              x={padding - 10} 
              y={padding} 
              fill="#9CA3AF" 
              fontSize="12" 
              textAnchor="end"
            >
              {chartData.format(maxValue)}
            </text>
            <text 
              x={padding - 10} 
              y={chartHeight - padding} 
              fill="#9CA3AF" 
              fontSize="12" 
              textAnchor="end"
            >
              {chartData.format(minValue)}
            </text>

            {/* グラデーション定義 */}
            <defs>
              <linearGradient id={`gradient-${selectedChart}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartData.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chartData.color} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* エリアフィル */}
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
              fill={`url(#gradient-${selectedChart})`}
            />

            {/* ライン */}
            <path
              d={pathData}
              fill="none"
              stroke={chartData.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* データポイント */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={chartData.color}
                stroke="#ffffff"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{chartData.format(point.value)}</title>
              </circle>
            ))}

            {/* X軸日付ラベル（簡略表示） */}
            {trendData.dates.map((date, index) => {
              if (index % Math.ceil(trendData.dates.length / 5) === 0) {
                const point = points[index]
                const displayDate = new Date(date).toLocaleDateString('ja-JP', { 
                  month: 'short', 
                  day: 'numeric' 
                })
                return (
                  <text
                    key={index}
                    x={point.x}
                    y={chartHeight - padding + 15}
                    fill="#9CA3AF"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {displayDate}
                  </text>
                )
              }
              return null
            })}
          </svg>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">最高値</p>
          <p className="font-bold text-white">{chartData.format(maxValue)}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">平均値</p>
          <p className="font-bold text-white">
            {chartData.format(Math.round(chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length))}
          </p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">期間</p>
          <p className="font-bold text-white">{chartData.data.length}日</p>
        </div>
      </div>
    </div>
  )
}