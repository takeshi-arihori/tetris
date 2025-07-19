-- ================================================================
-- 段階的データベースリセット（依存関係エラーを回避）
-- ================================================================
-- 実行場所: Supabaseダッシュボード → SQL Editor

-- ================================================================
-- ステップ1: すべてのトリガーを削除
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_personal_bests_updated_at ON public.personal_bests;
DROP TRIGGER IF EXISTS update_user_statistics_updated_at ON public.user_statistics;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;

-- ================================================================
-- ステップ2: 関数を削除
-- ================================================================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ================================================================
-- ステップ3: テーブルを削除（依存関係順）
-- ================================================================

DROP TABLE IF EXISTS public.game_records CASCADE;
DROP TABLE IF EXISTS public.rankings CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.user_statistics CASCADE;
DROP TABLE IF EXISTS public.personal_bests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ================================================================
-- ステップ4: テーブルを再作成
-- ================================================================

-- プロファイルテーブル
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 個人記録テーブル
CREATE TABLE public.personal_bests (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    best_score INTEGER NOT NULL DEFAULT 0,
    best_level INTEGER NOT NULL DEFAULT 1,
    best_lines INTEGER NOT NULL DEFAULT 0,
    longest_play INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー統計テーブル
CREATE TABLE public.user_statistics (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_score BIGINT DEFAULT 0,
    total_lines INTEGER DEFAULT 0,
    total_playtime INTEGER DEFAULT 0,
    average_score DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー設定テーブル
CREATE TABLE public.user_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    bgm_volume INTEGER DEFAULT 30,
    sfx_volume INTEGER DEFAULT 50,
    theme TEXT DEFAULT 'default',
    language TEXT DEFAULT 'ja',
    timezone TEXT DEFAULT 'Asia/Tokyo',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    privacy_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ゲーム記録テーブル
CREATE TABLE public.game_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    lines_cleared INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    tetrominos_dropped INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    is_guest BOOLEAN DEFAULT FALSE
);

-- ランキングテーブル
CREATE TABLE public.rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    rank_type TEXT NOT NULL,
    rank_position INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ステップ5: RLSを有効化
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- ステップ6: RLSポリシーを作成
-- ================================================================

-- プロファイル
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 個人記録
CREATE POLICY "Users can view their own personal bests" ON public.personal_bests
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own personal bests" ON public.personal_bests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own personal bests" ON public.personal_bests
    FOR UPDATE USING (auth.uid() = user_id);

-- ユーザー統計
CREATE POLICY "Users can view their own statistics" ON public.user_statistics
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own statistics" ON public.user_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- ユーザー設定
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- ゲーム記録
CREATE POLICY "Game records are viewable by everyone" ON public.game_records
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own game records" ON public.game_records
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ランキング
CREATE POLICY "Rankings are viewable by everyone" ON public.rankings
    FOR SELECT USING (true);

-- ================================================================
-- ステップ7: 関数を再作成
-- ================================================================

-- updated_at更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー処理関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Creating profile for new user: %', NEW.id;
    
    -- プロファイル作成
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id, 
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            CONCAT(SPLIT_PART(NEW.email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER)
        )
    );
    
    -- 個人記録作成
    INSERT INTO public.personal_bests (user_id)
    VALUES (NEW.id);
    
    -- ユーザー統計作成
    INSERT INTO public.user_statistics (user_id)
    VALUES (NEW.id);
    
    -- ユーザー設定作成
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RAISE LOG 'Successfully created all records for user: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- ステップ8: トリガーを再作成
-- ================================================================

-- updated_atトリガー
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_bests_updated_at
    BEFORE UPDATE ON public.personal_bests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
    BEFORE UPDATE ON public.user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 新規ユーザートリガー
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- ステップ9: インデックスを作成
-- ================================================================

CREATE INDEX idx_game_records_user_id ON public.game_records(user_id);
CREATE INDEX idx_game_records_score ON public.game_records(score DESC);
CREATE INDEX idx_game_records_created_at ON public.game_records(created_at DESC);
CREATE INDEX idx_rankings_type_position ON public.rankings(rank_type, rank_position);

-- ================================================================
-- 完了確認
-- ================================================================

SELECT 'Database reset completed successfully!' as message;

-- テーブル確認
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;
