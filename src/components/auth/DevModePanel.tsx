'use client'


interface DevModePanelProps {
  onSuccess?: () => void
}

export default function DevModePanel({}: DevModePanelProps) {
  const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development'

  if (!isDev) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-medium text-blue-800 mb-2">
        🔧 開発モード - レート制限回避方法
      </h3>
      <div className="text-xs text-blue-700 space-y-2">
        <div>
          <strong>方法1: 開発モード登録</strong>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li>新規登録フォームに情報を入力</li>
            <li>「新規登録」ボタンを押してレート制限エラーを表示</li>
            <li>「🔧 開発モードで登録」ボタンをクリック</li>
          </ol>
        </div>
        <div>
          <strong>方法2: 別のメールアドレス</strong>
          <p className="ml-2">test2@example.com, test3@example.com など</p>
        </div>
        <div>
          <strong>方法3: 時間を待つ</strong>
          <p className="ml-2">5-10分待ってから再試行</p>
        </div>
      </div>
    </div>
  )
}