'use client'

import { useState, useEffect } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { AudioSettings } from '@/lib/audio/types'

interface VolumeControlProps {
  className?: string
  compact?: boolean
}

export default function VolumeControl({ className = '', compact = false }: VolumeControlProps) {
  const { settings, updateSettings, mute, unmute, isInitialized } = useAudio()
  const [tempSettings, setTempSettings] = useState<AudioSettings | null>(null)

  useEffect(() => {
    if (settings) {
      setTempSettings(settings)
    }
  }, [settings])

  if (!isInitialized || !tempSettings) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${compact ? 'h-8 w-32' : 'h-24 w-64'} ${className}`} />
    )
  }

  const handleVolumeChange = (type: 'master' | 'bgm' | 'sfx', value: number) => {
    const newSettings: Partial<AudioSettings> = {}
    
    switch (type) {
      case 'master':
        newSettings.masterVolume = value
        break
      case 'bgm':
        newSettings.bgmVolume = value
        break
      case 'sfx':
        newSettings.sfxVolume = value
        break
    }

    const updated = { ...tempSettings, ...newSettings }
    setTempSettings(updated)
    updateSettings(newSettings)
  }

  const handleMuteToggle = () => {
    if (tempSettings.muted) {
      unmute()
    } else {
      mute()
    }
  }

  const handleFeatureToggle = (feature: 'bgm' | 'sfx') => {
    const newSettings: Partial<AudioSettings> = {}
    
    if (feature === 'bgm') {
      newSettings.bgmEnabled = !tempSettings.bgmEnabled
    } else {
      newSettings.sfxEnabled = !tempSettings.sfxEnabled
    }

    const updated = { ...tempSettings, ...newSettings }
    setTempSettings(updated)
    updateSettings(newSettings)
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* ミュートボタン */}
        <button
          onClick={handleMuteToggle}
          className={`p-1 rounded transition-colors ${
            tempSettings.muted 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
          title={tempSettings.muted ? 'ミュート解除' : 'ミュート'}
        >
          {tempSettings.muted ? '🔇' : '🔊'}
        </button>

        {/* マスター音量 */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-600">🎵</span>
          <input
            type="range"
            min="0"
            max="100"
            value={tempSettings.masterVolume}
            onChange={(e) => handleVolumeChange('master', parseInt(e.target.value))}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={tempSettings.muted}
          />
          <span className="text-xs text-gray-500 w-8">
            {tempSettings.masterVolume}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">音量設定</h3>
        <button
          onClick={handleMuteToggle}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            tempSettings.muted 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {tempSettings.muted ? '🔇 ミュート中' : '🔊 音声オン'}
        </button>
      </div>

      {/* マスター音量 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          マスター音量: {tempSettings.masterVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={tempSettings.masterVolume}
          onChange={(e) => handleVolumeChange('master', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={tempSettings.muted}
        />
      </div>

      {/* BGM音量 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            BGM: {tempSettings.bgmVolume}%
          </label>
          <button
            onClick={() => handleFeatureToggle('bgm')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              tempSettings.bgmEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tempSettings.bgmEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tempSettings.bgmVolume}
          onChange={(e) => handleVolumeChange('bgm', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={tempSettings.muted || !tempSettings.bgmEnabled}
        />
      </div>

      {/* 効果音音量 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            効果音: {tempSettings.sfxVolume}%
          </label>
          <button
            onClick={() => handleFeatureToggle('sfx')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              tempSettings.sfxEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tempSettings.sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tempSettings.sfxVolume}
          onChange={(e) => handleVolumeChange('sfx', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={tempSettings.muted || !tempSettings.sfxEnabled}
        />
      </div>

      {/* 設定の概要 */}
      <div className="pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="text-center">
            <div className="font-medium">マスター</div>
            <div>{tempSettings.masterVolume}%</div>
          </div>
          <div className="text-center">
            <div className="font-medium">BGM</div>
            <div>{tempSettings.bgmEnabled ? `${tempSettings.bgmVolume}%` : 'OFF'}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">効果音</div>
            <div>{tempSettings.sfxEnabled ? `${tempSettings.sfxVolume}%` : 'OFF'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}