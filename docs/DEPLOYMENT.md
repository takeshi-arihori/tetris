# デプロイメントガイド

このドキュメントでは、TetrisアプリケーションのVercelへのデプロイ方法について説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Vercelアカウント
- Supabaseプロジェクト

## 環境変数の設定

### 1. 環境変数ファイルの準備

`.env.example`をコピーして`.env.local`を作成し、実際の値を設定してください。

```bash
cp .env.example .env.local
```

### 2. 必須の環境変数

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# アプリケーションURL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Vercelでのデプロイ

### 1. Vercel CLIの使用

```bash
# Vercel CLIのインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトの初期化
vercel

# デプロイ
vercel --prod
```

### 2. GitHub連携でのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイの設定

### 3. 環境変数の設定（Vercel Dashboard）

Vercel Dashboardで以下の環境変数を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

## CI/CDパイプライン

`.github/workflows/ci.yml`で以下のプロセスが自動実行されます：

### テスト段階

1. **依存関係のインストール**
2. **型チェック**（TypeScript）
3. **リンティング**（ESLint）
4. **単体テスト**（Jest）
5. **E2Eテスト**（Playwright）
6. **セキュリティ監査**（npm audit）

### ビルド段階

1. **プロダクションビルド**
2. **静的ファイル最適化**
3. **ビルドアーティファクトの保存**

### デプロイ段階

1. **ステージング環境への自動デプロイ**（developブランチ）
2. **本番環境への自動デプロイ**（mainブランチ）
3. **Lighthouseパフォーマンステスト**
4. **Slack通知**

## パフォーマンス最適化

### 1. Next.jsの最適化

- **Image Optimization**: Next.js Imageコンポーネント使用
- **Code Splitting**: dynamic import使用
- **Bundle Analysis**: `ANALYZE=true npm run build`
- **Compression**: Gzip/Brotli圧縮有効

### 2. キャッシュ戦略

```javascript
// 静的ファイル: 1年間キャッシュ
Cache-Control: public, max-age=31536000, immutable

// HTML: キャッシュなし
Cache-Control: no-cache

// API: 短期キャッシュ
Cache-Control: public, max-age=60
```

### 3. CDN設定

Vercelの自動CDN機能により、以下のリージョンで配信：

- 東京（nrt1）- プライマリ
- 大阪（kix1）- セカンダリ
- シンガポール（sin1）- バックアップ

## セキュリティ設定

### 1. セキュリティヘッダー

```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 2. CORS設定

```javascript
Access-Control-Allow-Origin: https://tetris.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. 環境分離

- **本番環境**: `main`ブランチ → `https://tetris.vercel.app`
- **ステージング環境**: `develop`ブランチ → `https://tetris-staging.vercel.app`
- **開発環境**: ローカル → `http://localhost:3000`

## 監視とアラート

### 1. Vercel Analytics

- **パフォーマンス指標**の監視
- **エラー率**の追跡
- **トラフィック分析**

### 2. Lighthouse CI

自動パフォーマンステスト：
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 3. Sentry（オプション）

エラー監視とパフォーマンス追跡：

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## トラブルシューティング

### 1. ビルドエラー

```bash
# 依存関係の確認
npm ci

# 型チェック
npm run type-check

# ローカルビルドテスト
npm run build
```

### 2. 環境変数エラー

```bash
# 環境変数の確認
vercel env ls

# 環境変数の設定
vercel env add VARIABLE_NAME
```

### 3. パフォーマンス問題

```bash
# バンドル分析
ANALYZE=true npm run build

# Lighthouse実行
npm run lighthouse
```

## デプロイチェックリスト

### デプロイ前

- [ ] 全テスト通過
- [ ] 型チェック通過
- [ ] リンティング通過
- [ ] セキュリティ監査通過
- [ ] 環境変数設定完了
- [ ] データベースマイグレーション実行

### デプロイ後

- [ ] サイトアクセス確認
- [ ] 主要機能テスト
- [ ] パフォーマンステスト
- [ ] エラーログ確認
- [ ] 監視ダッシュボード確認

## ロールバック手順

緊急時のロールバック：

```bash
# 前のデプロイに戻す
vercel rollback

# 特定のデプロイに戻す
vercel rollback --url deployment-url
```

## スケーリング戦略

### 1. 水平スケーリング

- Vercelの自動スケーリング機能
- エッジ関数でのCDN活用
- データベース読み込みレプリカ

### 2. パフォーマンス監視

- Real User Monitoring (RUM)
- Core Web Vitals追跡
- API レスポンス時間監視

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)