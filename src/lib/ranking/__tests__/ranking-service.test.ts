import { RankingService } from '../ranking-service'
import { mockSupabaseClient } from '@/__mocks__/supabase'

// Supabaseクライアントをモック
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

describe('RankingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRanking', () => {
    it('should fetch overall ranking successfully', async () => {
      const mockRankingData = [
        {
          user_id: 'user1',
          username: 'player1',
          score: 10000,
          level: 5,
          rank_position: 1,
          period_start: null,
          period_end: null,
        },
        {
          user_id: 'user2',
          username: 'player2',
          score: 8000,
          level: 4,
          rank_position: 2,
          period_start: null,
          period_end: null,
        },
      ]

      mockSupabaseClient.from().then.mockResolvedValue({
        data: mockRankingData,
        error: null,
      })

      const result = await RankingService.getRanking('overall', 100)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('rankings')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        userId: 'user1',
        username: 'player1',
        score: 10000,
        level: 5,
        rankPosition: 1,
        periodStart: null,
        periodEnd: null,
      })
    })

    it('should handle database errors', async () => {
      mockSupabaseClient.from().then.mockRejectedValue(new Error('Database error'))

      await expect(RankingService.getRanking('overall')).rejects.toThrow('Database error')
    })

    it('should limit results correctly', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        user_id: `user${i}`,
        username: `player${i}`,
        score: 1000 - i,
        level: 1,
        rank_position: i + 1,
      }))

      mockSupabaseClient.from().then.mockResolvedValue({
        data: mockData,
        error: null,
      })

      await RankingService.getRanking('weekly', 50)

      expect(mockSupabaseClient.from().limit).toHaveBeenCalledWith(50)
    })
  })

  describe('getUserRank', () => {
    it('should fetch user ranks successfully', async () => {
      const mockUserRanks = [
        { rank_type: 'overall', rank_position: 5 },
        { rank_type: 'weekly', rank_position: 3 },
        { rank_type: 'monthly', rank_position: 8 },
        { rank_type: 'yearly', rank_position: 12 },
      ]

      mockSupabaseClient.from().then.mockResolvedValue({
        data: mockUserRanks,
        error: null,
      })

      const result = await RankingService.getUserRank('user123')

      expect(result).toEqual({
        overall: 5,
        weekly: 3,
        monthly: 8,
        yearly: 12,
      })
    })

    it('should handle missing ranks', async () => {
      mockSupabaseClient.from().then.mockResolvedValue({
        data: [{ rank_type: 'overall', rank_position: 1 }],
        error: null,
      })

      const result = await RankingService.getUserRank('user123')

      expect(result).toEqual({
        overall: 1,
        weekly: null,
        monthly: null,
        yearly: null,
      })
    })
  })

  describe('getSurroundingRanks', () => {
    it('should fetch surrounding ranks successfully', async () => {
      const mockUserRank = { rank_position: 5 }
      const mockSurroundingRanks = [
        { user_id: 'user1', username: 'player1', score: 12000, level: 6, rank_position: 3 },
        { user_id: 'user2', username: 'player2', score: 11000, level: 5, rank_position: 4 },
        { user_id: 'user3', username: 'player3', score: 10000, level: 5, rank_position: 5 },
        { user_id: 'user4', username: 'player4', score: 9000, level: 4, rank_position: 6 },
        { user_id: 'user5', username: 'player5', score: 8000, level: 4, rank_position: 7 },
      ]

      // 最初の呼び出しでユーザーの順位を取得
      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: mockUserRank,
        error: null,
      })

      // 2回目の呼び出しで周辺順位を取得
      mockSupabaseClient.from().then.mockResolvedValueOnce({
        data: mockSurroundingRanks,
        error: null,
      })

      const result = await RankingService.getSurroundingRanks('user3', 'overall', 2)

      expect(result).toHaveLength(5)
      expect(result[2].userId).toBe('user3') // 中央にユーザー自身
    })

    it('should return empty array when user not found', async () => {
      mockSupabaseClient.from().single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const result = await RankingService.getSurroundingRanks('nonexistent', 'overall')

      expect(result).toEqual([])
    })
  })

  describe('updateRankings', () => {
    it('should update all ranking types', async () => {
      // モックデータの設定
      const mockPersonalBests = [
        {
          user_id: 'user1',
          best_score: 10000,
          profiles: { username: 'player1' },
        },
      ]

      const mockGameRecords = [
        {
          user_id: 'user1',
          score: 8000,
          level: 4,
          profiles: { username: 'player1' },
        },
      ]

      // 複数の呼び出しに対してモックを設定
      mockSupabaseClient.from()
        .then
        .mockResolvedValueOnce({ data: mockPersonalBests, error: null }) // overall
        .mockResolvedValueOnce({ data: null, error: null }) // delete overall
        .mockResolvedValueOnce({ data: null, error: null }) // insert overall
        .mockResolvedValueOnce({ data: mockGameRecords, error: null }) // weekly
        .mockResolvedValueOnce({ data: null, error: null }) // delete weekly
        .mockResolvedValueOnce({ data: null, error: null }) // insert weekly
        .mockResolvedValueOnce({ data: mockGameRecords, error: null }) // monthly
        .mockResolvedValueOnce({ data: null, error: null }) // delete monthly
        .mockResolvedValueOnce({ data: null, error: null }) // insert monthly
        .mockResolvedValueOnce({ data: mockGameRecords, error: null }) // yearly
        .mockResolvedValueOnce({ data: null, error: null }) // delete yearly
        .mockResolvedValueOnce({ data: null, error: null }) // insert yearly

      await expect(RankingService.updateRankings()).resolves.not.toThrow()
    })
  })

  describe('validation', () => {
    it('should validate rank types', async () => {
      const validRankTypes = ['overall', 'weekly', 'monthly', 'yearly']
      
      for (const rankType of validRankTypes) {
        mockSupabaseClient.from().then.mockResolvedValue({
          data: [],
          error: null,
        })

        await expect(RankingService.getRanking(rankType as any)).resolves.not.toThrow()
      }
    })

    it('should handle score validation', () => {
      const testScore = 85000
      expect(testScore).toBeValidTetrisScore()
    })

    it('should handle level validation', () => {
      const testLevel = 5
      expect(testLevel).toBeValidTetrisLevel()
    })
  })
})