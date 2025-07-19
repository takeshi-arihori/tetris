// 統計データ関連のReactフック

'use client';

import { useState, useCallback, useEffect } from 'react';
import { StatisticsService } from '@/lib/database/statistics';
import type {
  PersonalBests,
  UserStatistics,
  GameStatsSummary,
  GameProgressChart,
  Leaderboard,
  ApiResponse
} from '@/types/game-records';

export interface UseStatisticsReturn {
  // データ
  personalBests: PersonalBests | null;
  statistics: UserStatistics | null;
  summary: GameStatsSummary | null;
  chartData: GameProgressChart | null;
  leaderboard: Leaderboard | null;
  
  // 状態
  loading: boolean;
  error: string | null;
  
  // アクション
  fetchPersonalBests: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchChartData: (days?: number) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useStatistics(autoFetch: boolean = true): UseStatisticsReturn {
  // State
  const [personalBests, setPersonalBests] = useState<PersonalBests | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [summary, setSummary] = useState<GameStatsSummary | null>(null);
  const [chartData, setChartData] = useState<GameProgressChart | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 個人ベスト取得
  const fetchPersonalBests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getPersonalBests();
      
      if (result.success && result.data) {
        setPersonalBests(result.data);
      } else {
        setError(result.message || '個人ベスト記録の取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 統計データ取得
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getUserStatistics();
      
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.message || '統計データの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 統計サマリー取得
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getGameStatsSummary();
      
      if (result.success && result.data) {
        setSummary(result.data);
        // サマリーに含まれるデータを個別のstateにも設定
        setPersonalBests(result.data.personal_bests);
        setStatistics(result.data.statistics);
      } else {
        setError(result.message || '統計サマリーの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 進捗チャートデータ取得
  const fetchChartData = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getProgressChartData(days);
      
      if (result.success && result.data) {
        setChartData(result.data);
      } else {
        setError(result.message || '進捗チャートデータの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // リーダーボード取得
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getLeaderboard();
      
      if (result.success && result.data) {
        setLeaderboard(result.data);
      } else {
        setError(result.message || 'リーダーボードの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 全データ更新
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchSummary(),
      fetchChartData(),
      fetchLeaderboard()
    ]);
  }, [fetchSummary, fetchChartData, fetchLeaderboard]);

  // 自動取得
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
    // データ
    personalBests,
    statistics,
    summary,
    chartData,
    leaderboard,
    
    // 状態
    loading,
    error,
    
    // アクション
    fetchPersonalBests,
    fetchStatistics,
    fetchSummary,
    fetchChartData,
    fetchLeaderboard,
    clearError,
    refresh
  };
}

// 個人ベスト専用フック
export function usePersonalBests(userId?: string) {
  const [personalBests, setPersonalBests] = useState<PersonalBests | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalBests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getPersonalBests(userId);
      
      if (result.success && result.data) {
        setPersonalBests(result.data);
      } else {
        setError(result.message || '個人ベスト記録の取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPersonalBests();
  }, [fetchPersonalBests]);

  return {
    personalBests,
    loading,
    error,
    refetch: fetchPersonalBests,
    clearError: () => setError(null)
  };
}

// リーダーボード専用フック
export function useLeaderboard(autoRefresh: boolean = false, refreshInterval: number = 60000) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getLeaderboard();
      
      if (result.success && result.data) {
        setLeaderboard(result.data);
      } else {
        setError(result.message || 'リーダーボードの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回取得
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // 自動更新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLeaderboard, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
    clearError: () => setError(null)
  };
}

// 月別統計フック
export function useMonthlyStats(year?: number, month?: number) {
  const [monthlyStats, setMonthlyStats] = useState<{
    month: string;
    total_games: number;
    total_score: number;
    average_score: number;
    best_score: number;
    total_lines: number;
    total_playtime: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await StatisticsService.getMonthlyStats(year, month);
      
      if (result.success && result.data) {
        setMonthlyStats(result.data);
      } else {
        setError(result.message || '月別統計の取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonthlyStats();
  }, [fetchMonthlyStats]);

  return {
    monthlyStats,
    loading,
    error,
    refetch: fetchMonthlyStats,
    clearError: () => setError(null)
  };
}