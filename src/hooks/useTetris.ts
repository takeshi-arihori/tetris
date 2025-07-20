'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, GameAction, GameConfig } from '@/types/tetris'
import { TetrisGameEngine } from '@/lib/tetris/gameEngine'
import { useKeyboard } from './useKeyboard'

interface UseTetrisProps {
  config?: Partial<GameConfig>
  onGameOver?: (state: GameState) => void
  onLinesCleared?: (lines: number, state: GameState) => void
}

export function useTetris({ config, onGameOver, onLinesCleared }: UseTetrisProps = {}) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const engineRef = useRef<TetrisGameEngine | null>(null)
  
  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedOnGameOver = useCallback((state: GameState) => {
    onGameOver?.(state)
  }, [onGameOver])
  
  const memoizedOnLinesCleared = useCallback((lines: number, state: GameState) => {
    onLinesCleared?.(lines, state)
  }, [onLinesCleared])
  
  // Initialize game engine
  useEffect(() => {
    const engine = new TetrisGameEngine(config)
    engineRef.current = engine
    
    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state)
      },
      onGameOver: (state) => {
        setGameState(state)
        memoizedOnGameOver(state)
      },
      onLinesCleared: (lines, state) => {
        setGameState(state)
        memoizedOnLinesCleared(lines, state)
      },
    })
    
    setGameState(engine.getState())
    
    return () => {
      engine.destroy()
    }
  }, [config, memoizedOnGameOver, memoizedOnLinesCleared])
  
  const handleAction = useCallback((action: GameAction) => {
    if (!engineRef.current) return
    
    if (action === GameAction.PAUSE) {
      engineRef.current.pauseGame()
    } else if (action === GameAction.RESTART) {
      engineRef.current.restartGame()
    } else {
      engineRef.current.handleAction(action)
    }
  }, [])
  
  const startGame = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.startGame()
  }, [])
  
  const pauseGame = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.pauseGame()
  }, [])
  
  const restartGame = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.restartGame()
  }, [])
  
  // Enable keyboard controls
  useKeyboard({
    onAction: handleAction,
    enabled: gameState?.isPlaying && !gameState?.isPaused,
  })
  
  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    handleAction,
  }
}