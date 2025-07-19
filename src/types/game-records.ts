// ゲーム記録・統計関連の型定義

export type GameMode = 'classic' | 'speed' | 'marathon';

export interface GameRecord {
  id: string;
  user_id?: string;
  score: number;
  level: number;
  lines_cleared: number;
  duration: number; // 秒
  tetrominos_dropped: number;
  game_mode: GameMode;
  created_at: string;
  session_id?: string;
  is_guest: boolean;
}

export interface PersonalBests {
  user_id: string;
  best_score: number;
  best_level: number;
  best_lines: number;
  longest_play: number; // 秒
  most_tetrominos: number;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  user_id: string;
  total_games: number;
  total_score: number;
  total_lines: number;
  total_playtime: number; // 秒
  total_tetrominos: number;
  average_score: number;
  average_duration: number; // 秒
  created_at: string;
  updated_at: string;
}

export interface GuestSession {
  session_id: string;
  game_data: GameRecord[];
  created_at: string;
  expires_at: string;
}

// ゲーム記録作成用のインターフェース
export interface CreateGameRecordData {
  score: number;
  level: number;
  lines_cleared: number;
  duration: number;
  tetrominos_dropped: number;
  game_mode?: GameMode;
}

// 統計集計用の型
export interface GameStatsSummary {
  personal_bests: PersonalBests;
  statistics: UserStatistics;
  recent_games: GameRecord[];
  total_records: number;
}

// フィルタリング・ソート用
export interface GameRecordFilters {
  start_date?: string;
  end_date?: string;
  min_score?: number;
  max_score?: number;
  level?: number;
  game_mode?: GameMode;
}

export interface GameRecordSort {
  field: 'score' | 'level' | 'lines_cleared' | 'duration' | 'created_at';
  direction: 'asc' | 'desc';
}

// ページネーション
export interface GameRecordPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface GameRecordListResponse {
  records: GameRecord[];
  pagination: GameRecordPagination;
}

// エクスポート用の型
export interface ExportOptions {
  format: 'csv' | 'json';
  include_personal_bests: boolean;
  include_statistics: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

// ランキング用
export interface RankingEntry {
  rank: number;
  user_id: string;
  username?: string;
  score: number;
  level: number;
  lines_cleared: number;
  created_at: string;
}

export interface Leaderboard {
  daily: RankingEntry[];
  weekly: RankingEntry[];
  monthly: RankingEntry[];
  all_time: RankingEntry[];
}

// グラフ・チャート用
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GameProgressChart {
  score_over_time: ChartDataPoint[];
  level_progression: ChartDataPoint[];
  lines_per_game: ChartDataPoint[];
  duration_trends: ChartDataPoint[];
}

// 成果・実績用
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'score' | 'level' | 'lines' | 'games' | 'playtime';
    value: number;
  };
  unlocked: boolean;
  unlocked_at?: string;
}

// ゲーム終了時のリザルト
export interface GameResult {
  record: GameRecord;
  is_personal_best: {
    score: boolean;
    level: boolean;
    lines: boolean;
    duration: boolean;
    tetrominos: boolean;
  };
  rank_info?: {
    current_rank: number;
    total_players: number;
    percentile: number;
  };
  achievements_unlocked: Achievement[];
}

// API レスポンス用
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// エラー型
export interface GameRecordError {
  code: 'INVALID_DATA' | 'DATABASE_ERROR' | 'PERMISSION_DENIED' | 'NOT_FOUND';
  message: string;
  details?: Record<string, any>;
}