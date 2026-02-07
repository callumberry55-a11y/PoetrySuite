/*
  # Poetry Collections, Favorites, and Bookmarks

  1. New Tables
    - `poetry_collections` - User-created poem collections/anthologies
    - `collection_poems` - Poems in collections with ordering
    - `poem_favorites` - Quick favorite poems
    - `poem_bookmarks` - Bookmarked poems with optional notes

  2. Security
    - Enable RLS on all tables
    - Users manage their own data
    - Public collections visible to all
*/

-- Poetry Collections Table
CREATE TABLE IF NOT EXISTS poetry_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE poetry_collections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_poetry_collections_user ON poetry_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_poetry_collections_public ON poetry_collections(is_public) WHERE is_public = true;

-- Collection Poems Table
CREATE TABLE IF NOT EXISTS collection_poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES poetry_collections(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  CONSTRAINT collection_poems_unique UNIQUE (collection_id, poem_id)
);

ALTER TABLE collection_poems ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_collection_poems_collection ON collection_poems(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_poems_poem ON collection_poems(poem_id);

-- Poem Favorites Table
CREATE TABLE IF NOT EXISTS poem_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT poem_favorites_unique UNIQUE (user_id, poem_id)
);

ALTER TABLE poem_favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_poem_favorites_user ON poem_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_favorites_poem ON poem_favorites(poem_id);

-- Poem Bookmarks Table
CREATE TABLE IF NOT EXISTS poem_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT poem_bookmarks_unique UNIQUE (user_id, poem_id)
);

ALTER TABLE poem_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_poem_bookmarks_user ON poem_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_bookmarks_poem ON poem_bookmarks(poem_id);

-- RLS Policies for poetry_collections
DROP POLICY IF EXISTS "Users can view own collections" ON poetry_collections;
CREATE POLICY "Users can view own collections"
  ON poetry_collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public collections" ON poetry_collections;
CREATE POLICY "Users can view public collections"
  ON poetry_collections FOR SELECT
  TO authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can create own collections" ON poetry_collections;
CREATE POLICY "Users can create own collections"
  ON poetry_collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own collections" ON poetry_collections;
CREATE POLICY "Users can update own collections"
  ON poetry_collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own collections" ON poetry_collections;
CREATE POLICY "Users can delete own collections"
  ON poetry_collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collection_poems
DROP POLICY IF EXISTS "Users can view poems in accessible collections" ON collection_poems;
CREATE POLICY "Users can view poems in accessible collections"
  ON collection_poems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_poems.collection_id
      AND (poetry_collections.user_id = auth.uid() OR poetry_collections.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can add poems to own collections" ON collection_poems;
CREATE POLICY "Users can add poems to own collections"
  ON collection_poems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_id
      AND poetry_collections.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove poems from own collections" ON collection_poems;
CREATE POLICY "Users can remove poems from own collections"
  ON collection_poems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_id
      AND poetry_collections.user_id = auth.uid()
    )
  );

-- RLS Policies for poem_favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON poem_favorites;
CREATE POLICY "Users can view own favorites"
  ON poem_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON poem_favorites;
CREATE POLICY "Users can add favorites"
  ON poem_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON poem_favorites;
CREATE POLICY "Users can remove favorites"
  ON poem_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for poem_bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON poem_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can create bookmarks"
  ON poem_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON poem_bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can delete bookmarks"
  ON poem_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'poem_favorites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE poem_favorites;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'collection_poems'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE collection_poems;
  END IF;
END $$;