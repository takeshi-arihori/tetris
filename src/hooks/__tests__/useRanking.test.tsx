import { renderHook, waitFor } from '@testing-library/react'
import { useRanking, useUserRank } from '../useRanking'
import { RankingService } from '@/lib/ranking/ranking-service'

// RankingServiceをモック
jest.mock('@/lib/ranking/ranking-service')

const mockRankingService = RankingService as jest.Mocked<typeof RankingService>

describe('useRanking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch rankings successfully', async () => {
    const mockRankings = [
      {
        userId: 'user1',
        username: 'player1',
        score: 10000,
        level: 5,
        rankPosition: 1,
      },
      {
        userId: 'user2',
        username: 'player2',
        score: 8000,
        level: 4,
        rankPosition: 2,
      },
    ]

    mockRankingService.getRanking.mockResolvedValue(mockRankings)

    const { result } = renderHook(() =>
      useRanking({ rankType: 'overall', limit: 100 })
    )

    // 初期状態
    expect(result.current.loading).toBe(true)
    expect(result.current.rankings).toEqual([])

    // データが読み込まれるまで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rankings).toEqual(mockRankings)
    expect(result.current.error).toBeNull()
    expect(mockRankingService.getRanking).toHaveBeenCalledWith('overall', 100)
  })

  it('should handle ranking fetch errors', async () => {
    const errorMessage = 'Failed to fetch rankings'
    mockRankingService.getRanking.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useRanking({ rankType: 'weekly' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rankings).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should refresh rankings when rankType changes', async () => {
    mockRankingService.getRanking.mockResolvedValue([])

    const { result, rerender } = renderHook(
      ({ rankType }) => useRanking({ rankType }),
      { initialProps: { rankType: 'overall' as const } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockRankingService.getRanking).toHaveBeenCalledWith('overall', 100)

    // rankTypeを変更
    rerender({ rankType: 'weekly' as const })

    await waitFor(() => {
      expect(mockRankingService.getRanking).toHaveBeenCalledWith('weekly', 100)
    })

    expect(mockRankingService.getRanking).toHaveBeenCalledTimes(2)
  })

  it('should auto-refresh when enabled', async () => {
    jest.useFakeTimers()
    mockRankingService.getRanking.mockResolvedValue([])

    renderHook(() =>
      useRanking({
        rankType: 'overall',
        autoRefresh: true,
        refreshInterval: 5000,
      })
    )

    await waitFor(() => {
      expect(mockRankingService.getRanking).toHaveBeenCalledTimes(1)
    })

    // 5秒経過
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(mockRankingService.getRanking).toHaveBeenCalledTimes(2)
    })

    jest.useRealTimers()
  })

  it('should not auto-refresh when disabled', async () => {
    jest.useFakeTimers()
    mockRankingService.getRanking.mockResolvedValue([])

    renderHook(() =>
      useRanking({
        rankType: 'overall',
        autoRefresh: false,
      })
    )

    await waitFor(() => {
      expect(mockRankingService.getRanking).toHaveBeenCalledTimes(1)
    })

    // 60秒経過（デフォルトの間隔）
    jest.advanceTimersByTime(60000)

    // 追加の呼び出しは発生しない
    expect(mockRankingService.getRanking).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })
})

describe('useUserRank', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch user ranks successfully', async () => {
    const mockUserRanks = {
      overall: 5,
      weekly: 3,
      monthly: 8,
      yearly: 12,
    }

    mockRankingService.getUserRank.mockResolvedValue(mockUserRanks)

    const { result } = renderHook(() =>
      useUserRank({ userId: 'user123' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.userRanks).toEqual(mockUserRanks)
    expect(result.current.error).toBeNull()
    expect(mockRankingService.getUserRank).toHaveBeenCalledWith('user123')
  })

  it('should handle null userId', async () => {
    const { result } = renderHook(() =>
      useUserRank({ userId: null })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.userRanks).toBeNull()
    expect(mockRankingService.getUserRank).not.toHaveBeenCalled()
  })

  it('should handle user rank fetch errors', async () => {
    const errorMessage = 'Failed to fetch user ranks'
    mockRankingService.getUserRank.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useUserRank({ userId: 'user123' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.userRanks).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('should refresh when userId changes', async () => {
    mockRankingService.getUserRank.mockResolvedValue({
      overall: null,
      weekly: null,
      monthly: null,
      yearly: null,
    })

    const { rerender } = renderHook(
      ({ userId }) => useUserRank({ userId }),
      { initialProps: { userId: 'user1' } }
    )

    await waitFor(() => {
      expect(mockRankingService.getUserRank).toHaveBeenCalledWith('user1')
    })

    // userIdを変更
    rerender({ userId: 'user2' })

    await waitFor(() => {
      expect(mockRankingService.getUserRank).toHaveBeenCalledWith('user2')
    })

    expect(mockRankingService.getUserRank).toHaveBeenCalledTimes(2)
  })

  it('should stop auto-refresh when userId becomes null', async () => {
    jest.useFakeTimers()
    mockRankingService.getUserRank.mockResolvedValue({
      overall: 1,
      weekly: 1,
      monthly: 1,
      yearly: 1,
    })

    const { rerender } = renderHook(
      ({ userId }) => useUserRank({ userId, autoRefresh: true, refreshInterval: 5000 }),
      { initialProps: { userId: 'user123' } }
    )

    await waitFor(() => {
      expect(mockRankingService.getUserRank).toHaveBeenCalledTimes(1)
    })

    // userIdをnullに変更
    rerender({ userId: null })

    // 5秒経過しても追加の呼び出しは発生しない
    jest.advanceTimersByTime(5000)
    expect(mockRankingService.getUserRank).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })
})