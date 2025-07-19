export type EasingFunction = (t: number) => number;

export const EasingFunctions = {
  linear: (t: number): number => t,
  
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  easeInBounce: (t: number): number => 1 - EasingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
} as const;

export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export class Animation {
  private startTime: number = 0;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private config: AnimationConfig;

  constructor(config: AnimationConfig) {
    this.config = config;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.startTime = performance.now();
    this.isRunning = true;
    this.tick();
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.config.duration, 1);
    
    const easedProgress = this.config.easing(progress);
    
    if (this.config.onUpdate) {
      this.config.onUpdate(easedProgress);
    }
    
    if (progress >= 1) {
      this.isRunning = false;
      if (this.config.onComplete) {
        this.config.onComplete();
      }
    } else {
      this.animationId = requestAnimationFrame(this.tick);
    }
  };
}

export class AnimationManager {
  private animations: Map<string, Animation> = new Map();

  create(key: string, config: AnimationConfig): Animation {
    const animation = new Animation(config);
    this.animations.set(key, animation);
    return animation;
  }

  start(key: string): boolean {
    const animation = this.animations.get(key);
    if (animation) {
      animation.start();
      return true;
    }
    return false;
  }

  stop(key: string): boolean {
    const animation = this.animations.get(key);
    if (animation) {
      animation.stop();
      return true;
    }
    return false;
  }

  stopAll(): void {
    for (const animation of this.animations.values()) {
      animation.stop();
    }
  }

  remove(key: string): boolean {
    const animation = this.animations.get(key);
    if (animation) {
      animation.stop();
      this.animations.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.stopAll();
    this.animations.clear();
  }

  has(key: string): boolean {
    return this.animations.has(key);
  }

  dispose(): void {
    this.clear();
  }
}

export interface TweenConfig<T> {
  from: T;
  to: T;
  duration: number;
  easing?: EasingFunction;
  onUpdate?: (value: T) => void;
  onComplete?: () => void;
}

export function createNumberTween(config: TweenConfig<number>): Animation {
  const { from, to, duration, easing = EasingFunctions.linear, onUpdate, onComplete } = config;
  
  return new Animation({
    duration,
    easing,
    onUpdate: (progress) => {
      const value = from + (to - from) * progress;
      if (onUpdate) {
        onUpdate(value);
      }
    },
    onComplete,
  });
}

export function createColorTween(config: TweenConfig<string>): Animation {
  const { from, to, duration, easing = EasingFunctions.linear, onUpdate, onComplete } = config;
  
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  
  if (!fromRgb || !toRgb) {
    throw new Error('Invalid color format');
  }
  
  return new Animation({
    duration,
    easing,
    onUpdate: (progress) => {
      const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
      const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
      const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);
      const color = `rgb(${r}, ${g}, ${b})`;
      
      if (onUpdate) {
        onUpdate(color);
      }
    },
    onComplete,
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}