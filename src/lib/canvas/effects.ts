// Canvas視覚効果とパーティクルシステム

import { EasingFunctions, type EasingFunction } from './animation'
import { EFFECT_COLORS } from './colors'

export interface Particle {
  id: string
  x: number
  y: number
  vx: number // X方向の速度
  vy: number // Y方向の速度
  life: number // 残り寿命（0-1）
  maxLife: number // 最大寿命（ミリ秒）
  size: number
  color: string
  alpha: number
  rotation: number
  rotationSpeed: number
  gravity?: number
  friction?: number
  type: 'spark' | 'star' | 'square' | 'circle'
}

export interface ScreenShake {
  intensity: number
  duration: number
  frequency?: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  private maxParticles: number = 1000
  private particleId: number = 0

  constructor(maxParticles: number = 1000) {
    this.maxParticles = maxParticles
  }

  // パーティクル追加
  addParticle(config: Partial<Particle>): string {
    const id = `particle_${this.particleId++}`
    
    const particle: Particle = {
      id,
      x: config.x || 0,
      y: config.y || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      life: 1,
      maxLife: config.maxLife || 1000,
      size: config.size || 2,
      color: config.color || EFFECT_COLORS.PARTICLE,
      alpha: config.alpha || 1,
      rotation: config.rotation || 0,
      rotationSpeed: config.rotationSpeed || 0,
      gravity: config.gravity || 0,
      friction: config.friction || 0.98,
      type: config.type || 'circle'
    }

    // 最大数を超える場合は古いパーティクルを削除
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift()
    }

    this.particles.push(particle)
    return id
  }

  // 複数パーティクル追加
  addParticles(configs: Partial<Particle>[]): string[] {
    return configs.map(config => this.addParticle(config))
  }

  // パーティクル更新
  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      // 寿命減少
      particle.life -= deltaTime / particle.maxLife
      
      if (particle.life <= 0) {
        return false
      }

      // 位置更新
      particle.x += particle.vx * deltaTime / 16.67 // 60fps基準
      particle.y += particle.vy * deltaTime / 16.67

      // 重力適用
      if (particle.gravity) {
        particle.vy += particle.gravity * deltaTime / 16.67
      }

      // 摩擦適用
      if (particle.friction) {
        particle.vx *= particle.friction
        particle.vy *= particle.friction
      }

      // 回転更新
      particle.rotation += particle.rotationSpeed * deltaTime / 16.67

      // アルファ値減衰
      particle.alpha = particle.life

      return true
    })
  }

  // パーティクル描画
  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      ctx.save()
      
      ctx.globalAlpha = particle.alpha
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      
      ctx.fillStyle = particle.color
      
      switch (particle.type) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case 'square':
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          break
          
        case 'star':
          this.drawStar(ctx, 0, 0, particle.size, 5)
          ctx.fill()
          break
          
        case 'spark':
          ctx.beginPath()
          ctx.moveTo(-particle.size, 0)
          ctx.lineTo(particle.size, 0)
          ctx.moveTo(0, -particle.size)
          ctx.lineTo(0, particle.size)
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 2
          ctx.stroke()
          break
      }
      
      ctx.restore()
    })
  }

  // 星形描画
  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number): void {
    const angle = Math.PI / points
    ctx.beginPath()
    
    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? radius : radius / 2
      const a = i * angle
      const px = x + Math.cos(a) * r
      const py = y + Math.sin(a) * r
      
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    
    ctx.closePath()
  }

  // 爆発エフェクト作成
  createExplosion(x: number, y: number, intensity: number = 1): string[] {
    const particleCount = Math.floor(15 * intensity)
    const configs: Partial<Particle>[] = []

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 50 + Math.random() * 100 * intensity
      
      configs.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        maxLife: 500 + Math.random() * 500,
        size: 2 + Math.random() * 3,
        color: intensity > 1 ? EFFECT_COLORS.EXPLOSION : EFFECT_COLORS.PARTICLE,
        type: Math.random() > 0.5 ? 'spark' : 'circle',
        gravity: 30,
        friction: 0.95
      })
    }

    return this.addParticles(configs)
  }

  // ライン消去エフェクト
  createLineClearEffect(y: number, width: number): string[] {
    const particleCount = Math.floor(width / 10)
    const configs: Partial<Particle>[] = []

    for (let i = 0; i < particleCount; i++) {
      configs.push({
        x: (i / particleCount) * width,
        y: y,
        vx: (Math.random() - 0.5) * 100,
        vy: -50 - Math.random() * 50,
        maxLife: 800 + Math.random() * 400,
        size: 3 + Math.random() * 2,
        color: '#ffffff',
        type: 'star',
        gravity: 20,
        rotationSpeed: Math.random() * 0.2 - 0.1
      })
    }

    return this.addParticles(configs)
  }

  // テトリス達成エフェクト
  createTetrisEffect(x: number, y: number, width: number, height: number): string[] {
    const particleCount = 30
    const configs: Partial<Particle>[] = []

    for (let i = 0; i < particleCount; i++) {
      configs.push({
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: (Math.random() - 0.5) * 200,
        vy: -100 - Math.random() * 100,
        maxLife: 1500,
        size: 4 + Math.random() * 4,
        color: '#ffd700',
        type: 'star',
        gravity: 15,
        rotationSpeed: Math.random() * 0.3 - 0.15
      })
    }

    return this.addParticles(configs)
  }

  // パーティクル統計
  getStats(): { count: number; maxParticles: number } {
    return {
      count: this.particles.length,
      maxParticles: this.maxParticles
    }
  }

  // 全パーティクルクリア
  clear(): void {
    this.particles = []
  }
}

export class EffectsManager {
  private particleSystem: ParticleSystem
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 }
  private currentShake: ScreenShake | null = null
  private shakeStartTime: number = 0

  constructor(maxParticles: number = 1000) {
    this.particleSystem = new ParticleSystem(maxParticles)
  }

  // 更新
  update(deltaTime: number): void {
    this.particleSystem.update(deltaTime)
    this.updateScreenShake(deltaTime)
  }

  // 描画
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    // 画面振動を適用
    ctx.translate(this.shakeOffset.x, this.shakeOffset.y)
    
    // パーティクル描画
    this.particleSystem.render(ctx)
    
    ctx.restore()
  }

  // 画面振動開始
  startScreenShake(intensity: number, duration: number, frequency: number = 30): void {
    this.currentShake = { intensity, duration, frequency }
    this.shakeStartTime = performance.now()
  }

  // 画面振動更新
  private updateScreenShake(deltaTime: number): void {
    if (!this.currentShake) {
      this.shakeOffset = { x: 0, y: 0 }
      return
    }

    const elapsed = performance.now() - this.shakeStartTime
    const progress = elapsed / this.currentShake.duration

    if (progress >= 1) {
      this.currentShake = null
      this.shakeOffset = { x: 0, y: 0 }
      return
    }

    // 振動の強度を時間とともに減衰
    const intensity = this.currentShake.intensity * (1 - progress)
    const frequency = this.currentShake.frequency || 30
    
    this.shakeOffset.x = Math.sin(elapsed * frequency / 1000) * intensity
    this.shakeOffset.y = Math.cos(elapsed * frequency / 1000) * intensity
  }

  // ゲームオーバーエフェクト
  createGameOverEffect(canvasWidth: number, canvasHeight: number): void {
    // 画面振動
    this.startScreenShake(10, 1000, 20)

    // 爆発パーティクル
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * canvasWidth
        const y = Math.random() * canvasHeight
        this.particleSystem.createExplosion(x, y, 1.5)
      }, i * 200)
    }
  }

  // レベルアップエフェクト
  createLevelUpEffect(canvasWidth: number, canvasHeight: number): void {
    // 画面振動
    this.startScreenShake(5, 500, 40)

    // 星のパーティクル
    for (let i = 0; i < 20; i++) {
      this.particleSystem.addParticle({
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
        vx: (Math.random() - 0.5) * 50,
        vy: -150 - Math.random() * 100,
        maxLife: 2000,
        size: 5 + Math.random() * 3,
        color: EFFECT_COLORS.LEVEL_UP,
        type: 'star',
        gravity: -10, // 上向きの重力
        rotationSpeed: Math.random() * 0.2 - 0.1
      })
    }
  }

  // テトリス達成エフェクト
  createTetrisEffect(canvasWidth: number, canvasHeight: number): void {
    this.startScreenShake(8, 800, 35)
    this.particleSystem.createTetrisEffect(0, 0, canvasWidth, canvasHeight)
  }

  // ライン消去エフェクト
  createLineClearEffect(lineY: number, canvasWidth: number, lineCount: number): void {
    // ライン数に応じて振動強度を調整
    const shakeIntensity = Math.min(lineCount * 2, 8)
    this.startScreenShake(shakeIntensity, 300, 50)

    // パーティクル生成
    this.particleSystem.createLineClearEffect(lineY, canvasWidth)

    // テトリス（4ライン消去）の場合は特別なエフェクト
    if (lineCount >= 4) {
      setTimeout(() => {
        this.createTetrisEffect(canvasWidth, 600) // デフォルトの高さを使用
      }, 100)
    }
  }

  // ブロック着地エフェクト
  createBlockLandEffect(x: number, y: number): void {
    this.particleSystem.createExplosion(x, y, 0.3)
  }

  // 回転エフェクト
  createRotationEffect(x: number, y: number): void {
    const configs: Partial<Particle>[] = []
    
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6
      configs.push({
        x: x + Math.cos(angle) * 15,
        y: y + Math.sin(angle) * 15,
        vx: Math.cos(angle + Math.PI / 2) * 30,
        vy: Math.sin(angle + Math.PI / 2) * 30,
        maxLife: 300,
        size: 2,
        color: '#ffffff',
        type: 'circle',
        friction: 0.9
      })
    }

    this.particleSystem.addParticles(configs)
  }

  // パーティクルシステム取得
  getParticleSystem(): ParticleSystem {
    return this.particleSystem
  }

  // 統計情報
  getStats(): {
    particles: { count: number; maxParticles: number }
    shake: ScreenShake | null
  } {
    return {
      particles: this.particleSystem.getStats(),
      shake: this.currentShake
    }
  }

  // 全エフェクトクリア
  clear(): void {
    this.particleSystem.clear()
    this.currentShake = null
    this.shakeOffset = { x: 0, y: 0 }
  }
}

// 便利関数
export function createGameOverEffect(effectsManager: EffectsManager, canvasWidth: number, canvasHeight: number): void {
  effectsManager.createGameOverEffect(canvasWidth, canvasHeight)
}

export function createLevelUpEffect(effectsManager: EffectsManager, canvasWidth: number, canvasHeight: number): void {
  effectsManager.createLevelUpEffect(canvasWidth, canvasHeight)
}

export function createTetrisEffect(effectsManager: EffectsManager, canvasWidth: number, canvasHeight: number): void {
  effectsManager.createTetrisEffect(canvasWidth, canvasHeight)
}