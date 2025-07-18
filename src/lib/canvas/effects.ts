import { EFFECT_COLORS } from './colors';
import { EasingFunctions } from './animation';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  decay: number;
}

export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 100;

  constructor(maxParticles: number = 100) {
    this.maxParticles = maxParticles;
  }

  addParticle(x: number, y: number, options: Partial<Particle> = {}): void {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const particle: Particle = {
      x,
      y,
      vx: options.vx ?? (Math.random() - 0.5) * 4,
      vy: options.vy ?? (Math.random() - 0.5) * 4,
      life: options.life ?? 1,
      maxLife: options.maxLife ?? 1,
      color: options.color ?? EFFECT_COLORS.PARTICLE,
      size: options.size ?? 3,
      decay: options.decay ?? 0.02,
    };

    this.particles.push(particle);
  }

  addExplosion(x: number, y: number, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: EFFECT_COLORS.EXPLOSION,
        size: 2 + Math.random() * 3,
        life: 1,
        maxLife: 1,
        decay: 0.01 + Math.random() * 0.02,
      });
    }
  }

  addLineClearEffect(y: number, width: number, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      
      this.addParticle(x, y, {
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 3,
        color: EFFECT_COLORS.PARTICLE,
        size: 1 + Math.random() * 2,
        life: 1,
        maxLife: 1,
        decay: 0.015,
      });
    }
  }

  addLevelUpEffect(x: number, y: number, count: number = 15): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1 + Math.random() * 2;
      
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: EFFECT_COLORS.LEVEL_UP,
        size: 3 + Math.random() * 2,
        life: 1,
        maxLife: 1,
        decay: 0.01,
      });
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += 0.1 * deltaTime; // gravity
      particle.life -= particle.decay * deltaTime;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  clear(): void {
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}

export class EffectsManager {
  private particleSystem: ParticleSystem;
  private screenShake: ScreenShake | null = null;
  private flashEffect: { intensity: number; duration: number; elapsed: number } | null = null;

  constructor(maxParticles: number = 100) {
    this.particleSystem = new ParticleSystem(maxParticles);
  }

  addExplosion(x: number, y: number, count?: number): void {
    this.particleSystem.addExplosion(x, y, count);
  }

  addLineClearEffect(y: number, width: number, count?: number): void {
    this.particleSystem.addLineClearEffect(y, width, count);
  }

  addLevelUpEffect(x: number, y: number, count?: number): void {
    this.particleSystem.addLevelUpEffect(x, y, count);
  }

  startScreenShake(intensity: number, duration: number): void {
    this.screenShake = {
      intensity,
      duration,
      elapsed: 0,
    };
  }

  startFlashEffect(intensity: number, duration: number): void {
    this.flashEffect = {
      intensity,
      duration,
      elapsed: 0,
    };
  }

  update(deltaTime: number): void {
    this.particleSystem.update(deltaTime);
    
    if (this.screenShake) {
      this.screenShake.elapsed += deltaTime;
      if (this.screenShake.elapsed >= this.screenShake.duration) {
        this.screenShake = null;
      }
    }
    
    if (this.flashEffect) {
      this.flashEffect.elapsed += deltaTime;
      if (this.flashEffect.elapsed >= this.flashEffect.duration) {
        this.flashEffect = null;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Apply screen shake
    if (this.screenShake) {
      const progress = this.screenShake.elapsed / this.screenShake.duration;
      const intensity = this.screenShake.intensity * (1 - EasingFunctions.easeOutQuad(progress));
      const shakeX = (Math.random() - 0.5) * intensity;
      const shakeY = (Math.random() - 0.5) * intensity;
      ctx.translate(shakeX, shakeY);
    }
    
    // Render particles
    this.particleSystem.render(ctx);
    
    // Apply flash effect
    if (this.flashEffect) {
      const progress = this.flashEffect.elapsed / this.flashEffect.duration;
      const alpha = this.flashEffect.intensity * (1 - EasingFunctions.easeOutQuad(progress));
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    ctx.restore();
  }

  getScreenShakeOffset(): { x: number; y: number } {
    if (!this.screenShake) {
      return { x: 0, y: 0 };
    }
    
    const progress = this.screenShake.elapsed / this.screenShake.duration;
    const intensity = this.screenShake.intensity * (1 - EasingFunctions.easeOutQuad(progress));
    
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
    };
  }

  isScreenShaking(): boolean {
    return this.screenShake !== null;
  }

  isFlashing(): boolean {
    return this.flashEffect !== null;
  }

  clear(): void {
    this.particleSystem.clear();
    this.screenShake = null;
    this.flashEffect = null;
  }

  getParticleCount(): number {
    return this.particleSystem.getParticleCount();
  }
}

export function createGameOverEffect(
  effectsManager: EffectsManager,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Add explosion particles
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    effectsManager.addExplosion(x, y, 5);
  }
  
  // Add screen shake
  effectsManager.startScreenShake(10, 1000);
  
  // Add flash effect
  effectsManager.startFlashEffect(0.5, 500);
}

export function createLevelUpEffect(
  effectsManager: EffectsManager,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Add level up particles in the center
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  effectsManager.addLevelUpEffect(centerX, centerY, 20);
  
  // Add flash effect
  effectsManager.startFlashEffect(0.3, 300);
}

export function createTetrisEffect(
  effectsManager: EffectsManager,
  lines: number[],
  canvasWidth: number,
  cellSize: number
): void {
  // Add particles for each cleared line
  for (const line of lines) {
    const y = line * cellSize + cellSize / 2;
    effectsManager.addLineClearEffect(y, canvasWidth, 25);
  }
  
  // Add screen shake for tetris
  if (lines.length === 4) {
    effectsManager.startScreenShake(8, 500);
    effectsManager.startFlashEffect(0.4, 200);
  } else {
    effectsManager.startScreenShake(4, 300);
  }
}