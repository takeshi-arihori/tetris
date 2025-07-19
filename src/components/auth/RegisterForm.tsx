'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface RegisterFormProps {
  onSuccess?: () => void
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Debug: Registration process started
      
      // まずユーザー名の重複チェック
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()
      
      // Debug: Username check completed
      
      if (existingUser) {
        setError('このユーザー名は既に使用されています')
        setIsLoading(false)
        return
      }

      // 一意のユーザー名を生成
      const uniqueUsername = `${username}_${Date.now()}`
      // Debug: Generated unique username
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: uniqueUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: undefined,
        },
      })

      // Debug: Auth signup completed

      if (error) {
        // Error: Registration failed
        
        // データベースエラーの場合は手動でプロファイルを作成
        if (error.message.includes('Database error') && data?.user) {
          // Debug: Database error, attempting manual profile creation
          try {
            const userId = (data.user as any).id as string
            // Debug: User ID extracted from data
            
            if (userId) {
              await createUserProfile(userId, uniqueUsername)
              // Debug: Manual profile creation successful
              setMessage('登録が完了しました。確認メールをチェックしてください。')
              onSuccess?.()
              router.refresh()
              return
            }
          } catch (profileError) {
            // Error: Profile creation failed
            setError('プロファイル作成中にエラーが発生しました。')
          }
        }
        
        if (error.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。')
        } else if (error.message.includes('weak password')) {
          setError('パスワードが弱すぎます。より強力なパスワードを設定してください。')
        } else if (error.message.includes('invalid email')) {
          setError('メールアドレスの形式が正しくありません。')
        } else if (error.message.includes('rate limit exceeded')) {
          const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development'
          if (isDev) {
            setError('メール送信の制限に達しました。開発環境では下の「開発モードで登録」ボタンをお試しください。')
          } else {
            setError('メール送信の制限に達しました。しばらく待ってから再度お試しください。')
          }
        } else {
          setError(`登録エラー: ${error.message}`)
        }
      } else {
        // Debug: Registration successful
        const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development'
        if (isDev) {
          setMessage('登録が完了しました。開発環境では確認メールのクリックが必要ですが、手動でプロファイルを作成することもできます。')
        } else {
          setMessage('登録が完了しました。確認メールをチェックしてください。')
        }
        onSuccess?.()
        router.refresh()
      }
    } catch (err) {
      // Error: Registration catch error
      setError('登録中にエラーが発生しました。しばらく経ってから再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const createUserProfile = async (userId: string, username: string) => {
    const supabase = createClient()
    
    // Debug: Manual profile creation started
    
    try {
      // プロファイル作成
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, username }])
        .select()
      
      // Debug: Profile creation completed
      if (profileError) throw profileError
      
      // 個人記録作成
      const { data: bestData, error: bestError } = await supabase
        .from('personal_bests')
        .insert([{ user_id: userId }])
        .select()
      
      // Debug: Personal bests creation completed
      if (bestError) throw bestError
      
      // 統計作成
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .insert([{ user_id: userId }])
        .select()
      
      // Debug: Statistics creation completed
      if (statsError) throw statsError
      
      // 設定作成
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .insert([{ user_id: userId }])
        .select()
      
      // Debug: Settings creation completed
      if (settingsError) throw settingsError
      
      // Debug: Manual profile creation completed
    } catch (error) {
      // Error: Manual profile creation failed
      throw error
    }
  }

  const handleDevModeRegister = async () => {
    if (process.env.NEXT_PUBLIC_APP_ENV !== 'development') {
      setError('この機能は開発環境でのみ利用できます。')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()
      
      // 開発環境用のテストユーザーIDを生成
      const testUserId = `dev-${email.replace('@', '-').replace('.', '-')}-${Date.now()}`
      const uniqueUsername = `${username}_${Date.now()}`

      // 手動でプロファイルを作成
      await createUserProfile(testUserId, uniqueUsername)
      
      setMessage('開発モードで登録が完了しました！テストユーザーとしてプロファイルが作成されました。')
      onSuccess?.()
      router.refresh()
    } catch (err) {
      console.error('開発モード登録エラー:', err)
      setError(`開発モード登録中にエラーが発生しました。: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development'
  const showDevMode = isDev && error?.includes('メール送信の制限')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          ユーザー名
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          パスワード確認
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {message && (
        <div className="text-green-600 text-sm">{message}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? '登録中...' : '新規登録'}
      </button>

      {showDevMode && (
        <button
          type="button"
          onClick={handleDevModeRegister}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-orange-500 rounded-md shadow-sm text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
        >
          {isLoading ? '処理中...' : '🔧 開発モードで登録'}
        </button>
      )}
    </form>
  )
}