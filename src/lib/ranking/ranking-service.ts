import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type RankingRecord = Database['public']['Tables']['rankings']['Row']
type RankingInsert = Database['public']['Tables']['rankings']['Insert']

export type RankType = 'overall' | 'weekly' | 'monthly' | 'yearly'

export interface RankingData {
  userId: string
  username: string
  score: number
  level: number
  rankPosition: number
  periodStart?: string
  periodEnd?: string
}

export interface UserRankInfo {
  overall: number | null
  weekly: number | null
  monthly: number | null
  yearly: number | null
}

export class RankingService {
  // ランキング取得
  static async getRanking(rankType: RankType, limit = 100): Promise<RankingData[]> {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('rank_type', rankType)
        .order('rank_position', { ascending: true })
        .limit(limit)

      if (error) throw error

      return data.map(record => ({
        userId: record.user_id,
        username: record.username,
        score: record.score,
        level: record.level,
        rankPosition: record.rank_position,
        periodStart: record.period_start || undefined,
        periodEnd: record.period_end || undefined
      }))
    } catch (error) {
      console.error(`ランキング取得エラー (${rankType}):`, error)
      throw error
    }
  }

  // ユーザーの順位取得
  static async getUserRank(userId: string): Promise<UserRankInfo> {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('rank_type, rank_position')
        .eq('user_id', userId)

      if (error) throw error

      const ranks: UserRankInfo = {
        overall: null,
        weekly: null,
        monthly: null,
        yearly: null
      }

      data.forEach(record => {
        if (record.rank_type in ranks) {
          ranks[record.rank_type as keyof UserRankInfo] = record.rank_position
        }
      })

      return ranks
    } catch (error) {
      console.error('ユーザー順位取得エラー:', error)
      throw error
    }
  }

  // 周辺順位取得（前後5位ずつ）
  static async getSurroundingRanks(userId: string, rankType: RankType, range = 5): Promise<RankingData[]> {
    try {
      // まずユーザーの順位を取得
      const { data: userRank, error: userError } = await supabase
        .from('rankings')
        .select('rank_position')
        .eq('user_id', userId)
        .eq('rank_type', rankType)
        .single()

      if (userError || !userRank) {
        return []
      }

      const startRank = Math.max(1, userRank.rank_position - range)
      const endRank = userRank.rank_position + range

      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('rank_type', rankType)
        .gte('rank_position', startRank)
        .lte('rank_position', endRank)
        .order('rank_position', { ascending: true })

      if (error) throw error

      return data.map(record => ({
        userId: record.user_id,
        username: record.username,
        score: record.score,
        level: record.level,
        rankPosition: record.rank_position,
        periodStart: record.period_start || undefined,
        periodEnd: record.period_end || undefined
      }))
    } catch (error) {
      console.error('周辺順位取得エラー:', error)
      throw error
    }
  }

  // ランキング更新（管理者用）
  static async updateRankings(): Promise<void> {
    try {
      console.log('ランキング更新開始...')
      
      await Promise.all([
        this.updateOverallRanking(),
        this.updateWeeklyRanking(),
        this.updateMonthlyRanking(),
        this.updateYearlyRanking()
      ])

      console.log('ランキング更新完了')
    } catch (error) {
      console.error('ランキング更新エラー:', error)
      throw error
    }
  }

  // 全体ランキング更新
  private static async updateOverallRanking(): Promise<void> {
    const { data: topScores, error } = await supabase
      .from('personal_bests')
      .select(`
        user_id,
        best_score,
        profiles!inner(username)
      `)
      .order('best_score', { ascending: false })
      .limit(1000) // 上位1000人まで

    if (error) throw error

    // 既存のランキングデータを削除
    await supabase
      .from('rankings')
      .delete()
      .eq('rank_type', 'overall')

    // 新しいランキングデータを挿入
    const rankingData: RankingInsert[] = topScores.map((record, index) => ({
      user_id: record.user_id,
      username: (record as any).profiles?.username || 'Unknown',
      score: record.best_score,
      level: 1, // TODO: レベル情報を取得
      rank_type: 'overall',
      rank_position: index + 1
    }))

    if (rankingData.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(rankingData)

      if (insertError) throw insertError
    }
  }

  // 週間ランキング更新
  private static async updateWeeklyRanking(): Promise<void> {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const { data: weeklyScores, error } = await supabase
      .from('game_records')
      .select(`
        user_id,
        score,
        level,
        profiles!inner(username)
      `)
      .gte('created_at', startOfWeek.toISOString())
      .lte('created_at', endOfWeek.toISOString())
      .eq('is_guest', false)
      .order('score', { ascending: false })
      .limit(100)

    if (error) throw error

    // 既存の週間ランキングを削除
    await supabase
      .from('rankings')
      .delete()
      .eq('rank_type', 'weekly')

    // ユーザーごとの最高スコアを取得
    const userBestScores = new Map<string, any>()
    weeklyScores.forEach(record => {
      if (!userBestScores.has(record.user_id) || 
          userBestScores.get(record.user_id).score < record.score) {
        userBestScores.set(record.user_id, record)
      }
    })

    const rankingData: RankingInsert[] = Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .map((record, index) => ({
        user_id: record.user_id,
        username: (record as any).profiles?.username || 'Unknown',
        score: record.score,
        level: record.level,
        rank_type: 'weekly',
        rank_position: index + 1,
        period_start: startOfWeek.toISOString().split('T')[0],
        period_end: endOfWeek.toISOString().split('T')[0]
      }))

    if (rankingData.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(rankingData)

      if (insertError) throw insertError
    }
  }

  // 月間ランキング更新
  private static async updateMonthlyRanking(): Promise<void> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const { data: monthlyScores, error } = await supabase
      .from('game_records')
      .select(`
        user_id,
        score,
        level,
        profiles!inner(username)
      `)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .eq('is_guest', false)
      .order('score', { ascending: false })
      .limit(100)

    if (error) throw error

    // 既存の月間ランキングを削除
    await supabase
      .from('rankings')
      .delete()
      .eq('rank_type', 'monthly')

    const userBestScores = new Map<string, any>()
    monthlyScores.forEach(record => {
      if (!userBestScores.has(record.user_id) || 
          userBestScores.get(record.user_id).score < record.score) {
        userBestScores.set(record.user_id, record)
      }
    })

    const rankingData: RankingInsert[] = Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .map((record, index) => ({
        user_id: record.user_id,
        username: (record as any).profiles?.username || 'Unknown',
        score: record.score,
        level: record.level,
        rank_type: 'monthly',
        rank_position: index + 1,
        period_start: startOfMonth.toISOString().split('T')[0],
        period_end: endOfMonth.toISOString().split('T')[0]
      }))

    if (rankingData.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(rankingData)

      if (insertError) throw insertError
    }
  }

  // 年間ランキング更新
  private static async updateYearlyRanking(): Promise<void> {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

    const { data: yearlyScores, error } = await supabase
      .from('game_records')
      .select(`
        user_id,
        score,
        level,
        profiles!inner(username)
      `)
      .gte('created_at', startOfYear.toISOString())
      .lte('created_at', endOfYear.toISOString())
      .eq('is_guest', false)
      .order('score', { ascending: false })
      .limit(100)

    if (error) throw error

    // 既存の年間ランキングを削除
    await supabase
      .from('rankings')
      .delete()
      .eq('rank_type', 'yearly')

    const userBestScores = new Map<string, any>()
    yearlyScores.forEach(record => {
      if (!userBestScores.has(record.user_id) || 
          userBestScores.get(record.user_id).score < record.score) {
        userBestScores.set(record.user_id, record)
      }
    })

    const rankingData: RankingInsert[] = Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .map((record, index) => ({
        user_id: record.user_id,
        username: (record as any).profiles?.username || 'Unknown',
        score: record.score,
        level: record.level,
        rank_type: 'yearly',
        rank_position: index + 1,
        period_start: startOfYear.toISOString().split('T')[0],
        period_end: endOfYear.toISOString().split('T')[0]
      }))

    if (rankingData.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(rankingData)

      if (insertError) throw insertError
    }
  }
}