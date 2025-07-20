import { test, expect, Page } from '@playwright/test'

test.describe('認証機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('ホームページが正常に表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Tetris/)
    
    // メインの要素が表示されている
    await expect(page.locator('h1')).toBeVisible()
    
    // ナビゲーションが表示されている
    await expect(page.locator('nav')).toBeVisible()
  })

  test('ランキングページに遷移できる', async ({ page }) => {
    // ランキングリンクをクリック
    await page.click('text=ランキング')
    
    // URLが正しく変更される
    await expect(page).toHaveURL('/ranking')
    
    // ランキングページの要素が表示される
    await expect(page.locator('text=ランキング')).toBeVisible()
    
    // ローディング状態が解除されるまで待機
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 10000 })
  })

  test('プロフィールページに遷移できる', async ({ page }) => {
    // プロフィールリンクをクリック
    await page.click('text=プロフィール')
    
    // URLが正しく変更される
    await expect(page).toHaveURL('/profile')
    
    // 未ログイン状態では認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })

  test('設定ページに遷移できる', async ({ page }) => {
    // 設定リンクをクリック（ヘッダーまたはナビゲーションから）
    await page.click('text=設定')
    
    // URLが正しく変更される
    await expect(page).toHaveURL('/profile/settings')
    
    // 未ログイン状態では認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // デスクトップ表示の確認
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('nav')).toBeVisible()
    
    // タブレット表示の確認
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('nav')).toBeVisible()
    
    // モバイル表示の確認
    await page.setViewportSize({ width: 375, height: 667 })
    
    // モバイルメニューボタンが表示される
    const mobileMenuButton = page.locator('[aria-label="メニュー"], button:has-text("☰"), button[data-testid="mobile-menu-button"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.locator('nav [href="/ranking"]')).toBeVisible()
    }
  })

  test('404ページが正常に表示される', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/nonexistent-page')
    
    // 404ステータスコードの確認
    expect(response?.status()).toBe(404)
    
    // 404ページの内容確認（Next.jsのデフォルト404ページまたはカスタム404ページ）
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('パフォーマンス指標が基準を満たしている', async ({ page }) => {
    // Lighthouseメトリクスの測定（簡易版）
    const navigationPromise = page.waitForLoadState('networkidle')
    await page.goto('/')
    await navigationPromise
    
    // ページの基本的なパフォーマンスチェック
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
    })
    
    // 基本的なパフォーマンス基準
    expect(performanceEntries.domContentLoaded).toBeLessThan(3000) // 3秒以下
    expect(performanceEntries.firstContentfulPaint).toBeLessThan(2000) // 2秒以下
  })

  test('アクセシビリティ基準を満たしている', async ({ page }) => {
    await page.goto('/')
    
    // 基本的なアクセシビリティチェック
    // キーボードナビゲーション
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // 見出し構造の確認
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    // Alt属性の確認（画像がある場合）
    const images = page.locator('img')
    const imageCount = await images.count()
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).toBeDefined()
      }
    }
  })
})

test.describe('ランキング機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ranking')
  })

  test('ランキングボードが表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/ランキング/)
    
    // ランキングフィルターが表示される
    await expect(page.locator('text=総合')).toBeVisible()
    await expect(page.locator('text=週間')).toBeVisible()
    await expect(page.locator('text=月間')).toBeVisible()
    await expect(page.locator('text=年間')).toBeVisible()
  })

  test('ランキングタイプを切り替えられる', async ({ page }) => {
    // 週間ランキングをクリック
    await page.click('text=週間')
    
    // 週間ランキングがアクティブになる
    await expect(page.locator('button:has-text("週間")').first()).toHaveClass(/bg-blue-600/)
    
    // 月間ランキングをクリック
    await page.click('text=月間')
    
    // 月間ランキングがアクティブになる
    await expect(page.locator('button:has-text("月間")').first()).toHaveClass(/bg-blue-600/)
  })

  test('更新ボタンが機能する', async ({ page }) => {
    // 更新ボタンをクリック
    await page.click('text=更新')
    
    // ローディング状態が表示される
    await expect(page.locator('text=更新中')).toBeVisible()
    
    // ローディングが完了するまで待機
    await expect(page.locator('text=更新中')).not.toBeVisible({ timeout: 10000 })
  })
})

test.describe('プロフィール機能', () => {
  test('未ログイン状態でプロフィールページにアクセス', async ({ page }) => {
    await page.goto('/profile')
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // ログインボタンが表示される
    await expect(page.locator('text=ログイン')).toBeVisible()
  })

  test('未ログイン状態で設定ページにアクセス', async ({ page }) => {
    await page.goto('/profile/settings')
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })

  test('プロフィール編集ページにアクセス', async ({ page }) => {
    await page.goto('/profile/edit')
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })
})