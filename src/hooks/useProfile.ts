import { useState, useEffect } from 'react'
import { ProfileService, type UserProfile, type ProfileSettings, type ProfileUpdateData, type SettingsUpdateData } from '@/lib/profile/profile-service'
import { StatisticsService, type DetailedStatistics, type TrendData } from '@/lib/profile/statistics'

interface UseProfileOptions {
  userId: string | null
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseProfileResult {
  profile: UserProfile | null
  settings: ProfileSettings | null
  loading: boolean
  error: string | null
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  updateSettings: (data: SettingsUpdateData) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  refresh: () => Promise<void>
}

export function useProfile({ userId, autoRefresh = false, refreshInterval = 300000 }: UseProfileOptions): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!userId) {
      setProfile(null)
      setSettings(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [profileData, settingsData] = await Promise.all([
        ProfileService.getProfile(userId),
        ProfileService.getSettings(userId)
      ])

      setProfile(profileData)
      setSettings(settingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィール取得に失敗しました')
      console.error('プロフィール取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!userId) throw new Error('ユーザーIDが設定されていません')

    try {
      setError(null)
      const updatedProfile = await ProfileService.updateProfile(userId, data)
      setProfile(updatedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィール更新に失敗しました')
      throw err
    }
  }

  const updateSettings = async (data: SettingsUpdateData) => {
    if (!userId) throw new Error('ユーザーIDが設定されていません')

    try {
      setError(null)
      const updatedSettings = await ProfileService.updateSettings(userId, data)
      setSettings(updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定更新に失敗しました')
      throw err
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!userId) throw new Error('ユーザーIDが設定されていません')

    try {
      setError(null)
      const avatarUrl = await ProfileService.uploadAvatar(userId, file)
      if (profile) {
        setProfile({ ...profile, avatarUrl })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アバターアップロードに失敗しました')
      throw err
    }
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, userId])

  return {
    profile,
    settings,
    loading,
    error,
    updateProfile,
    updateSettings,
    uploadAvatar,
    refresh: fetchData
  }
}

interface UseStatisticsOptions {
  userId: string | null
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseStatisticsResult {
  statistics: DetailedStatistics | null
  trendData: TrendData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  refreshTrends: (days?: number) => Promise<void>
}

export function useStatistics({ userId, autoRefresh = false, refreshInterval = 300000 }: UseStatisticsOptions): UseStatisticsResult {
  const [statistics, setStatistics] = useState<DetailedStatistics | null>(null)
  const [trendData, setTrendData] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    if (!userId) {
      setStatistics(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await StatisticsService.getDetailedStatistics(userId)
      setStatistics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計データ取得に失敗しました')
      console.error('統計取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendData = async (days = 30) => {
    if (!userId) {
      setTrendData(null)
      return
    }

    try {
      setError(null)
      const data = await StatisticsService.getTrendData(userId, days)
      setTrendData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'トレンドデータ取得に失敗しました')
      console.error('トレンド取得エラー:', err)
    }
  }

  const refreshTrends = async (days = 30) => {
    await fetchTrendData(days)
  }

  const refresh = async () => {
    await Promise.all([
      fetchStatistics(),
      fetchTrendData()
    ])
  }

  useEffect(() => {
    Promise.all([
      fetchStatistics(),
      fetchTrendData()
    ])
  }, [userId])

  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, userId])

  return {
    statistics,
    trendData,
    loading,
    error,
    refresh,
    refreshTrends
  }
}

interface UseUsernameCheckOptions {
  debounceMs?: number
}

interface UseUsernameCheckResult {
  isChecking: boolean
  isAvailable: boolean | null
  error: string | null
  checkUsername: (username: string, excludeUserId?: string) => Promise<void>
}

export function useUsernameCheck({ debounceMs = 500 }: UseUsernameCheckOptions = {}): UseUsernameCheckResult {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkUsername = async (username: string, excludeUserId?: string) => {
    if (!username || username.length < 3) {
      setIsAvailable(null)
      setError('ユーザー名は3文字以上である必要があります')
      return
    }

    try {
      setIsChecking(true)
      setError(null)
      
      // デバウンス処理
      await new Promise(resolve => setTimeout(resolve, debounceMs))
      
      const available = await ProfileService.checkUsernameAvailability(username, excludeUserId)
      setIsAvailable(available)
      
      if (!available) {
        setError('このユーザー名は既に使用されています')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー名チェックに失敗しました')
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  return {
    isChecking,
    isAvailable,
    error,
    checkUsername
  }
}