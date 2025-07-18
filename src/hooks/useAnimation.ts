'use client';

import { useRef, useCallback, useEffect } from 'react';
import { 
  AnimationManager, 
  AnimationConfig, 
  EasingFunctions, 
  createNumberTween, 
  createColorTween,
  TweenConfig
} from '@/lib/canvas/animation';

export function useAnimation() {
  const managerRef = useRef<AnimationManager | null>(null);

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      managerRef.current = new AnimationManager();
    }
    return managerRef.current;
  }, []);

  const createAnimation = useCallback((key: string, config: AnimationConfig) => {
    const manager = getManager();
    return manager.create(key, config);
  }, [getManager]);

  const startAnimation = useCallback((key: string) => {
    const manager = getManager();
    return manager.start(key);
  }, [getManager]);

  const stopAnimation = useCallback((key: string) => {
    const manager = getManager();
    return manager.stop(key);
  }, [getManager]);

  const stopAllAnimations = useCallback(() => {
    const manager = getManager();
    manager.stopAll();
  }, [getManager]);

  const removeAnimation = useCallback((key: string) => {
    const manager = getManager();
    return manager.remove(key);
  }, [getManager]);

  const clearAnimations = useCallback(() => {
    const manager = getManager();
    manager.clear();
  }, [getManager]);

  const hasAnimation = useCallback((key: string) => {
    const manager = getManager();
    return manager.has(key);
  }, [getManager]);

  const animateNumber = useCallback((key: string, config: TweenConfig<number>) => {
    const manager = getManager();
    const animation = createNumberTween(config);
    manager.create(key, {
      duration: config.duration,
      easing: config.easing || EasingFunctions.linear,
      onUpdate: config.onUpdate ? (progress) => {
        const value = config.from + (config.to - config.from) * progress;
        config.onUpdate!(value);
      } : undefined,
      onComplete: config.onComplete,
    });
    manager.start(key);
    return animation;
  }, [getManager]);

  const animateColor = useCallback((key: string, config: TweenConfig<string>) => {
    const manager = getManager();
    const animation = createColorTween(config);
    manager.create(key, {
      duration: config.duration,
      easing: config.easing || EasingFunctions.linear,
      onUpdate: config.onUpdate ? (_progress) => {
        // Color interpolation logic would go here
        if (config.onUpdate) {
          config.onUpdate(config.from); // Simplified for now
        }
      } : undefined,
      onComplete: config.onComplete,
    });
    manager.start(key);
    return animation;
  }, [getManager]);

  const animateFade = useCallback((
    key: string, 
    from: number, 
    to: number, 
    duration: number, 
    onUpdate?: (alpha: number) => void, 
    onComplete?: () => void
  ) => {
    return animateNumber(key, {
      from,
      to,
      duration,
      easing: EasingFunctions.easeInOutQuad,
      onUpdate,
      onComplete,
    });
  }, [animateNumber]);

  const animateSlide = useCallback((
    key: string, 
    from: number, 
    to: number, 
    duration: number, 
    onUpdate?: (position: number) => void, 
    onComplete?: () => void
  ) => {
    return animateNumber(key, {
      from,
      to,
      duration,
      easing: EasingFunctions.easeOutBack,
      onUpdate,
      onComplete,
    });
  }, [animateNumber]);

  const animateScale = useCallback((
    key: string, 
    from: number, 
    to: number, 
    duration: number, 
    onUpdate?: (scale: number) => void, 
    onComplete?: () => void
  ) => {
    return animateNumber(key, {
      from,
      to,
      duration,
      easing: EasingFunctions.easeOutElastic,
      onUpdate,
      onComplete,
    });
  }, [animateNumber]);

  const animateRotation = useCallback((
    key: string, 
    from: number, 
    to: number, 
    duration: number, 
    onUpdate?: (rotation: number) => void, 
    onComplete?: () => void
  ) => {
    return animateNumber(key, {
      from,
      to,
      duration,
      easing: EasingFunctions.easeOutBack,
      onUpdate,
      onComplete,
    });
  }, [animateNumber]);

  const animateLineClear = useCallback((
    key: string,
    lines: number[],
    duration: number,
    onUpdate?: (progress: number, lines: number[]) => void,
    onComplete?: () => void
  ) => {
    return createAnimation(key, {
      duration,
      easing: EasingFunctions.easeInOutQuad,
      onUpdate: (progress) => {
        if (onUpdate) {
          onUpdate(progress, lines);
        }
      },
      onComplete,
    });
  }, [createAnimation]);

  const animateDrop = useCallback((
    key: string,
    from: number,
    to: number,
    duration: number,
    onUpdate?: (y: number) => void,
    onComplete?: () => void
  ) => {
    return animateNumber(key, {
      from,
      to,
      duration,
      easing: EasingFunctions.easeInQuad,
      onUpdate,
      onComplete,
    });
  }, [animateNumber]);

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, []);

  return {
    createAnimation,
    startAnimation,
    stopAnimation,
    stopAllAnimations,
    removeAnimation,
    clearAnimations,
    hasAnimation,
    animateNumber,
    animateColor,
    animateFade,
    animateSlide,
    animateScale,
    animateRotation,
    animateLineClear,
    animateDrop,
    EasingFunctions,
  };
}