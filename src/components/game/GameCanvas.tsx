'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CanvasRenderer, GameBoard, TetrominoData, RenderOptions } from '@/lib/canvas/renderer';
import { MAIN_CANVAS_CONFIG } from '@/lib/canvas/utils';

export interface GameCanvasHandle {
  getRenderer: () => CanvasRenderer | null;
  clear: () => void;
  drawBoard: (board: GameBoard, options?: RenderOptions) => void;
  drawTetromino: (tetromino: TetrominoData, options?: RenderOptions) => void;
}

interface GameCanvasProps {
  className?: string;
  onMount?: (renderer: CanvasRenderer) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  ({ className = '', onMount }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      try {
        const renderer = new CanvasRenderer(canvasRef.current, MAIN_CANVAS_CONFIG);
        rendererRef.current = renderer;
        
        if (onMount) {
          onMount(renderer);
        }
        
        return () => {
          renderer.dispose();
          rendererRef.current = null;
        };
      } catch (error) {
        console.error('Failed to initialize GameCanvas:', error);
      }
    }, [onMount]);

    useImperativeHandle(ref, () => ({
      getRenderer: () => rendererRef.current,
      clear: () => {
        if (rendererRef.current) {
          rendererRef.current.clear();
        }
      },
      drawBoard: (board: GameBoard, options?: RenderOptions) => {
        if (rendererRef.current) {
          rendererRef.current.drawBoard(board, options);
        }
      },
      drawTetromino: (tetromino: TetrominoData, options?: RenderOptions) => {
        if (rendererRef.current) {
          rendererRef.current.drawTetromino(tetromino, options);
        }
      },
    }));

    return (
      <div className={`inline-block border-2 border-gray-600 ${className}`}>
        <canvas
          ref={canvasRef}
          className="block bg-gray-900"
          style={{
            width: MAIN_CANVAS_CONFIG.width,
            height: MAIN_CANVAS_CONFIG.height,
          }}
        />
      </div>
    );
  }
);

GameCanvas.displayName = 'GameCanvas';