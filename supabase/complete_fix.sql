-- ================================================================
-- 完全修正: トリガー関数の問題を解決
-- ================================================================
-- 問題: プロファイルは作成されるが、関連データが作成されない
-- 解決: トリガー関数を完全に再作成し、既存データを修正

-- ================================================================
-- 1. 既存のトリガーと関数を完全削除
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ================================================================
-- 2. 不足している関連データを手動で作成
-- ================================================================

-- 既存のプロファイルに対応する統計データを作成
INSERT INTO public.personal_bests (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.personal_bests);

INSERT INTO public.user_statistics (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_statistics);

INSERT INTO public.user_settings (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_settings);

-- ================================================================
-- 3. 新しいトリガー関数を作成（エラーハンドリング強化）
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Starting handle_new_user for user: %', NEW.id;
    
    -- プロファイル作成
    BEGIN
        INSERT INTO public.profiles (id, username)
        VALUES (
            NEW.id, 
            COALESCE(
                NEW.raw_user_meta_data->>'username',
                CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER)
            )
        );
        RAISE LOG 'Profile created for user: %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'Profile already exists for user: %', NEW.id;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;
    
    -- 個人記録作成
    BEGIN
        INSERT INTO public.personal_bests (user_id)
        VALUES (NEW.id);
        RAISE LOG 'Personal bests created for user: %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'Personal bests already exists for user: %', NEW.id;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating personal bests for user %: %', NEW.id, SQLERRM;
    END;
    
    -- 統計作成
    BEGIN
        INSERT INTO public.user_statistics (user_id)
        VALUES (NEW.id);
        RAISE LOG 'User statistics created for user: %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'User statistics already exists for user: %', NEW.id;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating user statistics for user %: %', NEW.id, SQLERRM;
    END;
    
    -- 設定作成
    BEGIN
        INSERT INTO public.user_settings (user_id)
        VALUES (NEW.id);
        RAISE LOG 'User settings created for user: %', NEW.id;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'User settings already exists for user: %', NEW.id;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating user settings for user %: %', NEW.id, SQLERRM;
    END;
    
    RAISE LOG 'Completed handle_new_user for user: %', NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. 新しいトリガーを作成
-- ================================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 5. 確認クエリ
-- ================================================================

-- 関数の存在確認
SELECT 
    proname as function_name,
    pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- トリガーの存在確認
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- データの確認
SELECT 
    'profiles' as table_name, 
    COUNT(*) as count 
FROM public.profiles
UNION ALL
SELECT 
    'personal_bests' as table_name, 
    COUNT(*) as count 
FROM public.personal_bests
UNION ALL
SELECT 
    'user_statistics' as table_name, 
    COUNT(*) as count 
FROM public.user_statistics
UNION ALL
SELECT 
    'user_settings' as table_name, 
    COUNT(*) as count 
FROM public.user_settings;

-- ================================================================
-- 6. テスト用の新しいユーザー作成（手動確認用）
-- ================================================================

-- このSQLを実行した後、アプリケーションで新しいユーザーを登録して
-- すべてのテーブルにデータが作成されることを確認してください

-- 実行完了メッセージ
SELECT 'Database fix completed successfully!' as message;