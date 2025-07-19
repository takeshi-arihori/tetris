'use client'

import { useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { BGMTrack, SFXType, BGM_CONFIGS, SFX_CONFIGS } from '@/lib/audio/types'

interface AudioTestPanelProps {
  className?: string
}

export default function AudioTestPanel({ className = '' }: AudioTestPanelProps) {
  const { 
    isInitialized, 
    playBGM, 
    stopBGM, 
    switchBGM, 
    playSFX,
    onGameStart,
    onGameOver,
    onStageClear,
    onBlockDrop,
    onLineClear,
    onRotate,
    audioManager
  } = useAudio()

  const [currentBGM, setCurrentBGM] = useState<BGMTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!isInitialized) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const handleBGMPlay = async (track: BGMTrack) => {
    try {
      if (currentBGM === track && isPlaying) {
        stopBGM()
        setIsPlaying(false)
        setCurrentBGM(null)
      } else {
        await playBGM(track)
        setCurrentBGM(track)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('BGM再生エラー:', error)
    }
  }

  const handleBGMSwitch = async (track: BGMTrack) => {
    try {
      await switchBGM(track, 1000)
      setCurrentBGM(track)
      setIsPlaying(true)
    } catch (error) {
      console.error('BGM切り替えエラー:', error)
    }
  }

  const handleSFXPlay = async (type: SFXType) => {
    try {
      await playSFX(type)
    } catch (error) {
      console.error('効果音再生エラー:', error)
    }
  }

  const handleStop = () => {
    stopBGM()
    setIsPlaying(false)
    setCurrentBGM(null)
  }

  const bgmTracks = Object.keys(BGM_CONFIGS) as BGMTrack[]
  const sfxTypes = Object.keys(SFX_CONFIGS) as SFXType[]

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 space-y-6 ${className}`}>
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🎵 音響システムテスト</h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className={`px-2 py-1 rounded ${isInitialized ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isInitialized ? '✓ 初期化済み' : '⚠ 未初期化'}
          </span>
          {currentBGM && (
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
              🎶 {currentBGM}
            </span>
          )}
        </div>
      </div>

      {/* BGMテスト */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">BGM テスト</h4>
        <div className="flex flex-wrap gap-2">
          {bgmTracks.map((track) => (
            <button
              key={track}
              onClick={() => handleBGMPlay(track)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentBGM === track && isPlaying
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {track}
              {currentBGM === track && isPlaying && ' ⏸'}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleStop}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            disabled={!isPlaying}
          >
            ⏹ 停止
          </button>
        </div>
      </div>

      {/* BGM切り替えテスト */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">BGM フェード切り替え</h4>
        <div className="flex flex-wrap gap-2">
          {bgmTracks.map((track) => (
            <button
              key={`switch-${track}`}
              onClick={() => handleBGMSwitch(track)}
              className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              disabled={!isPlaying}
            >
              → {track}
            </button>
          ))}
        </div>
      </div>

      {/* 効果音テスト */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">効果音テスト</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {sfxTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleSFXPlay(type)}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ゲームイベントテスト */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">ゲームイベント</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={onGameStart}
            className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
          >
            🎮 ゲーム開始
          </button>
          <button
            onClick={onGameOver}
            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            💀 ゲームオーバー
          </button>
          <button
            onClick={onStageClear}
            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            🏆 ステージクリア
          </button>
          <button
            onClick={onBlockDrop}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            📦 ブロック落下
          </button>
          <button
            onClick={() => onLineClear(1)}
            className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            ✨ 1ライン消去
          </button>
          <button
            onClick={() => onLineClear(4)}
            className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            🔥 4ライン消去
          </button>
          <button
            onClick={onRotate}
            className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
          >
            🔄 回転
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      {audioManager && (
        <div className="pt-4 border-t">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              🔍 デバッグ情報
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
              {JSON.stringify(audioManager.getStats(), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}