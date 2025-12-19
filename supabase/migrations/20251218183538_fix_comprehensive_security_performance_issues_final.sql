/*
  # Fix Comprehensive Security and Performance Issues

  ## 1. Add Missing Foreign Key Indexes
  Creates indexes for all foreign keys that lack covering indexes to improve query performance:
    - comments table: parent_id, poem_id
    - community_submissions: user_id
    - follows: following_id
    - private_messages: conversation_id, recipient_id, sender_id
    - public_chat_messages: user_id
    - push_subscriptions: user_id

  ## 2. Fix RLS Policy Performance
  Updates all RLS policies to use `(select auth.uid())` instead of `auth.uid()` 
  to prevent re-evaluation for each row, significantly improving query performance at scale.
  
  Affected tables:
    - beta_feedback (4 policies)
    - collaborative_sessions (3 policies)
    - collab_participants (2 policies)
    - collab_updates (1 policy)
    - custom_themes (4 policies)
    - ai_wallpapers (4 policies)

  ## 3. Remove Unused Indexes
  Drops indexes that have not been used and are consuming unnecessary storage and 
  maintenance overhead. These can be recreated if needed in the future.

  ## 4. Fix Function Search Path
  Updates the update_participant_count function to have an immutable search_path
  for security best practices.

  ## Notes
  - All changes are safe and backwards compatible
  - RLS policy changes maintain identical security behavior with better performance
  - Unused index removal reduces storage overhead and improves write performance
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Comments table
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_poem_id ON comments(poem_id);

-- Community submissions
CREATE INDEX IF NOT EXISTS idx_community_submissions_user_id ON community_submissions(user_id);

-- Follows table
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Private messages
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation_id ON private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient_id ON private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_id ON private_messages(sender_id);

-- Public chat messages
CREATE INDEX IF NOT EXISTS idx_public_chat_messages_user_id ON public_chat_messages(user_id);

-- Push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================================================
-- 2. FIX RLS POLICIES FOR PERFORMANCE
-- ============================================================================

-- Beta Feedback Policies
DROP POLICY IF EXISTS "Beta testers can view own feedback" ON beta_feedback;
CREATE POLICY "Beta testers can view own feedback"
  ON beta_feedback
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Beta testers can create feedback" ON beta_feedback;
CREATE POLICY "Beta testers can create feedback"
  ON beta_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Beta testers can update own feedback" ON beta_feedback;
CREATE POLICY "Beta testers can update own feedback"
  ON beta_feedback
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Beta testers can delete own feedback" ON beta_feedback;
CREATE POLICY "Beta testers can delete own feedback"
  ON beta_feedback
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Collaborative Sessions Policies
DROP POLICY IF EXISTS "Anyone can view active sessions" ON collaborative_sessions;
CREATE POLICY "Anyone can view active sessions"
  ON collaborative_sessions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create sessions" ON collaborative_sessions;
CREATE POLICY "Authenticated users can create sessions"
  ON collaborative_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Creator can delete session" ON collaborative_sessions;
CREATE POLICY "Creator can delete session"
  ON collaborative_sessions
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Participants can update session content" ON collaborative_sessions;
CREATE POLICY "Participants can update session content"
  ON collaborative_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE session_id = collaborative_sessions.id
      AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE session_id = collaborative_sessions.id
      AND user_id = (select auth.uid())
    )
  );

-- Collab Participants Policies
DROP POLICY IF EXISTS "Participants can view session members" ON collab_participants;
CREATE POLICY "Participants can view session members"
  ON collab_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM collaborative_sessions
      WHERE id = collab_participants.session_id
      AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can join sessions" ON collab_participants;
CREATE POLICY "Authenticated users can join sessions"
  ON collab_participants
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can leave sessions" ON collab_participants;
CREATE POLICY "Users can leave sessions"
  ON collab_participants
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Collab Updates Policies
DROP POLICY IF EXISTS "Participants can view updates" ON collab_updates;
CREATE POLICY "Participants can view updates"
  ON collab_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE session_id = collab_updates.session_id
      AND user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can create updates" ON collab_updates;
CREATE POLICY "Participants can create updates"
  ON collab_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id AND
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE session_id = collab_updates.session_id
      AND user_id = (select auth.uid())
    )
  );

-- Custom Themes Policies
DROP POLICY IF EXISTS "Users can read own custom themes" ON custom_themes;
CREATE POLICY "Users can read own custom themes"
  ON custom_themes
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own custom themes" ON custom_themes;
CREATE POLICY "Users can create own custom themes"
  ON custom_themes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own custom themes" ON custom_themes;
CREATE POLICY "Users can update own custom themes"
  ON custom_themes
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own custom themes" ON custom_themes;
CREATE POLICY "Users can delete own custom themes"
  ON custom_themes
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- AI Wallpapers Policies
DROP POLICY IF EXISTS "Users can read own AI wallpapers" ON ai_wallpapers;
CREATE POLICY "Users can read own AI wallpapers"
  ON ai_wallpapers
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own AI wallpapers" ON ai_wallpapers;
CREATE POLICY "Users can create own AI wallpapers"
  ON ai_wallpapers
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own AI wallpapers" ON ai_wallpapers;
CREATE POLICY "Users can update own AI wallpapers"
  ON ai_wallpapers
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own AI wallpapers" ON ai_wallpapers;
CREATE POLICY "Users can delete own AI wallpapers"
  ON ai_wallpapers
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_user_profiles_beta_tester;
DROP INDEX IF EXISTS idx_beta_feedback_created_at;
DROP INDEX IF EXISTS idx_collab_sessions_created_by;
DROP INDEX IF EXISTS idx_collab_participants_session;
DROP INDEX IF EXISTS idx_collab_participants_user;
DROP INDEX IF EXISTS idx_collab_updates_session;
DROP INDEX IF EXISTS idx_collab_updates_user;
DROP INDEX IF EXISTS idx_custom_themes_user_id;
DROP INDEX IF EXISTS idx_custom_themes_user_active;
DROP INDEX IF EXISTS idx_ai_wallpapers_user_id;
DROP INDEX IF EXISTS idx_ai_wallpapers_user_active;
DROP INDEX IF EXISTS idx_collaboration_participants_user_id;
DROP INDEX IF EXISTS idx_collaborations_owner_id;
DROP INDEX IF EXISTS idx_collaborations_poem_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_entries_user_id;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_poem_audio_poem_id;
DROP INDEX IF EXISTS idx_poem_audio_user_id;
DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP INDEX IF EXISTS idx_poem_images_poem_id;
DROP INDEX IF EXISTS idx_poem_images_user_id;
DROP INDEX IF EXISTS idx_poem_prompts_prompt_id;
DROP INDEX IF EXISTS idx_poem_series_user_id;
DROP INDEX IF EXISTS idx_poem_series_items_poem_id;
DROP INDEX IF EXISTS idx_poem_tags_tag_id;
DROP INDEX IF EXISTS idx_poem_versions_changed_by;
DROP INDEX IF EXISTS idx_reactions_user_id;
DROP INDEX IF EXISTS idx_reading_list_poems_poem_id;
DROP INDEX IF EXISTS idx_reading_lists_user_id;
DROP INDEX IF EXISTS idx_submissions_poem_id;
DROP INDEX IF EXISTS idx_tutorial_progress_tutorial_id;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATH
-- ============================================================================

CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collaborative_sessions
    SET participant_count = participant_count + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collaborative_sessions
    SET participant_count = participant_count - 1
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$;