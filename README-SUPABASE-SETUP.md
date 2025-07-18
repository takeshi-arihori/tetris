# Supabase セットアップガイド

このドキュメントは、テトリスゲームプロジェクトでSupabaseを設定する手順を説明します。

## 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `tetris-game`）
4. データベースパスワードを設定
5. リージョンを選択（日本の場合は `ap-northeast-1`）
6. 「Create new project」をクリック

## 2. データベーススキーマの作成

1. Supabase Dashboardの「SQL Editor」に移動
2. `supabase/schema.sql` の内容をコピー＆ペースト
3. 「RUN」をクリックしてスキーマを実行

## 3. 環境変数の設定

1. Supabase Dashboardの「Settings」→「API」に移動
2. 以下の値をコピー：
   - `URL`
   - `anon` キー
   - `service_role` キー（必要に応じて）

3. プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. 認証設定

1. Supabase Dashboardの「Authentication」→「Settings」に移動
2. 「Site URL」を設定：
   - 開発環境: `http://localhost:3000`
   - 本番環境: あなたのドメイン
3. 「Redirect URLs」を設定：
   - `http://localhost:3000/auth/callback`
   - `your-domain.com/auth/callback`

## 5. Row Level Security (RLS) の確認

スキーマが正しく作成されていることを確認：

1. 「Authentication」→「Policies」で RLS ポリシーが設定されていることを確認
2. 各テーブルで適切なポリシーが適用されていることを確認

## 6. 開発サーバーの起動

```bash
npm run dev
```

## 7. 動作確認

1. ブラウザで `http://localhost:3000` にアクセス
2. 認証機能のテスト：
   - ユーザー登録
   - ログイン
   - ログアウト
3. データベース機能のテスト：
   - ゲーム記録の保存
   - プロフィール情報の更新

## データベース構造

### テーブル一覧

- `profiles`: ユーザープロフィール
- `game_records`: ゲーム記録
- `personal_bests`: 個人最高記録
- `user_statistics`: ユーザー統計
- `rankings`: ランキング
- `user_settings`: ユーザー設定

### 主要な機能

- **自動プロフィール作成**: 新規ユーザー登録時に自動でプロフィールが作成
- **Row Level Security**: ユーザーごとのデータアクセス制御
- **リアルタイム更新**: ランキング等のリアルタイム更新対応
- **ゲスト機能**: ログイン不要でのゲームプレイ

## トラブルシューティング

### よくある問題

1. **認証エラー**: 環境変数が正しく設定されているか確認
2. **データベース接続エラー**: Supabase プロジェクトが正常に作成されているか確認
3. **RLS エラー**: ポリシーが正しく設定されているか確認

### デバッグ方法

```bash
# 環境変数の確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 開発サーバーの詳細ログ
npm run dev -- --debug
```

## 次のステップ

1. 認証フローの実装
2. ゲーム記録機能の実装
3. ランキング機能の実装
4. マイページ機能の実装