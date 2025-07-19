'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CanvasRenderer, GameBoard, TetrominoData, RenderOptions } from '@/lib/canvas/renderer';
import { MAIN_CANVAS_CONFIG } from '@/lib/canvas/utils';

export interface GameCanvasHandle {
  getRenderer: () => CanvasRenderer | null;
  clear: () => void;
  renderBoard: (board: GameBoard, options?: RenderOptions) => void;
  renderTetromino: (tetromino: TetrominoData, options?: RenderOptions) => void;
  renderGhost: (tetromino: TetrominoData, ghostPosition: { row: number; col: number }) => void;
  renderLineClearAnimation: (lines: number[], progress: number, board: GameBoard) => void;
  renderGameOverEffect: (progress: number) => void;
  renderLevelUpEffect: (progress: number) => void;
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
          renderer.stopPerformanceMonitoring();
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
      renderBoard: (board: GameBoard, options?: RenderOptions) => {
        if (rendererRef.current) {
          rendererRef.current.renderBoard(board, options);
        }
      },
      renderTetromino: (tetromino: TetrominoData, options?: RenderOptions) => {
        if (rendererRef.current) {
          rendererRef.current.renderTetromino(tetromino, options);
        }
      },
      renderGhost: (tetromino: TetrominoData, ghostPosition: { row: number; col: number }) => {
        if (rendererRef.current) {
          rendererRef.current.renderGhost(tetromino, ghostPosition);
        }
      },
      renderLineClearAnimation: (lines: number[], progress: number, board: GameBoard) => {
        if (rendererRef.current) {
          rendererRef.current.renderLineClearAnimation(lines, progress, board);
        }
      },
      renderGameOverEffect: (progress: number) => {
        if (rendererRef.current) {
          rendererRef.current.renderGameOverEffect(progress);
        }
      },
      renderLevelUpEffect: (progress: number) => {
        if (rendererRef.current) {
          rendererRef.current.renderLevelUpEffect(progress);
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