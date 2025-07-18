import React from 'react'

interface ScoreDisplayProps {
  score: number
  level: number
  lines: number
  className?: string
}

export default function ScoreDisplay({ score, level, lines, className = '' }: ScoreDisplayProps) {
  return (
    <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">スコア</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">得点</span>
          <span className="text-2xl font-bold text-purple-400">
            {score.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">レベル</span>
          <span className="text-xl font-bold text-blue-400">
            {level}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">ライン</span>
          <span className="text-xl font-bold text-green-400">
            {lines}
          </span>
        </div>
      </div>
    </div>
  )
}