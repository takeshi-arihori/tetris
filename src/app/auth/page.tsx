'use client'

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
        <h1 className="text-3xl font-bold text-center mb-8">認証システム</h1>
        
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