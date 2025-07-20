import { Metadata } from 'next'
import { LazyRankingBoard } from '@/components/ui/LazyComponents'

export const metadata: Metadata = {
  title: 'ランキング | Tetris',
  description: 'Tetrisのランキングをチェックして、あなたの順位を確認しましょう。',
}

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <LazyRankingBoard />
    </main>
  )
}