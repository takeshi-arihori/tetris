export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Position {
  x: number
  y: number
}

export interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
  rotation: number
}

export interface GameState {
  board: number[][]
  currentPiece: Tetromino | null
  nextPiece: TetrominoType | null
  score: number
  level: number
  lines: number
  isPlaying: boolean
  isPaused: boolean
  isGameOver: boolean
  playtime: number
  tetrominoCount: number
}

export interface GameConfig {
  boardWidth: number
  boardHeight: number
  dropInterval: number
  levelSpeedMultiplier: number
  scoring: {
    single: number
    double: number
    triple: number
    tetris: number
    softDrop: number
    hardDrop: number
  }
}

export interface GameStats {
  totalGames: number
  totalScore: number
  totalLines: number
  totalPlaytime: number
  bestScore: number
  bestLevel: number
  bestLines: number
  longestPlay: number
  averageScore: number
  tetrominoStats: Record<TetrominoType, number>
}

export enum GameAction {
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  MOVE_DOWN = 'MOVE_DOWN',
  ROTATE_CW = 'ROTATE_CW',
  ROTATE_CCW = 'ROTATE_CCW',
  HARD_DROP = 'HARD_DROP',
  SOFT_DROP = 'SOFT_DROP',
  HOLD = 'HOLD',
  PAUSE = 'PAUSE',
  RESTART = 'RESTART',
}