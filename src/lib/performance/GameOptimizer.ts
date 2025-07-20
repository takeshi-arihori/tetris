// ゲームパフォーマンス最適化ユーティリティ

class GameOptimizer {
  private static instance: GameOptimizer
  private performanceEntries: PerformanceEntry[] = []
  private frameRateHistory: number[] = []
  private memoryUsageHistory: number[] = []
  private lastFrameTime = 0
  private frameCount = 0

  static getInstance(): GameOptimizer {
    if (!GameOptimizer.instance) {
      GameOptimizer.instance = new GameOptimizer()
    }
    return GameOptimizer.instance
  }

  // フレームレート監視
  public trackFrameRate(): void {
    const now = performance.now()
    if (this.lastFrameTime) {
      const deltaTime = now - this.lastFrameTime
      const fps = 1000 / deltaTime
      
      this.frameRateHistory.push(fps)
      
      // 直近100フレームのみ保持
      if (this.frameRateHistory.length > 100) {
        this.frameRateHistory.shift()
      }
    }
    this.lastFrameTime = now
    this.frameCount++
  }

  // メモリ使用量監視
  public trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
      
      this.memoryUsageHistory.push(usage.used / 1024 / 1024) // MB単位
      
      // 直近50回の記録のみ保持
      if (this.memoryUsageHistory.length > 50) {
        this.memoryUsageHistory.shift()
      }
    }
  }

  // パフォーマンス統計取得
  public getPerformanceStats() {
    const avgFps = this.frameRateHistory.length > 0 
      ? this.frameRateHistory.reduce((a, b) => a + b, 0) / this.frameRateHistory.length 
      : 0

    const minFps = this.frameRateHistory.length > 0 
      ? Math.min(...this.frameRateHistory) 
      : 0

    const avgMemory = this.memoryUsageHistory.length > 0
      ? this.memoryUsageHistory.reduce((a, b) => a + b, 0) / this.memoryUsageHistory.length
      : 0

    return {
      averageFps: Math.round(avgFps * 100) / 100,
      minimumFps: Math.round(minFps * 100) / 100,
      averageMemoryUsage: Math.round(avgMemory * 100) / 100,
      frameCount: this.frameCount,
      performanceLevel: this.getPerformanceLevel(avgFps, avgMemory)
    }
  }

  // パフォーマンスレベル判定
  private getPerformanceLevel(fps: number, memoryUsage: number): 'high' | 'medium' | 'low' {
    if (fps >= 58 && memoryUsage < 100) return 'high'
    if (fps >= 40 && memoryUsage < 200) return 'medium'
    return 'low'
  }

  // Canvas描画最適化
  public optimizeCanvasRendering(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d', {
      alpha: false, // 透明度が不要な場合
      desynchronized: true, // 低レイテンシ描画
      willReadFrequently: false // 読み取り頻度が低い場合
    })

    if (ctx) {
      // 画像のスムージングを無効化（ピクセルアート用）
      ctx.imageSmoothingEnabled = false
      
      // 描画品質設定
      ctx.textRenderingOptimization = 'speed'
    }

    return ctx
  }

  // requestAnimationFrame最適化
  public createOptimizedAnimationLoop(callback: (deltaTime: number) => void): () => void {
    let lastTime = 0
    let animationId: number

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // フレームレート制限（60FPS以下の環境での負荷軽減）
      if (deltaTime >= 16.67) { // 約60FPS
        this.trackFrameRate()
        callback(deltaTime)
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    // 停止関数を返す
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }

  // オブジェクトプール（頻繁に生成/破棄されるオブジェクトの最適化）
  public createObjectPool<T>(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize = 10
  ) {
    const pool: T[] = []
    
    // 初期オブジェクトを作成
    for (let i = 0; i < initialSize; i++) {
      pool.push(createFn())
    }

    return {
      acquire(): T {
        if (pool.length > 0) {
          return pool.pop()!
        }
        return createFn()
      },
      
      release(obj: T): void {
        resetFn(obj)
        pool.push(obj)
      },
      
      size(): number {
        return pool.length
      }
    }
  }

  // イベントリスナー最適化
  public addOptimizedEventListener(
    element: Element,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    const optimizedOptions = {
      passive: true, // スクロール等のパフォーマンス向上
      ...options
    }

    element.addEventListener(event, handler, optimizedOptions)

    return () => {
      element.removeEventListener(event, handler, optimizedOptions)
    }
  }

  // デバウンス関数（頻繁な呼び出しの最適化）
  public debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  // スロットル関数（一定間隔での実行制限）
  public throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // メモリリーク検出
  public detectMemoryLeaks(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      
      if (usagePercent > 80) {
        console.warn('⚠️ メモリ使用量が80%を超えています:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        })
      }
    }
  }

  // パフォーマンス測定
  public measurePerformance<T>(name: string, fn: () => T): T {
    const startTime = performance.now()
    const result = fn()
    const endTime = performance.now()
    
    console.log(`🔍 ${name}: ${(endTime - startTime).toFixed(2)}ms`)
    
    return result
  }

  // リセット
  public reset(): void {
    this.frameRateHistory = []
    this.memoryUsageHistory = []
    this.frameCount = 0
    this.lastFrameTime = 0
  }
}

// Web Workers用のパフォーマンス計算（重い処理のオフロード）
export class PerformanceWorkerManager {
  private worker: Worker | null = null

  public createWorker(scriptUrl: string): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(scriptUrl)
    }
  }

  public postMessage(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker is not available'))
        return
      }

      const messageId = Date.now() + Math.random()
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === messageId) {
          this.worker!.removeEventListener('message', handleMessage)
          resolve(event.data.result)
        }
      }

      const handleError = (error: ErrorEvent) => {
        this.worker!.removeEventListener('error', handleError)
        reject(error)
      }

      this.worker.addEventListener('message', handleMessage)
      this.worker.addEventListener('error', handleError)

      this.worker.postMessage({ id: messageId, ...data })
    })
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}

export default GameOptimizer