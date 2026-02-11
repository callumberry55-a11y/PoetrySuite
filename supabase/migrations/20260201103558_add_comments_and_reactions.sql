/*
  # Add Comments and Reactions System

  This migration adds full support for poem likes/reactions and comments.

  ## 1. New Tables
  
  ### `reactions` table
  - `id` (uuid, primary key) - Unique reaction identifier
  - `poem_id` (uuid, foreign key) - References the poem being liked
  - `user_id` (uuid, foreign key) - References the user who liked
  - `created_at` (timestamptz) - When the like was created
  - Unique constraint on (poem_id, user_id) - One like per user per poem
  
  ### `comments` table
  - `id` (uuid, primary key) - Unique comment identifier
  - `poem_id` (uuid, foreign key) - References the poem being commented on
  - `user_id` (uuid, foreign key) - References the comment author
  - `content` (text) - The comment text
  - `created_at` (timestamptz) - When the comment was created
  - `updated_at` (timestamptz) - When the comment was last edited

  ## 2. Indexes
  
  Performance indexes for common queries:
  - Index on poem_id for both tables (for fetching reactions/comments by poem)
  - Index on user_id for both tables (for fetching user's own reactions/comments)
  - Index on created_at for comments (for sorting by date)

  ## 3. Security (RLS)
  
  ### Reactions Table:
  - Users can view all reactions
  - Users can create reactions for their own user_id only
  - Users can delete only their own reactions
  
  ### Comments Table:
  - Users can view all comments on poems they have access to
  - Users can create comments with their own user_id
  - Users can update only their own comments
  - Users can delete only their own comments

  ## 4. Helper Functions
  
  - `get_poem_like_count(poem_id)` - Returns the number of likes for a poem
  - `get_poem_comment_count(poem_id)` - Returns the number of comments for a poem
  - `user_has_liked_poem(poem_id, user_id)` - Checks if a user has liked a poem
*/

-- =====================================================
-- PART 1: Create Reactions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poem_id, user_id)
);

-- Add indexes for reactions
CREATE INDEX IF NOT EXISTS idx_reactions_poem_id ON reactions(poem_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- Enable RLS on reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 2: Create Comments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_poem_id ON comments(poem_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 3: Helper Functions
-- =====================================================

-- Function to get like count for a poem
CREATE OR REPLACE FUNCTION get_poem_like_count(p_poem_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM reactions WHERE poem_id = p_poem_id;
$$;

-- Function to get comment count for a poem
CREATE OR REPLACE FUNCTION get_poem_comment_count(p_poem_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM comments WHERE poem_id = p_poem_id;
$$;

-- Function to check if user has liked a poem
CREATE OR REPLACE FUNCTION user_has_liked_poem(p_poem_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM reactions WHERE poem_id = p_poem_id AND user_id = p_user_id);
$$;

-- Trigger to update comments updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_comment_updated_at ON comments;
CREATE TRIGGER set_comment_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();
