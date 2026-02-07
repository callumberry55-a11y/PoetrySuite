/*
  # Writing Streaks and Habits Tracking System (Fixed)

  1. New Tables
    - `daily_writing_logs` - Track daily writing activity
    - `user_achievements` - Track user achievements

  2. Functions
    - Streak calculation and achievement tracking

  3. Security
    - Enable RLS with appropriate policies
*/

-- Daily Writing Logs Table
CREATE TABLE IF NOT EXISTS daily_writing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  write_date date NOT NULL,
  word_count integer DEFAULT 0,
  poems_written integer DEFAULT 0,
  minutes_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT daily_writing_logs_unique UNIQUE (user_id, write_date)
);

ALTER TABLE daily_writing_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_daily_writing_logs_user ON daily_writing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_writing_logs_date ON daily_writing_logs(write_date);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text DEFAULT '',
  earned_at timestamptz DEFAULT now(),
  CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_type)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- RLS Policies for daily_writing_logs
DROP POLICY IF EXISTS "Users can view own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can view own writing logs"
  ON daily_writing_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can insert own writing logs"
  ON daily_writing_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can update own writing logs"
  ON daily_writing_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view others achievements" ON user_achievements;
CREATE POLICY "Users can view others achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

-- Function to update writing streak
CREATE OR REPLACE FUNCTION update_writing_streak(p_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_write_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_total_days integer;
  v_streak_start_date date;
BEGIN
  SELECT last_write_date, current_streak, longest_streak, total_writing_days, streak_start_date
  INTO v_last_write_date, v_current_streak, v_longest_streak, v_total_days, v_streak_start_date
  FROM writing_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO writing_streaks (user_id, current_streak, longest_streak, last_write_date, total_writing_days, streak_start_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, 1, CURRENT_DATE);
    RETURN;
  END IF;

  IF v_last_write_date = CURRENT_DATE THEN
    RETURN;
  END IF;

  IF v_last_write_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
  ELSIF v_last_write_date < CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := 1;
    v_streak_start_date := CURRENT_DATE;
  END IF;

  v_total_days := v_total_days + 1;

  UPDATE writing_streaks
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_write_date = CURRENT_DATE,
    total_writing_days = v_total_days,
    streak_start_date = v_streak_start_date,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to log daily writing activity
CREATE OR REPLACE FUNCTION log_daily_writing(
  p_user_id uuid,
  p_word_count integer DEFAULT 0,
  p_poems_written integer DEFAULT 1,
  p_minutes_spent integer DEFAULT 0
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO daily_writing_logs (user_id, write_date, word_count, poems_written, minutes_spent)
  VALUES (p_user_id, CURRENT_DATE, p_word_count, p_poems_written, p_minutes_spent)
  ON CONFLICT (user_id, write_date)
  DO UPDATE SET
    word_count = daily_writing_logs.word_count + p_word_count,
    poems_written = daily_writing_logs.poems_written + p_poems_written,
    minutes_spent = daily_writing_logs.minutes_spent + p_minutes_spent;
  
  PERFORM update_writing_streak(p_user_id);
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_streak integer;
  v_total_poems integer;
BEGIN
  SELECT current_streak INTO v_current_streak
  FROM writing_streaks
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_total_poems
  FROM poems
  WHERE author_id = p_user_id;

  IF v_current_streak >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, 'week_streak', '7-Day Streak', 'Wrote for 7 consecutive days')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF v_current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, 'month_streak', '30-Day Streak', 'Wrote for 30 consecutive days')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF v_total_poems >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, 'first_poem', 'First Poem', 'Created your first poem')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF v_total_poems >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, '10_poems', '10 Poems', 'Created 10 poems')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF v_total_poems >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, '50_poems', '50 Poems', 'Created 50 poems')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF v_total_poems >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (p_user_id, '100_poems', 'Centurion Poet', 'Created 100 poems')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
END;
$$;

-- Trigger to update streak when a poem is created
CREATE OR REPLACE FUNCTION trigger_update_writing_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM log_daily_writing(NEW.author_id, 0, 1, 0);
  PERFORM check_and_award_achievements(NEW.author_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_writing_activity_on_poem_create ON poems;
CREATE TRIGGER update_writing_activity_on_poem_create
  AFTER INSERT ON poems
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_writing_activity();

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_achievements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
  END IF;
END $$;