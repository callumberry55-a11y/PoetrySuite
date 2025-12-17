/*
  # Poetry Suite Database Schema

  ## Overview
  This migration creates the complete database schema for Poetry Suite, a personal sanctuary 
  for writing, curating, and sharing poetry.

  ## New Tables
  
  ### 1. `poems`
  Stores all poems created by users
  - `id` (uuid, primary key) - Unique poem identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `title` (text) - Poem title
  - `content` (text) - The poem content/body
  - `is_public` (boolean) - Visibility setting (default: false)
  - `word_count` (integer) - Cached word count
  - `created_at` (timestamptz) - When poem was created
  - `updated_at` (timestamptz) - Last modification time
  - `favorited` (boolean) - User favorite flag
  
  ### 2. `collections`
  Organizational folders for grouping poems
  - `id` (uuid, primary key) - Unique collection identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Collection name
  - `description` (text) - Optional description
  - `color` (text) - UI color theme for collection
  - `created_at` (timestamptz) - When collection was created
  
  ### 3. `poem_collections`
  Junction table for many-to-many relationship between poems and collections
  - `poem_id` (uuid, foreign key) - References poems
  - `collection_id` (uuid, foreign key) - References collections
  - `added_at` (timestamptz) - When poem was added to collection
  
  ### 4. `tags`
  User-defined tags for categorizing poems
  - `id` (uuid, primary key) - Unique tag identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Tag name
  - `created_at` (timestamptz) - When tag was created
  
  ### 5. `poem_tags`
  Junction table for many-to-many relationship between poems and tags
  - `poem_id` (uuid, foreign key) - References poems
  - `tag_id` (uuid, foreign key) - References tags
  - `added_at` (timestamptz) - When tag was added to poem
  
  ### 6. `writing_stats`
  Daily writing statistics for analytics and streak tracking
  - `id` (uuid, primary key) - Unique stat identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `date` (date) - The date for this stat record
  - `poems_written` (integer) - Number of poems created that day
  - `words_written` (integer) - Total words written that day
  - `minutes_writing` (integer) - Estimated time spent writing

  ## Security
  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow users to view only their own data
  - Allow users to create their own data
  - Allow users to update only their own data
  - Allow users to delete only their own data
  - Public poems can be viewed by anyone through specific queries
*/

-- Create poems table
CREATE TABLE IF NOT EXISTS poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  content text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT false,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  favorited boolean NOT NULL DEFAULT false
);

ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own poems"
  ON poems FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own poems"
  ON poems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own poems"
  ON poems FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own poems"
  ON poems FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create poem_collections junction table
CREATE TABLE IF NOT EXISTS poem_collections (
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poem_id, collection_id)
);

ALTER TABLE poem_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own poem collections"
  ON poem_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own poem collections"
  ON poem_collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own poem collections"
  ON poem_collections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

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

-- Create poem_tags junction table
CREATE TABLE IF NOT EXISTS poem_tags (
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poem_id, tag_id)
);

ALTER TABLE poem_tags ENABLE ROW LEVEL SECURITY;

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

-- Create writing_stats table
CREATE TABLE IF NOT EXISTS writing_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  poems_written integer NOT NULL DEFAULT 0,
  words_written integer NOT NULL DEFAULT 0,
  minutes_writing integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE writing_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own writing stats"
  ON writing_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writing stats"
  ON writing_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writing stats"
  ON writing_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own writing stats"
  ON writing_stats FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poems_user_id ON poems(user_id);
CREATE INDEX IF NOT EXISTS idx_poems_created_at ON poems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poems_favorited ON poems(user_id, favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_stats_user_date ON writing_stats(user_id, date DESC);