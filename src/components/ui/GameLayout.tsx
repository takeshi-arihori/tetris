import React from 'react'

interface GameLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export default function GameLayout({ children, sidebar, className = '' }: GameLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインゲーム領域 */}
          <div className="flex-1 flex justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              {children}
            </div>
          </div>
          
          {/* サイドバー */}
          {sidebar && (
            <div className="w-full lg:w-80">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}