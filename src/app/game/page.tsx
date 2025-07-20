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

  // Canvas描画の統合
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameState) return

    const renderer = canvas.getRenderer()
    if (!renderer) return

    // Canvas をクリア
    renderer.clear()

    // ゲーム状態をコンソールに出力（デバッグ用）
    console.log('Rendering game state:', {
      isPlaying: gameState.isPlaying,
      score: gameState.score,
      level: gameState.level,
      hasCurrentPiece: !!gameState.currentPiece,
      boardSize: gameState.board?.length
    })

    // 簡単な描画テスト（基本的なゲーム情報表示）
    try {
      // ここで実際のCanvas描画を行う予定
      // 現在は基本的なログ出力のみ
    } catch (error) {
      console.warn('Canvas rendering error:', error)
    }
  }, [gameState])

  // ゲーム開始の確認
  const handleStartGame = () => {
    console.log('Starting game...')
    startGame()
  }

  const handlePauseGame = () => {
    console.log('Pausing/Resuming game...')
    pauseGame()
  }

  const handleRestartGame = () => {
    console.log('Restarting game...')
    restartGame()
  }

  const sidebar = (
    <div className="space-y-6">
      {/* ゲームコントロール */}
      <GameControls
        isPlaying={gameState?.isPlaying || false}
        isPaused={gameState?.isPaused || false}
        onStart={handleStartGame}
        onPause={handlePauseGame}
        onRestart={handleRestartGame}
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
          <div className="mt-4 text-center space-y-2">
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
            {gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver && (
              <div className="bg-green-500/80 text-white px-4 py-2 rounded-lg font-bold">
                ゲーム実行中 🎮
              </div>
            )}
            
            {/* デバッグ情報 */}
            <div className="bg-gray-800/80 text-gray-300 px-3 py-2 rounded text-xs">
              Debug: Playing={gameState.isPlaying ? 'YES' : 'NO'} | 
              Paused={gameState.isPaused ? 'YES' : 'NO'} | 
              GameOver={gameState.isGameOver ? 'YES' : 'NO'} | 
              HasPiece={gameState.currentPiece ? 'YES' : 'NO'}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}