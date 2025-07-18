'use client'

import { useEffect, useCallback } from 'react'
import { GameAction } from '@/types/tetris'

interface KeyboardConfig {
  moveLeft: string[]
  moveRight: string[]
  moveDown: string[]
  rotateCW: string[]
  rotateCCW: string[]
  hardDrop: string[]
  softDrop: string[]
  pause: string[]
  restart: string[]
}

const defaultKeyConfig: KeyboardConfig = {
  moveLeft: ['ArrowLeft', 'a', 'A'],
  moveRight: ['ArrowRight', 'd', 'D'],
  moveDown: ['ArrowDown', 's', 'S'],
  rotateCW: ['ArrowUp', 'w', 'W', 'x', 'X'],
  rotateCCW: ['z', 'Z'],
  hardDrop: [' ', 'Enter'],
  softDrop: ['ArrowDown', 's', 'S'],
  pause: ['p', 'P', 'Escape'],
  restart: ['r', 'R'],
}

interface UseKeyboardProps {
  onAction: (action: GameAction) => void
  enabled?: boolean
  config?: Partial<KeyboardConfig>
}

export function useKeyboard({ onAction, enabled = true, config = {} }: UseKeyboardProps) {
  const keyConfig = { ...defaultKeyConfig, ...config }
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    const key = event.key
    let action: GameAction | null = null
    
    // Prevent default for game keys
    const gameKeys = Object.values(keyConfig).flat()
    if (gameKeys.includes(key)) {
      event.preventDefault()
    }
    
    if (keyConfig.moveLeft.includes(key)) {
      action = GameAction.MOVE_LEFT
    } else if (keyConfig.moveRight.includes(key)) {
      action = GameAction.MOVE_RIGHT
    } else if (keyConfig.moveDown.includes(key)) {
      action = GameAction.SOFT_DROP
    } else if (keyConfig.rotateCW.includes(key)) {
      action = GameAction.ROTATE_CW
    } else if (keyConfig.rotateCCW.includes(key)) {
      action = GameAction.ROTATE_CCW
    } else if (keyConfig.hardDrop.includes(key)) {
      action = GameAction.HARD_DROP
    } else if (keyConfig.pause.includes(key)) {
      action = GameAction.PAUSE
    } else if (keyConfig.restart.includes(key)) {
      action = GameAction.RESTART
    }
    
    if (action) {
      onAction(action)
    }
  }, [enabled, keyConfig, onAction])
  
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    const key = event.key
    
    // Prevent default for game keys
    const gameKeys = Object.values(keyConfig).flat()
    if (gameKeys.includes(key)) {
      event.preventDefault()
    }
  }, [enabled, keyConfig])
  
  useEffect(() => {
    if (!enabled) return
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled, handleKeyDown, handleKeyUp])
  
  return {
    keyConfig,
  }
}