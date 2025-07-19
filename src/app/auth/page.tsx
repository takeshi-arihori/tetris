'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import UserProfile from '@/components/auth/UserProfile'
import { useState } from 'react'

export default function AuthPage() {
  const { user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>←</span>
            <span>トップページに戻る</span>
          </Link>
          <Link 
            href="/audio-test" 
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            🎵 音響テスト
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">🔐 認証システム</h1>
        
        {user ? (
          <UserProfile user={user} />
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-6">ログインまたは新規登録をしてください</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              ログイン / 新規登録
            </button>
          </div>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </div>
  )
}