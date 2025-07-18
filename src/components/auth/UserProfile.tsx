'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserProfileProps {
  user: User
}

interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export default function UserProfile({ user }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setProfile(data)
        setUsername(data.username || '')
      }
    } catch (err) {
      setError('プロフィールの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id)

      if (error) {
        setError(error.message)
      } else {
        setIsEditing(false)
        fetchProfile()
      }
    } catch (err) {
      setError('プロフィールの更新に失敗しました')
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.reload()
    } catch (err) {
      setError('ログアウトに失敗しました')
    }
  }

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">プロフィール</h2>
      
      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <div className="mt-1 text-sm text-gray-900">{user.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <div className="mt-1 text-sm text-gray-900">
              {profile?.username || 'ユーザー名未設定'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            登録日
          </label>
          <div className="mt-1 text-sm text-gray-900">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '不明'}
          </div>
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              編集
            </button>
          )}
          
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}