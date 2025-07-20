import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎮 TETRIS
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            モダンなテトリスゲーム
          </p>
          <p className="text-sm text-gray-400">
            Next.js 15 + TypeScript + Tailwind CSS
          </p>
        </div>
        
        {/* メインアクション */}
        <div className="flex flex-col sm:flex-row gap-6 mb-16">
          <Link 
            href="/game" 
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🎮</span>
              <span className="text-lg">今すぐプレイ</span>
            </div>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link 
            href="/auth" 
            className="group relative bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🔐</span>
              <span className="text-lg">ログイン / 登録</span>
            </div>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {/* メインゲーム */}
          <Link 
            href="/game" 
            className="group bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">🎮</span>
              <div>
                <div className="font-bold text-white text-lg">テトリスゲーム</div>
                <div className="text-sm text-gray-300">メインゲーム</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              クラシックなテトリスをプレイしよう
            </p>
          </Link>

          {/* ランキング */}
          <Link 
            href="/ranking" 
            className="group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">🏆</span>
              <div>
                <div className="font-bold text-white text-lg">ランキング</div>
                <div className="text-sm text-gray-300">リーダーボード</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              世界中のプレイヤーと競争
            </p>
          </Link>

          {/* プロフィール */}
          <Link 
            href="/profile" 
            className="group bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">👤</span>
              <div>
                <div className="font-bold text-white text-lg">プロフィール</div>
                <div className="text-sm text-gray-300">統計・設定</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              あなたの統計と設定
            </p>
          </Link>

          {/* ゲーム履歴 */}
          <Link 
            href="/history" 
            className="group bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">📊</span>
              <div>
                <div className="font-bold text-white text-lg">ゲーム履歴</div>
                <div className="text-sm text-gray-300">スコア・統計</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              過去のゲーム記録を確認
            </p>
          </Link>

          {/* 音響テスト */}
          <Link 
            href="/audio-test" 
            className="group bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-sm border border-pink-400/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">🎵</span>
              <div>
                <div className="font-bold text-white text-lg">音響システム</div>
                <div className="text-sm text-gray-300">BGM・効果音</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              サウンド設定をテスト
            </p>
          </Link>

          {/* Canvas デモ */}
          <Link 
            href="/canvas-demo" 
            className="group bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-xl p-6 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-3xl">🎨</span>
              <div>
                <div className="font-bold text-white text-lg">Canvas描画</div>
                <div className="text-sm text-gray-300">アニメーション</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              描画システムをテスト
            </p>
          </Link>
        </div>

        {/* プロジェクト情報 */}
        <div className="mt-16 text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <p className="text-sm text-green-400 mb-3 font-medium">
              ✅ Phase 3: スコア記録・履歴機能 完了
            </p>
            <div className="flex justify-center flex-wrap gap-2 text-xs text-gray-300">
              <span className="bg-blue-500/20 px-2 py-1 rounded">Next.js 15</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded">TypeScript</span>
              <span className="bg-cyan-500/20 px-2 py-1 rounded">Tailwind CSS</span>
              <span className="bg-green-500/20 px-2 py-1 rounded">Supabase</span>
              <span className="bg-purple-500/20 px-2 py-1 rounded">Canvas API</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}