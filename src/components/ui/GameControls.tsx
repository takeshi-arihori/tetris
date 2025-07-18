'use client'

import React from 'react'
import Button from './Button'

interface GameControlsProps {
  isPlaying: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onRestart: () => void
  onSettings?: () => void
  className?: string
}

export default function GameControls({
  isPlaying,
  isPaused,
  onStart,
  onPause,
  onRestart,
  onSettings,
  className = ''
}: GameControlsProps) {
  return (
    <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">ゲームコントロール</h3>
      
      <div className="space-y-3">
        {!isPlaying ? (
          <Button
            variant="tetris"
            size="lg"
            onClick={onStart}
            className="w-full"
          >
            ゲーム開始
          </Button>
        ) : (
          <Button
            variant={isPaused ? "success" : "warning"}
            size="lg"
            onClick={onPause}
            className="w-full"
          >
            {isPaused ? "再開" : "一時停止"}
          </Button>
        )}
        
        <Button
          variant="danger"
          size="md"
          onClick={onRestart}
          className="w-full"
          disabled={!isPlaying}
        >
          リスタート
        </Button>
        
        {onSettings && (
          <Button
            variant="outline"
            size="md"
            onClick={onSettings}
            className="w-full"
          >
            設定
          </Button>
        )}
      </div>
    </div>
  )
}