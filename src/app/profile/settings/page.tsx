import { Metadata } from 'next'
import { LazySettings } from '@/components/ui/LazyComponents'

export const metadata: Metadata = {
  title: '設定 | Tetris',
  description: 'Tetrisゲームの各種設定を調整できます。',
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-4xl mx-auto p-6">
        <LazySettings />
      </div>
    </main>
  )
}