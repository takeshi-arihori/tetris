'use client'

import React from 'react'
import { useTetris } from '@/hooks/useTetris'
import { TETROMINO_COLORS } from '@/lib/tetris/constants'

export default function TetrisDemoPage() {
  const { gameState, startGame, pauseGame, restartGame } = useTetris({
    onGameOver: (state) => {
      console.log('Game Over! Final score:', state.score)
    },
    onLinesCleared: (lines, state) => {
      console.log(`Cleared ${lines} lines! Total: ${state.lines}`)
    },
  })

  if (!gameState) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>
  }

  const renderCell = (cell: number, key: string) => {
    let className = 'w-6 h-6 border border-gray-600 '
    
    if (cell === 0) {
      className += 'bg-gray-900'
    } else if (cell === -1) {
      className += 'bg-gray-700 opacity-50' // Shadow
    } else {
      const tetrominoTypes = ['', 'I', 'O', 'T', 'S', 'Z', 'J', 'L']
      const type = tetrominoTypes[cell] as keyof typeof TETROMINO_COLORS
      const color = TETROMINO_COLORS[type] || '#666666'
      className += `border-2 border-white/20`
      className += ` bg-[${color}]`
    }
    
    return <div key={key} className={className} style={{ backgroundColor: cell > 0 ? getBgColor(cell) : undefined }} />
  }

  const getBgColor = (cell: number): string => {
    const tetrominoTypes = ['', 'I', 'O', 'T', 'S', 'Z', 'J', 'L']
    const type = tetrominoTypes[cell] as keyof typeof TETROMINO_COLORS
    return TETROMINO_COLORS[type] || '#666666'
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Tetris Engine Demo</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Game Board */}
          <div className="bg-black p-4 rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-10 gap-0 border-2 border-white/20 p-2">
              {gameState.board.map((row, y) =>
                row.map((cell, x) => renderCell(cell, `${x}-${y}`))
              )}
            </div>
          </div>
          
          {/* Game Info */}
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">スコア</h3>
              <div className="text-2xl font-bold text-purple-400">{gameState.score.toLocaleString()}</div>
            </div>
            
            {/* Level & Lines */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">レベル & ライン</h3>
              <div className="text-lg text-blue-400">レベル: {gameState.level}</div>
              <div className="text-lg text-green-400">ライン: {gameState.lines}</div>
            </div>
            
            {/* Next Piece */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">次のピース</h3>
              <div className="text-lg text-yellow-400">{gameState.nextPiece || '?'}</div>
            </div>
            
            {/* Controls */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">コントロール</h3>
              <div className="space-y-2">
                {!gameState.isPlaying ? (
                  <button
                    onClick={startGame}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ゲーム開始
                  </button>
                ) : (
                  <button
                    onClick={pauseGame}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    {gameState.isPaused ? '再開' : '一時停止'}
                  </button>
                )}
                
                <button
                  onClick={restartGame}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  リスタート
                </button>
              </div>
            </div>
            
            {/* Game Stats */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">統計</h3>
              <div className="space-y-1 text-sm">
                <div className="text-gray-300">プレイ時間: {Math.floor(gameState.playtime / 60)}:{(gameState.playtime % 60).toString().padStart(2, '0')}</div>
                <div className="text-gray-300">テトリミノ: {gameState.tetrominoCount}</div>
                <div className="text-gray-300">状態: {gameState.isGameOver ? 'ゲームオーバー' : gameState.isPaused ? '一時停止' : gameState.isPlaying ? 'プレイ中' : '停止中'}</div>
              </div>
            </div>
            
            {/* Keyboard Controls */}
            <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-bold mb-2">キーボード操作</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <div>← → : 左右移動</div>
                <div>↓ : ソフトドロップ</div>
                <div>↑ : 回転</div>
                <div>Space : ハードドロップ</div>
                <div>P : 一時停止</div>
                <div>R : リスタート</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}