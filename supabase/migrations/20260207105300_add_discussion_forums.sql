/*
  # Discussion Forums System

  1. New Tables
    - `forum_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text, optional - emoji or icon name)
      - `order_index` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `forum_topics`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references forum_categories)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `is_pinned` (boolean, default false)
      - `is_locked` (boolean, default false)
      - `view_count` (integer, default 0)
      - `reply_count` (integer, default 0)
      - `last_activity_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `forum_replies`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, references forum_topics)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `is_solution` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `forum_topic_likes`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, references forum_topics)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - Unique constraint on (topic_id, user_id)
    
    - `forum_reply_likes`
      - `id` (uuid, primary key)
      - `reply_id` (uuid, references forum_replies)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - Unique constraint on (reply_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Public read access, authenticated write access
*/

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_categories_order ON forum_categories(order_index);

-- Forum Topics Table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_activity ON forum_topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned ON forum_topics(is_pinned) WHERE is_pinned = true;

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user ON forum_replies(user_id);

-- Forum Topic Likes Table
CREATE TABLE IF NOT EXISTS forum_topic_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT forum_topic_likes_unique UNIQUE (topic_id, user_id)
);

ALTER TABLE forum_topic_likes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_topic_likes_topic ON forum_topic_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_topic_likes_user ON forum_topic_likes(user_id);

-- Forum Reply Likes Table
CREATE TABLE IF NOT EXISTS forum_reply_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT forum_reply_likes_unique UNIQUE (reply_id, user_id)
);

ALTER TABLE forum_reply_likes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply ON forum_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user ON forum_reply_likes(user_id);

-- RLS Policies for forum_categories
DROP POLICY IF EXISTS "Anyone can view forum categories" ON forum_categories;
CREATE POLICY "Anyone can view forum categories"
  ON forum_categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for forum_topics
DROP POLICY IF EXISTS "Anyone can view forum topics" ON forum_topics;
CREATE POLICY "Anyone can view forum topics"
  ON forum_topics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own topics" ON forum_topics;
CREATE POLICY "Users can update own topics"
  ON forum_topics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own topics" ON forum_topics;
CREATE POLICY "Users can delete own topics"
  ON forum_topics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for forum_replies
DROP POLICY IF EXISTS "Anyone can view forum replies" ON forum_replies;
CREATE POLICY "Anyone can view forum replies"
  ON forum_replies FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own replies" ON forum_replies;
CREATE POLICY "Users can update own replies"
  ON forum_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own replies" ON forum_replies;
CREATE POLICY "Users can delete own replies"
  ON forum_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for forum_topic_likes
DROP POLICY IF EXISTS "Anyone can view topic likes" ON forum_topic_likes;
CREATE POLICY "Anyone can view topic likes"
  ON forum_topic_likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can like topics" ON forum_topic_likes;
CREATE POLICY "Users can like topics"
  ON forum_topic_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike topics" ON forum_topic_likes;
CREATE POLICY "Users can unlike topics"
  ON forum_topic_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for forum_reply_likes
DROP POLICY IF EXISTS "Anyone can view reply likes" ON forum_reply_likes;
CREATE POLICY "Anyone can view reply likes"
  ON forum_reply_likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can like replies" ON forum_reply_likes;
CREATE POLICY "Users can like replies"
  ON forum_reply_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike replies" ON forum_reply_likes;
CREATE POLICY "Users can unlike replies"
  ON forum_reply_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update reply count and last activity
CREATE OR REPLACE FUNCTION update_topic_reply_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE forum_topics
  SET 
    reply_count = (SELECT COUNT(*) FROM forum_replies WHERE topic_id = NEW.topic_id),
    last_activity_at = now()
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_topic_stats_on_reply ON forum_replies;
CREATE TRIGGER update_topic_stats_on_reply
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_reply_stats();

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'forum_topics'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE forum_topics;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'forum_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
  END IF;
END $$;

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, order_index) VALUES
  ('General Discussion', 'Talk about anything poetry related', '💬', 0),
  ('Writing Help', 'Get feedback and help with your poetry', '✍️', 1),
  ('Forms & Techniques', 'Discuss poetry forms, meters, and techniques', '📝', 2),
  ('Show & Tell', 'Share your favorite poems and discoveries', '🎭', 3),
  ('Challenges & Prompts', 'Discuss writing challenges and prompts', '⚡', 4)
ON CONFLICT DO NOTHING;