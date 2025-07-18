import React from 'react'
import ScoreDisplay from './ScoreDisplay'
import NextPieceDisplay from './NextPieceDisplay'
import GameControls from './GameControls'
import GameStats from './GameStats'

interface GameSidebarProps {
  score: number
  level: number
  lines: number
  nextPiece?: string
  playtime: number
  tetrominoes: number
  isPlaying: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onRestart: () => void
  onSettings?: () => void
  className?: string
}

export default function GameSidebar({
  score,
  level,
  lines,
  nextPiece,
  playtime,
  tetrominoes,
  isPlaying,
  isPaused,
  onStart,
  onPause,
  onRestart,
  onSettings,
  className = ''
}: GameSidebarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ScoreDisplay score={score} level={level} lines={lines} />
      
      <NextPieceDisplay nextPiece={nextPiece} />
      
      <GameControls
        isPlaying={isPlaying}
        isPaused={isPaused}
        onStart={onStart}
        onPause={onPause}
        onRestart={onRestart}
        onSettings={onSettings}
      />
      
      <GameStats
        playtime={playtime}
        totalLines={lines}
        tetrominoes={tetrominoes}
      />
    </div>
  )
}