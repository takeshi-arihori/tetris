// ゲーム記録関連のReactフック

'use client';

import { useState, useCallback } from 'react';
import { GameRecordService } from '@/lib/database/game-records';
import type {
  GameRecord,
  CreateGameRecordData,
  GameRecordFilters,
  GameRecordSort,
  GameRecordListResponse,
  ApiResponse
} from '@/types/game-records';

export interface UseGameRecordOptions {
  autoFetch?: boolean;
  initialFilters?: GameRecordFilters;
  initialSort?: GameRecordSort;
  pageSize?: number;
}

export interface UseGameRecordReturn {
  // State
  records: GameRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createRecord: (data: CreateGameRecordData, isGuest?: boolean, sessionId?: string) => Promise<ApiResponse<GameRecord>>;
  fetchRecords: (page?: number) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  setFilters: (filters: GameRecordFilters) => void;
  setSort: (sort: GameRecordSort) => void;
  clearError: () => void;
  
  // Current state
  filters: GameRecordFilters;
  sort: GameRecordSort;
}

export function useGameRecord(options: UseGameRecordOptions = {}): UseGameRecordReturn {
  const {
    autoFetch = false,
    initialFilters = {},
    initialSort = { field: 'created_at', direction: 'desc' },
    pageSize = 20
  } = options;

  // State
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameRecordFilters>(initialFilters);
  const [sort, setSort] = useState<GameRecordSort>(initialSort);

  // ゲーム記録作成
  const createRecord = useCallback(async (
    data: CreateGameRecordData,
    isGuest: boolean = false,
    sessionId?: string
  ): Promise<ApiResponse<GameRecord>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await GameRecordService.createGameRecord(data, isGuest, sessionId);
      
      if (result.success && result.data) {
        // 新しい記録をリストの先頭に追加
        setRecords(prev => [result.data!, ...prev]);
        
        // ページネーション情報を更新
        if (pagination) {
          setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
        }
      } else {
        setError(result.message || 'ゲーム記録の保存に失敗しました');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  // ゲーム記録一覧取得
  const fetchRecords = useCallback(async (page: number = 1): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await GameRecordService.getUserGameRecords(
        filters,
        sort,
        page,
        pageSize
      );

      if (result.success && result.data) {
        setRecords(result.data.records);
        setPagination(result.data.pagination);
      } else {
        setError(result.message || 'ゲーム記録の取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pageSize]);

  // ゲーム記録削除
  const deleteRecord = useCallback(async (recordId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await GameRecordService.deleteGameRecord(recordId);
      
      if (result.success) {
        // リストから削除
        setRecords(prev => prev.filter(record => record.id !== recordId));
        
        // ページネーション情報を更新
        if (pagination) {
          setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
        }
      } else {
        setError(result.message || 'ゲーム記録の削除に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  // フィルター設定
  const setFiltersAndRefetch = useCallback((newFilters: GameRecordFilters) => {
    setFilters(newFilters);
    // フィルター変更時は1ページ目から取得
    fetchRecords(1);
  }, [fetchRecords]);

  // ソート設定
  const setSortAndRefetch = useCallback((newSort: GameRecordSort) => {
    setSort(newSort);
    // ソート変更時は1ページ目から取得
    fetchRecords(1);
  }, [fetchRecords]);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 自動取得
  React.useEffect(() => {
    if (autoFetch) {
      fetchRecords(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    records,
    pagination,
    loading,
    error,
    
    // Actions
    createRecord,
    fetchRecords,
    deleteRecord,
    setFilters: setFiltersAndRefetch,
    setSort: setSortAndRefetch,
    clearError,
    
    // Current state
    filters,
    sort
  };
}

// ゲスト記録専用フック
export function useGuestGameRecord(sessionId: string) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ゲスト記録取得
  const fetchGuestRecords = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await GameRecordService.getGuestGameRecords(sessionId);
      
      if (result.success && result.data) {
        setRecords(result.data);
      } else {
        setError(result.message || 'ゲスト記録の取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // ゲスト記録をユーザー記録に移行
  const migrateToUser = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;
    
    setLoading(true);
    setError(null);

    try {
      const result = await GameRecordService.migrateGuestRecords(sessionId);
      
      if (result.success) {
        setRecords([]); // 移行後はゲスト記録をクリア
        return true;
      } else {
        setError(result.message || 'データの移行に失敗しました');
        return false;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // ゲスト記録作成
  const createGuestRecord = useCallback(async (data: CreateGameRecordData): Promise<ApiResponse<GameRecord>> => {
    return GameRecordService.createGameRecord(data, true, sessionId);
  }, [sessionId]);

  React.useEffect(() => {
    if (sessionId) {
      fetchGuestRecords();
    }
  }, [fetchGuestRecords, sessionId]);

  return {
    records,
    loading,
    error,
    fetchGuestRecords,
    migrateToUser,
    createGuestRecord,
    clearError: () => setError(null)
  };
}

// React import for useEffect
import React from 'react';