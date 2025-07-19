import { 
  AudioManagerInterface, 
  AudioSettings, 
  DEFAULT_AUDIO_SETTINGS,
  BGMTrack,
  SFXType,
  LEVEL_BGM_MAP
} from './types'
import { BGMPlayer } from './BGMPlayer'
import { SFXPlayer } from './SFXPlayer'

export class AudioManager implements AudioManagerInterface {
  public readonly bgm: BGMPlayer
  public readonly sfx: SFXPlayer
  private settings: AudioSettings
  private isInitialized: boolean = false
  private storageKey: string = 'tetris-audio-settings'

  constructor() {
    this.bgm = new BGMPlayer()
    this.sfx = new SFXPlayer()
    this.settings = this.loadSettings()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 高優先度効果音をプリロード
      await this.sfx.preload(['blockDrop', 'rotate', 'lineClear', 'gameOver'])
      
      // 設定を適用
      this.applySettings()
      
      this.isInitialized = true
      console.log('AudioManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error)
      throw error
    }
  }

  setSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.applySettings()
    this.saveSettings()
  }

  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  mute(): void {
    this.setSettings({ muted: true })
  }

  unmute(): void {
    this.setSettings({ muted: false })
  }

  private applySettings(): void {
    const { masterVolume, bgmVolume, sfxVolume, muted, bgmEnabled, sfxEnabled } = this.settings

    // マスター音量計算
    const masterVol = muted ? 0 : masterVolume / 100
    
    // BGM設定
    if (bgmEnabled && !muted) {
      this.bgm.setVolume((bgmVolume / 100) * masterVol)
    } else {
      this.bgm.setVolume(0)
    }

    // SFX設定
    if (sfxEnabled && !muted) {
      this.sfx.setVolume((sfxVolume / 100) * masterVol)
    } else {
      this.sfx.mute()
    }

    if (!muted && sfxEnabled) {
      this.sfx.unmute()
    }
  }

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_AUDIO_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error)
    }

    return DEFAULT_AUDIO_SETTINGS
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save audio settings:', error)
    }
  }

  // ゲームレベルに基づいてBGMを自動切り替え
  async playLevelBGM(level: number): Promise<void> {
    const track = LEVEL_BGM_MAP[level] || 'stage1'
    await this.playBGM(track)
  }

  // BGM再生（便利メソッド）
  async playBGM(track: BGMTrack): Promise<void> {
    if (!this.settings.bgmEnabled || this.settings.muted) return
    await this.bgm.play(track)
  }

  // BGM切り替え（フェード付き）
  async switchBGM(track: BGMTrack, fadeDuration?: number): Promise<void> {
    if (!this.settings.bgmEnabled || this.settings.muted) return
    await this.bgm.switchTo(track, fadeDuration)
  }

  // 効果音再生（便利メソッド）
  async playSFX(type: SFXType, options?: { volume?: number }): Promise<void> {
    if (!this.settings.sfxEnabled || this.settings.muted) return
    await this.sfx.play(type, options)
  }

  // BGM停止
  stopBGM(): void {
    this.bgm.stop()
  }

  // BGM一時停止/再開
  pauseBGM(): void {
    this.bgm.pause()
  }

  resumeBGM(): void {
    if (!this.settings.bgmEnabled || this.settings.muted) return
    this.bgm.resume()
  }

  // ゲーム状態に応じた音響制御
  onGameStart(): void {
    this.playSFX('gameStart')
  }

  onGameOver(): void {
    this.stopBGM()
    this.playSFX('gameOver')
  }

  onStageClear(): void {
    this.playSFX('stageClear')
  }

  onBlockDrop(): void {
    this.playSFX('blockDrop')
  }

  onLineClear(lineCount: number): void {
    // ライン数に応じて音量調整
    const volume = Math.min(1.0, 0.7 + (lineCount * 0.1))
    this.playSFX('lineClear', { volume })
  }

  onRotate(): void {
    this.playSFX('rotate')
  }

  onPause(): void {
    this.pauseBGM()
    this.playSFX('pauseMenu')
  }

  onResume(): void {
    this.resumeBGM()
  }

  // レベルアップ時の処理
  async onLevelUp(newLevel: number): Promise<void> {
    const newTrack = LEVEL_BGM_MAP[newLevel]
    const currentTrack = this.bgm.getCurrentTrack()
    
    if (newTrack && newTrack !== currentTrack) {
      await this.switchBGM(newTrack, 1500) // 1.5秒でフェード
    }
  }

  // 統計情報（デバッグ用）
  getStats(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      settings: this.settings,
      bgm: {
        currentTrack: this.bgm.getCurrentTrack(),
        state: this.bgm.getState()
      },
      sfx: this.sfx.getStats()
    }
  }

  // システム終了時のクリーンアップ
  destroy(): void {
    this.bgm.destroy()
    this.sfx.destroy()
    this.isInitialized = false
  }

  // ユーザー操作によるオーディオ再生許可取得
  async requestUserInteraction(): Promise<boolean> {
    try {
      // ダミーオーディオを再生してユーザー操作を確認
      const dummyAudio = new Audio()
      dummyAudio.volume = 0
      await dummyAudio.play()
      dummyAudio.pause()
      return true
    } catch (error) {
      console.warn('User interaction required for audio playback')
      return false
    }
  }
}

// シングルトンインスタンス
let audioManagerInstance: AudioManager | null = null

export const getAudioManager = (): AudioManager => {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager()
  }
  return audioManagerInstance
}

export const initializeAudio = async (): Promise<AudioManager> => {
  const manager = getAudioManager()
  await manager.initialize()
  return manager
}