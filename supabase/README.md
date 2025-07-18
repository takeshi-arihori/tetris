# Supabaseデータベース修正手順

## 🚨 「Database error saving new user」エラーの修正

### 📋 問題の概要
- ユーザー登録時にデータベーストリガーエラーが発生
- `handle_new_user()` 関数でUNIQUE制約違反
- プロファイル作成に失敗

### 🔧 修正手順

#### 1. **Supabaseダッシュボードにアクセス**
1. [Supabaseダッシュボード](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. **SQL Editor** に移動

#### 2. **修正SQLを実行**
`supabase/fix_database_error.sql` の内容を **SQL Editor** で実行：

```bash
# ファイルの場所
/Users/takeshi-arihori/code/project/tetris/supabase/fix_database_error.sql
```

#### 3. **実行順序**
1. **データクリーンアップ** - 重複データの削除
2. **トリガー関数更新** - 新しいロジックの適用
3. **動作確認** - 関数とトリガーの確認

#### 4. **実行後の確認**
- [ ] すべてのクエリがエラーなく実行完了
- [ ] トリガー関数が正常に作成
- [ ] データベースの状態が正常
- [ ] アプリケーションでユーザー登録が成功

### 📁 関連ファイル

```
supabase/
├── schema.sql              # 元のデータベーススキーマ
├── fix_database_error.sql  # 修正用SQL（このファイルを実行）
└── README.md              # この手順書
```

### 🔄 フォールバック機能

もしトリガーエラーが続く場合、アプリケーション側で以下のフォールバック機能が動作します：

1. **ユーザー名重複チェック**
2. **一意のユーザー名生成**
3. **手動プロファイル作成**

### 🛠 デバッグ

問題が続く場合、`/debug` ページで以下をテスト：

- **Test Connection**: データベース接続確認
- **Test User Registration**: ユーザー登録テスト
- **Test Database Trigger**: トリガー関数の動作確認

### 🚨 緊急時のロールバック

問題が発生した場合：

```sql
-- トリガーを無効化
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 元のschema.sqlを再実行
```

### 💡 修正内容の説明

1. **UNIQUE制約違反の対処**
   - `raw_user_meta_data` からユーザー名を取得
   - フォールバック: `メールアドレス_タイムスタンプ`

2. **エラーハンドリング強化**
   - `EXCEPTION` ブロックで例外処理
   - `WHEN unique_violation` で重複対応
   - `WHEN OTHERS` で一般的なエラー処理

3. **ログ記録**
   - `RAISE LOG` でエラーログ記録
   - ユーザー作成は失敗させない

この修正により、ユーザー登録時のデータベースエラーが解決されます。