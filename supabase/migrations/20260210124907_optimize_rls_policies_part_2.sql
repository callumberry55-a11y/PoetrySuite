/*
  # Optimize RLS Policies - Part 2: Writing Logs, Forums, Collections

  Wrap auth.uid() calls with (select auth.uid()) to prevent re-evaluation per row.
*/

-- =====================================================
-- Daily Writing Logs
-- =====================================================

DROP POLICY IF EXISTS "Users can view own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can view own writing logs"
  ON daily_writing_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can insert own writing logs"
  ON daily_writing_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own writing logs" ON daily_writing_logs;
CREATE POLICY "Users can update own writing logs"
  ON daily_writing_logs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- User Achievements
-- =====================================================

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Forum Topics
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own topics" ON forum_topics;
CREATE POLICY "Users can update own topics"
  ON forum_topics FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own topics" ON forum_topics;
CREATE POLICY "Users can delete own topics"
  ON forum_topics FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Forum Replies
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own replies" ON forum_replies;
CREATE POLICY "Users can update own replies"
  ON forum_replies FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own replies" ON forum_replies;
CREATE POLICY "Users can delete own replies"
  ON forum_replies FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Forum Likes
-- =====================================================

DROP POLICY IF EXISTS "Users can like topics" ON forum_topic_likes;
CREATE POLICY "Users can like topics"
  ON forum_topic_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unlike topics" ON forum_topic_likes;
CREATE POLICY "Users can unlike topics"
  ON forum_topic_likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can like replies" ON forum_reply_likes;
CREATE POLICY "Users can like replies"
  ON forum_reply_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unlike replies" ON forum_reply_likes;
CREATE POLICY "Users can unlike replies"
  ON forum_reply_likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Poetry Collections
-- =====================================================

DROP POLICY IF EXISTS "Users can view own collections" ON poetry_collections;
CREATE POLICY "Users can view own collections"
  ON poetry_collections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own collections" ON poetry_collections;
CREATE POLICY "Users can create own collections"
  ON poetry_collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own collections" ON poetry_collections;
CREATE POLICY "Users can update own collections"
  ON poetry_collections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own collections" ON poetry_collections;
CREATE POLICY "Users can delete own collections"
  ON poetry_collections FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Collection Poems
-- =====================================================

DROP POLICY IF EXISTS "Users can view poems in accessible collections" ON collection_poems;
CREATE POLICY "Users can view poems in accessible collections"
  ON collection_poems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_poems.collection_id
      AND (poetry_collections.user_id = (select auth.uid()) OR poetry_collections.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can add poems to own collections" ON collection_poems;
CREATE POLICY "Users can add poems to own collections"
  ON collection_poems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_poems.collection_id
      AND poetry_collections.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can remove poems from own collections" ON collection_poems;
CREATE POLICY "Users can remove poems from own collections"
  ON collection_poems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_collections
      WHERE poetry_collections.id = collection_poems.collection_id
      AND poetry_collections.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- Poem Favorites
-- =====================================================

DROP POLICY IF EXISTS "Users can view own favorites" ON poem_favorites;
CREATE POLICY "Users can view own favorites"
  ON poem_favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can add favorites" ON poem_favorites;
CREATE POLICY "Users can add favorites"
  ON poem_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove favorites" ON poem_favorites;
CREATE POLICY "Users can remove favorites"
  ON poem_favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Poem Bookmarks
-- =====================================================

DROP POLICY IF EXISTS "Users can view own bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON poem_bookmarks FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can create bookmarks"
  ON poem_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON poem_bookmarks FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete bookmarks" ON poem_bookmarks;
CREATE POLICY "Users can delete bookmarks"
  ON poem_bookmarks FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));