'use client';

import { useRef, useCallback, useEffect } from 'react';
import { CanvasRenderer } from '@/lib/canvas/renderer';
import { CanvasConfig } from '@/lib/canvas/utils';

export interface UseCanvasOptions {
  onMount?: (renderer: CanvasRenderer) => void;
  onUnmount?: (renderer: CanvasRenderer) => void;
  autoStart?: boolean;
}

export function useCanvas(config: CanvasConfig, options: UseCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const { onMount, onUnmount, autoStart = false } = options;

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current) return null;

    try {
      const renderer = new CanvasRenderer(canvasRef.current, config);
      rendererRef.current = renderer;
      
      if (onMount) {
        onMount(renderer);
      }
      
      return renderer;
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      return null;
    }
  }, [config, onMount]);

  const destroyCanvas = useCallback(() => {
    if (rendererRef.current) {
      if (onUnmount) {
        onUnmount(rendererRef.current);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  }, [onUnmount]);

  const getRenderer = useCallback(() => {
    return rendererRef.current;
  }, []);

  const startAnimation = useCallback((callback: () => void) => {
    if (rendererRef.current) {
      rendererRef.current.startAnimation(callback);
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.stopAnimation();
    }
  }, []);

  const clear = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.clear();
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      initializeCanvas();
    }
    
    return () => {
      destroyCanvas();
    };
  }, [autoStart, initializeCanvas, destroyCanvas]);

  return {
    canvasRef,
    renderer: rendererRef.current,
    initializeCanvas,
    destroyCanvas,
    getRenderer,
    startAnimation,
    stopAnimation,
    clear,
  };
}