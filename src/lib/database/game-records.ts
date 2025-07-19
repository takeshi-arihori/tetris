// ゲーム記録のデータベース操作関数

import { supabase } from '@/lib/supabase/client';
import type {
  GameRecord,
  CreateGameRecordData,
  GameRecordFilters,
  GameRecordSort,
  GameRecordListResponse,
  GameResult,
  ApiResponse,
  GameMode
} from '@/types/game-records';

export class GameRecordService {
  /**
   * 新しいゲーム記録を保存
   */
  static async createGameRecord(
    data: CreateGameRecordData,
    isGuest: boolean = false,
    sessionId?: string
  ): Promise<ApiResponse<GameRecord>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (isGuest && !sessionId) {
        return {
          success: false,
          error: 'INVALID_DATA',
          message: 'ゲストプレイにはセッションIDが必要です'
        };
      }

      if (!isGuest && !user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      // ゲーム記録を保存
      const recordData = {
        ...data,
        user_id: isGuest ? null : user?.id,
        session_id: isGuest ? sessionId : null,
        is_guest: isGuest
      };

      const { data: record, error } = await supabase
        .from('game_records')
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;

      // 認証済みユーザーの場合、統計を更新
      if (!isGuest && user) {
        await this.updateUserStats(user.id, data);
      }

      return {
        success: true,
        data: record,
        message: 'ゲーム記録を保存しました'
      };

    } catch (error) {
      console.error('Failed to create game record:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲーム記録の保存に失敗しました'
      };
    }
  }

  /**
   * ユーザーのゲーム記録一覧を取得
   */
  static async getUserGameRecords(
    filters: GameRecordFilters = {},
    sort: GameRecordSort = { field: 'created_at', direction: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<GameRecordListResponse>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      let query = supabase
        .from('game_records')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_guest', false);

      // フィルタ適用
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      if (filters.min_score) {
        query = query.gte('score', filters.min_score);
      }
      
      if (filters.max_score) {
        query = query.lte('score', filters.max_score);
      }
      
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      
      if (filters.game_mode) {
        query = query.eq('game_mode', filters.game_mode);
      }

      // ソート適用
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      // ページネーション
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: records, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          records: records || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages
          }
        }
      };

    } catch (error) {
      console.error('Failed to get user game records:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲーム記録の取得に失敗しました'
      };
    }
  }

  /**
   * ゲスト記録を取得
   */
  static async getGuestGameRecords(sessionId: string): Promise<ApiResponse<GameRecord[]>> {
    try {
      const { data: records, error } = await supabase
        .from('game_records')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_guest', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: records || []
      };

    } catch (error) {
      console.error('Failed to get guest game records:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲスト記録の取得に失敗しました'
      };
    }
  }

  /**
   * ゲスト記録をユーザー記録に移行
   */
  static async migrateGuestRecords(sessionId: string): Promise<ApiResponse<number>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      // ストアドプロシージャを呼び出し
      const { data, error } = await supabase.rpc('migrate_guest_records_to_user', {
        p_session_id: sessionId,
        p_user_id: user.id
      });

      if (error) throw error;

      return {
        success: true,
        data: data as number,
        message: `${data}件のゲスト記録をアカウントに移行しました`
      };

    } catch (error) {
      console.error('Failed to migrate guest records:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲスト記録の移行に失敗しました'
      };
    }
  }

  /**
   * 単一のゲーム記録を取得
   */
  static async getGameRecord(recordId: string): Promise<ApiResponse<GameRecord>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: record, error } = await supabase
        .from('game_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;
      
      // ユーザーのデータかどうかチェック
      if (record.user_id !== user?.id && !record.is_guest) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'このデータにアクセスする権限がありません'
        };
      }

      return {
        success: true,
        data: record
      };

    } catch (error) {
      console.error('Failed to get game record:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲーム記録の取得に失敗しました'
      };
    }
  }

  /**
   * ゲーム記録を削除
   */
  static async deleteGameRecord(recordId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      const { error } = await supabase
        .from('game_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        success: true,
        message: 'ゲーム記録を削除しました'
      };

    } catch (error) {
      console.error('Failed to delete game record:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ゲーム記録の削除に失敗しました'
      };
    }
  }

  /**
   * ユーザー統計を更新（内部用）
   */
  private static async updateUserStats(
    userId: string, 
    gameData: CreateGameRecordData
  ): Promise<void> {
    try {
      // ストアドプロシージャを使用して統計とベスト記録を一括更新
      const { error } = await supabase.rpc('save_game_record_and_update_stats', {
        p_user_id: userId,
        p_score: gameData.score,
        p_level: gameData.level,
        p_lines_cleared: gameData.lines_cleared,
        p_duration: gameData.duration,
        p_tetrominos_dropped: gameData.tetrominos_dropped,
        p_game_mode: gameData.game_mode || 'classic'
      });

      if (error) throw error;

    } catch (error) {
      console.error('Failed to update user stats:', error);
      // 統計更新失敗でもゲーム記録は保存する
    }
  }

  /**
   * 今日のベストスコアを取得
   */
  static async getTodaysBest(): Promise<ApiResponse<GameRecord[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: records, error } = await supabase
        .from('game_records')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .eq('is_guest', false)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      return {
        success: true,
        data: records || []
      };

    } catch (error) {
      console.error('Failed to get today\'s best:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '今日のベストスコアの取得に失敗しました'
      };
    }
  }

  /**
   * 期限切れゲストデータを削除
   */
  static async cleanupExpiredGuestData(): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_guest_data');

      if (error) throw error;

      return {
        success: true,
        data: data as number,
        message: `${data}件の期限切れデータを削除しました`
      };

    } catch (error) {
      console.error('Failed to cleanup expired guest data:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '期限切れデータの削除に失敗しました'
      };
    }
  }
}