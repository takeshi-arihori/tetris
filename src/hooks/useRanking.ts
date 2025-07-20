import { useState, useEffect } from 'react'
import { RankingService, type RankType, type RankingData, type UserRankInfo } from '@/lib/ranking/ranking-service'

interface UseRankingOptions {
  rankType: RankType
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseRankingResult {
  rankings: RankingData[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRanking({ 
  rankType, 
  limit = 100, 
  autoRefresh = false, 
  refreshInterval = 60000 
}: UseRankingOptions): UseRankingResult {
  const [rankings, setRankings] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRankings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RankingService.getRanking(rankType, limit)
      setRankings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランキング取得に失敗しました')
      console.error('ランキング取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRankings()
  }, [rankType, limit])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchRankings, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  return {
    rankings,
    loading,
    error,
    refresh: fetchRankings
  }
}

interface UseUserRankOptions {
  userId: string | null
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseUserRankResult {
  userRanks: UserRankInfo | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserRank({ 
  userId, 
  autoRefresh = false, 
  refreshInterval = 60000 
}: UseUserRankOptions): UseUserRankResult {
  const [userRanks, setUserRanks] = useState<UserRankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserRanks = async () => {
    if (!userId) {
      setUserRanks(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await RankingService.getUserRank(userId)
      setUserRanks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー順位取得に失敗しました')
      console.error('ユーザー順位取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserRanks()
  }, [userId])

  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(fetchUserRanks, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, userId])

  return {
    userRanks,
    loading,
    error,
    refresh: fetchUserRanks
  }
}

interface UseSurroundingRanksOptions {
  userId: string | null
  rankType: RankType
  range?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseSurroundingRanksResult {
  surroundingRanks: RankingData[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSurroundingRanks({ 
  userId, 
  rankType, 
  range = 5, 
  autoRefresh = false, 
  refreshInterval = 60000 
}: UseSurroundingRanksOptions): UseSurroundingRanksResult {
  const [surroundingRanks, setSurroundingRanks] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSurroundingRanks = async () => {
    if (!userId) {
      setSurroundingRanks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await RankingService.getSurroundingRanks(userId, rankType, range)
      setSurroundingRanks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '周辺順位取得に失敗しました')
      console.error('周辺順位取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSurroundingRanks()
  }, [userId, rankType, range])

  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(fetchSurroundingRanks, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, userId])

  return {
    surroundingRanks,
    loading,
    error,
    refresh: fetchSurroundingRanks
  }
}