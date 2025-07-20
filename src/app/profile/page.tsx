import { Metadata } from 'next'
import { LazyDashboard } from '@/components/ui/LazyComponents'

export const metadata: Metadata = {
  title: 'プロフィール | Tetris',
  description: 'あなたのTetrisプロフィール、統計、ゲーム履歴を確認できます。',
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <LazyDashboard />
    </main>
  )
}