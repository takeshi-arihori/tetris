export { CanvasRenderer, type GameBoard, type TetrominoData, type RenderOptions } from './renderer';
export { TETROMINO_COLORS, BACKGROUND_COLORS, EFFECT_COLORS, type TetrominoType } from './colors';
export { 
  type CanvasConfig, 
  MAIN_CANVAS_CONFIG, 
  SIDE_CANVAS_CONFIG,
  clearCanvas,
  fillCell,
  strokeCell,
  drawGrid,
  drawBackground,
  drawCellWithShadow
} from './utils';
export { 
  EasingFunctions, 
  Animation, 
  AnimationManager, 
  createNumberTween, 
  createColorTween,
  type EasingFunction,
  type AnimationConfig,
  type TweenConfig
} from './animation';
export { 
  ParticleSystem, 
  EffectsManager, 
  createGameOverEffect, 
  createLevelUpEffect, 
  createTetrisEffect,
  type Particle,
  type ScreenShake
} from './effects';