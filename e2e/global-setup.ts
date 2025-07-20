import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2Eテスト環境のセットアップを開始...')
  
  // テスト用のブラウザを起動
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // アプリケーションが起動するまで待機
    const baseURL = config.use?.baseURL || 'http://localhost:3000'
    console.log(`📡 ${baseURL} への接続を確認中...`)
    
    await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    // 基本的なページ要素が読み込まれているかチェック
    await page.waitForSelector('body', { timeout: 10000 })
    
    console.log('✅ アプリケーションが正常に起動しました')
    
    // テスト用データベースの初期化（必要に応じて）
    // await setupTestDatabase()
    
  } catch (error) {
    console.error('❌ グローバルセットアップに失敗:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('🎯 E2Eテスト環境のセットアップ完了')
}

export default globalSetup