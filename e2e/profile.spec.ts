import { test, expect } from '@playwright/test'

test.describe('プロフィール機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
  })

  test('未ログイン状態でのプロフィールページ', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/プロフィール/)
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // ログインボタンが表示される
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
    
    // 説明テキストが表示される
    await expect(page.locator('text=ダッシュボードを表示するにはログインしてください')).toBeVisible()
  })

  test('プロフィール編集ページへのアクセス', async ({ page }) => {
    await page.goto('/profile/edit')
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // プロフィール編集特有のメッセージ
    await expect(page.locator('text=プロフィール編集にはログインが必要です')).toBeVisible()
  })

  test('設定ページへのアクセス', async ({ page }) => {
    await page.goto('/profile/settings')
    
    // 認証が必要なメッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // 設定特有のメッセージ
    await expect(page.locator('text=設定を変更するにはログインが必要です')).toBeVisible()
  })

  test('ページナビゲーション', async ({ page }) => {
    // ヘッダーからプロフィールページに移動
    await page.goto('/')
    await page.click('a[href="/profile"]')
    await expect(page).toHaveURL('/profile')
    
    // ヘッダーから設定ページに移動
    await page.click('a[href="/profile/settings"]')
    await expect(page).toHaveURL('/profile/settings')
    
    // プロフィールページに戻る
    await page.click('a[href="/profile"]')
    await expect(page).toHaveURL('/profile')
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // デスクトップ表示
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // モバイル表示
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // ログインボタンがモバイルでも適切に表示される
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
  })
})

test.describe('プロフィール設定機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/settings')
    await page.waitForLoadState('networkidle')
  })

  test('設定ページの基本構造', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/設定/)
    
    // 未ログイン状態での表示確認
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
    
    // 設定に関する説明が表示される
    await expect(page.locator('text=設定を変更するにはログインが必要です')).toBeVisible()
  })

  test('設定ページのローディング状態', async ({ page }) => {
    // ローディング状態の確認（遅延読み込みコンポーネント）
    await page.goto('/profile/settings')
    
    // 遅延読み込みによるローディング表示
    const loadingElement = page.locator('[data-testid="loading-skeleton"], .animate-pulse')
    
    // ローディングが短時間表示される可能性
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).not.toBeVisible({ timeout: 5000 })
    }
    
    // 最終的にログイン要求メッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })

  test('設定ページのアクセシビリティ', async ({ page }) => {
    // キーボードナビゲーション
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // 見出し構造の確認
    const headings = page.locator('h1, h2, h3')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    // ログインボタンのアクセシビリティ
    const loginButton = page.locator('button:has-text("ログイン")')
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
  })
})

test.describe('プロフィール編集機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/edit')
    await page.waitForLoadState('networkidle')
  })

  test('編集ページの基本構造', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/プロフィール編集/)
    
    // ページヘッダーの確認
    await expect(page.locator('h1:has-text("プロフィール編集")')).toBeVisible()
    
    // 説明テキストの確認
    await expect(page.locator('text=アカウント情報とプロフィール設定を管理します')).toBeVisible()
    
    // 未ログイン状態でのメッセージ
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })

  test('編集ページのローディング状態', async ({ page }) => {
    // 遅延読み込みコンポーネントのテスト
    await page.goto('/profile/edit')
    
    // ローディングスケルトンが表示される可能性
    const loadingElement = page.locator('[data-testid="loading-skeleton"], .animate-pulse')
    
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).not.toBeVisible({ timeout: 5000 })
    }
    
    // 最終的にログイン要求が表示される
    await expect(page.locator('text=プロフィール編集にはログインが必要です')).toBeVisible()
  })

  test('ページ間ナビゲーション', async ({ page }) => {
    // プロフィールメインページから編集ページへ
    await page.goto('/profile')
    
    // 編集ボタンがあれば（ログイン後の状態では）クリック
    const editButton = page.locator('a[href="/profile/edit"]')
    if (await editButton.isVisible()) {
      await editButton.click()
      await expect(page).toHaveURL('/profile/edit')
    }
    
    // 設定ページから編集ページへ
    await page.goto('/profile/settings')
    
    // 編集リンクがあれば確認
    const editLink = page.locator('a[href="/profile/edit"]')
    if (await editLink.isVisible()) {
      await editLink.click()
      await expect(page).toHaveURL('/profile/edit')
    }
  })
})

test.describe('プロフィール機能のパフォーマンス', () => {
  test('ページ読み込み速度', async ({ page }) => {
    // プロフィールページ読み込み時間測定
    const startTime = Date.now()
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    console.log(`プロフィールページ読み込み時間: ${loadTime}ms`)
    
    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000)
  })

  test('設定ページ読み込み速度', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/profile/settings')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    console.log(`設定ページ読み込み時間: ${loadTime}ms`)
    
    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000)
  })

  test('編集ページ読み込み速度', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/profile/edit')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    console.log(`編集ページ読み込み時間: ${loadTime}ms`)
    
    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000)
  })

  test('遅延読み込みコンポーネントの動作', async ({ page }) => {
    // プロフィールページの遅延読み込み確認
    await page.goto('/profile')
    
    // 遅延読み込みされるコンポーネントのローディング状態
    const loadingIndicators = page.locator('.animate-pulse, [data-testid="loading-skeleton"]')
    
    // ローディングが表示される場合は適切に解除される
    if (await loadingIndicators.first().isVisible()) {
      await expect(loadingIndicators.first()).not.toBeVisible({ timeout: 5000 })
    }
    
    // 最終的にコンテンツが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })
})