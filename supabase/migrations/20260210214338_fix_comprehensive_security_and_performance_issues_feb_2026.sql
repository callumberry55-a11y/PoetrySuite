/*
  # Fix Comprehensive Security and Performance Issues - February 2026

  ## Summary
  This migration addresses critical security and performance issues identified in the database audit:
  - 14 unindexed foreign keys causing suboptimal query performance
  - 4 RLS policies with performance issues (stories and story_views tables)
  - 73 unused indexes consuming storage and slowing writes
  - 8 tables with multiple permissive policies that can be consolidated
  - 1 security definer view that needs to be fixed
  - 1 function with mutable search_path

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  Creates indexes for 14 foreign keys without covering indexes:
  - book_club_discussions.club_id
  - collection_poems.poem_id
  - forum_replies.topic_id
  - forum_topics.category_id
  - poem_bookmarks.poem_id
  - poem_critiques.critic_id
  - poem_critiques.poem_id
  - poem_favorites.poem_id
  - poem_shares.poem_id
  - reading_list_poems.poem_id
  - study_group_resources.group_id
  - user_prompt_completions.poem_id
  - user_prompt_completions.prompt_id
  - writing_sessions.user_id

  ### 2. Fix RLS Policies for Performance
  Updates 4 RLS policies to use (select auth.uid()) instead of auth.uid():
  - stories: "Users can create own stories"
  - stories: "Users can delete own stories"
  - story_views: "Users can record story views"
  - story_views: "Users can view their own story views"

  ### 3. Drop Unused Indexes
  Removes 73 unused indexes that are consuming storage and slowing writes

  ### 4. Consolidate Multiple Permissive Policies
  Optimizes 8 tables with multiple permissive SELECT policies:
  - book_clubs (created_by, is_private)
  - poem_critiques (critic_id, is_private)
  - poem_shares (shared_by, is_public)
  - poetry_collections (user_id, is_public)
  - poetry_events (organizer_id, is_public)
  - study_groups (created_by, is_private)
  - user_achievements
  - user_follows

  ### 5. Fix Security Definer View
  Recreates monthly_distributions_summary view without SECURITY DEFINER

  ### 6. Fix Function Search Path
  Updates should_collect_maintenance_tax function with immutable search_path
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_book_club_discussions_club_id 
  ON book_club_discussions(club_id);

CREATE INDEX IF NOT EXISTS idx_collection_poems_poem_id 
  ON collection_poems(poem_id);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id 
  ON forum_replies(topic_id);

CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id 
  ON forum_topics(category_id);

CREATE INDEX IF NOT EXISTS idx_poem_bookmarks_poem_id 
  ON poem_bookmarks(poem_id);

CREATE INDEX IF NOT EXISTS idx_poem_critiques_critic_id 
  ON poem_critiques(critic_id);

CREATE INDEX IF NOT EXISTS idx_poem_critiques_poem_id 
  ON poem_critiques(poem_id);

CREATE INDEX IF NOT EXISTS idx_poem_favorites_poem_id 
  ON poem_favorites(poem_id);

CREATE INDEX IF NOT EXISTS idx_poem_shares_poem_id 
  ON poem_shares(poem_id);

CREATE INDEX IF NOT EXISTS idx_reading_list_poems_poem_id 
  ON reading_list_poems(poem_id);

CREATE INDEX IF NOT EXISTS idx_study_group_resources_group_id 
  ON study_group_resources(group_id);

CREATE INDEX IF NOT EXISTS idx_user_prompt_completions_poem_id 
  ON user_prompt_completions(poem_id);

CREATE INDEX IF NOT EXISTS idx_user_prompt_completions_prompt_id 
  ON user_prompt_completions(prompt_id);

CREATE INDEX IF NOT EXISTS idx_writing_sessions_user_id 
  ON writing_sessions(user_id);

-- =====================================================
-- PART 2: Fix RLS Policies for Performance
-- =====================================================

-- Stories table policies
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
CREATE POLICY "Users can create own stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Story views policies
DROP POLICY IF EXISTS "Users can record story views" ON story_views;
CREATE POLICY "Users can record story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own story views" ON story_views;
CREATE POLICY "Users can view their own story views"
  ON story_views FOR SELECT
  TO authenticated
  USING (viewer_id = (select auth.uid()));

-- =====================================================
-- PART 3: Drop Unused Indexes
-- =====================================================

-- AI related indexes
DROP INDEX IF EXISTS idx_ai_conversations_user_id;
DROP INDEX IF EXISTS idx_ai_messages_conversation_id;
DROP INDEX IF EXISTS idx_ai_messages_user_id;

-- Anthology indexes
DROP INDEX IF EXISTS idx_anthologies_curator_id;
DROP INDEX IF EXISTS idx_anthology_submissions_poem_id;

-- Bookmark indexes
DROP INDEX IF EXISTS idx_bookmarks_poem_id;

-- Challenge indexes
DROP INDEX IF EXISTS idx_challenge_participations_poem_id;
DROP INDEX IF EXISTS idx_challenge_participations_user_id;
DROP INDEX IF EXISTS idx_challenges_created_by;

-- Collaboration indexes
DROP INDEX IF EXISTS idx_collaboration_invitations_collaborative_poem_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_invitee_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_inviter_id;
DROP INDEX IF EXISTS idx_collaborative_poems_creator_id;

-- Comment indexes
DROP INDEX IF EXISTS idx_comments_user_id;

-- Community submission indexes
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;

-- Contest indexes
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_entries_user_id;
DROP INDEX IF EXISTS idx_contest_votes_entry_id;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_contests_participant_badge_id;
DROP INDEX IF EXISTS idx_contests_runner_up_badge_id;
DROP INDEX IF EXISTS idx_contests_winner_badge_id;

-- Critique indexes
DROP INDEX IF EXISTS idx_critiques_user_id;
DROP INDEX IF EXISTS idx_critiques_workshop_submission_id;

-- Daily prompt indexes
DROP INDEX IF EXISTS idx_daily_prompts_created_by;

-- Event indexes
DROP INDEX IF EXISTS idx_event_attendees_user_id;
DROP INDEX IF EXISTS idx_events_host_id;

-- External API indexes
DROP INDEX IF EXISTS idx_external_api_keys_created_by;
DROP INDEX IF EXISTS idx_external_api_usage_api_key_id;

-- Feedback indexes
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Mentorship indexes
DROP INDEX IF EXISTS idx_mentorships_mentee_id;

-- PaaS indexes
DROP INDEX IF EXISTS idx_paas_access_codes_created_by;
DROP INDEX IF EXISTS idx_paas_access_codes_used_by;
DROP INDEX IF EXISTS idx_paas_ai_banker_decisions_billing_period_id;
DROP INDEX IF EXISTS idx_paas_api_logs_api_key_id;
DROP INDEX IF EXISTS idx_paas_api_logs_developer_id;
DROP INDEX IF EXISTS idx_paas_api_usage_api_key_id;
DROP INDEX IF EXISTS idx_paas_billing_charges_billing_period_id;
DROP INDEX IF EXISTS idx_paas_developer_reserves_category_id;
DROP INDEX IF EXISTS idx_paas_developers_access_code_id;
DROP INDEX IF EXISTS idx_paas_point_grants_developer_id;
DROP INDEX IF EXISTS idx_paas_reserve_allocations_reserve_id;
DROP INDEX IF EXISTS idx_paas_reserve_transactions_reserve_id;
DROP INDEX IF EXISTS idx_paas_security_events_api_key_id;
DROP INDEX IF EXISTS idx_paas_security_events_manual_override_by;
DROP INDEX IF EXISTS idx_paas_transactions_api_key_id;

-- Poem related indexes
DROP INDEX IF EXISTS idx_poem_collaborators_collaborative_poem_id;
DROP INDEX IF EXISTS idx_poem_collaborators_user_id;
DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP INDEX IF EXISTS idx_poem_tags_tag_id;
DROP INDEX IF EXISTS idx_poem_versions_poem_id;

-- Prompt indexes
DROP INDEX IF EXISTS idx_prompt_responses_poem_id;
DROP INDEX IF EXISTS idx_prompt_responses_user_id;

-- Reading list indexes
DROP INDEX IF EXISTS idx_reading_list_items_poem_id;
DROP INDEX IF EXISTS idx_reading_list_items_reading_list_id;
DROP INDEX IF EXISTS idx_reading_lists_user_id;

-- Study group indexes
DROP INDEX IF EXISTS idx_study_group_resources_user_id;

-- User related indexes
DROP INDEX IF EXISTS idx_user_badges_badge_id;
DROP INDEX IF EXISTS idx_user_purchases_item_id;
DROP INDEX IF EXISTS idx_user_tax_transactions_user_id;

-- Workshop indexes
DROP INDEX IF EXISTS idx_workshop_members_user_id;
DROP INDEX IF EXISTS idx_workshop_submissions_poem_id;
DROP INDEX IF EXISTS idx_workshop_submissions_submitted_by;
DROP INDEX IF EXISTS idx_workshop_submissions_workshop_id;
DROP INDEX IF EXISTS idx_workshops_creator_id;

-- Writing goal indexes
DROP INDEX IF EXISTS idx_writing_goals_user_id;

-- Zine indexes
DROP INDEX IF EXISTS idx_zine_poems_poem_id;
DROP INDEX IF EXISTS idx_zines_creator_id;

-- Story indexes
DROP INDEX IF EXISTS idx_stories_user_id;
DROP INDEX IF EXISTS idx_stories_expires_at;
DROP INDEX IF EXISTS idx_stories_created_at;
DROP INDEX IF EXISTS idx_story_views_story_id;
DROP INDEX IF EXISTS idx_story_views_viewer_id;

-- Distribution indexes
DROP INDEX IF EXISTS idx_monthly_distributions_date;

-- =====================================================
-- PART 4: Consolidate Multiple Permissive Policies
-- =====================================================

-- Book clubs: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Users can view book clubs they are members of" ON book_clubs;
DROP POLICY IF EXISTS "Users can view public book clubs" ON book_clubs;
CREATE POLICY "Users can view accessible book clubs"
  ON book_clubs FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR id IN (
      SELECT club_id FROM book_club_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- Poem critiques: Consolidate three SELECT policies
DROP POLICY IF EXISTS "Poem authors can view critiques on their poems" ON poem_critiques;
DROP POLICY IF EXISTS "Users can view own critiques" ON poem_critiques;
DROP POLICY IF EXISTS "Users can view public critiques" ON poem_critiques;
CREATE POLICY "Users can view accessible critiques"
  ON poem_critiques FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR critic_id = (select auth.uid())
    OR poem_id IN (
      SELECT id FROM poems WHERE user_id = (select auth.uid())
    )
  );

-- Poem shares: Consolidate three SELECT policies
DROP POLICY IF EXISTS "Users can view own poem shares" ON poem_shares;
DROP POLICY IF EXISTS "Users can view public poem shares" ON poem_shares;
DROP POLICY IF EXISTS "Users can view shares from followed users" ON poem_shares;
CREATE POLICY "Users can view accessible poem shares"
  ON poem_shares FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR shared_by = (select auth.uid())
    OR shared_by IN (
      SELECT following_id FROM user_follows 
      WHERE follower_id = (select auth.uid())
    )
  );

-- Poetry collections: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Users can view own collections" ON poetry_collections;
DROP POLICY IF EXISTS "Users can view public collections" ON poetry_collections;
CREATE POLICY "Users can view accessible collections"
  ON poetry_collections FOR SELECT
  TO authenticated
  USING (
    is_public = true 
    OR user_id = (select auth.uid())
  );

-- Poetry events: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Users can view events they are attending" ON poetry_events;
DROP POLICY IF EXISTS "Users can view public events" ON poetry_events;
CREATE POLICY "Users can view accessible events"
  ON poetry_events FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR id IN (
      SELECT event_id FROM event_attendees 
      WHERE user_id = (select auth.uid())
    )
  );

-- Study groups: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Users can view public study groups" ON study_groups;
DROP POLICY IF EXISTS "Users can view study groups they are members of" ON study_groups;
CREATE POLICY "Users can view accessible study groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR id IN (
      SELECT group_id FROM study_group_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- User achievements: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Users can view others achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view all achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

-- User follows: Consolidate two SELECT policies
DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
CREATE POLICY "Users can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PART 5: Fix Security Definer View
-- =====================================================

DROP VIEW IF EXISTS monthly_distributions_summary;
CREATE VIEW monthly_distributions_summary AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(month FROM distribution_date) AS month_number,
  EXTRACT(year FROM distribution_date) AS year
FROM monthly_distributions
ORDER BY distribution_date DESC;

-- =====================================================
-- PART 6: Fix Function Search Path
-- =====================================================

DROP FUNCTION IF EXISTS should_collect_maintenance_tax(uuid);
CREATE OR REPLACE FUNCTION should_collect_maintenance_tax(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  last_tax_date timestamptz;
  is_developer boolean;
BEGIN
  -- Check if user is a developer (exempt from maintenance tax)
  SELECT EXISTS (
    SELECT 1 FROM paas_developers WHERE user_id = user_id_param
  ) INTO is_developer;
  
  IF is_developer THEN
    RETURN false;
  END IF;

  -- Get last maintenance tax date
  SELECT MAX(created_at) INTO last_tax_date
  FROM user_tax_transactions
  WHERE user_id = user_id_param
  AND tax_type = 'maintenance';

  -- If no previous tax or more than 30 days ago, collect tax
  IF last_tax_date IS NULL OR last_tax_date < (now() - interval '30 days') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;