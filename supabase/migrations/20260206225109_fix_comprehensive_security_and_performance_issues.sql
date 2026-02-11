/*
  # Fix Comprehensive Security and Performance Issues

  1. RLS Performance Optimizations
    - Fix `paas_developers` - "Developers can view developer accounts" policy
    - Fix `paas_point_accounts` - "Developers can view point accounts" policy
    - Fix `user_profiles` - "Users and developers can update profiles" policy
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Remove Unused Indexes (76 total)
    - Drop all indexes that have not been used
    - Reduces database overhead and improves write performance
    - Only indexes that are actively used should remain

  3. Function Security Fixes
    - Fix `should_collect_maintenance_tax` function search path security issue
    - Set immutable search_path to prevent SQL injection risks

  ## Security Notes
  - All RLS policies remain functionally identical but now perform better
  - Removing unused indexes improves write performance without affecting reads
  - Function search path fix prevents potential security vulnerabilities
*/

-- =====================================================
-- PART 1: FIX RLS PERFORMANCE ISSUES
-- =====================================================

-- Fix paas_developers RLS policy
DROP POLICY IF EXISTS "Developers can view developer accounts" ON paas_developers;
CREATE POLICY "Developers can view developer accounts"
  ON paas_developers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers pd
      WHERE pd.user_id = (select auth.uid())
    )
  );

-- Fix paas_point_accounts RLS policy
DROP POLICY IF EXISTS "Developers can view point accounts" ON paas_point_accounts;
CREATE POLICY "Developers can view point accounts"
  ON paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers pd
      WHERE pd.user_id = (select auth.uid())
    )
  );

-- Fix user_profiles RLS policy
DROP POLICY IF EXISTS "Users and developers can update profiles" ON user_profiles;
CREATE POLICY "Users and developers can update profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM paas_developers pd
      WHERE pd.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM paas_developers pd
      WHERE pd.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- PART 2: DROP UNUSED INDEXES
-- =====================================================

-- AI Feature Indexes
DROP INDEX IF EXISTS idx_ai_conversations_user_id;
DROP INDEX IF EXISTS idx_ai_messages_conversation_id;
DROP INDEX IF EXISTS idx_ai_messages_user_id;

-- Anthology Indexes
DROP INDEX IF EXISTS idx_anthologies_curator_id;
DROP INDEX IF EXISTS idx_anthology_submissions_poem_id;

-- Bookmark Indexes
DROP INDEX IF EXISTS idx_bookmarks_poem_id;

-- Challenge Indexes
DROP INDEX IF EXISTS idx_challenge_participations_poem_id;
DROP INDEX IF EXISTS idx_challenge_participations_user_id;
DROP INDEX IF EXISTS idx_challenges_created_by;

-- Collaboration Indexes
DROP INDEX IF EXISTS idx_collaboration_invitations_collaborative_poem_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_invitee_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_inviter_id;
DROP INDEX IF EXISTS idx_collaborative_poems_creator_id;

-- Comment Indexes
DROP INDEX IF EXISTS idx_comments_user_id;

-- Community Submission Indexes
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;

-- Contest Indexes
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_entries_user_id;
DROP INDEX IF EXISTS idx_contest_votes_entry_id;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_contests_participant_badge_id;
DROP INDEX IF EXISTS idx_contests_runner_up_badge_id;
DROP INDEX IF EXISTS idx_contests_winner_badge_id;

-- Critique Indexes
DROP INDEX IF EXISTS idx_critiques_user_id;
DROP INDEX IF EXISTS idx_critiques_workshop_submission_id;

-- Daily Prompt Indexes
DROP INDEX IF EXISTS idx_daily_prompts_created_by;

-- Event Indexes
DROP INDEX IF EXISTS idx_event_attendees_user_id;
DROP INDEX IF EXISTS idx_events_host_id;

-- External API Indexes
DROP INDEX IF EXISTS idx_external_api_keys_created_by;
DROP INDEX IF EXISTS idx_external_api_usage_api_key_id;

-- Feedback Indexes
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Mentorship Indexes
DROP INDEX IF EXISTS idx_mentorships_mentee_id;

-- PaaS Access Code Indexes
DROP INDEX IF EXISTS idx_paas_access_codes_created_by;
DROP INDEX IF EXISTS idx_paas_access_codes_used_by;

-- PaaS AI Banker Indexes
DROP INDEX IF EXISTS idx_paas_ai_banker_decisions_billing_period_id;
DROP INDEX IF EXISTS idx_paas_ai_banker_decisions_developer_id;

-- PaaS API Log Indexes
DROP INDEX IF EXISTS idx_paas_api_logs_api_key_id;
DROP INDEX IF EXISTS idx_paas_api_logs_developer_id;

-- PaaS API Usage Indexes
DROP INDEX IF EXISTS idx_paas_api_usage_api_key_id;
DROP INDEX IF EXISTS idx_paas_api_usage_developer_id;

-- PaaS Billing Indexes
DROP INDEX IF EXISTS idx_paas_billing_charges_billing_period_id;
DROP INDEX IF EXISTS idx_paas_billing_charges_developer_id;
DROP INDEX IF EXISTS idx_paas_billing_periods_developer_id;

-- PaaS Developer Reserve Indexes
DROP INDEX IF EXISTS idx_paas_developer_reserves_category_id;
DROP INDEX IF EXISTS idx_paas_developers_access_code_id;

-- PaaS Point Grant Indexes
DROP INDEX IF EXISTS idx_paas_point_grants_developer_id;

-- PaaS Reserve Indexes
DROP INDEX IF EXISTS idx_paas_reserve_ai_recommendations_developer_id;
DROP INDEX IF EXISTS idx_paas_reserve_allocations_developer_id;
DROP INDEX IF EXISTS idx_paas_reserve_allocations_reserve_id;
DROP INDEX IF EXISTS idx_paas_reserve_transactions_developer_id;
DROP INDEX IF EXISTS idx_paas_reserve_transactions_reserve_id;

-- PaaS Security Indexes
DROP INDEX IF EXISTS idx_paas_security_events_api_key_id;
DROP INDEX IF EXISTS idx_paas_security_events_manual_override_by;

-- PaaS Transaction Indexes
DROP INDEX IF EXISTS idx_paas_transactions_api_key_id;

-- Poem Collaboration Indexes
DROP INDEX IF EXISTS idx_poem_collaborators_collaborative_poem_id;
DROP INDEX IF EXISTS idx_poem_collaborators_user_id;

-- Poem Collection Indexes
DROP INDEX IF EXISTS idx_poem_collections_collection_id;

-- Poem Tag Indexes
DROP INDEX IF EXISTS idx_poem_tags_tag_id;

-- Poem Version Indexes
DROP INDEX IF EXISTS idx_poem_versions_poem_id;

-- Prompt Response Indexes
DROP INDEX IF EXISTS idx_prompt_responses_poem_id;
DROP INDEX IF EXISTS idx_prompt_responses_user_id;

-- Reading List Indexes
DROP INDEX IF EXISTS idx_reading_list_items_poem_id;
DROP INDEX IF EXISTS idx_reading_list_items_reading_list_id;
DROP INDEX IF EXISTS idx_reading_lists_user_id;

-- User Badge Indexes
DROP INDEX IF EXISTS idx_user_badges_badge_id;

-- User Purchase Indexes
DROP INDEX IF EXISTS idx_user_purchases_item_id;

-- User Tax Indexes
DROP INDEX IF EXISTS idx_user_tax_transactions_user_id;

-- Workshop Indexes
DROP INDEX IF EXISTS idx_workshop_members_user_id;
DROP INDEX IF EXISTS idx_workshop_submissions_poem_id;
DROP INDEX IF EXISTS idx_workshop_submissions_submitted_by;
DROP INDEX IF EXISTS idx_workshop_submissions_workshop_id;
DROP INDEX IF EXISTS idx_workshops_creator_id;

-- Writing Goal Indexes
DROP INDEX IF EXISTS idx_writing_goals_user_id;

-- Zine Indexes
DROP INDEX IF EXISTS idx_zine_poems_poem_id;
DROP INDEX IF EXISTS idx_zines_creator_id;

-- =====================================================
-- PART 3: FIX FUNCTION SEARCH PATH SECURITY
-- =====================================================

-- Drop and recreate the function with a secure, immutable search_path
DROP FUNCTION IF EXISTS public.should_collect_maintenance_tax(uuid);

CREATE FUNCTION public.should_collect_maintenance_tax(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  last_tax_date timestamptz;
  is_developer boolean;
BEGIN
  -- Check if user is a developer (developers are exempt)
  SELECT EXISTS(
    SELECT 1 FROM paas_developers
    WHERE user_id = p_user_id
    AND is_verified = true
  ) INTO is_developer;
  
  IF is_developer THEN
    RETURN false;
  END IF;
  
  -- Get last maintenance tax date
  SELECT MAX(created_at) INTO last_tax_date
  FROM user_tax_transactions
  WHERE user_id = p_user_id
  AND tax_type = 'maintenance';
  
  -- If never taxed or more than 30 days ago, collect tax
  IF last_tax_date IS NULL OR last_tax_date < (NOW() - INTERVAL '30 days') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;