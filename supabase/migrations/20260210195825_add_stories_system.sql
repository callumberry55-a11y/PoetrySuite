/*
  # Add Stories System

  1. New Tables
    - `stories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content_url` (text) - URL to image/video
      - `content_type` (text) - 'image' or 'video'
      - `caption` (text, optional)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - 24 hours from creation
      - `view_count` (integer, default 0)
    
    - `story_views`
      - `id` (uuid, primary key)
      - `story_id` (uuid, foreign key to stories)
      - `viewer_id` (uuid, foreign key to auth.users)
      - `viewed_at` (timestamptz)
      - Unique constraint on (story_id, viewer_id)

  2. Security
    - Enable RLS on both tables
    - Stories are viewable by authenticated users
    - Users can create their own stories
    - Users can delete their own stories
    - Users can view who viewed their stories
    - Users can record views of other users' stories

  3. Performance
    - Index on user_id for fast story retrieval
    - Index on expires_at for cleanup queries
    - Index on story_id and viewer_id for view tracking
*/

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_url text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('image', 'video')),
  caption text,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours') NOT NULL,
  view_count integer DEFAULT 0 NOT NULL
);

-- Create story_views table
CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(story_id, viewer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Authenticated users can view non-expired stories"
  ON stories FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can create own stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Users can view their own story views"
  ON story_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_views.story_id
      AND stories.user_id = auth.uid()
    )
    OR viewer_id = auth.uid()
  );

CREATE POLICY "Users can record story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_story_view_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE stories
  SET view_count = view_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_story_view_count ON story_views;
CREATE TRIGGER trigger_increment_story_view_count
  AFTER INSERT ON story_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_view_count();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE story_views;