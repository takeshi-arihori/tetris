import { Metadata } from 'next'
import { LazyProfileForm } from '@/components/ui/LazyComponents'

export const metadata: Metadata = {
  title: 'プロフィール編集 | Tetris',
  description: 'あなたのTetrisプロフィール情報を編集できます。',
}

export default function ProfileEditPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">プロフィール編集</h1>
          <p className="text-gray-400">アカウント情報とプロフィール設定を管理します</p>
        </div>
        <LazyProfileForm />
      </div>
    </main>
  )
}