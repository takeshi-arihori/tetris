import { 
  BGMTrack, 
  BGMPlayerInterface, 
  AudioPlayerState, 
  BGMConfig,
  BGM_CONFIGS 
} from './types'

export class BGMPlayer implements BGMPlayerInterface {
  private audio: HTMLAudioElement | null = null
  private currentTrack: BGMTrack | null = null
  private volume: number = 0.7
  private fadeInterval: NodeJS.Timeout | null = null
  private isInitialized: boolean = false

  async play(track: BGMTrack): Promise<void> {
    try {
      // 同じトラックが再生中の場合はスキップ
      if (this.currentTrack === track && this.audio && !this.audio.paused) {
        return
      }

      // 現在の音楽を停止
      await this.stop()

      const config = BGM_CONFIGS[track]
      if (!config) {
        throw new Error(`BGM configuration not found for track: ${track}`)
      }

      // 新しいオーディオ要素を作成
      this.audio = new Audio(config.file)
      this.audio.loop = config.loop
      this.audio.volume = (config.volume || 0.7) * this.volume
      this.audio.preload = 'auto'

      // イベントリスナーを設定
      this.setupEventListeners()

      // 再生開始
      await this.audio.play()
      this.currentTrack = track
      this.isInitialized = true

    } catch (error) {
      console.error(`Failed to play BGM track: ${track}`, error)
      throw error
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
    this.currentTrack = null
    this.clearFadeInterval()
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  resume(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(error => {
        console.error('Failed to resume BGM:', error)
      })
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.audio) {
      const config = this.currentTrack ? BGM_CONFIGS[this.currentTrack] : null
      const baseVolume = config?.volume || 0.7
      this.audio.volume = baseVolume * this.volume
    }
  }

  async fadeIn(duration: number = 2000): Promise<void> {
    if (!this.audio) return

    return new Promise((resolve) => {
      const startVolume = 0
      const targetVolume = this.audio!.volume
      const steps = 50
      const stepDuration = duration / steps
      const volumeStep = (targetVolume - startVolume) / steps

      this.audio!.volume = startVolume
      let currentStep = 0

      this.fadeInterval = setInterval(() => {
        if (!this.audio) {
          this.clearFadeInterval()
          resolve()
          return
        }

        currentStep++
        const newVolume = startVolume + (volumeStep * currentStep)
        this.audio.volume = Math.min(newVolume, targetVolume)

        if (currentStep >= steps) {
          this.clearFadeInterval()
          resolve()
        }
      }, stepDuration)
    })
  }

  async fadeOut(duration: number = 2000): Promise<void> {
    if (!this.audio) return

    return new Promise((resolve) => {
      const startVolume = this.audio!.volume
      const targetVolume = 0
      const steps = 50
      const stepDuration = duration / steps
      const volumeStep = (startVolume - targetVolume) / steps

      let currentStep = 0

      this.fadeInterval = setInterval(() => {
        if (!this.audio) {
          this.clearFadeInterval()
          resolve()
          return
        }

        currentStep++
        const newVolume = startVolume - (volumeStep * currentStep)
        this.audio.volume = Math.max(newVolume, targetVolume)

        if (currentStep >= steps) {
          this.clearFadeInterval()
          resolve()
        }
      }, stepDuration)
    })
  }

  getCurrentTrack(): BGMTrack | null {
    return this.currentTrack
  }

  getState(): AudioPlayerState {
    if (!this.audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: this.volume,
        muted: false
      }
    }

    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.volume,
      muted: this.audio.muted
    }
  }

  private setupEventListeners(): void {
    if (!this.audio) return

    this.audio.addEventListener('error', (error) => {
      console.error('BGM playback error:', error)
    })

    this.audio.addEventListener('ended', () => {
      // ループが無効の場合のハンドリング
      if (this.audio && !this.audio.loop) {
        this.currentTrack = null
      }
    })

    this.audio.addEventListener('canplaythrough', () => {
      // 音楽が完全に読み込まれたときの処理
    })
  }

  private clearFadeInterval(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
  }

  // BGMの切り替え（フェード付き）
  async switchTo(track: BGMTrack, fadeDuration: number = 1000): Promise<void> {
    if (this.currentTrack === track) return

    if (this.audio && !this.audio.paused) {
      await this.fadeOut(fadeDuration)
    }

    await this.play(track)
    await this.fadeIn(fadeDuration)
  }

  // クリーンアップ
  destroy(): void {
    this.stop()
    this.clearFadeInterval()
  }
}