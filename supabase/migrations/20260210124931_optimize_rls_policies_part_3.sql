/*
  # Optimize RLS Policies - Part 3: Critiques, Follows, Sessions, Reading Lists

  Wrap auth.uid() calls with (select auth.uid()) to prevent re-evaluation per row.
*/

-- =====================================================
-- Poem Critiques
-- =====================================================

DROP POLICY IF EXISTS "Users can view own critiques" ON poem_critiques;
CREATE POLICY "Users can view own critiques"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (critic_id = (select auth.uid()));

DROP POLICY IF EXISTS "Poem authors can view critiques on their poems" ON poem_critiques;
CREATE POLICY "Poem authors can view critiques on their poems"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_critiques.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create critiques" ON poem_critiques;
CREATE POLICY "Users can create critiques"
  ON poem_critiques FOR INSERT
  TO authenticated
  WITH CHECK (critic_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own critiques" ON poem_critiques;
CREATE POLICY "Users can update own critiques"
  ON poem_critiques FOR UPDATE
  TO authenticated
  USING (critic_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own critiques" ON poem_critiques;
CREATE POLICY "Users can delete own critiques"
  ON poem_critiques FOR DELETE
  TO authenticated
  USING (critic_id = (select auth.uid()));

-- =====================================================
-- User Follows
-- =====================================================

DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON user_follows;
CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (follower_id = (select auth.uid()));

-- =====================================================
-- Writing Sessions
-- =====================================================

DROP POLICY IF EXISTS "Users can view own sessions" ON writing_sessions;
CREATE POLICY "Users can view own sessions"
  ON writing_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own sessions" ON writing_sessions;
CREATE POLICY "Users can create own sessions"
  ON writing_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own sessions" ON writing_sessions;
CREATE POLICY "Users can update own sessions"
  ON writing_sessions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Reading List Poems
-- =====================================================

DROP POLICY IF EXISTS "Users can view poems in accessible reading lists" ON reading_list_poems;
CREATE POLICY "Users can view poems in accessible reading lists"
  ON reading_list_poems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND (reading_lists.user_id = (select auth.uid()) OR reading_lists.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can add poems to own reading lists" ON reading_list_poems;
CREATE POLICY "Users can add poems to own reading lists"
  ON reading_list_poems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND reading_lists.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update poems in own reading lists" ON reading_list_poems;
CREATE POLICY "Users can update poems in own reading lists"
  ON reading_list_poems FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND reading_lists.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can remove poems from own reading lists" ON reading_list_poems;
CREATE POLICY "Users can remove poems from own reading lists"
  ON reading_list_poems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_poems.reading_list_id
      AND reading_lists.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- Poem Shares
-- =====================================================

DROP POLICY IF EXISTS "Users can view own poem shares" ON poem_shares;
CREATE POLICY "Users can view own poem shares"
  ON poem_shares FOR SELECT
  TO authenticated
  USING (shared_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view shares from followed users" ON poem_shares;
CREATE POLICY "Users can view shares from followed users"
  ON poem_shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_follows
      WHERE user_follows.following_id = poem_shares.shared_by
      AND user_follows.follower_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create poem shares" ON poem_shares;
CREATE POLICY "Users can create poem shares"
  ON poem_shares FOR INSERT
  TO authenticated
  WITH CHECK (shared_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own poem shares" ON poem_shares;
CREATE POLICY "Users can delete own poem shares"
  ON poem_shares FOR DELETE
  TO authenticated
  USING (shared_by = (select auth.uid()));

-- =====================================================
-- User Prompt Completions
-- =====================================================

DROP POLICY IF EXISTS "Users can view own prompt completions" ON user_prompt_completions;
CREATE POLICY "Users can view own prompt completions"
  ON user_prompt_completions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own prompt completions" ON user_prompt_completions;
CREATE POLICY "Users can create own prompt completions"
  ON user_prompt_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own prompt completions" ON user_prompt_completions;
CREATE POLICY "Users can delete own prompt completions"
  ON user_prompt_completions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));