/*
  # Fix Security and Performance Issues

  This migration addresses multiple security and performance issues identified in the database audit:

  ## 1. Add Missing Foreign Key Indexes
  
  Creates indexes for foreign keys that lack covering indexes:
  - `community_submissions.reviewed_by`
  - `poem_collections.collection_id`
  - `poem_tags.tag_id`

  ## 2. Optimize RLS Policies for Performance
  
  Updates all RLS policies to use `(select auth.uid())` instead of `auth.uid()`.
  This prevents the function from being re-evaluated for each row, significantly improving query performance at scale.
  
  Affected tables:
  - poems (4 policies)
  - collections (4 policies)
  - poem_collections (3 policies)
  - tags (4 policies)
  - poem_tags (4 policies)
  - writing_stats (4 policies)
  - community_submissions (6 policies)
  - feedback (2 policies)
  - user_profiles (3 policies)

  ## 3. Fix Function Search Paths
  
  Secures functions by setting search_path to prevent SQL injection:
  - update_feedback_updated_at
  - promote_to_developer
  - handle_new_user

  ## 4. Consolidate Multiple Permissive Policies
  
  Optimizes community_submissions SELECT policies to avoid redundancy.
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_community_submissions_reviewed_by 
ON community_submissions(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id 
ON poem_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id 
ON poem_tags(tag_id);

-- =====================================================
-- PART 2: Optimize RLS Policies - POEMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own poems" ON poems;
CREATE POLICY "Users can view own poems"
  ON poems FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own poems" ON poems;
CREATE POLICY "Users can insert own poems"
  ON poems FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own poems" ON poems;
CREATE POLICY "Users can update own poems"
  ON poems FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own poems" ON poems;
CREATE POLICY "Users can delete own poems"
  ON poems FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 3: Optimize RLS Policies - COLLECTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own collections" ON collections;
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own collections" ON collections;
CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 4: Optimize RLS Policies - POEM_COLLECTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own poem collections" ON poem_collections;
CREATE POLICY "Users can view own poem collections"
  ON poem_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = poem_collections.collection_id
      AND collections.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own poem collections" ON poem_collections;
CREATE POLICY "Users can insert own poem collections"
  ON poem_collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = poem_collections.collection_id
      AND collections.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own poem collections" ON poem_collections;
CREATE POLICY "Users can delete own poem collections"
  ON poem_collections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = poem_collections.collection_id
      AND collections.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- PART 5: Optimize RLS Policies - TAGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own tags" ON tags;
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tags" ON tags;
CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own tags" ON tags;
CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 6: Optimize RLS Policies - POEM_TAGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own poem tags" ON poem_tags;
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

DROP POLICY IF EXISTS "Users can insert own poem tags" ON poem_tags;
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

DROP POLICY IF EXISTS "Users can delete own poem tags" ON poem_tags;
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

-- =====================================================
-- PART 7: Optimize RLS Policies - WRITING_STATS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own writing stats" ON writing_stats;
CREATE POLICY "Users can view own writing stats"
  ON writing_stats FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own writing stats" ON writing_stats;
CREATE POLICY "Users can insert own writing stats"
  ON writing_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own writing stats" ON writing_stats;
CREATE POLICY "Users can update own writing stats"
  ON writing_stats FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own writing stats" ON writing_stats;
CREATE POLICY "Users can delete own writing stats"
  ON writing_stats FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 8: Optimize RLS Policies - COMMUNITY_SUBMISSIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can create community submissions for own poems" ON community_submissions;
CREATE POLICY "Users can create community submissions for own poems"
  ON community_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = community_submissions.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own community submissions" ON community_submissions;
DROP POLICY IF EXISTS "Admin can view all community submissions" ON community_submissions;
DROP POLICY IF EXISTS "Anyone can view approved community submissions" ON community_submissions;

CREATE POLICY "View community submissions"
  ON community_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = community_submissions.poem_id
      AND poems.user_id = (select auth.uid())
    )
    OR status = 'approved'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

DROP POLICY IF EXISTS "Admin can update community submissions" ON community_submissions;
CREATE POLICY "Admin can update community submissions"
  ON community_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

DROP POLICY IF EXISTS "Admin can delete community submissions" ON community_submissions;
CREATE POLICY "Admin can delete community submissions"
  ON community_submissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

-- =====================================================
-- PART 9: Optimize RLS Policies - FEEDBACK TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can create feedback" ON feedback;
CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 10: Optimize RLS Policies - USER_PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow individual read access" ON user_profiles;
CREATE POLICY "Allow individual read access"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow individual write access" ON user_profiles;
CREATE POLICY "Allow individual write access"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow developers to update profiles" ON user_profiles;
CREATE POLICY "Allow developers to update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid())
      AND up.is_developer = true
    )
  );

-- =====================================================
-- PART 11: Fix Function Search Paths
-- =====================================================

CREATE OR REPLACE FUNCTION update_feedback_updated_at()
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

CREATE OR REPLACE FUNCTION promote_to_developer(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET is_developer = true
  WHERE user_id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
