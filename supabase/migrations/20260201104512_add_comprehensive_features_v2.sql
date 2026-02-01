/*
  # Add Comprehensive Social and Writing Features - Part 1: Tables Only

  This migration creates all tables first without complex RLS policies to avoid forward references.
  Complex RLS policies will be added in a follow-up migration.
*/

-- =====================================================
-- PART 1: Extend user_profiles
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bio') THEN
    ALTER TABLE user_profiles ADD COLUMN bio text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'location') THEN
    ALTER TABLE user_profiles ADD COLUMN location text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'website') THEN
    ALTER TABLE user_profiles ADD COLUMN website text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'favorite_forms') THEN
    ALTER TABLE user_profiles ADD COLUMN favorite_forms text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'writing_style') THEN
    ALTER TABLE user_profiles ADD COLUMN writing_style text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'follower_count') THEN
    ALTER TABLE user_profiles ADD COLUMN follower_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'following_count') THEN
    ALTER TABLE user_profiles ADD COLUMN following_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'total_likes_received') THEN
    ALTER TABLE user_profiles ADD COLUMN total_likes_received integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_editor') THEN
    ALTER TABLE user_profiles ADD COLUMN is_editor boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_mentor') THEN
    ALTER TABLE user_profiles ADD COLUMN is_mentor boolean DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- PART 2: Extend Poems Table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poems' AND column_name = 'status') THEN
    ALTER TABLE poems ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poems' AND column_name = 'audio_url') THEN
    ALTER TABLE poems ADD COLUMN audio_url text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poems' AND column_name = 'mood') THEN
    ALTER TABLE poems ADD COLUMN mood text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poems' AND column_name = 'theme') THEN
    ALTER TABLE poems ADD COLUMN theme text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poems' AND column_name = 'form_type') THEN
    ALTER TABLE poems ADD COLUMN form_type text DEFAULT '';
  END IF;
END $$;

-- Create tables (without RLS policies initially)

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, poem_id)
);

CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reading_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_list_id uuid NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poem_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  version_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  max_members integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshop_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workshop_id, user_id)
);

CREATE TABLE IF NOT EXISTS workshop_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS critiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_submission_id uuid NOT NULL REFERENCES workshop_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  line_number integer DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborative_poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text DEFAULT 'open' CHECK (mode IN ('exquisite_corpse', 'open')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  max_contributors integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poem_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborative_poem_id uuid NOT NULL REFERENCES collaborative_poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution text NOT NULL,
  position integer NOT NULL,
  contributed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaboration_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborative_poem_id uuid NOT NULL REFERENCES collaborative_poems(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  prompt_date date UNIQUE NOT NULL,
  category text DEFAULT 'theme' CHECK (category IN ('theme', 'form', 'word', 'image')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompt_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, poem_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS writing_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('timed', 'word_count', 'form', 'daily')),
  target_value integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id uuid REFERENCES poems(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS writing_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('weekly_poems', 'monthly_poems', 'word_count', 'daily_writing')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  theme text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  voting_end_date timestamptz NOT NULL,
  prize_description text DEFAULT '',
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'voting', 'completed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, poem_id)
);

CREATE TABLE IF NOT EXISTS contest_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  entry_id uuid NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('open_mic', 'featured_reading', 'workshop', 'social')),
  start_time timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_url text DEFAULT '',
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_attendees integer DEFAULT 100,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS anthologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  theme text DEFAULT '',
  season text CHECK (season IN ('spring', 'summer', 'fall', 'winter', '')),
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  cover_image_url text DEFAULT '',
  curator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anthology_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anthology_id uuid NOT NULL REFERENCES anthologies(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(anthology_id, poem_id)
);

CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  requested_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  UNIQUE(mentor_id, mentee_id)
);

CREATE TABLE IF NOT EXISTS zines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_image_url text DEFAULT '',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zine_poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zine_id uuid NOT NULL REFERENCES zines(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  page_number integer DEFAULT 1,
  added_at timestamptz DEFAULT now(),
  UNIQUE(zine_id, poem_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_color text DEFAULT '#3b82f6',
  font_family text DEFAULT 'serif',
  font_size text DEFAULT 'medium',
  background_color text DEFAULT '#ffffff',
  text_color text DEFAULT '#1e293b',
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_poem ON bookmarks(poem_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_items_list ON reading_list_items(reading_list_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_items_poem ON reading_list_items(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_versions_poem ON poem_versions(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_versions_created ON poem_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_creator ON workshops(creator_id);
CREATE INDEX IF NOT EXISTS idx_workshop_members_workshop ON workshop_members(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_members_user ON workshop_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_workshop ON workshop_submissions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_poem ON workshop_submissions(poem_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_user ON workshop_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_critiques_submission ON critiques(workshop_submission_id);
CREATE INDEX IF NOT EXISTS idx_critiques_user ON critiques(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_poems_creator ON collaborative_poems(creator_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_poems_status ON collaborative_poems(status);
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_poem ON poem_collaborators(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_user ON poem_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_poem ON collaboration_invitations(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invitee ON collaboration_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON daily_prompts(prompt_date DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_prompt ON prompt_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_user ON prompt_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_streaks_user ON writing_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge ON challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_goals_user ON writing_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_goals_dates ON writing_goals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_dates ON contests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_user ON contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_contest ON contest_votes(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_entry ON contest_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_host ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_anthologies_curator ON anthologies(curator_id);
CREATE INDEX IF NOT EXISTS idx_anthologies_published ON anthologies(is_published);
CREATE INDEX IF NOT EXISTS idx_anthology_submissions_anthology ON anthology_submissions(anthology_id);
CREATE INDEX IF NOT EXISTS idx_anthology_submissions_poem ON anthology_submissions(poem_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
CREATE INDEX IF NOT EXISTS idx_zines_creator ON zines(creator_id);
CREATE INDEX IF NOT EXISTS idx_zines_public ON zines(is_public);
CREATE INDEX IF NOT EXISTS idx_zine_poems_zine ON zine_poems(zine_id);
CREATE INDEX IF NOT EXISTS idx_zine_poems_poem ON zine_poems(poem_id);

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Poem', 'Write your first poem', 'pen-tool', 'poem_count', 1),
  ('10 Poems', 'Write 10 poems', 'book', 'poem_count', 10),
  ('50 Poems', 'Write 50 poems', 'book-open', 'poem_count', 50),
  ('100 Poems', 'Write 100 poems', 'library', 'poem_count', 100),
  ('Week Streak', 'Write for 7 days in a row', 'flame', 'streak', 7),
  ('Month Streak', 'Write for 30 days in a row', 'zap', 'streak', 30),
  ('Sonnet Master', 'Write your first sonnet', 'award', 'form', 1),
  ('Haiku Master', 'Write 10 haikus', 'award', 'form', 10),
  ('Popular Poet', 'Get 100 total likes', 'heart', 'likes', 100),
  ('Social Butterfly', 'Follow 50 poets', 'users', 'following', 50)
ON CONFLICT (name) DO NOTHING;
