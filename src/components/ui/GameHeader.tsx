'use client'

import React from 'react'
import Link from 'next/link'

interface GameHeaderProps {
  title?: string
  showAuth?: boolean
  className?: string
}

export default function GameHeader({ title = 'Tetris', showAuth = true, className = '' }: GameHeaderProps) {
  const user = null // 認証機能は別ブランチで実装済み

  return (
    <header className={`bg-black/60 backdrop-blur-md border-b border-purple-500/30 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              ゲーム
            </Link>
            <Link href="/rankings" className="text-gray-300 hover:text-white transition-colors">
              ランキング
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              プロフィール
            </Link>
          </nav>

          {/* 認証関連 */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              <Link
                href="/auth"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                ログイン
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}