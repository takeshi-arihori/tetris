// 統計データのデータベース操作関数

import { supabase } from '@/lib/supabase/client';
import type {
  PersonalBests,
  UserStatistics,
  GameStatsSummary,
  GameProgressChart,
  ChartDataPoint,
  RankingEntry,
  Leaderboard,
  ApiResponse
} from '@/types/game-records';

export class StatisticsService {
  /**
   * ユーザーの個人ベスト記録を取得
   */
  static async getPersonalBests(userId?: string): Promise<ApiResponse<PersonalBests>> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return {
            success: false,
            error: 'PERMISSION_DENIED',
            message: '認証が必要です'
          };
        }
        targetUserId = user.id;
      }

      const { data: personalBests, error } = await supabase
        .from('personal_bests')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // No rows error is acceptable
        throw error;
      }

      // データが存在しない場合はデフォルト値を返す
      const defaultBests: PersonalBests = {
        user_id: targetUserId,
        best_score: 0,
        best_level: 1,
        best_lines: 0,
        longest_play: 0,
        most_tetrominos: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        data: personalBests || defaultBests
      };

    } catch (error) {
      console.error('Failed to get personal bests:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '個人ベスト記録の取得に失敗しました'
      };
    }
  }

  /**
   * ユーザーの統計データを取得
   */
  static async getUserStatistics(userId?: string): Promise<ApiResponse<UserStatistics>> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return {
            success: false,
            error: 'PERMISSION_DENIED',
            message: '認証が必要です'
          };
        }
        targetUserId = user.id;
      }

      const { data: statistics, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // データが存在しない場合はデフォルト値を返す
      const defaultStats: UserStatistics = {
        user_id: targetUserId,
        total_games: 0,
        total_score: 0,
        total_lines: 0,
        total_playtime: 0,
        total_tetrominos: 0,
        average_score: 0,
        average_duration: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        data: statistics || defaultStats
      };

    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '統計データの取得に失敗しました'
      };
    }
  }

  /**
   * 統計サマリーを取得（個人ベスト + 統計 + 最近のゲーム）
   */
  static async getGameStatsSummary(): Promise<ApiResponse<GameStatsSummary>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      const [personalBestsResult, statisticsResult, recentGamesResult, totalCountResult] = await Promise.all([
        this.getPersonalBests(user.id),
        this.getUserStatistics(user.id),
        supabase
          .from('game_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_guest', false)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('game_records')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_guest', false)
      ]);

      if (!personalBestsResult.success || !statisticsResult.success) {
        throw new Error('Failed to get basic stats');
      }

      const { data: recentGames, error: recentError } = recentGamesResult;
      const { count: totalRecords, error: countError } = totalCountResult;

      if (recentError) throw recentError;
      if (countError) throw countError;

      return {
        success: true,
        data: {
          personal_bests: personalBestsResult.data!,
          statistics: statisticsResult.data!,
          recent_games: recentGames || [],
          total_records: totalRecords || 0
        }
      };

    } catch (error) {
      console.error('Failed to get game stats summary:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '統計サマリーの取得に失敗しました'
      };
    }
  }

  /**
   * 進捗チャートデータを取得
   */
  static async getProgressChartData(days: number = 30): Promise<ApiResponse<GameProgressChart>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: gameRecords, error } = await supabase
        .from('game_records')
        .select('score, level, lines_cleared, duration, created_at')
        .eq('user_id', user.id)
        .eq('is_guest', false)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // データをチャート形式に変換
      const scoreOverTime: ChartDataPoint[] = [];
      const levelProgression: ChartDataPoint[] = [];
      const linesPerGame: ChartDataPoint[] = [];
      const durationTrends: ChartDataPoint[] = [];

      gameRecords?.forEach((record) => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        
        scoreOverTime.push({
          date,
          value: record.score,
          label: `スコア: ${record.score.toLocaleString()}`
        });

        levelProgression.push({
          date,
          value: record.level,
          label: `レベル: ${record.level}`
        });

        linesPerGame.push({
          date,
          value: record.lines_cleared,
          label: `ライン: ${record.lines_cleared}`
        });

        durationTrends.push({
          date,
          value: Math.round(record.duration / 60), // 分に変換
          label: `時間: ${Math.round(record.duration / 60)}分`
        });
      });

      return {
        success: true,
        data: {
          score_over_time: scoreOverTime,
          level_progression: levelProgression,
          lines_per_game: linesPerGame,
          duration_trends: durationTrends
        }
      };

    } catch (error) {
      console.error('Failed to get progress chart data:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '進捗チャートデータの取得に失敗しました'
      };
    }
  }

  /**
   * リーダーボードを取得
   */
  static async getLeaderboard(): Promise<ApiResponse<Leaderboard>> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [dailyResult, weeklyResult, monthlyResult, allTimeResult] = await Promise.all([
        // 今日のランキング
        supabase
          .from('game_records')
          .select('user_id, score, level, lines_cleared, created_at')
          .eq('is_guest', false)
          .gte('created_at', today.toISOString())
          .order('score', { ascending: false })
          .limit(10),
        
        // 今週のランキング
        supabase
          .from('game_records')
          .select('user_id, score, level, lines_cleared, created_at')
          .eq('is_guest', false)
          .gte('created_at', weekStart.toISOString())
          .order('score', { ascending: false })
          .limit(10),
        
        // 今月のランキング
        supabase
          .from('game_records')
          .select('user_id, score, level, lines_cleared, created_at')
          .eq('is_guest', false)
          .gte('created_at', monthStart.toISOString())
          .order('score', { ascending: false })
          .limit(10),
        
        // 全期間のランキング
        supabase
          .from('game_records')
          .select('user_id, score, level, lines_cleared, created_at')
          .eq('is_guest', false)
          .order('score', { ascending: false })
          .limit(10)
      ]);

      const formatRankingData = (data: any[]): RankingEntry[] => {
        return data.map((record, index) => ({
          rank: index + 1,
          user_id: record.user_id,
          score: record.score,
          level: record.level,
          lines_cleared: record.lines_cleared,
          created_at: record.created_at
        }));
      };

      return {
        success: true,
        data: {
          daily: formatRankingData(dailyResult.data || []),
          weekly: formatRankingData(weeklyResult.data || []),
          monthly: formatRankingData(monthlyResult.data || []),
          all_time: formatRankingData(allTimeResult.data || [])
        }
      };

    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'リーダーボードの取得に失敗しました'
      };
    }
  }

  /**
   * ユーザーのランキング位置を取得
   */
  static async getUserRanking(score: number): Promise<ApiResponse<{ rank: number; total: number; percentile: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      // 自分より高いスコアの数をカウント
      const { count: higherScores, error: higherError } = await supabase
        .from('game_records')
        .select('id', { count: 'exact', head: true })
        .eq('is_guest', false)
        .gt('score', score);

      // 全体の記録数をカウント
      const { count: totalRecords, error: totalError } = await supabase
        .from('game_records')
        .select('id', { count: 'exact', head: true })
        .eq('is_guest', false);

      if (higherError) throw higherError;
      if (totalError) throw totalError;

      const rank = (higherScores || 0) + 1;
      const total = totalRecords || 1;
      const percentile = Math.round(((total - rank) / total) * 100);

      return {
        success: true,
        data: { rank, total, percentile }
      };

    } catch (error) {
      console.error('Failed to get user ranking:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'ランキング情報の取得に失敗しました'
      };
    }
  }

  /**
   * 月別統計を取得
   */
  static async getMonthlyStats(year?: number, month?: number): Promise<ApiResponse<{
    month: string;
    total_games: number;
    total_score: number;
    average_score: number;
    best_score: number;
    total_lines: number;
    total_playtime: number;
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: '認証が必要です'
        };
      }

      const now = new Date();
      const targetYear = year || now.getFullYear();
      const targetMonth = month || now.getMonth() + 1;

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const { data: records, error } = await supabase
        .from('game_records')
        .select('score, lines_cleared, duration')
        .eq('user_id', user.id)
        .eq('is_guest', false)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const stats = records?.reduce((acc, record) => {
        acc.total_games += 1;
        acc.total_score += record.score;
        acc.total_lines += record.lines_cleared;
        acc.total_playtime += record.duration;
        acc.best_score = Math.max(acc.best_score, record.score);
        return acc;
      }, {
        total_games: 0,
        total_score: 0,
        total_lines: 0,
        total_playtime: 0,
        best_score: 0
      }) || {
        total_games: 0,
        total_score: 0,
        total_lines: 0,
        total_playtime: 0,
        best_score: 0
      };

      const monthStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
      const averageScore = stats.total_games > 0 ? stats.total_score / stats.total_games : 0;

      return {
        success: true,
        data: {
          month: monthStr,
          ...stats,
          average_score: Math.round(averageScore * 100) / 100
        }
      };

    } catch (error) {
      console.error('Failed to get monthly stats:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: '月別統計の取得に失敗しました'
      };
    }
  }
}