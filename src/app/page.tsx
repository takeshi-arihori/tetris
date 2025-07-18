export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Tetris Game
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Next.js 15 + TypeScript + Tailwind CSS で作られたテトリスゲーム
      </p>
      <div className="flex gap-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          ゲスト でプレイ
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          ログイン
        </button>
      </div>
    </main>
  )
}