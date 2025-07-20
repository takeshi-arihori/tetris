export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
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
        Insert: {
          user_id: string
          bgm_volume?: number
          sfx_volume?: number
          theme?: string
          language?: string
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          privacy_public?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          bgm_volume?: number
          sfx_volume?: number
          theme?: string
          language?: string
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          privacy_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      game_records: {
        Row: {
          id: string
          user_id: string
          score: number
          level: number
          lines_cleared: number
          duration: number
          tetrominos_dropped: number
          game_mode: string
          created_at: string
          session_id: string | null
          is_guest: boolean
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          level: number
          lines_cleared: number
          duration: number
          tetrominos_dropped: number
          game_mode?: string
          created_at?: string
          session_id?: string | null
          is_guest?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          level?: number
          lines_cleared?: number
          duration?: number
          tetrominos_dropped?: number
          game_mode?: string
          created_at?: string
          session_id?: string | null
          is_guest?: boolean
        }
        Relationships: []
      }
      personal_bests: {
        Row: {
          user_id: string
          best_score: number
          best_level: number
          best_lines: number
          longest_play: number
          most_tetrominos: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          best_score?: number
          best_level?: number
          best_lines?: number
          longest_play?: number
          most_tetrominos?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          best_score?: number
          best_level?: number
          best_lines?: number
          longest_play?: number
          most_tetrominos?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          user_id: string
          total_games: number
          total_score: number
          total_lines: number
          total_playtime: number
          total_tetrominos: number
          average_score: number
          average_duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_games?: number
          total_score?: number
          total_lines?: number
          total_playtime?: number
          total_tetrominos?: number
          average_score?: number
          average_duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_games?: number
          total_score?: number
          total_lines?: number
          total_playtime?: number
          total_tetrominos?: number
          average_score?: number
          average_duration?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          id: string
          user_id: string
          username: string
          score: number
          level: number
          rank_type: string
          rank_position: number
          period_start: string | null
          period_end: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          score: number
          level: number
          rank_type: string
          rank_position: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          score?: number
          level?: number
          rank_type?: string
          rank_position?: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}