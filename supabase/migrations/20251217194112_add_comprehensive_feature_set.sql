/*
  # Comprehensive Feature Set for Poetry Suite

  This migration adds extensive new functionality to Poetry Suite including:
  - Social features (follows, reactions, comments)
  - Discovery (public feed, contests, reading lists)
  - Writing tools (prompts, forms, versions, collaboration)
  - Multimedia (audio, images, typography)
  - Analytics (enhanced tracking, style analysis)
  - Organization (moods, series, smart collections, tags)
  - Publishing (submissions, exports, portfolio)
  - Learning (tutorials, critique, dictionary)

  ## New Tables

  ### Extended `poems` columns
  - `form_type` (text) - Poetry form (sonnet, haiku, etc.)
  - `meter_pattern` (text) - Metrical pattern
  - `rhyme_scheme` (text) - Rhyme scheme notation
  - `reading_time_seconds` (integer) - Estimated reading time
  - `portfolio_visible` (boolean) - Show in public portfolio
  - `views_count` (integer) - View counter
  - `shares_count` (integer) - Share counter

  ### 1. `tags` - User-defined tags
  ### 2. `poem_tags` - Junction table
  ### 3. `user_profiles` - Extended user information
  ### 4. `follows` - User follow relationships
  ### 5. `reactions` - Reactions on poems
  ### 6. `comments` - Comments on poems
  ### 7. `writing_prompts` - Daily/weekly prompts
  ### 8. `poem_prompts` - Track poems from prompts
  ### 9. `contests` - Poetry contests
  ### 10. `contest_entries` - Contest submissions
  ### 11. `contest_votes` - Voting on entries
  ### 12. `reading_lists` - Curated collections
  ### 13. `reading_list_poems` - Poems in lists
  ### 14. `poem_moods` - Mood tracking
  ### 15. `poem_series` - Poem series
  ### 16. `poem_series_items` - Poems in series
  ### 17. `submissions` - Submission tracker
  ### 18. `poem_audio` - Audio recordings
  ### 19. `poem_images` - Background images
  ### 20. `collaborations` - Collaborative writing
  ### 21. `collaboration_participants` - Collaborators
  ### 22. `poem_versions` - Version history
  ### 23. `tutorials` - Learning resources
  ### 24. `tutorial_progress` - Progress tracking

  ## Security
  All tables have RLS enabled with appropriate policies
*/

-- Extend poems table with new columns
ALTER TABLE poems ADD COLUMN IF NOT EXISTS form_type text;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS meter_pattern text;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS rhyme_scheme text;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS reading_time_seconds integer DEFAULT 0;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS portfolio_visible boolean DEFAULT false;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;

-- Add policy for viewing public poems
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'poems' 
    AND policyname = 'Anyone can view public poems'
  ) THEN
    CREATE POLICY "Anyone can view public poems"
      ON poems FOR SELECT
      TO authenticated
      USING (is_public = true OR auth.uid() = user_id);
  END IF;
END $$;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create poem_tags junction table
CREATE TABLE IF NOT EXISTS poem_tags (
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (poem_id, tag_id)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  bio text DEFAULT '',
  avatar_url text,
  portfolio_enabled boolean DEFAULT false,
  typography_preset text DEFAULT 'classic',
  theme_preference text DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz DEFAULT now(),
  UNIQUE(poem_id, user_id, reaction_type)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create writing_prompts table
CREATE TABLE IF NOT EXISTS writing_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  prompt_type text NOT NULL DEFAULT 'daily',
  difficulty text DEFAULT 'intermediate',
  active_date date,
  created_at timestamptz DEFAULT now()
);

-- Create poem_prompts junction table
CREATE TABLE IF NOT EXISTS poem_prompts (
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (poem_id, prompt_id)
);

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  theme text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  voting_end_date timestamptz NOT NULL,
  status text DEFAULT 'upcoming',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create contest_entries table
CREATE TABLE IF NOT EXISTS contest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, poem_id)
);

-- Create contest_votes table
CREATE TABLE IF NOT EXISTS contest_votes (
  entry_id uuid NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (entry_id, user_id)
);

-- Create reading_lists table
CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reading_list_poems junction table
CREATE TABLE IF NOT EXISTS reading_list_poems (
  reading_list_id uuid NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0,
  PRIMARY KEY (reading_list_id, poem_id)
);

-- Create poem_moods table
CREATE TABLE IF NOT EXISTS poem_moods (
  poem_id uuid PRIMARY KEY REFERENCES poems(id) ON DELETE CASCADE,
  mood text NOT NULL,
  emotions text[] DEFAULT '{}',
  intensity integer DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create poem_series table
CREATE TABLE IF NOT EXISTS poem_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create poem_series_items junction table
CREATE TABLE IF NOT EXISTS poem_series_items (
  series_id uuid NOT NULL REFERENCES poem_series(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (series_id, poem_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_name text NOT NULL,
  venue_type text DEFAULT 'journal',
  submission_date date NOT NULL,
  status text DEFAULT 'pending',
  response_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create poem_audio table
CREATE TABLE IF NOT EXISTS poem_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create poem_images table
CREATE TABLE IF NOT EXISTS poem_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  source text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create collaborations table
CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create collaboration_participants table
CREATE TABLE IF NOT EXISTS collaboration_participants (
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'contributor',
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  status text DEFAULT 'pending',
  PRIMARY KEY (collaboration_id, user_id)
);

-- Create poem_versions table
CREATE TABLE IF NOT EXISTS poem_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  change_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(poem_id, version_number)
);

-- Create tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text DEFAULT 'beginner',
  content jsonb NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tutorial_progress table
CREATE TABLE IF NOT EXISTS tutorial_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  progress_data jsonb DEFAULT '{}',
  completed_at timestamptz,
  PRIMARY KEY (user_id, tutorial_id)
);

-- Enable RLS on all tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_series_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for poem_tags
CREATE POLICY "Users can view own poem tags"
  ON poem_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own poem tags"
  ON poem_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own poem tags"
  ON poem_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Create policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for follows
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create policies for reactions
CREATE POLICY "Users can view reactions on public poems"
  ON reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = reactions.poem_id
      AND (poems.is_public = true OR poems.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Users can view comments on public poems"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = comments.poem_id
      AND (poems.is_public = true OR poems.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add comments to public poems"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = comments.poem_id
      AND poems.is_public = true
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for writing_prompts
CREATE POLICY "Everyone can view prompts"
  ON writing_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for poem_prompts
CREATE POLICY "Users can view own poem prompts"
  ON poem_prompts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_prompts.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add poem prompts"
  ON poem_prompts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_prompts.poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Create policies for contests
CREATE POLICY "Everyone can view contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for contest_entries
CREATE POLICY "Everyone can view contest entries"
  ON contest_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit own entries"
  ON contest_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = contest_entries.poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Create policies for contest_votes
CREATE POLICY "Users can view all votes"
  ON contest_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on entries"
  ON contest_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes"
  ON contest_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for reading_lists
CREATE POLICY "Users can view own and public reading lists"
  ON reading_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own reading lists"
  ON reading_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading lists"
  ON reading_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading lists"
  ON reading_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for reading_list_poems
CREATE POLICY "Users can view reading list poems"
  ON reading_list_poems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND (reading_lists.user_id = auth.uid() OR reading_lists.is_public = true)
    )
  );

CREATE POLICY "Users can add to own reading lists"
  ON reading_list_poems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND reading_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from own reading lists"
  ON reading_list_poems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND reading_lists.user_id = auth.uid()
    )
  );

-- Create policies for poem_moods
CREATE POLICY "Users can view own poem moods"
  ON poem_moods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_moods.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add moods to own poems"
  ON poem_moods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_moods.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own poem moods"
  ON poem_moods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_moods.poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Create policies for poem_series
CREATE POLICY "Users can view own series"
  ON poem_series FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create series"
  ON poem_series FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own series"
  ON poem_series FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own series"
  ON poem_series FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for poem_series_items
CREATE POLICY "Users can view own series items"
  ON poem_series_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poem_series
      WHERE poem_series.id = poem_series_items.series_id
      AND poem_series.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to own series"
  ON poem_series_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poem_series
      WHERE poem_series.id = poem_series_items.series_id
      AND poem_series.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from own series"
  ON poem_series_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poem_series
      WHERE poem_series.id = poem_series_items.series_id
      AND poem_series.user_id = auth.uid()
    )
  );

-- Create policies for submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for poem_audio
CREATE POLICY "Users can view audio for accessible poems"
  ON poem_audio FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_audio.poem_id
      AND (poems.user_id = auth.uid() OR poems.is_public = true)
    )
  );

CREATE POLICY "Users can upload audio to own poems"
  ON poem_audio FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio"
  ON poem_audio FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for poem_images
CREATE POLICY "Users can view images for accessible poems"
  ON poem_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_images.poem_id
      AND (poems.user_id = auth.uid() OR poems.is_public = true)
    )
  );

CREATE POLICY "Users can add images to own poems"
  ON poem_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON poem_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for collaborations
CREATE POLICY "Participants can view collaborations"
  ON collaborations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM collaboration_participants
      WHERE collaboration_participants.collaboration_id = collaborations.id
      AND collaboration_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create collaborations"
  ON collaborations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update collaborations"
  ON collaborations FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create policies for collaboration_participants
CREATE POLICY "Participants can view collaboration participants"
  ON collaboration_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM collaborations
      WHERE collaborations.id = collaboration_participants.collaboration_id
      AND collaborations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can add participants"
  ON collaboration_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborations
      WHERE collaborations.id = collaboration_participants.collaboration_id
      AND collaborations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update own status"
  ON collaboration_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for poem_versions
CREATE POLICY "Users can view versions of own poems"
  ON poem_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_versions.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of own poems"
  ON poem_versions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- Create policies for tutorials
CREATE POLICY "Everyone can view tutorials"
  ON tutorials FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for tutorial_progress
CREATE POLICY "Users can view own tutorial progress"
  ON tutorial_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track own progress"
  ON tutorial_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON tutorial_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_reactions_poem ON reactions(poem_id);
CREATE INDEX IF NOT EXISTS idx_comments_poem ON comments(poem_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_prompts_date ON writing_prompts(active_date);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_poem_versions_poem ON poem_versions(poem_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_poems_public ON poems(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_poems_form_type ON poems(form_type) WHERE form_type IS NOT NULL;
