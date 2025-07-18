import React from 'react'

interface GameStatsProps {
  playtime: number
  totalLines: number
  tetrominoes: number
  className?: string
}

export default function GameStats({ playtime, totalLines, tetrominoes, className = '' }: GameStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">ゲーム統計</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">プレイ時間</span>
          <span className="text-lg font-mono text-blue-400">
            {formatTime(playtime)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">総ライン数</span>
          <span className="text-lg font-bold text-green-400">
            {totalLines}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">テトリミノ数</span>
          <span className="text-lg font-bold text-purple-400">
            {tetrominoes}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">効率</span>
          <span className="text-lg font-bold text-yellow-400">
            {tetrominoes > 0 ? (totalLines / tetrominoes).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
    </div>
  )
}