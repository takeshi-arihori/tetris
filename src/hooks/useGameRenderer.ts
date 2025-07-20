'use client';

import { useRef, useCallback, useEffect } from 'react';
import { CanvasRenderer, GameBoard, TetrominoData } from '@/lib/canvas/renderer';
import { EffectsManager, createGameOverEffect, createLevelUpEffect, createTetrisEffect } from '@/lib/canvas/effects';
import { useAnimation } from './useAnimation';
import { GameState, Tetromino } from '@/types/tetris';
import { TETROMINO_COLORS, TetrominoType } from '@/lib/canvas/colors';

export interface GameRendererOptions {
  showGrid?: boolean;
  showShadow?: boolean;
  showEffects?: boolean;
  animationEnabled?: boolean;
}

export function useGameRenderer(options: GameRendererOptions = {}) {
  const { showGrid = true, showShadow = true, showEffects = true, animationEnabled = true } = options;
  
  const mainRendererRef = useRef<CanvasRenderer | null>(null);
  const sideRendererRef = useRef<CanvasRenderer | null>(null);
  const effectsManagerRef = useRef<EffectsManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const prevLevelRef = useRef<number>(1);
  const prevLinesRef = useRef<number>(0);
  
  const {
    animateDrop,
    animateRotation,
    animateLineClear,
    stopAnimation,
    stopAllAnimations,
  } = useAnimation();

  const getEffectsManager = useCallback(() => {
    if (!effectsManagerRef.current) {
      effectsManagerRef.current = new EffectsManager();
    }
    return effectsManagerRef.current;
  }, []);

  const setMainRenderer = useCallback((renderer: CanvasRenderer | null) => {
    mainRendererRef.current = renderer;
  }, []);

  const setSideRenderer = useCallback((renderer: CanvasRenderer | null) => {
    sideRendererRef.current = renderer;
  }, []);

  const convertTetrominoToData = useCallback((tetromino: Tetromino): TetrominoData => {
    return {
      shape: tetromino.shape.map(row => row.map(cell => Boolean(cell))),
      type: tetromino.type as TetrominoType,
      position: { row: tetromino.position.y, col: tetromino.position.x },
      rotation: tetromino.rotation,
    };
  }, []);

  const convertBoardToGameBoard = useCallback((board: number[][]): GameBoard => {
    return board.map(row => row.map(cell => {
      if (cell === 0) return 'EMPTY';
      // Convert number to TetrominoType based on the mapping
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      return types[cell - 1] || 'EMPTY';
    })) as GameBoard;
  }, []);

  const renderGame = useCallback((gameState: GameState) => {
    if (!mainRendererRef.current) return;

    const board = convertBoardToGameBoard(gameState.board);
    const renderer = mainRendererRef.current;
    
    // Clear canvas
    renderer.clear();
    
    // Draw board
    renderer.drawBoard(board, { showGrid, showShadow });
    
    // Draw current piece
    if (gameState.currentPiece) {
      const tetrominoData = convertTetrominoToData(gameState.currentPiece);
      renderer.drawTetromino(tetrominoData, { showShadow });
    }
    
    // Draw effects
    if (showEffects && effectsManagerRef.current) {
      effectsManagerRef.current.render(renderer['ctx']);
    }
  }, [showGrid, showShadow, showEffects, convertBoardToGameBoard, convertTetrominoToData]);

  const renderNextPiece = useCallback((nextPiece: Tetromino) => {
    if (!sideRendererRef.current) return;

    const tetrominoData = convertTetrominoToData(nextPiece);
    sideRendererRef.current.drawNextPiece(tetrominoData);
  }, [convertTetrominoToData]);

  const handleGameStateChange = useCallback((gameState: GameState) => {
    // Check for level up
    if (gameState.level > prevLevelRef.current) {
      if (showEffects && effectsManagerRef.current && mainRendererRef.current) {
        const canvas = mainRendererRef.current['ctx'].canvas;
        createLevelUpEffect(getEffectsManager(), canvas.width, canvas.height);
      }
      prevLevelRef.current = gameState.level;
    }

    // Check for lines cleared
    if (gameState.lines > prevLinesRef.current) {
      const clearedLines = gameState.lines - prevLinesRef.current;
      if (showEffects && effectsManagerRef.current && mainRendererRef.current) {
        const canvas = mainRendererRef.current['ctx'].canvas;
        // Simulate line positions for effect (this would need to be passed from game engine)
        const linePositions = Array.from({ length: clearedLines }, (_, i) => i);
        createTetrisEffect(getEffectsManager(), linePositions, canvas.width, 30);
      }
      prevLinesRef.current = gameState.lines;
    }

    // Handle game over
    if (gameState.isGameOver && showEffects && effectsManagerRef.current && mainRendererRef.current) {
      const canvas = mainRendererRef.current['ctx'].canvas;
      createGameOverEffect(getEffectsManager(), canvas.width, canvas.height);
    }

    // Render the game
    renderGame(gameState);
    if (gameState.nextPiece) {
      // Convert TetrominoType to Tetromino for rendering
      const nextPieceData: Tetromino = {
        type: gameState.nextPiece,
        shape: [[1]], // Simplified - would need proper shape lookup
        position: { x: 0, y: 0 },
        rotation: 0,
      };
      renderNextPiece(nextPieceData);
    }
  }, [showEffects, renderGame, renderNextPiece, getEffectsManager]);

  const animateTetrominoDrop = useCallback((
    tetromino: Tetromino,
    fromY: number,
    toY: number,
    duration: number = 300,
    onComplete?: () => void
  ) => {
    if (!animationEnabled) {
      if (onComplete) onComplete();
      return;
    }

    animateDrop(
      'tetromino-drop',
      fromY,
      toY,
      duration,
      (_y) => {
        if (mainRendererRef.current) {
          // Re-render with animated position
          // This would need integration with the game state
        }
      },
      onComplete
    );
  }, [animationEnabled, animateDrop, convertTetrominoToData]);

  const animateTetrominoRotation = useCallback((
    tetromino: Tetromino,
    fromRotation: number,
    toRotation: number,
    duration: number = 200,
    onComplete?: () => void
  ) => {
    if (!animationEnabled) {
      if (onComplete) onComplete();
      return;
    }

    animateRotation(
      'tetromino-rotation',
      fromRotation,
      toRotation,
      duration,
      (_rotation) => {
        if (mainRendererRef.current) {
          // Re-render with animated rotation
          // This would need integration with the game state
        }
      },
      onComplete
    );
  }, [animationEnabled, animateRotation, convertTetrominoToData]);

  const animateLinesClear = useCallback((
    lines: number[],
    duration: number = 500,
    onComplete?: () => void
  ) => {
    if (!animationEnabled) {
      if (onComplete) onComplete();
      return;
    }

    animateLineClear(
      'lines-clear',
      lines,
      duration,
      (_progress, _clearedLines) => {
        // Apply line clear animation effects
        if (mainRendererRef.current) {
          // This would need custom rendering logic for line clearing animation
        }
      },
      onComplete
    );
  }, [animationEnabled, animateLineClear]);

  const startGameLoop = useCallback(() => {
    if (animationFrameRef.current) return;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update effects
      if (showEffects && effectsManagerRef.current) {
        effectsManagerRef.current.update(deltaTime);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  }, [showEffects]);

  const stopGameLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const clearAnimations = useCallback(() => {
    stopAllAnimations();
    if (effectsManagerRef.current) {
      effectsManagerRef.current.clear();
    }
  }, [stopAllAnimations]);

  useEffect(() => {
    startGameLoop();
    return () => {
      stopGameLoop();
      clearAnimations();
    };
  }, [startGameLoop, stopGameLoop, clearAnimations]);

  return {
    setMainRenderer,
    setSideRenderer,
    renderGame,
    renderNextPiece,
    handleGameStateChange,
    animateTetrominoDrop,
    animateTetrominoRotation,
    animateLinesClear,
    clearAnimations,
    startGameLoop,
    stopGameLoop,
    effectsManager: getEffectsManager(),
  };
}