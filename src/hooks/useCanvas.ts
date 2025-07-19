'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { CanvasRenderer, GameBoard, TetrominoData, RenderOptions } from '@/lib/canvas/renderer';
import { AnimationManager } from '@/lib/canvas/animation';
import { EffectsManager } from '@/lib/canvas/effects';
import { CanvasConfig } from '@/lib/canvas/utils';

export interface UseCanvasOptions {
  config?: CanvasConfig;
  enableEffects?: boolean;
  enableAnimations?: boolean;
  onMount?: (renderer: CanvasRenderer) => void;
  onError?: (error: Error) => void;
}

export interface CanvasHookReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  renderer: CanvasRenderer | null;
  animationManager: AnimationManager | null;
  effectsManager: EffectsManager | null;
  isReady: boolean;
  error: Error | null;
  clear: () => void;
  renderBoard: (board: GameBoard, options?: RenderOptions) => void;
  renderTetromino: (tetromino: TetrominoData, options?: RenderOptions) => void;
  renderGhost: (tetromino: TetrominoData, ghostPosition: { row: number; col: number }) => void;
  renderNext: (tetromino: TetrominoData) => void;
  renderText: (text: string, x: number, y: number, options?: any) => void;
  startLineClearAnimation: (lines: number[], board: GameBoard, onComplete?: () => void) => void;
  startLevelUpAnimation: (onComplete?: () => void) => void;
  startGameOverAnimation: (onComplete?: () => void) => void;
  createExplosion: (x: number, y: number, intensity?: number) => void;
  createLineClearEffect: (lineY: number, canvasWidth: number, lineCount: number) => void;
  startScreenShake: (intensity: number, duration: number, frequency?: number) => void;
}

export function useCanvas(options: UseCanvasOptions = {}): CanvasHookReturn {
  const {
    config,
    enableEffects = true,
    enableAnimations = true,
    onMount,
    onError
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const animationManagerRef = useRef<AnimationManager | null>(null);
  const effectsManagerRef = useRef<EffectsManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // CanvasRenderer作成
      const renderer = new CanvasRenderer(canvasRef.current, config);
      rendererRef.current = renderer;

      // AnimationManager作成
      if (enableAnimations) {
        const animationManager = new AnimationManager();
        animationManagerRef.current = animationManager;
      }

      // EffectsManager作成
      if (enableEffects) {
        const effectsManager = new EffectsManager();
        effectsManagerRef.current = effectsManager;
      }

      setIsReady(true);
      setError(null);

      if (onMount) {
        onMount(renderer);
      }

      // エフェクト更新ループ開始
      if (enableEffects && effectsManagerRef.current) {
        let lastTime = performance.now();
        
        const updateLoop = (currentTime: number) => {
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;

          if (effectsManagerRef.current) {
            effectsManagerRef.current.update(deltaTime);
          }

          animationFrameRef.current = requestAnimationFrame(updateLoop);
        };

        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Canvas initialization failed');
      setError(error);
      setIsReady(false);

      if (onError) {
        onError(error);
      }
    }

    return () => {
      // クリーンアップ
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.stopPerformanceMonitoring();
      }

      if (animationManagerRef.current) {
        animationManagerRef.current.stopGlobalTimer();
        animationManagerRef.current.clear();
      }

      if (effectsManagerRef.current) {
        effectsManagerRef.current.clear();
      }

      rendererRef.current = null;
      animationManagerRef.current = null;
      effectsManagerRef.current = null;
      setIsReady(false);
    };
  }, [config, enableEffects, enableAnimations, onMount, onError]);

  // 基本描画メソッド
  const clear = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.clear();
    }
  }, []);

  const renderBoard = useCallback((board: GameBoard, options?: RenderOptions) => {
    if (rendererRef.current) {
      rendererRef.current.renderBoard(board, options);
    }
  }, []);

  const renderTetromino = useCallback((tetromino: TetrominoData, options?: RenderOptions) => {
    if (rendererRef.current) {
      rendererRef.current.renderTetromino(tetromino, options);
    }
  }, []);

  const renderGhost = useCallback((tetromino: TetrominoData, ghostPosition: { row: number; col: number }) => {
    if (rendererRef.current) {
      rendererRef.current.renderGhost(tetromino, ghostPosition);
    }
  }, []);

  const renderNext = useCallback((tetromino: TetrominoData) => {
    if (rendererRef.current) {
      rendererRef.current.renderNext(tetromino);
    }
  }, []);

  const renderText = useCallback((text: string, x: number, y: number, options?: any) => {
    if (rendererRef.current) {
      rendererRef.current.renderText(text, x, y, options);
    }
  }, []);

  // アニメーションメソッド
  const startLineClearAnimation = useCallback((lines: number[], board: GameBoard, onComplete?: () => void) => {
    if (!rendererRef.current || !animationManagerRef.current) return;

    const renderer = rendererRef.current;
    const animationId = 'line-clear';

    animationManagerRef.current.createTween(animationId, {
      from: 0,
      to: 1,
      duration: 500,
      onUpdate: (progress, value) => {
        renderer.renderLineClearAnimation(lines, value, board);
      },
      onComplete: () => {
        animationManagerRef.current?.remove(animationId);
        if (onComplete) onComplete();
      }
    }).start();
  }, []);

  const startLevelUpAnimation = useCallback((onComplete?: () => void) => {
    if (!rendererRef.current || !animationManagerRef.current) return;

    const renderer = rendererRef.current;
    const animationId = 'level-up';

    animationManagerRef.current.createTween(animationId, {
      from: 0,
      to: 1,
      duration: 1000,
      onUpdate: (progress, value) => {
        renderer.renderLevelUpEffect(value);
      },
      onComplete: () => {
        animationManagerRef.current?.remove(animationId);
        if (onComplete) onComplete();
      }
    }).start();
  }, []);

  const startGameOverAnimation = useCallback((onComplete?: () => void) => {
    if (!rendererRef.current || !animationManagerRef.current) return;

    const renderer = rendererRef.current;
    const animationId = 'game-over';

    animationManagerRef.current.createTween(animationId, {
      from: 0,
      to: 1,
      duration: 2000,
      onUpdate: (progress, value) => {
        renderer.renderGameOverEffect(value);
      },
      onComplete: () => {
        animationManagerRef.current?.remove(animationId);
        if (onComplete) onComplete();
      }
    }).start();
  }, []);

  // エフェクトメソッド
  const createExplosion = useCallback((x: number, y: number, intensity: number = 1) => {
    if (effectsManagerRef.current) {
      effectsManagerRef.current.getParticleSystem().createExplosion(x, y, intensity);
    }
  }, []);

  const createLineClearEffect = useCallback((lineY: number, canvasWidth: number, lineCount: number) => {
    if (effectsManagerRef.current) {
      effectsManagerRef.current.createLineClearEffect(lineY, canvasWidth, lineCount);
    }
  }, []);

  const startScreenShake = useCallback((intensity: number, duration: number, frequency?: number) => {
    if (effectsManagerRef.current) {
      effectsManagerRef.current.startScreenShake(intensity, duration, frequency);
    }
  }, []);

  return {
    canvasRef,
    renderer: rendererRef.current,
    animationManager: animationManagerRef.current,
    effectsManager: effectsManagerRef.current,
    isReady,
    error,
    clear,
    renderBoard,
    renderTetromino,
    renderGhost,
    renderNext,
    renderText,
    startLineClearAnimation,
    startLevelUpAnimation,
    startGameOverAnimation,
    createExplosion,
    createLineClearEffect,
    startScreenShake,
  };
}
