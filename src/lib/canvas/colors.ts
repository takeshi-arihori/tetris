export const TETROMINO_COLORS = {
  I: '#00f0f0', // シアン
  O: '#f0f000', // イエロー
  T: '#a000f0', // パープル
  S: '#00f000', // グリーン
  Z: '#f00000', // レッド
  J: '#0000f0', // ブルー
  L: '#f0a000', // オレンジ
  EMPTY: '#000000', // 空セル
  GHOST: '#808080', // ゴーストピース
} as const;

export const BACKGROUND_COLORS = {
  GAME_BOARD: '#222222',
  SIDE_PANEL: '#333333',
  GRID_LINE: '#444444',
} as const;

export const EFFECT_COLORS = {
  PARTICLE: '#ffffff',
  EXPLOSION: '#ffaa00',
  LEVEL_UP: '#00ff00',
  GAME_OVER: '#ff0000',
} as const;

export type TetrominoType = keyof typeof TETROMINO_COLORS;