'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AudioManager, getAudioManager } from '@/lib/audio/AudioManager'
import { AudioSettings, BGMTrack, SFXType } from '@/lib/audio/types'

interface UseAudioReturn {
  audioManager: AudioManager | null
  isInitialized: boolean
  settings: AudioSettings | null
  isLoading: boolean
  error: string | null
  
  // 制御メソッド
  playBGM: (track: BGMTrack) => Promise<void>
  stopBGM: () => void
  pauseBGM: () => void
  resumeBGM: () => void
  switchBGM: (track: BGMTrack, fadeDuration?: number) => Promise<void>
  playSFX: (type: SFXType, options?: { volume?: number }) => Promise<void>
  
  // 設定メソッド
  updateSettings: (newSettings: Partial<AudioSettings>) => void
  mute: () => void
  unmute: () => void
  
  // ゲーム連動メソッド
  onGameStart: () => void
  onGameOver: () => void
  onStageClear: () => void
  onBlockDrop: () => void
  onLineClear: (lineCount: number) => void
  onRotate: () => void
  onPause: () => void
  onResume: () => void
  onLevelUp: (newLevel: number) => Promise<void>
}

export const useAudio = (): UseAudioReturn => {
  const [audioManager, setAudioManager] = useState<AudioManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [settings, setSettings] = useState<AudioSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initializationRef = useRef(false)

  // AudioManager初期化
  useEffect(() => {
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeAudioManager = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const manager = getAudioManager()
        await manager.initialize()
        
        setAudioManager(manager)
        setSettings(manager.getSettings())
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to initialize audio manager:', err)
        setError(err instanceof Error ? err.message : 'Audio initialization failed')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAudioManager()

    // クリーンアップ
    return () => {
      if (audioManager) {
        audioManager.destroy()
      }
    }
  }, [])

  // BGM制御
  const playBGM = useCallback(async (track: BGMTrack) => {
    if (!audioManager) return
    try {
      await audioManager.playBGM(track)
    } catch (err) {
      console.error('Failed to play BGM:', err)
    }
  }, [audioManager])

  const stopBGM = useCallback(() => {
    if (!audioManager) return
    audioManager.stopBGM()
  }, [audioManager])

  const pauseBGM = useCallback(() => {
    if (!audioManager) return
    audioManager.pauseBGM()
  }, [audioManager])

  const resumeBGM = useCallback(() => {
    if (!audioManager) return
    audioManager.resumeBGM()
  }, [audioManager])

  const switchBGM = useCallback(async (track: BGMTrack, fadeDuration?: number) => {
    if (!audioManager) return
    try {
      await audioManager.switchBGM(track, fadeDuration)
    } catch (err) {
      console.error('Failed to switch BGM:', err)
    }
  }, [audioManager])

  // SFX制御
  const playSFX = useCallback(async (type: SFXType, options?: { volume?: number }) => {
    if (!audioManager) return
    try {
      await audioManager.playSFX(type, options)
    } catch (err) {
      console.error('Failed to play SFX:', err)
    }
  }, [audioManager])

  // 設定更新
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    if (!audioManager) return
    audioManager.setSettings(newSettings)
    setSettings(audioManager.getSettings())
  }, [audioManager])

  const mute = useCallback(() => {
    updateSettings({ muted: true })
  }, [updateSettings])

  const unmute = useCallback(() => {
    updateSettings({ muted: false })
  }, [updateSettings])

  // ゲーム連動メソッド
  const onGameStart = useCallback(() => {
    if (!audioManager) return
    audioManager.onGameStart()
  }, [audioManager])

  const onGameOver = useCallback(() => {
    if (!audioManager) return
    audioManager.onGameOver()
  }, [audioManager])

  const onStageClear = useCallback(() => {
    if (!audioManager) return
    audioManager.onStageClear()
  }, [audioManager])

  const onBlockDrop = useCallback(() => {
    if (!audioManager) return
    audioManager.onBlockDrop()
  }, [audioManager])

  const onLineClear = useCallback((lineCount: number) => {
    if (!audioManager) return
    audioManager.onLineClear(lineCount)
  }, [audioManager])

  const onRotate = useCallback(() => {
    if (!audioManager) return
    audioManager.onRotate()
  }, [audioManager])

  const onPause = useCallback(() => {
    if (!audioManager) return
    audioManager.onPause()
  }, [audioManager])

  const onResume = useCallback(() => {
    if (!audioManager) return
    audioManager.onResume()
  }, [audioManager])

  const onLevelUp = useCallback(async (newLevel: number) => {
    if (!audioManager) return
    try {
      await audioManager.onLevelUp(newLevel)
    } catch (err) {
      console.error('Failed to handle level up:', err)
    }
  }, [audioManager])

  return {
    audioManager,
    isInitialized,
    settings,
    isLoading,
    error,
    
    // 制御メソッド
    playBGM,
    stopBGM,
    pauseBGM,
    resumeBGM,
    switchBGM,
    playSFX,
    
    // 設定メソッド
    updateSettings,
    mute,
    unmute,
    
    // ゲーム連動メソッド
    onGameStart,
    onGameOver,
    onStageClear,
    onBlockDrop,
    onLineClear,
    onRotate,
    onPause,
    onResume,
    onLevelUp
  }
}