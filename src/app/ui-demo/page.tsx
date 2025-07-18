'use client'

import React, { useState } from 'react'
import {
  GameLayout,
  GameHeader,
  GameNavigation,
  GameSidebar,
  Button
} from '@/components/ui'

export default function UIDemoPage() {
  const [score, setScore] = useState(12540)
  const [level, setLevel] = useState(5)
  const [lines, setLines] = useState(23)
  const [nextPiece, setNextPiece] = useState('T')
  const [playtime, setPlaytime] = useState(245)
  const [tetrominoes, setTetrominoes] = useState(67)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const handleStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleRestart = () => {
    setScore(0)
    setLevel(1)
    setLines(0)
    setPlaytime(0)
    setTetrominoes(0)
    setIsPlaying(false)
    setIsPaused(false)
  }

  const handleSettings = () => {
    alert('設定画面は未実装です')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <GameHeader />
      <GameNavigation />
      
      <GameLayout
        sidebar={
          <GameSidebar
            score={score}
            level={level}
            lines={lines}
            nextPiece={nextPiece}
            playtime={playtime}
            tetrominoes={tetrominoes}
            isPlaying={isPlaying}
            isPaused={isPaused}
            onStart={handleStart}
            onPause={handlePause}
            onRestart={handleRestart}
            onSettings={handleSettings}
          />
        }
      >
        <div className="w-80 h-96 bg-gray-800 border-2 border-purple-500/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">Tetris Game</h2>
            <p className="text-gray-400 mb-4">ゲームエンジンは未実装</p>
            <div className="space-y-2">
              <Button variant="tetris" onClick={() => setScore(score + 100)}>
                スコア+100
              </Button>
              <Button variant="secondary" onClick={() => setLevel(level + 1)}>
                レベル+1
              </Button>
              <Button variant="success" onClick={() => setLines(lines + 1)}>
                ライン+1
              </Button>
            </div>
          </div>
        </div>
      </GameLayout>
    </div>
  )
}