/*
  # Add Irish-Ranked Badge System

  1. Changes
    - Add `rank` column to badges table using traditional Irish bardic rankings
    - Add `category` column to organize badges by type
    - Add `points` column for gamification
    - Populate badges table with Irish-themed achievement badges
  
  2. Badge Ranks (Traditional Irish Bardic System)
    - Ollamh: Master (highest rank)
    - Anruth: Expert (second rank)
    - Cli: Journeyman (third rank)
    - Fochlog: Apprentice (entry rank)
  
  3. Security
    - No changes to RLS policies needed
*/

-- Add rank and category columns to badges table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'badges' AND column_name = 'rank'
  ) THEN
    ALTER TABLE badges ADD COLUMN rank text CHECK (rank IN ('Fochlog', 'Cli', 'Anruth', 'Ollamh'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'badges' AND column_name = 'category'
  ) THEN
    ALTER TABLE badges ADD COLUMN category text DEFAULT 'achievement' CHECK (category IN ('achievement', 'social', 'creative', 'dedication'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'badges' AND column_name = 'points'
  ) THEN
    ALTER TABLE badges ADD COLUMN points integer DEFAULT 0;
  END IF;
END $$;

-- Clear existing badges to repopulate with new structure
TRUNCATE badges CASCADE;

-- Insert Irish-ranked badges

-- FOCHLOG (Apprentice) Badges - Entry Level
INSERT INTO badges (name, description, icon, rank, category, requirement_type, requirement_value, points)
VALUES
  ('First Verse', 'Published your first poem', 'feather', 'Fochlog', 'achievement', 'poems_published', 1, 10),
  ('Word Weaver', 'Wrote 100 words', 'pen', 'Fochlog', 'creative', 'words_written', 100, 10),
  ('Social Spark', 'Received your first like', 'heart', 'Fochlog', 'social', 'likes_received', 1, 10),
  ('Curious Mind', 'Read 5 poems', 'book-open', 'Fochlog', 'social', 'poems_read', 5, 10);

-- CLI (Journeyman) Badges - Intermediate Level
INSERT INTO badges (name, description, icon, rank, category, requirement_type, requirement_value, points)
VALUES
  ('Dedicated Poet', 'Published 10 poems', 'scroll', 'Cli', 'achievement', 'poems_published', 10, 25),
  ('Silver Tongue', 'Wrote 1,000 words', 'message-circle', 'Cli', 'creative', 'words_written', 1000, 25),
  ('Community Voice', 'Received 25 likes', 'thumbs-up', 'Cli', 'social', 'likes_received', 25, 25),
  ('Week Warrior', 'Maintained a 7-day writing streak', 'flame', 'Cli', 'dedication', 'streak_days', 7, 25),
  ('Feedback Friend', 'Left 10 comments', 'message-square', 'Cli', 'social', 'comments_given', 10, 25);

-- ANRUTH (Expert) Badges - Advanced Level
INSERT INTO badges (name, description, icon, rank, category, requirement_type, requirement_value, points)
VALUES
  ('Prolific Bard', 'Published 50 poems', 'book', 'Anruth', 'achievement', 'poems_published', 50, 50),
  ('Golden Quill', 'Wrote 10,000 words', 'pen-tool', 'Anruth', 'creative', 'words_written', 10000, 50),
  ('Beloved Poet', 'Received 100 likes', 'star', 'Anruth', 'social', 'likes_received', 100, 50),
  ('Month Master', 'Maintained a 30-day writing streak', 'calendar', 'Anruth', 'dedication', 'streak_days', 30, 50),
  ('Mentor Spirit', 'Left 50 comments', 'users', 'Anruth', 'social', 'comments_given', 50, 50);

-- OLLAMH (Master) Badges - Master Level
INSERT INTO badges (name, description, icon, rank, category, requirement_type, requirement_value, points)
VALUES
  ('Master Poet', 'Published 100 poems', 'crown', 'Ollamh', 'achievement', 'poems_published', 100, 100),
  ('Epic Wordsmith', 'Wrote 50,000 words', 'book-open', 'Ollamh', 'creative', 'words_written', 50000, 100),
  ('Legend of Poetry', 'Received 500 likes', 'trophy', 'Ollamh', 'social', 'likes_received', 500, 100),
  ('Year Champion', 'Maintained a 365-day writing streak', 'award', 'Ollamh', 'dedication', 'streak_days', 365, 100),
  ('Grand Mentor', 'Left 200 comments', 'graduation-cap', 'Ollamh', 'social', 'comments_given', 200, 100);

-- Add total_points to user_badges for display purposes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_badges' AND column_name = 'progress'
  ) THEN
    ALTER TABLE user_badges ADD COLUMN progress integer DEFAULT 0;
  END IF;
END $$;

-- Create index for faster badge queries
CREATE INDEX IF NOT EXISTS idx_badges_rank ON badges(rank);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
