// Canvas アニメーションエンジン

export type EasingFunction = (t: number) => number

// イージング関数集
export const EasingFunctions = {
  // 基本のイージング
  linear: (t: number): number => t,
  
  // Ease In
  easeInQuad: (t: number): number => t * t,
  easeInCubic: (t: number): number => t * t * t,
  easeInQuart: (t: number): number => t * t * t * t,
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeInSine: (t: number): number => 1 - Math.cos(t * Math.PI / 2),
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
  easeInBack: (t: number): number => {
    const s = 1.70158
    return t * t * ((s + 1) * t - s)
  },
  
  // Ease Out
  easeOutQuad: (t: number): number => t * (2 - t),
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeOutQuart: (t: number): number => 1 - --t * t * t * t,
  easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
  easeOutSine: (t: number): number => Math.sin(t * Math.PI / 2),
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutCirc: (t: number): number => Math.sqrt(1 - --t * t),
  easeOutBack: (t: number): number => {
    const s = 1.70158
    return --t * t * ((s + 1) * t + s) + 1
  },
  
  // Ease In Out
  easeInOutQuad: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInOutCubic: (t: number): number => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInOutSine: (t: number): number => 
    -(Math.cos(Math.PI * t) - 1) / 2,
  
  // 特殊なイージング
  bounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
  
  elastic: (t: number): number => {
    if (t === 0) return 0
    if (t === 1) return 1
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * (2 * Math.PI) / 0.4) + 1
  }
} as const

export interface AnimationConfig {
  duration: number
  easing?: EasingFunction
  delay?: number
  loop?: boolean
  yoyo?: boolean
  onUpdate?: (progress: number, value: any) => void
  onComplete?: () => void
}

export interface TweenConfig extends AnimationConfig {
  from: number
  to: number
}

export class Animation {
  private startTime: number = 0
  private pausedTime: number = 0
  private isRunning: boolean = false
  private isPaused: boolean = false
  private currentProgress: number = 0

  constructor(
    private config: AnimationConfig,
    private updateCallback: (progress: number) => void
  ) {}

  start(): void {
    if (this.isRunning && !this.isPaused) return
    
    this.startTime = performance.now() - this.pausedTime
    this.isRunning = true
    this.isPaused = false
    this.animate()
  }

  pause(): void {
    if (!this.isRunning || this.isPaused) return
    
    this.isPaused = true
    this.pausedTime = performance.now() - this.startTime
  }

  resume(): void {
    if (!this.isPaused) return
    
    this.startTime = performance.now() - this.pausedTime
    this.isPaused = false
    this.animate()
  }

  stop(): void {
    this.isRunning = false
    this.isPaused = false
    this.currentProgress = 0
    this.pausedTime = 0
  }

  private animate(): void {
    if (!this.isRunning || this.isPaused) return

    const currentTime = performance.now()
    const elapsed = currentTime - this.startTime - (this.config.delay || 0)
    
    if (elapsed < 0) {
      requestAnimationFrame(() => this.animate())
      return
    }

    let progress = Math.min(elapsed / this.config.duration, 1)
    
    // Yoyo効果
    if (this.config.yoyo && Math.floor(elapsed / this.config.duration) % 2 === 1) {
      progress = 1 - progress
    }
    
    // イージング適用
    const easedProgress = this.config.easing 
      ? this.config.easing(progress) 
      : progress

    this.currentProgress = easedProgress
    this.updateCallback(easedProgress)
    
    if (this.config.onUpdate) {
      this.config.onUpdate(easedProgress, easedProgress)
    }

    // アニメーション完了チェック
    if (elapsed >= this.config.duration) {
      if (this.config.loop) {
        this.startTime = currentTime
      } else {
        this.isRunning = false
        if (this.config.onComplete) {
          this.config.onComplete()
        }
        return
      }
    }

    if (this.isRunning) {
      requestAnimationFrame(() => this.animate())
    }
  }

  getProgress(): number {
    return this.currentProgress
  }

  isActive(): boolean {
    return this.isRunning && !this.isPaused
  }
}

export class AnimationManager {
  private animations: Map<string, Animation> = new Map()
  private globalTime: number = 0
  private isRunning: boolean = false
  private animationFrame: number | null = null

  constructor() {
    this.startGlobalTimer()
  }

  // 数値のトゥイーンアニメーション作成
  createTween(id: string, config: TweenConfig): Animation {
    const animation = new Animation(config, (progress) => {
      const value = config.from + (config.to - config.from) * progress
      if (config.onUpdate) {
        config.onUpdate(progress, value)
      }
    })

    this.animations.set(id, animation)
    return animation
  }

  // カラートゥイーンアニメーション作成
  createColorTween(
    id: string, 
    fromColor: string, 
    toColor: string, 
    config: AnimationConfig
  ): Animation {
    const from = this.hexToRgb(fromColor)
    const to = this.hexToRgb(toColor)

    const animation = new Animation(config, (progress) => {
      const r = Math.round(from.r + (to.r - from.r) * progress)
      const g = Math.round(from.g + (to.g - from.g) * progress)
      const b = Math.round(from.b + (to.b - from.b) * progress)
      const color = `rgb(${r}, ${g}, ${b})`
      
      if (config.onUpdate) {
        config.onUpdate(progress, color)
      }
    })

    this.animations.set(id, animation)
    return animation
  }

  // カスタムアニメーション作成
  createCustom(
    id: string,
    config: AnimationConfig,
    updateCallback: (progress: number) => void
  ): Animation {
    const animation = new Animation(config, updateCallback)
    this.animations.set(id, animation)
    return animation
  }

  // アニメーション開始
  start(id: string): boolean {
    const animation = this.animations.get(id)
    if (animation) {
      animation.start()
      return true
    }
    return false
  }

  // アニメーション一時停止
  pause(id: string): boolean {
    const animation = this.animations.get(id)
    if (animation) {
      animation.pause()
      return true
    }
    return false
  }

  // アニメーション再開
  resume(id: string): boolean {
    const animation = this.animations.get(id)
    if (animation) {
      animation.resume()
      return true
    }
    return false
  }

  // アニメーション停止
  stop(id: string): boolean {
    const animation = this.animations.get(id)
    if (animation) {
      animation.stop()
      return true
    }
    return false
  }

  // アニメーション削除
  remove(id: string): boolean {
    const animation = this.animations.get(id)
    if (animation) {
      animation.stop()
      this.animations.delete(id)
      return true
    }
    return false
  }

  // 全アニメーション停止
  stopAll(): void {
    this.animations.forEach(animation => animation.stop())
  }

  // 全アニメーション削除
  clear(): void {
    this.stopAll()
    this.animations.clear()
  }

  // アニメーション取得
  get(id: string): Animation | undefined {
    return this.animations.get(id)
  }

  // アクティブなアニメーション数
  getActiveCount(): number {
    let count = 0
    this.animations.forEach(animation => {
      if (animation.isActive()) count++
    })
    return count
  }

  // グローバルタイマー
  private startGlobalTimer(): void {
    if (this.isRunning) return

    this.isRunning = true
    const tick = () => {
      this.globalTime = performance.now()
      
      if (this.isRunning) {
        this.animationFrame = requestAnimationFrame(tick)
      }
    }
    tick()
  }

  stopGlobalTimer(): void {
    this.isRunning = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  // ユーティリティ: 16進数色をRGBに変換
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  // 統計情報
  getStats(): {
    totalAnimations: number
    activeAnimations: number
    globalTime: number
  } {
    return {
      totalAnimations: this.animations.size,
      activeAnimations: this.getActiveCount(),
      globalTime: this.globalTime
    }
  }
}

// 便利な関数群
export function createNumberTween(
  from: number,
  to: number,
  duration: number,
  easing: EasingFunction = EasingFunctions.linear,
  onUpdate?: (value: number) => void
): Animation {
  return new Animation({ duration, easing }, (progress) => {
    const value = from + (to - from) * progress
    if (onUpdate) {
      onUpdate(value)
    }
  })
}

export function createColorTween(
  fromColor: string,
  toColor: string,
  duration: number,
  easing: EasingFunction = EasingFunctions.linear,
  onUpdate?: (color: string) => void
): Animation {
  const manager = new AnimationManager()
  return manager.createColorTween('temp', fromColor, toColor, {
    duration,
    easing,
    onUpdate: onUpdate ? (_, color) => onUpdate(color as string) : undefined
  })
}

// 複数アニメーションのシーケンス実行
export function createSequence(animations: {
  animation: Animation
  delay?: number
}[]): Promise<void> {
  return new Promise((resolve) => {
    let currentIndex = 0
    
    const playNext = () => {
      if (currentIndex >= animations.length) {
        resolve()
        return
      }
      
      const { animation, delay = 0 } = animations[currentIndex]
      currentIndex++
      
      setTimeout(() => {
        animation.start()
        // アニメーション完了を待つ
        const checkComplete = () => {
          if (!animation.isActive()) {
            playNext()
          } else {
            requestAnimationFrame(checkComplete)
          }
        }
        checkComplete()
      }, delay)
    }
    
    playNext()
  })
}

// 複数アニメーションの並列実行
export function createParallel(animations: Animation[]): Promise<void> {
  return Promise.all(
    animations.map(animation => {
      return new Promise<void>((resolve) => {
        const originalOnComplete = animation['config'].onComplete
        animation['config'].onComplete = () => {
          if (originalOnComplete) originalOnComplete()
          resolve()
        }
        animation.start()
      })
    })
  ).then(() => {})
}