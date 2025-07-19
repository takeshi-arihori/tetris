import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎮 Tetris Game
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Next.js 15 + TypeScript + Tailwind CSS で作られたテトリスゲーム
      </p>
      
      {/* メインアクション */}
      <div className="flex gap-4 mb-12">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          🎮 ゲストでプレイ
        </button>
        <Link href="/auth" className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          🔐 ログイン / 新規登録
        </Link>
      </div>

      {/* ナビゲーションメニュー */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          🔧 開発・テスト機能
        </h2>
        <div className="space-y-3">
          <Link 
            href="/audio-test" 
            className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎵</span>
              <div>
                <div className="font-medium text-gray-800">音響システム</div>
                <div className="text-sm text-gray-600">BGM・効果音テスト</div>
              </div>
            </div>
            <span className="text-purple-600 group-hover:text-purple-700">→</span>
          </Link>

          <Link 
            href="/canvas-demo" 
            className="flex items-center justify-between p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <div className="font-medium text-gray-800">Canvas描画システム</div>
                <div className="text-sm text-gray-600">アニメーション・エフェクト</div>
              </div>
            </div>
            <span className="text-cyan-600 group-hover:text-cyan-700">→</span>
          </Link>

          <Link 
            href="/auth" 
            className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="font-medium text-gray-800">認証システム</div>
                <div className="text-sm text-gray-600">ログイン・登録機能</div>
              </div>
            </div>
            <span className="text-blue-600 group-hover:text-blue-700">→</span>
          </Link>

          <Link 
            href="/history" 
            className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-gray-800">スコア記録・履歴</div>
                <div className="text-sm text-gray-600">統計・個人ベスト</div>
              </div>
            </div>
            <span className="text-green-600 group-hover:text-green-700">→</span>
          </Link>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-medium text-gray-800">ゲームエンジン統合</div>
                <div className="text-sm text-gray-600">準備中...</div>
              </div>
            </div>
            <span className="text-gray-400">🚧</span>
          </div>
        </div>
      </div>

      {/* プロジェクト情報 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Phase 3: スコア記録・履歴機能 ✅ 完了
        </p>
        <div className="flex justify-center space-x-4 text-xs text-gray-400">
          <span>Next.js 15</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Supabase</span>
        </div>
      </div>
    </main>
  )
}