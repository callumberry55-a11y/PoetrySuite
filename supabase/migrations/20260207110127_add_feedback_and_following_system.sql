/*
  # Feedback/Critique and Following System

  1. New Tables
    - `poem_critiques` - Detailed critiques/feedback on poems
    - `user_follows` - User following relationships
    - `writing_sessions` - Track writing sessions for analytics

  2. Security
    - Enable RLS
    - Users can critique public poems
    - Users manage their own follows
*/

-- Poem Critiques Table
CREATE TABLE IF NOT EXISTS poem_critiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  critic_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  critique_text text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  critique_type text DEFAULT 'general',
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE poem_critiques ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_poem_critiques_poem ON poem_critiques(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_critiques_critic ON poem_critiques(critic_id);

-- User Follows Table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT user_follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Writing Sessions Table (for analytics)
CREATE TABLE IF NOT EXISTS writing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  words_written integer DEFAULT 0,
  session_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_writing_sessions_user ON writing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_date ON writing_sessions(session_date);

-- RLS Policies for poem_critiques
DROP POLICY IF EXISTS "Users can view public critiques" ON poem_critiques;
CREATE POLICY "Users can view public critiques"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (is_private = false);

DROP POLICY IF EXISTS "Users can view own critiques" ON poem_critiques;
CREATE POLICY "Users can view own critiques"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (critic_id = auth.uid());

DROP POLICY IF EXISTS "Poem authors can view critiques on their poems" ON poem_critiques;
CREATE POLICY "Poem authors can view critiques on their poems"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_critiques.poem_id
      AND poems.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create critiques" ON poem_critiques;
CREATE POLICY "Users can create critiques"
  ON poem_critiques FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = critic_id);

DROP POLICY IF EXISTS "Users can update own critiques" ON poem_critiques;
CREATE POLICY "Users can update own critiques"
  ON poem_critiques FOR UPDATE
  TO authenticated
  USING (auth.uid() = critic_id)
  WITH CHECK (auth.uid() = critic_id);

DROP POLICY IF EXISTS "Users can delete own critiques" ON poem_critiques;
CREATE POLICY "Users can delete own critiques"
  ON poem_critiques FOR DELETE
  TO authenticated
  USING (auth.uid() = critic_id);

-- RLS Policies for user_follows
DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- RLS Policies for writing_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON writing_sessions;
CREATE POLICY "Users can view own sessions"
  ON writing_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON writing_sessions;
CREATE POLICY "Users can create own sessions"
  ON writing_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON writing_sessions;
CREATE POLICY "Users can update own sessions"
  ON writing_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'poem_critiques'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE poem_critiques;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_follows;
  END IF;
END $$;