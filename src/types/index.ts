// ゲーム関連の型定義
export interface TetroPosition {
  x: number;
  y: number;
}

export interface TetroState {
  type: number;
  rotation: number;
  position: TetroPosition;
}

export interface GameState {
  field: number[][];
  currentTetro: TetroState | null;
  nextTetro: TetroState | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface GameRecord {
  id: string;
  userId?: string;
  score: number;
  level: number;
  lines: number;
  duration: number;
  createdAt: Date;
  isGuest: boolean;
}

// ユーザー関連の型定義
export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  bgmVolume: number;
  sfxVolume: number;
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// 音響関連の型定義
export interface AudioSettings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
}