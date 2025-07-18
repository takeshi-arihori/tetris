'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { GameCanvas, GameCanvasHandle } from './GameCanvas';
import { SideCanvas, SideCanvasHandle } from './SideCanvas';
import { useGameRenderer } from '@/hooks/useGameRenderer';
import { GameState } from '@/types/tetris';
import { TetrisGameEngine } from '@/lib/tetris/gameEngine';

interface CanvasGameRendererProps {
  gameEngine: TetrisGameEngine;
  className?: string;
  showGrid?: boolean;
  showShadow?: boolean;
  showEffects?: boolean;
  animationEnabled?: boolean;
}

export const CanvasGameRenderer: React.FC<CanvasGameRendererProps> = ({
  gameEngine,
  className = '',
  showGrid = true,
  showShadow = true,
  showEffects = true,
  animationEnabled = true,
}) => {
  const gameCanvasRef = useRef<GameCanvasHandle>(null);
  const sideCanvasRef = useRef<SideCanvasHandle>(null);
  
  const {
    setMainRenderer,
    setSideRenderer,
    handleGameStateChange,
    startGameLoop,
    stopGameLoop,
    clearAnimations,
  } = useGameRenderer({
    showGrid,
    showShadow,
    showEffects,
    animationEnabled,
  });

  const onGameCanvasMount = useCallback((renderer: any) => {
    setMainRenderer(renderer);
  }, [setMainRenderer]);

  const onSideCanvasMount = useCallback((renderer: any) => {
    setSideRenderer(renderer);
  }, [setSideRenderer]);

  const onGameStateChange = useCallback((gameState: GameState) => {
    handleGameStateChange(gameState);
  }, [handleGameStateChange]);

  const onLinesCleared = useCallback((lines: number, gameState: GameState) => {
    // Handle line clear animations and effects
    handleGameStateChange(gameState);
  }, [handleGameStateChange]);

  const onGameOver = useCallback((gameState: GameState) => {
    // Handle game over effects
    handleGameStateChange(gameState);
  }, [handleGameStateChange]);

  useEffect(() => {
    // Set up game engine callbacks
    gameEngine.setCallbacks({
      onStateChange: onGameStateChange,
      onLinesCleared: onLinesCleared,
      onGameOver: onGameOver,
    });

    // Start render loop
    startGameLoop();

    // Initial render
    const initialState = gameEngine.getState();
    handleGameStateChange(initialState);

    return () => {
      stopGameLoop();
      clearAnimations();
    };
  }, [
    gameEngine,
    onGameStateChange,
    onLinesCleared,
    onGameOver,
    startGameLoop,
    stopGameLoop,
    clearAnimations,
    handleGameStateChange,
  ]);

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-gray-300 mb-2">ゲームフィールド</h3>
        <GameCanvas
          ref={gameCanvasRef}
          onMount={onGameCanvasMount}
          className="shadow-lg"
        />
      </div>
      
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-gray-300 mb-2">次のピース</h3>
        <SideCanvas
          ref={sideCanvasRef}
          onMount={onSideCanvasMount}
          className="shadow-lg"
        />
      </div>
    </div>
  );
};