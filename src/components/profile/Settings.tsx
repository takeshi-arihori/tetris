'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/lib/auth/store'
import type { SettingsUpdateData } from '@/lib/profile/profile-service'

export function Settings() {
  const { user } = useAuthStore()
  const { settings, loading, error, updateSettings } = useProfile({ 
    userId: user?.id || null 
  })

  const [formData, setFormData] = useState<SettingsUpdateData>({
    bgmVolume: 30,
    sfxVolume: 50,
    theme: 'default',
    language: 'ja',
    timezone: 'Asia/Tokyo',
    emailNotifications: true,
    pushNotifications: true,
    privacyPublic: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 設定データが読み込まれたらフォームを初期化
  useEffect(() => {
    if (settings) {
      setFormData({
        bgmVolume: settings.bgmVolume,
        sfxVolume: settings.sfxVolume,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        privacyPublic: settings.privacyPublic
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateSettings(formData)
      setSuccessMessage('設定を保存しました')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('設定保存エラー:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = settings && (
    formData.bgmVolume !== settings.bgmVolume ||
    formData.sfxVolume !== settings.sfxVolume ||
    formData.theme !== settings.theme ||
    formData.language !== settings.language ||
    formData.timezone !== settings.timezone ||
    formData.emailNotifications !== settings.emailNotifications ||
    formData.pushNotifications !== settings.pushNotifications ||
    formData.privacyPublic !== settings.privacyPublic
  )

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg text-gray-400 mb-2">ログインが必要です</h3>
        <p className="text-gray-500 text-sm">
          設定を変更するにはログインが必要です
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">設定の読み込みに失敗しました</h3>
        <p className="text-red-300">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">⚙️ 設定</h1>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
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
        )}
      </div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
          <p className="text-green-400 text-sm">✅ {successMessage}</p>
        </div>
      )}

      {/* 音声設定 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">🔊 音声設定</h2>
        
        <div className="space-y-6">
          {/* BGM音量 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              BGM音量: {formData.bgmVolume}%
            </label>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-8">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.bgmVolume}
                onChange={(e) => setFormData(prev => ({ ...prev, bgmVolume: Number(e.target.value) }))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${formData.bgmVolume}%, #374151 ${formData.bgmVolume}%, #374151 100%)`
                }}
              />
              <span className="text-gray-400 text-sm w-12">100%</span>
            </div>
          </div>

          {/* 効果音音量 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              効果音音量: {formData.sfxVolume}%
            </label>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-8">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.sfxVolume}
                onChange={(e) => setFormData(prev => ({ ...prev, sfxVolume: Number(e.target.value) }))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${formData.sfxVolume}%, #374151 ${formData.sfxVolume}%, #374151 100%)`
                }}
              />
              <span className="text-gray-400 text-sm w-12">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 表示設定 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">🎨 表示設定</h2>
        
        <div className="space-y-6">
          {/* テーマ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              テーマ
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="default">デフォルト</option>
              <option value="dark">ダークモード</option>
              <option value="classic">クラシック</option>
              <option value="neon">ネオン</option>
            </select>
          </div>

          {/* 言語 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              言語
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* タイムゾーン */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              タイムゾーン
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Asia/Tokyo">東京 (JST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">ニューヨーク (EST)</option>
              <option value="Europe/London">ロンドン (GMT)</option>
              <option value="Asia/Seoul">ソウル (KST)</option>
              <option value="Asia/Shanghai">上海 (CST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">🔔 通知設定</h2>
        
        <div className="space-y-6">
          {/* メール通知 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">メール通知</h3>
              <p className="text-gray-400 text-sm">新しい機能やランキング更新をメールで受け取る</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* プッシュ通知 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">プッシュ通知</h3>
              <p className="text-gray-400 text-sm">ブラウザ通知でリアルタイム更新を受け取る</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* プライバシー設定 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">🔒 プライバシー設定</h2>
        
        <div className="space-y-6">
          {/* プロフィール公開 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">プロフィール公開</h3>
              <p className="text-gray-400 text-sm">他のユーザーにプロフィール情報を公開する</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacyPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, privacyPublic: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-medium text-sm mb-2">🔐 プライバシーについて</h4>
            <ul className="text-yellow-200 text-xs space-y-1">
              <li>• プロフィール非公開時は、ユーザー名のみが他のユーザーに表示されます</li>
              <li>• ゲーム記録やランキングは設定に関係なく公開されます</li>
              <li>• いつでも設定を変更できます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 危険な操作 */}
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-400 mb-6">⚠️ 危険な操作</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">アカウント削除</h3>
            <p className="text-gray-400 text-sm mb-4">
              アカウントを完全に削除します。この操作は取り消せません。
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              アカウント削除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}