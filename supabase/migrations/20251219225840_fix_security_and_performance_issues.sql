/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys (33 indexes)
    - Remove unused indexes (17 indexes)
    - Optimize RLS policies to use `(select auth.uid())` pattern
    - Fix function search paths for security

  2. Security Improvements
    - Fix RLS policies in feedback table
    - Fix RLS policies in system_config table
    - Fix RLS policies in config_history table
    - Remove duplicate permissive policies
    - Set immutable search paths on functions

  3. Tables Affected
    - ai_wallpapers, collab_participants, collab_updates
    - collaboration_participants, collaborations, collaborative_sessions
    - comments, community_submissions, config_history
    - contest_entries, contest_votes, contests
    - custom_themes, feedback, poem_audio, poem_collections
    - poem_images, poem_prompts, poem_series, poem_series_items
    - poem_tags, poem_versions, reactions, reading_list_poems
    - reading_lists, submissions, system_config, tutorial_progress
*/

-- ============================================================================
-- PART 1: Add missing indexes for foreign keys
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_wallpapers_user_id ON public.ai_wallpapers(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_participants_user_id ON public.collab_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_updates_session_id ON public.collab_updates(session_id);
CREATE INDEX IF NOT EXISTS idx_collab_updates_user_id ON public.collab_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_user_id ON public.collaboration_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_owner_id ON public.collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_poem_id ON public.collaborations(poem_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_sessions_created_by ON public.collaborative_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_submissions_reviewed_by ON public.community_submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_config_history_changed_by ON public.config_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_contest_entries_poem_id ON public.contest_entries(poem_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_user_id ON public.contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_user_id ON public.contest_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON public.contests(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_themes_user_id ON public.custom_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_audio_poem_id ON public.poem_audio(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_audio_user_id ON public.poem_audio(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id ON public.poem_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_poem_images_poem_id ON public.poem_images(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_images_user_id ON public.poem_images(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_prompts_prompt_id ON public.poem_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_poem_series_user_id ON public.poem_series(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_series_items_poem_id ON public.poem_series_items(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id ON public.poem_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_poem_versions_changed_by ON public.poem_versions(changed_by);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_poems_poem_id ON public.reading_list_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON public.reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_poem_id ON public.submissions(poem_id);
CREATE INDEX IF NOT EXISTS idx_system_config_updated_by ON public.system_config(updated_by);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial_id ON public.tutorial_progress(tutorial_id);

-- ============================================================================
-- PART 2: Drop unused indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_comments_poem_id;
DROP INDEX IF EXISTS idx_community_submissions_user_id;
DROP INDEX IF EXISTS idx_follows_following_id;
DROP INDEX IF EXISTS idx_private_messages_conversation_id;
DROP INDEX IF EXISTS idx_private_messages_recipient_id;
DROP INDEX IF EXISTS idx_private_messages_sender_id;
DROP INDEX IF EXISTS idx_public_chat_messages_user_id;
DROP INDEX IF EXISTS idx_push_subscriptions_user_id;
DROP INDEX IF EXISTS idx_feedback_user_id;
DROP INDEX IF EXISTS idx_feedback_status;
DROP INDEX IF EXISTS idx_feedback_created_at;
DROP INDEX IF EXISTS idx_user_profiles_is_developer;
DROP INDEX IF EXISTS idx_system_config_category;
DROP INDEX IF EXISTS idx_system_config_key;
DROP INDEX IF EXISTS idx_config_history_config_id;
DROP INDEX IF EXISTS idx_config_history_created_at;

-- ============================================================================
-- PART 3: Fix RLS policies for feedback table
-- ============================================================================

DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

CREATE POLICY "Users can create feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- PART 4: Fix RLS policies for system_config table
-- ============================================================================

DROP POLICY IF EXISTS "Developers can read system config" ON public.system_config;
DROP POLICY IF EXISTS "Developers can insert system config" ON public.system_config;
DROP POLICY IF EXISTS "Developers can update system config" ON public.system_config;

CREATE POLICY "Developers can read system config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can insert system config"
  ON public.system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can update system config"
  ON public.system_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

-- ============================================================================
-- PART 5: Fix RLS policies for config_history table
-- ============================================================================

DROP POLICY IF EXISTS "Developers can read config history" ON public.config_history;
DROP POLICY IF EXISTS "Developers can insert config history" ON public.config_history;

CREATE POLICY "Developers can read config history"
  ON public.config_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can insert config history"
  ON public.config_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_developer = true
    )
  );

-- ============================================================================
-- PART 6: Remove duplicate permissive policies
-- ============================================================================

-- For collab_participants, keep the more specific "Participants can view session members"
DROP POLICY IF EXISTS "Anyone can view participants" ON public.collab_participants;

-- For collab_updates, keep the more specific "Participants can view updates"
DROP POLICY IF EXISTS "Anyone can view updates" ON public.collab_updates;

-- ============================================================================
-- PART 7: Fix function search paths
-- ============================================================================

-- Recreate update_feedback_updated_at with immutable search path
DROP FUNCTION IF EXISTS public.update_feedback_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_feedback_updated_at_trigger ON public.feedback;
CREATE TRIGGER update_feedback_updated_at_trigger
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feedback_updated_at();

-- Recreate promote_to_developer with immutable search path
DROP FUNCTION IF EXISTS public.promote_to_developer(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.promote_to_developer(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is already a developer
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND is_developer = true
  ) THEN
    RAISE EXCEPTION 'Only developers can promote users';
  END IF;

  -- Promote the target user
  UPDATE public.user_profiles
  SET is_developer = true
  WHERE user_id = target_user_id;
END;
$$;