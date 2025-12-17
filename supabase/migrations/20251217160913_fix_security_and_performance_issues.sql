/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Indexes added for foreign key columns to improve join performance:
  - `idx_poem_collections_collection_id` on `poem_collections.collection_id`
  - `idx_poem_likes_user_id` on `poem_likes.user_id`
  - `idx_poem_tags_tag_id` on `poem_tags.tag_id`

  ### 2. Remove Unused Indexes
  The following indexes were not being used and have been removed:
  - `idx_poems_created_at` - Not used in current queries
  - `idx_poems_favorited` - Not used in current queries
  - `idx_tags_user_id` - Redundant with existing indexes

  ### 3. Optimize RLS Policies
  All RLS policies now use `(select auth.uid())` instead of `auth.uid()` to prevent
  re-evaluation for each row, significantly improving query performance at scale.

  ### 4. Fix Multiple Permissive Policies
  Consolidated the poems SELECT policies to avoid multiple permissive policies:
  - Combined "Users can view own poems" and "Anyone can view public poems" into a single policy

  ### 5. Fix Function Search Path
  Updated functions to use explicit schema references and set secure search_path:
  - `increment_like_count` - Now uses explicit schema and secure search_path
  - `decrement_like_count` - Now uses explicit schema and secure search_path

  ## Important Notes
  - All changes maintain backward compatibility
  - No data is modified or deleted
  - Performance improvements will be immediate for tables with many rows
*/

-- ============================================================================
-- 1. Add Missing Foreign Key Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id 
  ON poem_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_poem_likes_user_id 
  ON poem_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id 
  ON poem_tags(tag_id);

-- ============================================================================
-- 2. Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_poems_created_at;
DROP INDEX IF EXISTS idx_poems_favorited;
DROP INDEX IF EXISTS idx_tags_user_id;

-- ============================================================================
-- 3. Optimize RLS Policies - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own poems" ON poems;
DROP POLICY IF EXISTS "Users can insert own poems" ON poems;
DROP POLICY IF EXISTS "Users can update own poems" ON poems;
DROP POLICY IF EXISTS "Users can delete own poems" ON poems;
DROP POLICY IF EXISTS "Anyone can view public poems" ON poems;

DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;

DROP POLICY IF EXISTS "Users can view own poem collections" ON poem_collections;
DROP POLICY IF EXISTS "Users can insert own poem collections" ON poem_collections;
DROP POLICY IF EXISTS "Users can delete own poem collections" ON poem_collections;

DROP POLICY IF EXISTS "Users can view own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;

DROP POLICY IF EXISTS "Users can view own poem tags" ON poem_tags;
DROP POLICY IF EXISTS "Users can insert own poem tags" ON poem_tags;
DROP POLICY IF EXISTS "Users can delete own poem tags" ON poem_tags;

DROP POLICY IF EXISTS "Users can view own writing stats" ON writing_stats;
DROP POLICY IF EXISTS "Users can insert own writing stats" ON writing_stats;
DROP POLICY IF EXISTS "Users can update own writing stats" ON writing_stats;
DROP POLICY IF EXISTS "Users can delete own writing stats" ON writing_stats;

DROP POLICY IF EXISTS "Users can like public poems" ON poem_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON poem_likes;
DROP POLICY IF EXISTS "Users can view likes on public poems" ON poem_likes;

-- Recreate policies with optimized auth.uid() calls
-- POEMS: Combined view policy to avoid multiple permissive policies
CREATE POLICY "Users can view poems"
  ON poems FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR is_public = true);

CREATE POLICY "Users can insert own poems"
  ON poems FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own poems"
  ON poems FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own poems"
  ON poems FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- COLLECTIONS
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- POEM_COLLECTIONS
CREATE POLICY "Users can view own poem collections"
  ON poem_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own poem collections"
  ON poem_collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own poem collections"
  ON poem_collections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_collections.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

-- TAGS
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- POEM_TAGS
CREATE POLICY "Users can view own poem tags"
  ON poem_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own poem tags"
  ON poem_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own poem tags"
  ON poem_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_tags.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

-- WRITING_STATS
CREATE POLICY "Users can view own writing stats"
  ON writing_stats FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own writing stats"
  ON writing_stats FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own writing stats"
  ON writing_stats FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own writing stats"
  ON writing_stats FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- POEM_LIKES
CREATE POLICY "Users can like public poems"
  ON poem_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_likes.poem_id
      AND poems.is_public = true
    )
    AND (select auth.uid()) = user_id
  );

CREATE POLICY "Users can view likes on public poems"
  ON poem_likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_likes.poem_id
      AND (poems.is_public = true OR poems.user_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can unlike their own likes"
  ON poem_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. Fix Function Search Path Issues
-- ============================================================================

-- Drop triggers first before dropping functions
DROP TRIGGER IF EXISTS increment_poem_likes ON poem_likes;
DROP TRIGGER IF EXISTS decrement_poem_likes ON poem_likes;
DROP TRIGGER IF EXISTS on_like_added ON poem_likes;
DROP TRIGGER IF EXISTS on_like_removed ON poem_likes;

-- Drop and recreate increment_like_count with secure search_path
DROP FUNCTION IF EXISTS increment_like_count() CASCADE;
CREATE OR REPLACE FUNCTION public.increment_like_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.poems
  SET like_count = COALESCE(like_count, 0) + 1
  WHERE id = NEW.poem_id;
  RETURN NEW;
END;
$$;

-- Drop and recreate decrement_like_count with secure search_path
DROP FUNCTION IF EXISTS decrement_like_count() CASCADE;
CREATE OR REPLACE FUNCTION public.decrement_like_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.poems
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
  WHERE id = OLD.poem_id;
  RETURN OLD;
END;
$$;

-- Recreate triggers
CREATE TRIGGER increment_poem_likes
  AFTER INSERT ON poem_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_like_count();

CREATE TRIGGER decrement_poem_likes
  AFTER DELETE ON poem_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_like_count();
