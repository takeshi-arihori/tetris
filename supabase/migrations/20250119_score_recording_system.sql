-- Phase 3: スコア記録・履歴機能のデータベーススキーマ
-- 作成日: 2025/01/19

-- ゲーム記録テーブル
CREATE TABLE IF NOT EXISTS game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 9),
  lines_cleared INTEGER NOT NULL CHECK (lines_cleared >= 0),
  duration INTEGER NOT NULL CHECK (duration > 0), -- 秒単位
  tetrominos_dropped INTEGER NOT NULL CHECK (tetrominos_dropped >= 0),
  game_mode VARCHAR(20) DEFAULT 'classic' CHECK (game_mode IN ('classic', 'speed', 'marathon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT, -- ゲストプレイ用
  is_guest BOOLEAN DEFAULT FALSE,
  
  -- インデックス用
  CONSTRAINT valid_guest_data CHECK (
    (is_guest = true AND session_id IS NOT NULL AND user_id IS NULL) OR
    (is_guest = false AND session_id IS NULL AND user_id IS NOT NULL)
  )
);

-- 個人ベスト記録テーブル
CREATE TABLE IF NOT EXISTS personal_bests (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  best_score INTEGER NOT NULL DEFAULT 0,
  best_level INTEGER NOT NULL DEFAULT 1,
  best_lines INTEGER NOT NULL DEFAULT 0,
  longest_play INTEGER NOT NULL DEFAULT 0, -- 秒単位
  most_tetrominos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- ユーザー統計データテーブル
CREATE TABLE IF NOT EXISTS user_statistics (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  total_games INTEGER DEFAULT 0 CHECK (total_games >= 0),
  total_score BIGINT DEFAULT 0 CHECK (total_score >= 0),
  total_lines INTEGER DEFAULT 0 CHECK (total_lines >= 0),
  total_playtime INTEGER DEFAULT 0 CHECK (total_playtime >= 0), -- 秒単位
  total_tetrominos BIGINT DEFAULT 0 CHECK (total_tetrominos >= 0),
  average_score DECIMAL(10,2) DEFAULT 0 CHECK (average_score >= 0),
  average_duration DECIMAL(10,2) DEFAULT 0 CHECK (average_duration >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- ゲストセッションテーブル（一時保存用）
CREATE TABLE IF NOT EXISTS guest_sessions (
  session_id TEXT PRIMARY KEY,
  game_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_score ON game_records(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_session_id ON game_records(session_id);
CREATE INDEX IF NOT EXISTS idx_game_records_is_guest ON game_records(is_guest);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON guest_sessions(expires_at);

-- RLS (Row Level Security) ポリシー設定
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own game records" 
ON game_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game records" 
ON game_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ゲストセッションポリシー
CREATE POLICY "Anyone can read guest sessions by session_id" 
ON guest_sessions FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert guest sessions" 
ON guest_sessions FOR INSERT 
WITH CHECK (true);

-- 個人ベストポリシー
CREATE POLICY "Users can view own personal bests" 
ON personal_bests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own personal bests" 
ON personal_bests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal bests" 
ON personal_bests FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 統計データポリシー
CREATE POLICY "Users can view own statistics" 
ON user_statistics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own statistics" 
ON user_statistics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" 
ON user_statistics FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ストアドプロシージャ: ゲーム記録保存と統計更新
CREATE OR REPLACE FUNCTION save_game_record_and_update_stats(
  p_user_id UUID,
  p_score INTEGER,
  p_level INTEGER,
  p_lines_cleared INTEGER,
  p_duration INTEGER,
  p_tetrominos_dropped INTEGER,
  p_game_mode VARCHAR(20) DEFAULT 'classic'
) RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
  v_current_stats user_statistics%ROWTYPE;
BEGIN
  -- ゲーム記録を保存
  INSERT INTO game_records (
    user_id, score, level, lines_cleared, duration, tetrominos_dropped, game_mode, is_guest
  ) VALUES (
    p_user_id, p_score, p_level, p_lines_cleared, p_duration, p_tetrominos_dropped, p_game_mode, false
  ) RETURNING id INTO v_record_id;

  -- 現在の統計を取得
  SELECT * INTO v_current_stats 
  FROM user_statistics 
  WHERE user_id = p_user_id;

  -- 統計データを更新または作成
  INSERT INTO user_statistics (
    user_id, total_games, total_score, total_lines, total_playtime, total_tetrominos,
    average_score, average_duration
  ) VALUES (
    p_user_id, 1, p_score, p_lines_cleared, p_duration, p_tetrominos_dropped,
    p_score::DECIMAL, p_duration::DECIMAL
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_games = user_statistics.total_games + 1,
    total_score = user_statistics.total_score + p_score,
    total_lines = user_statistics.total_lines + p_lines_cleared,
    total_playtime = user_statistics.total_playtime + p_duration,
    total_tetrominos = user_statistics.total_tetrominos + p_tetrominos_dropped,
    average_score = (user_statistics.total_score + p_score)::DECIMAL / (user_statistics.total_games + 1),
    average_duration = (user_statistics.total_playtime + p_duration)::DECIMAL / (user_statistics.total_games + 1),
    updated_at = NOW();

  -- 個人ベスト記録を更新
  INSERT INTO personal_bests (
    user_id, best_score, best_level, best_lines, longest_play, most_tetrominos
  ) VALUES (
    p_user_id, p_score, p_level, p_lines_cleared, p_duration, p_tetrominos_dropped
  )
  ON CONFLICT (user_id) DO UPDATE SET
    best_score = GREATEST(personal_bests.best_score, p_score),
    best_level = GREATEST(personal_bests.best_level, p_level),
    best_lines = GREATEST(personal_bests.best_lines, p_lines_cleared),
    longest_play = GREATEST(personal_bests.longest_play, p_duration),
    most_tetrominos = GREATEST(personal_bests.most_tetrominos, p_tetrominos_dropped),
    updated_at = NOW();

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ストアドプロシージャ: ゲスト記録をユーザー記録に移行
CREATE OR REPLACE FUNCTION migrate_guest_records_to_user(
  p_session_id TEXT,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_migrated_count INTEGER := 0;
  v_record RECORD;
BEGIN
  -- ゲスト記録をユーザー記録に移行
  FOR v_record IN 
    SELECT * FROM game_records 
    WHERE session_id = p_session_id AND is_guest = true
  LOOP
    -- 既存の記録を更新
    UPDATE game_records 
    SET 
      user_id = p_user_id,
      is_guest = false,
      session_id = NULL
    WHERE id = v_record.id;

    -- 統計を再計算
    PERFORM save_game_record_and_update_stats(
      p_user_id,
      v_record.score,
      v_record.level,
      v_record.lines_cleared,
      v_record.duration,
      v_record.tetrominos_dropped,
      v_record.game_mode
    );

    v_migrated_count := v_migrated_count + 1;
  END LOOP;

  -- ゲストセッションデータを削除
  DELETE FROM guest_sessions WHERE session_id = p_session_id;

  RETURN v_migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ストアドプロシージャ: 期限切れゲストデータ削除
CREATE OR REPLACE FUNCTION cleanup_expired_guest_data() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  -- 期限切れのゲストセッションを削除
  WITH deleted_sessions AS (
    DELETE FROM guest_sessions 
    WHERE expires_at < NOW() 
    RETURNING session_id
  )
  DELETE FROM game_records 
  WHERE session_id IN (SELECT session_id FROM deleted_sessions) 
  AND is_guest = true;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント追加
COMMENT ON TABLE game_records IS 'ゲーム記録テーブル - 各ゲームプレイの詳細記録';
COMMENT ON TABLE personal_bests IS '個人ベスト記録テーブル - ユーザーの最高記録';
COMMENT ON TABLE user_statistics IS 'ユーザー統計テーブル - 累計データと平均値';
COMMENT ON TABLE guest_sessions IS 'ゲストセッションテーブル - 一時保存用';

COMMENT ON FUNCTION save_game_record_and_update_stats IS 'ゲーム記録保存と統計更新を一括実行';
COMMENT ON FUNCTION migrate_guest_records_to_user IS 'ゲスト記録をユーザー記録に移行';
COMMENT ON FUNCTION cleanup_expired_guest_data IS '期限切れゲストデータの自動削除';