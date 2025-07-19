-- Enable Row Level Security (RLS)
-- Users table is automatically created by Supabase Auth

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game records table
CREATE TABLE game_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    lines_cleared INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    tetrominos_dropped INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT, -- for guest play
    is_guest BOOLEAN DEFAULT FALSE
);

-- Create personal bests table
CREATE TABLE personal_bests (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    best_score INTEGER NOT NULL DEFAULT 0,
    best_level INTEGER NOT NULL DEFAULT 1,
    best_lines INTEGER NOT NULL DEFAULT 0,
    longest_play INTEGER NOT NULL DEFAULT 0, -- in seconds
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user statistics table
CREATE TABLE user_statistics (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_score BIGINT DEFAULT 0,
    total_lines INTEGER DEFAULT 0,
    total_playtime INTEGER DEFAULT 0, -- in seconds
    average_score DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rankings table
CREATE TABLE rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    rank_type TEXT NOT NULL, -- 'overall', 'weekly', 'monthly', 'yearly'
    rank_position INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE user_settings (
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

-- Create indexes for performance
CREATE INDEX idx_game_records_user_id ON game_records(user_id);
CREATE INDEX idx_game_records_score ON game_records(score DESC);
CREATE INDEX idx_game_records_created_at ON game_records(created_at DESC);
CREATE INDEX idx_game_records_session_id ON game_records(session_id);
CREATE INDEX idx_rankings_type_position ON rankings(rank_type, rank_position);
CREATE INDEX idx_rankings_user_type ON rankings(user_id, rank_type);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Game records: Users can read all records but only insert their own
CREATE POLICY "Game records are viewable by everyone" ON game_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own game records" ON game_records
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Personal bests: Users can only access their own
CREATE POLICY "Users can view their own personal bests" ON personal_bests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal bests" ON personal_bests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal bests" ON personal_bests
    FOR UPDATE USING (auth.uid() = user_id);

-- User statistics: Users can only access their own
CREATE POLICY "Users can view their own statistics" ON user_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Rankings: Everyone can read
CREATE POLICY "Rankings are viewable by everyone" ON rankings
    FOR SELECT USING (true);

-- User settings: Users can only access their own
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automated updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_bests_updated_at
    BEFORE UPDATE ON personal_bests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
    BEFORE UPDATE ON user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
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

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();