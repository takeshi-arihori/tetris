'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CanvasRenderer, TetrominoData } from '@/lib/canvas/renderer';
import { SIDE_CANVAS_CONFIG } from '@/lib/canvas/utils';

export interface SideCanvasHandle {
  getRenderer: () => CanvasRenderer | null;
  clear: () => void;
  renderNext: (tetromino: TetrominoData) => void;
}

interface SideCanvasProps {
  className?: string;
  onMount?: (renderer: CanvasRenderer) => void;
}

export const SideCanvas = forwardRef<SideCanvasHandle, SideCanvasProps>(
  ({ className = '', onMount }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      try {
        const renderer = new CanvasRenderer(canvasRef.current, SIDE_CANVAS_CONFIG);
        rendererRef.current = renderer;
        
        if (onMount) {
          onMount(renderer);
        }
        
        return () => {
          renderer.stopPerformanceMonitoring();
          rendererRef.current = null;
        };
      } catch (error) {
        console.error('Failed to initialize SideCanvas:', error);
      }
    }, [onMount]);

    useImperativeHandle(ref, () => ({
      getRenderer: () => rendererRef.current,
      clear: () => {
        if (rendererRef.current) {
          rendererRef.current.clear();
        }
      },
      renderNext: (tetromino: TetrominoData) => {
        if (rendererRef.current) {
          rendererRef.current.renderNext(tetromino);
        }
      },
    }));

    return (
      <div className={`inline-block border-2 border-gray-600 ${className}`}>
        <canvas
          ref={canvasRef}
          className="block bg-gray-800"
          style={{
            width: SIDE_CANVAS_CONFIG.width,
            height: SIDE_CANVAS_CONFIG.height,
          }}
        />
      </div>
    );
  }
);

SideCanvas.displayName = 'SideCanvas';