-- ==================================================
-- Database Error "Database error saving new user" 修正用SQL
-- ==================================================
-- 実行場所: Supabaseダッシュボード → SQL Editor
-- 実行順序: 1. データクリーンアップ → 2. トリガー関数更新

-- ==================================================
-- 1. 既存の重複データをクリーンアップ
-- ==================================================

-- 重複するprofilesレコードを削除
DELETE FROM profiles 
WHERE id IN (
    SELECT id FROM profiles 
    WHERE username IN (
        SELECT username 
        FROM profiles 
        GROUP BY username 
        HAVING COUNT(*) > 1
    )
);

-- 孤立したレコードをクリーンアップ（もしあれば）
DELETE FROM personal_bests 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM user_statistics 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM user_settings 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ==================================================
-- 2. トリガー関数の更新
-- ==================================================

-- 既存のトリガー関数を更新
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use username from metadata if available, otherwise use email with timestamp
    INSERT INTO profiles (id, username)
    VALUES (
        NEW.id, 
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER)
        )
    );
    
    INSERT INTO personal_bests (user_id)
    VALUES (NEW.id);
    
    INSERT INTO user_statistics (user_id)
    VALUES (NEW.id);
    
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle unique constraint violation
        INSERT INTO profiles (id, username)
        VALUES (
            NEW.id,
            CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER, '_', SUBSTRING(NEW.id::TEXT, 1, 8))
        );
        
        INSERT INTO personal_bests (user_id)
        VALUES (NEW.id);
        
        INSERT INTO user_statistics (user_id)
        VALUES (NEW.id);
        
        INSERT INTO user_settings (user_id)
        VALUES (NEW.id);
        
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 3. 動作確認用クエリ
-- ==================================================

-- トリガー関数の存在確認
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- トリガーの存在確認
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- データベースの状態確認
SELECT 
    'profiles' as table_name, 
    COUNT(*) as count 
FROM profiles
UNION ALL
SELECT 
    'personal_bests' as table_name, 
    COUNT(*) as count 
FROM personal_bests
UNION ALL
SELECT 
    'user_statistics' as table_name, 
    COUNT(*) as count 
FROM user_statistics
UNION ALL
SELECT 
    'user_settings' as table_name, 
    COUNT(*) as count 
FROM user_settings;

-- ==================================================
-- 4. 実行後の確認事項
-- ==================================================

-- ✅ 実行完了後、以下を確認してください：
-- 1. すべてのクエリがエラーなく実行されたか
-- 2. トリガー関数が正常に作成されたか
-- 3. データベースの状態が正常か
-- 4. アプリケーションでユーザー登録が正常に動作するか

-- ==================================================
-- 5. 緊急時のロールバック
-- ==================================================

-- もし問題が発生した場合、以下のSQLでトリガーを無効化：
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS handle_new_user();

-- その後、元のschema.sqlを再実行してください。