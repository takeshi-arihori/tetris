'use client'

import Link from 'next/link'
import VolumeControl from '@/components/audio/VolumeControl'
import AudioTestPanel from '@/components/audio/AudioTestPanel'

export default function AudioTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>←</span>
            <span>トップページに戻る</span>
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="/auth" 
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              🔐 認証システム
            </Link>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎵 音響システムテスト
          </h1>
          <p className="text-gray-600">
            Tetris音響システムの動作確認とテスト
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 音量制御パネル */}
          <div className="lg:col-span-1">
            <VolumeControl />
          </div>

          {/* 音響テストパネル */}
          <div className="lg:col-span-2">
            <AudioTestPanel />
          </div>
        </div>

        {/* コンパクト音量制御のデモ */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            コンパクト音量制御
          </h3>
          <div className="flex justify-center">
            <VolumeControl compact className="bg-gray-50 p-3 rounded-lg" />
          </div>
        </div>

        {/* 使用方法 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📖 使用方法
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">BGMテスト</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>各BGMボタンをクリックして再生/停止</li>
                <li>フェード切り替えボタンで滑らかな切り替え</li>
                <li>レベル別BGMの自動切り替えをテスト</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">効果音テスト</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>各効果音ボタンをクリックして再生</li>
                <li>同時再生と音響プールの動作確認</li>
                <li>音量とタイミングの調整</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">ゲームイベント</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>実際のゲームイベントに対応した音響再生</li>
                <li>BGMと効果音の連動動作をテスト</li>
                <li>レベルアップ時のBGM自動切り替え</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 技術仕様 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ⚙️ 技術仕様
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">BGMシステム</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• HTML5 Audio API使用</li>
                <li>• 自動ループ再生</li>
                <li>• フェードイン/フェードアウト</li>
                <li>• レベル別自動切り替え</li>
                <li>• 音量個別制御</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">効果音システム</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 音響プール管理</li>
                <li>• 同時再生対応</li>
                <li>• 優先度制御</li>
                <li>• レート制限</li>
                <li>• メモリ最適化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}