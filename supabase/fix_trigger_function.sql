-- ================================================================
-- トリガー関数が存在しない問題の修正
-- ================================================================
-- 実行場所: Supabaseダッシュボード → SQL Editor
-- 
-- 問題: "Could not find the function public.handle_new_user"
-- 解決: トリガー関数を完全に再作成

-- ================================================================
-- 1. 既存のトリガーと関数をクリーンアップ
-- ================================================================

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 既存の関数を削除
DROP FUNCTION IF EXISTS handle_new_user();

-- ================================================================
-- 2. 新しいトリガー関数を作成
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- デバッグ用ログ
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Use username from metadata if available, otherwise use email with timestamp
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id, 
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER)
        )
    );
    
    RAISE LOG 'Profile created for user: %', NEW.id;
    
    INSERT INTO public.personal_bests (user_id)
    VALUES (NEW.id);
    
    RAISE LOG 'Personal bests created for user: %', NEW.id;
    
    INSERT INTO public.user_statistics (user_id)
    VALUES (NEW.id);
    
    RAISE LOG 'User statistics created for user: %', NEW.id;
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RAISE LOG 'User settings created for user: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RAISE LOG 'Unique violation for user %, attempting fallback', NEW.id;
        
        -- Handle unique constraint violation
        INSERT INTO public.profiles (id, username)
        VALUES (
            NEW.id,
            CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER, '_', SUBSTRING(NEW.id::TEXT, 1, 8))
        );
        
        INSERT INTO public.personal_bests (user_id)
        VALUES (NEW.id);
        
        INSERT INTO public.user_statistics (user_id)
        VALUES (NEW.id);
        
        INSERT INTO public.user_settings (user_id)
        VALUES (NEW.id);
        
        RAISE LOG 'Fallback profile creation successful for user: %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. 新しいトリガーを作成
-- ================================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 4. 関数とトリガーの存在確認
-- ================================================================

-- 関数の存在確認
SELECT 
    proname as function_name,
    pronamespace::regnamespace as schema_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- トリガーの存在確認
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ================================================================
-- 5. テスト用のクエリ
-- ================================================================

-- 現在のデータベース状態を確認
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
-- 実行完了後の確認事項
-- ================================================================

-- ✅ 実行完了後、以下を確認してください：
-- 1. 関数の存在確認で1行返される
-- 2. トリガーの存在確認で1行返される
-- 3. エラーメッセージが表示されない
-- 4. アプリケーションでユーザー登録をテスト