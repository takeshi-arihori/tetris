'use client'

import type { Database } from '@/types/supabase'

type GameRecord = Database['public']['Tables']['game_records']['Row']

interface GameHistoryProps {
  recentGames: GameRecord[]
  loading: boolean
}

export function GameHistory({ recentGames, loading }: GameHistoryProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📝 最近のゲーム</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (recentGames.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📝 最近のゲーム</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl text-gray-400 mb-2">ゲーム履歴がありません</h3>
          <p className="text-gray-500">最初のゲームをプレイしてみましょう！</p>
        </div>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getScoreColor = (score: number, allScores: number[]) => {
    const maxScore = Math.max(...allScores)
    const minScore = Math.min(...allScores)
    const range = maxScore - minScore
    
    if (range === 0) return 'text-white'
    
    const percentage = (score - minScore) / range
    
    if (percentage >= 0.8) return 'text-green-400'
    if (percentage >= 0.6) return 'text-blue-400'
    if (percentage >= 0.4) return 'text-yellow-400'
    if (percentage >= 0.2) return 'text-orange-400'
    return 'text-red-400'
  }

  const allScores = recentGames.map(game => game.score)

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">📝 最近のゲーム</h2>
        <span className="text-sm text-gray-400">
          最新{recentGames.length}件
        </span>
      </div>

      <div className="space-y-3">
        {recentGames.map((game, index) => (
          <div key={game.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors">
            <div className="flex items-center justify-between">
              {/* ゲーム基本情報 */}
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {index === 0 && '🆕'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && '🎮'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getScoreColor(game.score, allScores)}`}>
                      {game.score.toLocaleString('ja-JP')}
                    </span>
                    <span className="text-sm text-gray-400">
                      Level {game.level}
                    </span>
                    <span className="text-sm text-gray-400">
                      {game.lines_cleared}ライン
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      プレイ時間: {formatDuration(game.duration)}
                    </span>
                    <span className="text-xs text-gray-500">
                      テトロミノ: {game.tetrominos_dropped}個
                    </span>
                    <span className="text-xs text-gray-500">
                      モード: {getGameModeLabel(game.game_mode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 日時とパフォーマンス */}
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {formatDate(game.created_at)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  効率: {Math.round(game.score / game.duration)}pt/秒
                </div>
              </div>
            </div>

            {/* 詳細統計（展開可能にする場合） */}
            {index === 0 && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ライン/分:</span>
                    <span className="text-white ml-1">
                      {((game.lines_cleared / game.duration) * 60).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">テトロミノ/分:</span>
                    <span className="text-white ml-1">
                      {((game.tetrominos_dropped / game.duration) * 60).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">平均スコア/ライン:</span>
                    <span className="text-white ml-1">
                      {game.lines_cleared > 0 ? Math.round(game.score / game.lines_cleared) : 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">効率:</span>
                    <span className="text-white ml-1">
                      {calculateEfficiency(game)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 統計サマリー */}
      <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">最近の傾向</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">平均スコア:</span>
            <span className="text-white ml-1">
              {Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length).toLocaleString('ja-JP')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">最高レベル:</span>
            <span className="text-white ml-1">
              Level {Math.max(...recentGames.map(g => g.level))}
            </span>
          </div>
          <div>
            <span className="text-gray-400">総プレイ時間:</span>
            <span className="text-white ml-1">
              {formatDuration(recentGames.reduce((sum, game) => sum + game.duration, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-400">総ライン:</span>
            <span className="text-white ml-1">
              {recentGames.reduce((sum, game) => sum + game.lines_cleared, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGameModeLabel(mode: string): string {
  const modes: Record<string, string> = {
    classic: 'クラシック',
    speed: 'スピード',
    marathon: 'マラソン'
  }
  return modes[mode] || mode
}

function calculateEfficiency(game: GameRecord): number {
  // 効率スコア計算（スコア、レベル、時間、ライン消去を総合）
  const timeBonus = Math.max(0, 300 - game.duration) / 300 // 時間ボーナス
  const levelBonus = (game.level - 1) / 8 // レベルボーナス
  const lineBonus = game.lines_cleared / (game.tetrominos_dropped || 1) // ライン効率
  
  const efficiency = (timeBonus + levelBonus + lineBonus) / 3 * 100
  return Math.min(100, Math.max(0, Math.round(efficiency)))
}