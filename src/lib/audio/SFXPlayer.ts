import { 
  SFXType, 
  SFXPlayerInterface, 
  SFXConfig,
  SFX_CONFIGS 
} from './types'

interface SFXInstance {
  audio: HTMLAudioElement
  config: SFXConfig
  lastPlayTime: number
}

export class SFXPlayer implements SFXPlayerInterface {
  private sfxPool: Map<SFXType, SFXInstance[]> = new Map()
  private volume: number = 0.8
  private muted: boolean = false
  private maxInstances: number = 5 // 同じ効果音の最大同時再生数
  private minInterval: number = 50 // 同じ効果音の最小間隔（ms）

  constructor() {
    this.initializePool()
  }

  async play(type: SFXType, options?: { volume?: number }): Promise<void> {
    if (this.muted) return

    try {
      const config = SFX_CONFIGS[type]
      if (!config) {
        throw new Error(`SFX configuration not found for type: ${type}`)
      }

      // レート制限チェック
      if (!this.canPlay(type)) {
        return
      }

      const instance = this.getAvailableInstance(type)
      if (!instance) {
        console.warn(`No available instance for SFX: ${type}`)
        return
      }

      // 音量設定
      const baseVolume = config.volume || 0.7
      const playVolume = options?.volume || 1.0
      instance.audio.volume = baseVolume * this.volume * playVolume

      // 再生位置をリセット
      instance.audio.currentTime = 0
      
      // 再生
      await instance.audio.play()
      instance.lastPlayTime = Date.now()

    } catch (error) {
      console.error(`Failed to play SFX: ${type}`, error)
    }
  }

  async preload(types: SFXType[]): Promise<void> {
    const preloadPromises = types.map(async (type) => {
      const config = SFX_CONFIGS[type]
      if (!config) return

      // プールにインスタンスを追加
      const instances = this.sfxPool.get(type) || []
      if (instances.length === 0) {
        await this.createInstances(type, Math.min(this.maxInstances, 3))
      }
    })

    await Promise.all(preloadPromises)
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    
    // 既存のインスタンスの音量も更新
    this.sfxPool.forEach((instances, type) => {
      const config = SFX_CONFIGS[type]
      const baseVolume = config?.volume || 0.7
      
      instances.forEach(instance => {
        instance.audio.volume = baseVolume * this.volume
      })
    })
  }

  mute(): void {
    this.muted = true
    this.sfxPool.forEach(instances => {
      instances.forEach(instance => {
        instance.audio.muted = true
      })
    })
  }

  unmute(): void {
    this.muted = false
    this.sfxPool.forEach(instances => {
      instances.forEach(instance => {
        instance.audio.muted = false
      })
    })
  }

  private initializePool(): void {
    // 高優先度の効果音を事前作成
    const highPrioritySFX: SFXType[] = ['blockDrop', 'rotate', 'lineClear']
    
    highPrioritySFX.forEach(type => {
      this.createInstances(type, 3)
    })
  }

  private async createInstances(type: SFXType, count: number): Promise<void> {
    const config = SFX_CONFIGS[type]
    if (!config) return

    const instances: SFXInstance[] = []
    
    for (let i = 0; i < count; i++) {
      const audio = new Audio(config.file)
      audio.preload = 'auto'
      audio.volume = (config.volume || 0.7) * this.volume
      
      // イベントリスナーを設定
      this.setupEventListeners(audio, type)
      
      instances.push({
        audio,
        config,
        lastPlayTime: 0
      })
    }

    this.sfxPool.set(type, instances)
  }

  private getAvailableInstance(type: SFXType): SFXInstance | null {
    let instances = this.sfxPool.get(type)
    
    // インスタンスが存在しない場合は作成
    if (!instances || instances.length === 0) {
      this.createInstances(type, 2)
      instances = this.sfxPool.get(type)
      if (!instances) return null
    }

    // 再生中でないインスタンスを探す
    for (const instance of instances) {
      if (instance.audio.paused || instance.audio.ended) {
        return instance
      }
    }

    // すべて再生中の場合、最も古いものを使用
    const oldestInstance = instances.reduce((oldest, current) => 
      current.lastPlayTime < oldest.lastPlayTime ? current : oldest
    )

    return oldestInstance
  }

  private canPlay(type: SFXType): boolean {
    const instances = this.sfxPool.get(type)
    if (!instances) return true

    // 最小間隔チェック
    const now = Date.now()
    const recentInstance = instances.find(instance => 
      now - instance.lastPlayTime < this.minInterval
    )

    return !recentInstance
  }

  private setupEventListeners(audio: HTMLAudioElement, type: SFXType): void {
    audio.addEventListener('error', (error) => {
      console.error(`SFX playback error for ${type}:`, error)
    })

    audio.addEventListener('ended', () => {
      // 再生終了後の処理（必要に応じて）
    })
  }

  // 特定の効果音を停止
  stop(type: SFXType): void {
    const instances = this.sfxPool.get(type)
    if (!instances) return

    instances.forEach(instance => {
      if (!instance.audio.paused) {
        instance.audio.pause()
        instance.audio.currentTime = 0
      }
    })
  }

  // すべての効果音を停止
  stopAll(): void {
    this.sfxPool.forEach((instances) => {
      instances.forEach(instance => {
        if (!instance.audio.paused) {
          instance.audio.pause()
          instance.audio.currentTime = 0
        }
      })
    })
  }

  // クリーンアップ
  destroy(): void {
    this.stopAll()
    this.sfxPool.clear()
  }

  // 統計情報（デバッグ用）
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    this.sfxPool.forEach((instances, type) => {
      stats[type] = {
        instanceCount: instances.length,
        playingCount: instances.filter(i => !i.audio.paused).length
      }
    })

    return {
      totalTypes: this.sfxPool.size,
      muted: this.muted,
      volume: this.volume,
      details: stats
    }
  }
}