import { test, expect } from '@playwright/test'

test.describe('ランキング詳細機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ranking')
    
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle')
    
    // ローディングが完了するまで待機
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 10000 })
  })

  test('ランキング表示の基本機能', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/ランキング/)
    
    // メインタイトルが表示される
    await expect(page.locator('h1:has-text("ランキング")')).toBeVisible()
    
    // ランキングフィルターが表示される
    await expect(page.locator('text=総合')).toBeVisible()
    await expect(page.locator('text=週間')).toBeVisible()
    await expect(page.locator('text=月間')).toBeVisible()
    await expect(page.locator('text=年間')).toBeVisible()
  })

  test('ランキングフィルターの切り替え', async ({ page }) => {
    // 初期状態では総合ランキングが選択されている
    await expect(page.locator('button:has-text("総合")').first()).toHaveClass(/bg-blue-600/)
    
    // 週間ランキングをクリック
    await page.click('button:has-text("週間")')
    
    // 週間ランキングがアクティブになる
    await expect(page.locator('button:has-text("週間")').first()).toHaveClass(/bg-blue-600/)
    
    // 期間情報が表示される
    await expect(page.locator('text=/\\d+\\/\\d+ - \\d+\\/\\d+の記録/')).toBeVisible()
    
    // 月間ランキングをクリック
    await page.click('button:has-text("月間")')
    
    // 月間ランキングがアクティブになる
    await expect(page.locator('button:has-text("月間")').first()).toHaveClass(/bg-blue-600/)
    
    // 年間ランキングをクリック
    await page.click('button:has-text("年間")')
    
    // 年間ランキングがアクティブになる
    await expect(page.locator('button:has-text("年間")').first()).toHaveClass(/bg-blue-600/)
  })

  test('ランキング更新機能', async ({ page }) => {
    // 更新ボタンが表示される
    await expect(page.locator('button:has-text("更新")')).toBeVisible()
    
    // 更新ボタンをクリック
    await page.click('button:has-text("更新")')
    
    // ローディング状態が表示される
    await expect(page.locator('text=更新中')).toBeVisible()
    
    // ローディングが完了するまで待機
    await expect(page.locator('text=更新中')).not.toBeVisible({ timeout: 10000 })
    
    // 更新ボタンが再び表示される
    await expect(page.locator('button:has-text("更新")')).toBeVisible()
  })

  test('ランキングカードの表示', async ({ page }) => {
    // ランキングデータが存在する場合のテスト
    const rankingCards = page.locator('[data-testid="ranking-card"]')
    const cardCount = await rankingCards.count()
    
    if (cardCount > 0) {
      // 1位のカードを確認
      const firstPlace = rankingCards.first()
      await expect(firstPlace).toBeVisible()
      
      // 順位表示（メダルまたは数字）
      await expect(firstPlace.locator('text=/[🥇🥈🥉]|[1-9]\\d*/')).toBeVisible()
      
      // スコア表示
      await expect(firstPlace.locator('text=/\\d{1,3}(,\\d{3})*/')).toBeVisible()
      
      // レベル表示
      await expect(firstPlace.locator('text=/Level \\d+/')).toBeVisible()
    } else {
      // ランキングデータが存在しない場合
      await expect(page.locator('text=まだランキングがありません')).toBeVisible()
    }
  })

  test('ユーザー順位サイドバー', async ({ page }) => {
    // サイドバーが表示される
    await expect(page.locator('text=あなたの順位')).toBeVisible()
    
    // 未ログイン状態でのメッセージ
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // ログインボタンが表示される
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // デスクトップ表示の確認
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // メインランキングとサイドバーが横並びで表示される
    const mainRanking = page.locator('text=総合ランキング').first()
    const sidebar = page.locator('text=あなたの順位')
    
    await expect(mainRanking).toBeVisible()
    await expect(sidebar).toBeVisible()
    
    // タブレット表示の確認
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(mainRanking).toBeVisible()
    await expect(sidebar).toBeVisible()
    
    // モバイル表示の確認
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 要素が縦並びで表示される
    await expect(mainRanking).toBeVisible()
    await expect(sidebar).toBeVisible()
    
    // フィルターボタンが適切に表示される
    await expect(page.locator('button:has-text("総合")')).toBeVisible()
  })

  test('キーボードナビゲーション', async ({ page }) => {
    // フィルターボタンにフォーカスを移動
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // フォーカスされた要素が見える
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Enterキーでボタンを押下
    await page.keyboard.press('Enter')
    
    // 更新ボタンまでTabで移動
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 更新ボタンにフォーカスが当たっている
    await expect(page.locator('button:has-text("更新"):focus')).toBeVisible()
  })

  test('エラーハンドリング', async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.route('**/api/**', route => {
      route.abort('failed')
    })
    
    // ページを再読み込み
    await page.reload()
    
    // エラーメッセージが表示される（タイムアウト後）
    await expect(page.locator('text=エラーが発生しました')).toBeVisible({ timeout: 15000 })
    
    // 再試行ボタンが表示される
    await expect(page.locator('button:has-text("再試行")')).toBeVisible()
  })

  test('パフォーマンス測定', async ({ page }) => {
    // ページ読み込み時間の測定
    const startTime = Date.now()
    await page.goto('/ranking')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    console.log(`ランキングページ読み込み時間: ${loadTime}ms`)
    
    // 5秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(5000)
    
    // ランキング切り替えの応答時間
    const switchStartTime = Date.now()
    await page.click('button:has-text("週間")')
    await page.waitForLoadState('networkidle')
    const switchEndTime = Date.now()
    
    const switchTime = switchEndTime - switchStartTime
    console.log(`ランキング切り替え時間: ${switchTime}ms`)
    
    // 2秒以内に切り替わることを確認
    expect(switchTime).toBeLessThan(2000)
  })

  test('ページネーション（将来実装）', async ({ page }) => {
    // 大量のランキングデータがある場合のページネーション
    // 現在は100位まで表示の仕様だが、将来的な拡張を考慮
    
    const rankingCards = page.locator('[data-testid="ranking-card"]')
    const cardCount = await rankingCards.count()
    
    // 最大100件まで表示される
    expect(cardCount).toBeLessThanOrEqual(100)
    
    // より多くのデータがある場合のページネーション要素（将来実装）
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible()
    if (paginationExists) {
      await expect(page.locator('button:has-text("次へ")')).toBeVisible()
      await expect(page.locator('button:has-text("前へ")')).toBeVisible()
    }
  })
})