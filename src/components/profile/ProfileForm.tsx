'use client'

import { useState, useRef } from 'react'
import { useProfile, useUsernameCheck } from '@/hooks/useProfile'
import { useAuthStore } from '@/lib/auth/store'

export function ProfileForm() {
  const { user } = useAuthStore()
  const { profile, loading, error, updateProfile, uploadAvatar } = useProfile({ 
    userId: user?.id || null 
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isChecking, isAvailable, error: usernameError, checkUsername } = useUsernameCheck()

  // プロフィールデータが読み込まれたら初期値を設定
  if (profile && !isEditing && username !== profile.username) {
    setUsername(profile.username)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // キャンセル時は元の値に戻す
      setUsername(profile?.username || '')
      setSuccessMessage('')
    }
    setIsEditing(!isEditing)
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setSuccessMessage('')
    
    if (value && value !== profile?.username && value.length >= 3) {
      checkUsername(value, user?.id)
    }
  }

  const handleSave = async () => {
    if (!username.trim() || !isAvailable) return

    try {
      setIsSaving(true)
      await updateProfile({ username: username.trim() })
      setIsEditing(false)
      setSuccessMessage('プロフィールを更新しました')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('保存エラー:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    try {
      setIsUploading(true)
      await uploadAvatar(file)
      setSuccessMessage('アバターを更新しました')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('アップロードエラー:', err)
    } finally {
      setIsUploading(false)
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg text-gray-400 mb-2">ログインが必要です</h3>
        <p className="text-gray-500 text-sm">
          プロフィール編集にはログインが必要です
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">プロフィールが見つかりません</h3>
        <p className="text-red-300">{error || '不明なエラーが発生しました'}</p>
      </div>
    )
  }

  const canSave = username.trim() && 
                 username !== profile.username && 
                 username.length >= 3 && 
                 isAvailable &&
                 !isChecking

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">👤 プロフィール設定</h2>
        <button
          onClick={handleEditToggle}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isEditing 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>
      </div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 mb-6">
          <p className="text-green-400 text-sm">✅ {successMessage}</p>
        </div>
      )}

      {/* アバター */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt="アバター" 
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* アップロード中のオーバーレイ */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{profile.username}</h3>
          <p className="text-gray-400 text-sm mb-3">
            {new Date(profile.createdAt).toLocaleDateString('ja-JP')}から参加
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                アップロード中...
              </>
            ) : (
              'アバター変更'
            )}
          </button>
        </div>
      </div>

      {/* ユーザー名編集 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ユーザー名
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="ユーザー名を入力"
                minLength={3}
                maxLength={20}
              />
              
              {/* バリデーションメッセージ */}
              <div className="mt-2 min-h-[20px]">
                {username && username.length < 3 && (
                  <p className="text-red-400 text-sm">ユーザー名は3文字以上である必要があります</p>
                )}
                {username && username.length >= 3 && username !== profile.username && (
                  <>
                    {isChecking && (
                      <p className="text-yellow-400 text-sm">確認中...</p>
                    )}
                    {!isChecking && isAvailable === true && (
                      <p className="text-green-400 text-sm">✅ 使用可能です</p>
                    )}
                    {!isChecking && isAvailable === false && (
                      <p className="text-red-400 text-sm">❌ {usernameError}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-700/50 rounded-lg px-4 py-3">
              <p className="text-white">{profile.username}</p>
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
            <button
              onClick={handleEditToggle}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>

      {/* プロフィール統計 */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📊 アカウント情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-sm text-gray-400">ユーザーID</p>
            <p className="text-white font-mono text-sm">{profile.id}</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-sm text-gray-400">最終更新</p>
            <p className="text-white">
              {new Date(profile.updatedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}