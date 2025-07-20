import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2Eテスト環境のクリーンアップを開始...')
  
  try {
    // テストデータの削除（必要に応じて）
    // await cleanupTestDatabase()
    
    // 一時ファイルの削除
    // await cleanupTempFiles()
    
    console.log('✅ E2Eテスト環境のクリーンアップ完了')
    
  } catch (error) {
    console.error('❌ グローバルクリーンアップに失敗:', error)
    // クリーンアップの失敗はテスト失敗とはしない
  }
}

export default globalTeardown