import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type UserStatistics = Database['public']['Tables']['user_statistics']['Row']
type PersonalBests = Database['public']['Tables']['personal_bests']['Row']
type GameRecord = Database['public']['Tables']['game_records']['Row']

export interface DetailedStatistics {
  // 基本統計
  totalGames: number
  totalScore: number
  totalLines: number
  totalPlaytime: number
  totalTetrominos: number
  averageScore: number
  averageDuration: number

  // 個人ベスト
  bestScore: number
  bestLevel: number
  bestLines: number
  longestPlay: number
  mostTetrominos: number

  // 成長データ
  recentGames: GameRecord[]
  scoreHistory: Array<{ date: string; score: number; level: number }>
  levelProgress: Array<{ level: number; count: number; averageScore: number }>
  playTimeByDay: Array<{ day: string; minutes: number }>
  
  // 分析データ
  improvementRate: number
  consistency: number
  favoritePlayTime: string
  strongestLevel: number
}

export interface TrendData {
  dates: string[]
  scores: number[]
  levels: number[]
  playtime: number[]
}

export class StatisticsService {
  // 詳細統計データ取得
  static async getDetailedStatistics(userId: string): Promise<DetailedStatistics | null> {
    try {
      // 並行してデータを取得
      const [userStats, personalBests, recentGames, allGames] = await Promise.all([
        this.getUserStatistics(userId),
        this.getPersonalBests(userId),
        this.getRecentGames(userId, 10),
        this.getAllUserGames(userId)
      ])

      if (!userStats || !personalBests) {
        return null
      }

      // 分析データの計算
      const scoreHistory = this.calculateScoreHistory(allGames)
      const levelProgress = this.calculateLevelProgress(allGames)
      const playTimeByDay = this.calculatePlayTimeByDay(allGames)
      const improvementRate = this.calculateImprovementRate(scoreHistory)
      const consistency = this.calculateConsistency(allGames)
      const favoritePlayTime = this.calculateFavoritePlayTime(allGames)
      const strongestLevel = this.calculateStrongestLevel(levelProgress)

      return {
        // 基本統計
        totalGames: userStats.total_games,
        totalScore: Number(userStats.total_score),
        totalLines: userStats.total_lines,
        totalPlaytime: userStats.total_playtime,
        totalTetrominos: Number(userStats.total_tetrominos),
        averageScore: Number(userStats.average_score),
        averageDuration: Number(userStats.average_duration),

        // 個人ベスト
        bestScore: personalBests.best_score,
        bestLevel: personalBests.best_level,
        bestLines: personalBests.best_lines,
        longestPlay: personalBests.longest_play,
        mostTetrominos: personalBests.most_tetrominos,

        // 成長データ
        recentGames,
        scoreHistory,
        levelProgress,
        playTimeByDay,

        // 分析データ
        improvementRate,
        consistency,
        favoritePlayTime,
        strongestLevel
      }
    } catch (error) {
      console.error('詳細統計取得エラー:', error)
      throw error
    }
  }

  // トレンドデータ取得（チャート用）
  static async getTrendData(userId: string, days: number = 30): Promise<TrendData> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: games, error } = await supabase
        .from('game_records')
        .select('score, level, duration, created_at')
        .eq('user_id', userId)
        .eq('is_guest', false)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // 日付ごとの最高スコアを集計
      const dailyData = new Map<string, { scores: number[], levels: number[], playtime: number }>()

      games.forEach(game => {
        const date = new Date(game.created_at).toISOString().split('T')[0]
        if (!dailyData.has(date)) {
          dailyData.set(date, { scores: [], levels: [], playtime: 0 })
        }
        const dayData = dailyData.get(date)!
        dayData.scores.push(game.score)
        dayData.levels.push(game.level)
        dayData.playtime += game.duration
      })

      const dates: string[] = []
      const scores: number[] = []
      const levels: number[] = []
      const playtime: number[] = []

      // 日付順でソート
      const sortedDates = Array.from(dailyData.keys()).sort()

      sortedDates.forEach(date => {
        const dayData = dailyData.get(date)!
        dates.push(date)
        scores.push(Math.max(...dayData.scores))
        levels.push(Math.max(...dayData.levels))
        playtime.push(Math.round(dayData.playtime / 60)) // 分に変換
      })

      return { dates, scores, levels, playtime }
    } catch (error) {
      console.error('トレンドデータ取得エラー:', error)
      throw error
    }
  }

  // レベル別統計取得
  static async getLevelStatistics(userId: string): Promise<Array<{ level: number; games: number; averageScore: number; bestScore: number }>> {
    try {
      const { data: games, error } = await supabase
        .from('game_records')
        .select('level, score')
        .eq('user_id', userId)
        .eq('is_guest', false)

      if (error) throw error

      const levelStats = new Map<number, { scores: number[], count: number }>()

      games.forEach(game => {
        if (!levelStats.has(game.level)) {
          levelStats.set(game.level, { scores: [], count: 0 })
        }
        const stats = levelStats.get(game.level)!
        stats.scores.push(game.score)
        stats.count++
      })

      return Array.from(levelStats.entries())
        .map(([level, data]) => ({
          level,
          games: data.count,
          averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          bestScore: Math.max(...data.scores)
        }))
        .sort((a, b) => a.level - b.level)
    } catch (error) {
      console.error('レベル別統計取得エラー:', error)
      throw error
    }
  }

  // プライベートメソッド群
  private static async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('ユーザー統計取得エラー:', error)
      return null
    }
    return data
  }

  private static async getPersonalBests(userId: string): Promise<PersonalBests | null> {
    const { data, error } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('個人ベスト取得エラー:', error)
      return null
    }
    return data
  }

  private static async getRecentGames(userId: string, limit: number): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', userId)
      .eq('is_guest', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('最近のゲーム取得エラー:', error)
      return []
    }
    return data
  }

  private static async getAllUserGames(userId: string): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', userId)
      .eq('is_guest', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('全ゲーム取得エラー:', error)
      return []
    }
    return data
  }

  private static calculateScoreHistory(games: GameRecord[]): Array<{ date: string; score: number; level: number }> {
    const dailyBests = new Map<string, { score: number; level: number }>()

    games.forEach(game => {
      const date = new Date(game.created_at).toISOString().split('T')[0]
      if (!dailyBests.has(date) || dailyBests.get(date)!.score < game.score) {
        dailyBests.set(date, { score: game.score, level: game.level })
      }
    })

    return Array.from(dailyBests.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static calculateLevelProgress(games: GameRecord[]): Array<{ level: number; count: number; averageScore: number }> {
    const levelData = new Map<number, number[]>()

    games.forEach(game => {
      if (!levelData.has(game.level)) {
        levelData.set(game.level, [])
      }
      levelData.get(game.level)!.push(game.score)
    })

    return Array.from(levelData.entries())
      .map(([level, scores]) => ({
        level,
        count: scores.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))
      .sort((a, b) => a.level - b.level)
  }

  private static calculatePlayTimeByDay(games: GameRecord[]): Array<{ day: string; minutes: number }> {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayData = new Array(7).fill(0)

    games.forEach(game => {
      const dayOfWeek = new Date(game.created_at).getDay()
      dayData[dayOfWeek] += game.duration
    })

    return dayNames.map((day, index) => ({
      day,
      minutes: Math.round(dayData[index] / 60)
    }))
  }

  private static calculateImprovementRate(scoreHistory: Array<{ date: string; score: number; level: number }>): number {
    if (scoreHistory.length < 2) return 0

    const firstScore = scoreHistory[0].score
    const lastScore = scoreHistory[scoreHistory.length - 1].score
    const improvement = ((lastScore - firstScore) / firstScore) * 100

    return Math.round(improvement * 10) / 10
  }

  private static calculateConsistency(games: GameRecord[]): number {
    if (games.length < 2) return 0

    const scores = games.map(g => g.score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // 一貫性スコア（低い標準偏差ほど高い一貫性）
    const consistency = Math.max(0, 100 - (standardDeviation / average) * 100)
    return Math.round(consistency)
  }

  private static calculateFavoritePlayTime(games: GameRecord[]): string {
    const hourCounts = new Array(24).fill(0)

    games.forEach(game => {
      const hour = new Date(game.created_at).getHours()
      hourCounts[hour]++
    })

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts))
    return `${maxHour}:00-${maxHour + 1}:00`
  }

  private static calculateStrongestLevel(levelProgress: Array<{ level: number; count: number; averageScore: number }>): number {
    if (levelProgress.length === 0) return 1

    return levelProgress.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    ).level
  }
}