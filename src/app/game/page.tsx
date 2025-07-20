'use client'

import React, { useRef, useEffect } from 'react'
import { useTetris } from '@/hooks/useTetris'
import { GameCanvas, GameCanvasHandle } from '@/components/game/GameCanvas'
import GameLayout from '@/components/ui/GameLayout'
import GameControls from '@/components/ui/GameControls'
import ScoreDisplay from '@/components/ui/ScoreDisplay'

export default function GamePage() {
  const canvasRef = useRef<GameCanvasHandle>(null)

  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
  } = useTetris({
    onGameOver: (state) => {
      console.log('Game Over! Final Score:', state.score)
    },
    onLinesCleared: (lines, state) => {
      console.log(`Lines cleared: ${lines}`)
    }
  })

  // ゲーム状態の基本ログ出力（開発用）
  useEffect(() => {
    if (gameState) {
      console.log('Game state updated:', {
        score: gameState.score,
        level: gameState.level,
        lines: gameState.lines,
        isPlaying: gameState.isPlaying,
        isPaused: gameState.isPaused,
        isGameOver: gameState.isGameOver
      })
    }
  }, [gameState?.score, gameState?.level, gameState?.lines, gameState?.isPlaying, gameState?.isPaused, gameState?.isGameOver])

  const sidebar = (
    <div className="space-y-6">
      {/* ゲームコントロール */}
      <GameControls
        isPlaying={gameState?.isPlaying || false}
        isPaused={gameState?.isPaused || false}
        onStart={startGame}
        onPause={pauseGame}
        onRestart={restartGame}
      />

      {/* スコア表示 */}
      {gameState && (
        <ScoreDisplay
          score={gameState.score}
          level={gameState.level}
          lines={gameState.lines}
        />
      )}

      {/* 次のピース */}
      {gameState?.nextPiece && (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-3">次のピース</h3>
          <div className="flex justify-center">
            <div className="text-2xl">{gameState.nextPiece}</div>
          </div>
        </div>
      )}

      {/* ゲーム統計 */}
      {gameState && (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-3">統計</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>プレイ時間:</span>
              <span>{Math.floor(gameState.playtime / 60)}分{gameState.playtime % 60}秒</span>
            </div>
            <div className="flex justify-between">
              <span>テトロミノ数:</span>
              <span>{gameState.tetrominoCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作方法 */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-3">操作方法</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>移動:</span>
            <span>← → ↓</span>
          </div>
          <div className="flex justify-between">
            <span>回転:</span>
            <span>↑ / Z</span>
          </div>
          <div className="flex justify-between">
            <span>ハードドロップ:</span>
            <span>Space</span>
          </div>
          <div className="flex justify-between">
            <span>ホールド:</span>
            <span>C</span>
          </div>
          <div className="flex justify-between">
            <span>一時停止:</span>
            <span>P</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <GameLayout sidebar={sidebar}>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🎮 Tetris Game
        </h1>
        
        {/* ゲームキャンバス */}
        <GameCanvas
          ref={canvasRef}
          className="rounded-lg shadow-2xl"
        />

        {/* ゲーム状態表示 */}
        {gameState && (
          <div className="mt-4 text-center">
            {gameState.isGameOver && (
              <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg font-bold">
                ゲームオーバー！ スコア: {gameState.score}
              </div>
            )}
            {gameState.isPaused && !gameState.isGameOver && (
              <div className="bg-yellow-500/80 text-black px-4 py-2 rounded-lg font-bold">
                一時停止中
              </div>
            )}
            {!gameState.isPlaying && !gameState.isGameOver && (
              <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg font-bold">
                ゲーム開始を押してプレイ！
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  )
}