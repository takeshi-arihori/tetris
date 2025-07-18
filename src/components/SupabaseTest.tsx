'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        
        // テスト1: 接続確認
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        
        if (error) {
          throw error
        }
        
        // テスト2: 認証状態確認
        const { data: authData } = await supabase.auth.getUser()
        setUser(authData.user)
        
        setConnectionStatus('connected')
      } catch (err) {
        console.error('Supabase connection error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  const handleSignUp = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
      })
      
      if (error) {
        alert('Sign up error: ' + error.message)
      } else {
        alert('Sign up successful! Check your email for verification.')
      }
    } catch (err) {
      alert('Sign up error: ' + err)
    }
  }

  const handleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123',
      })
      
      if (error) {
        alert('Sign in error: ' + error.message)
      } else {
        alert('Sign in successful!')
        window.location.reload()
      }
    } catch (err) {
      alert('Sign in error: ' + err)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        alert('Sign out error: ' + error.message)
      } else {
        alert('Sign out successful!')
        window.location.reload()
      }
    } catch (err) {
      alert('Sign out error: ' + err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Supabase 接続テスト</h2>
      
      {/* 接続状態 */}
      <div className="mb-6 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">接続状態:</h3>
        {connectionStatus === 'connecting' && (
          <div className="text-yellow-600">🔄 接続中...</div>
        )}
        {connectionStatus === 'connected' && (
          <div className="text-green-600">✅ 接続成功!</div>
        )}
        {connectionStatus === 'error' && (
          <div className="text-red-600">❌ 接続エラー: {error}</div>
        )}
      </div>

      {/* 認証状態 */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">認証状態:</h3>
        {user ? (
          <div className="text-green-600">
            ✅ ログイン済み: {user.email}
          </div>
        ) : (
          <div className="text-gray-600">❌ 未ログイン</div>
        )}
      </div>

      {/* 認証テストボタン */}
      <div className="space-y-4">
        <h3 className="font-semibold">認証テスト:</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleSignUp}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            テストユーザー作成
          </button>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ログイン
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 環境変数チェック */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">環境変数チェック:</h3>
        <div className="space-y-1 text-sm">
          <div>
            SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}
          </div>
          <div>
            SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}
          </div>
        </div>
      </div>
    </div>
  )
}