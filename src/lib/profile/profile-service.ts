import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

export interface UserProfile {
  id: string
  username: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileSettings {
  bgmVolume: number
  sfxVolume: number
  theme: string
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  privacyPublic: boolean
}

export interface ProfileUpdateData {
  username?: string
  avatarUrl?: string
}

export interface SettingsUpdateData {
  bgmVolume?: number
  sfxVolume?: number
  theme?: string
  language?: string
  timezone?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  privacyPublic?: boolean
}

export class ProfileService {
  // プロフィール取得
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('プロフィール取得エラー:', error)
        return null
      }

      return {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      throw error
    }
  }

  // プロフィール更新
  static async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: updateData.username,
          avatar_url: updateData.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      throw error
    }
  }

  // 設定取得
  static async getSettings(userId: string): Promise<ProfileSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('設定取得エラー:', error)
        return null
      }

      return {
        bgmVolume: data.bgm_volume,
        sfxVolume: data.sfx_volume,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        privacyPublic: data.privacy_public
      }
    } catch (error) {
      console.error('設定取得エラー:', error)
      throw error
    }
  }

  // 設定更新
  static async updateSettings(userId: string, updateData: SettingsUpdateData): Promise<ProfileSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          bgm_volume: updateData.bgmVolume,
          sfx_volume: updateData.sfxVolume,
          theme: updateData.theme,
          language: updateData.language,
          timezone: updateData.timezone,
          email_notifications: updateData.emailNotifications,
          push_notifications: updateData.pushNotifications,
          privacy_public: updateData.privacyPublic,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        bgmVolume: data.bgm_volume,
        sfxVolume: data.sfx_volume,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        privacyPublic: data.privacy_public
      }
    } catch (error) {
      console.error('設定更新エラー:', error)
      throw error
    }
  }

  // ユーザー名の重複チェック
  static async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('profiles')
        .select('id')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error

      return data.length === 0
    } catch (error) {
      console.error('ユーザー名重複チェックエラー:', error)
      throw error
    }
  }

  // アバター画像アップロード
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 既存のアバターを削除
      const profile = await this.getProfile(userId)
      if (profile?.avatarUrl) {
        const oldFileName = profile.avatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('user-uploads')
            .remove([`avatars/${oldFileName}`])
        }
      }

      // 新しいアバターをアップロード
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // パブリックURLを取得
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      // プロフィールを更新
      await this.updateProfile(userId, { avatarUrl: data.publicUrl })

      return data.publicUrl
    } catch (error) {
      console.error('アバターアップロードエラー:', error)
      throw error
    }
  }

  // アカウント削除
  static async deleteAccount(userId: string): Promise<void> {
    try {
      // アバター画像を削除
      const profile = await this.getProfile(userId)
      if (profile?.avatarUrl) {
        const fileName = profile.avatarUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('user-uploads')
            .remove([`avatars/${fileName}`])
        }
      }

      // 関連データは外部キー制約で自動削除される
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error
    } catch (error) {
      console.error('アカウント削除エラー:', error)
      throw error
    }
  }

  // プライバシー設定に基づく公開情報取得
  static async getPublicProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) return null

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('privacy_public')
        .eq('user_id', userId)
        .single()

      if (settingsError) return null

      // プライベート設定の場合は限定情報のみ返す
      if (!settings.privacy_public) {
        return {
          id: profile.id,
          username: profile.username,
          avatarUrl: undefined,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      }

      return {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatar_url || undefined,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    } catch (error) {
      console.error('公開プロフィール取得エラー:', error)
      throw error
    }
  }
}