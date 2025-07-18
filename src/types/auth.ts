export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface GameRecord {
  id: string
  user_id: string | null
  score: number
  level: number
  lines_cleared: number
  duration: number
  tetrominos_dropped: number
  created_at: string
  session_id: string | null
  is_guest: boolean
}

export interface PersonalBest {
  user_id: string
  best_score: number
  best_level: number
  best_lines: number
  longest_play: number
  updated_at: string
}

export interface UserStatistics {
  user_id: string
  total_games: number
  total_score: number
  total_lines: number
  total_playtime: number
  average_score: number
  updated_at: string
}

export interface Ranking {
  id: string
  user_id: string
  username: string
  score: number
  level: number
  rank_type: 'overall' | 'weekly' | 'monthly' | 'yearly'
  rank_position: number
  period_start: string | null
  period_end: string | null
  updated_at: string
  created_at: string
}

export interface UserSettings {
  user_id: string
  bgm_volume: number
  sfx_volume: number
  theme: string
  language: string
  timezone: string
  email_notifications: boolean
  push_notifications: boolean
  privacy_public: boolean
  updated_at: string
}