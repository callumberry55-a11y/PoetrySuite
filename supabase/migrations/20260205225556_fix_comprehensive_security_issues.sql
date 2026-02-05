/*
  # Fix Comprehensive Security Issues
  
  ## Overview
  This migration addresses critical security and performance issues identified by Supabase security scanner.
  
  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes (Performance)
  Creates indexes for all foreign key columns that lack covering indexes to optimize query performance.
  Affects 78 foreign keys across multiple tables including:
  - AI conversation and message tables
  - Contest and challenge tables
  - Collaboration and workshop tables
  - PaaS infrastructure tables
  - User-related tables
  
  ### 2. Remove Unused Index
  Drops the unused index `idx_store_items_sale_ends_at` on store_items table.
  
  ### 3. Consolidate Multiple Permissive Policies
  Fixes security issues where tables have multiple permissive policies for the same role/action:
  - paas_developers: Merges 2 SELECT policies into 1 comprehensive policy
  - paas_point_accounts: Merges 2 SELECT policies into 1 comprehensive policy
  - user_profiles: Merges 2 UPDATE policies into 1 comprehensive policy
  
  ### 4. Fix Function Search Path Security
  Updates `should_collect_maintenance_tax` function to use immutable search_path.
  
  ## Notes
  - Auth DB Connection Strategy must be manually adjusted in Supabase dashboard (cannot be fixed via migration)
  - All indexes use IF NOT EXISTS to prevent errors on re-run
  - Policies are dropped and recreated to ensure clean consolidation
*/

-- =====================================================
-- SECTION 1: Add Missing Foreign Key Indexes
-- =====================================================

-- AI conversation and message indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON public.ai_messages(user_id);

-- Anthology indexes
CREATE INDEX IF NOT EXISTS idx_anthologies_curator_id ON public.anthologies(curator_id);
CREATE INDEX IF NOT EXISTS idx_anthology_submissions_poem_id ON public.anthology_submissions(poem_id);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_poem_id ON public.bookmarks(poem_id);

-- Challenge indexes
CREATE INDEX IF NOT EXISTS idx_challenge_participations_poem_id ON public.challenge_participations(poem_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON public.challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges(created_by);

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_collaborative_poem_id ON public.collaboration_invitations(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invitee_id ON public.collaboration_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_inviter_id ON public.collaboration_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_poems_creator_id ON public.collaborative_poems(creator_id);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Community submission indexes
CREATE INDEX IF NOT EXISTS idx_community_submissions_reviewed_by ON public.community_submissions(reviewed_by);

-- Contest indexes
CREATE INDEX IF NOT EXISTS idx_contest_entries_poem_id ON public.contest_entries(poem_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_user_id ON public.contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_entry_id ON public.contest_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_user_id ON public.contest_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON public.contests(created_by);
CREATE INDEX IF NOT EXISTS idx_contests_participant_badge_id ON public.contests(participant_badge_id);
CREATE INDEX IF NOT EXISTS idx_contests_runner_up_badge_id ON public.contests(runner_up_badge_id);
CREATE INDEX IF NOT EXISTS idx_contests_winner_badge_id ON public.contests(winner_badge_id);

-- Critique indexes
CREATE INDEX IF NOT EXISTS idx_critiques_user_id ON public.critiques(user_id);
CREATE INDEX IF NOT EXISTS idx_critiques_workshop_submission_id ON public.critiques(workshop_submission_id);

-- Daily prompt indexes
CREATE INDEX IF NOT EXISTS idx_daily_prompts_created_by ON public.daily_prompts(created_by);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON public.events(host_id);

-- External API indexes
CREATE INDEX IF NOT EXISTS idx_external_api_keys_created_by ON public.external_api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_api_key_id ON public.external_api_usage(api_key_id);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Mentorship indexes
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON public.mentorships(mentee_id);

-- PaaS access code indexes
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_created_by ON public.paas_access_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_used_by ON public.paas_access_codes(used_by);

-- PaaS AI banker indexes
CREATE INDEX IF NOT EXISTS idx_paas_ai_banker_decisions_billing_period_id ON public.paas_ai_banker_decisions(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_paas_ai_banker_decisions_developer_id ON public.paas_ai_banker_decisions(developer_id);

-- PaaS API log indexes
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_api_key_id ON public.paas_api_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_developer_id ON public.paas_api_logs(developer_id);

-- PaaS API usage indexes
CREATE INDEX IF NOT EXISTS idx_paas_api_usage_api_key_id ON public.paas_api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_usage_developer_id ON public.paas_api_usage(developer_id);

-- PaaS billing indexes
CREATE INDEX IF NOT EXISTS idx_paas_billing_charges_billing_period_id ON public.paas_billing_charges(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_paas_billing_charges_developer_id ON public.paas_billing_charges(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_billing_periods_developer_id ON public.paas_billing_periods(developer_id);

-- PaaS developer reserve indexes
CREATE INDEX IF NOT EXISTS idx_paas_developer_reserves_category_id ON public.paas_developer_reserves(category_id);
CREATE INDEX IF NOT EXISTS idx_paas_developers_access_code_id ON public.paas_developers(access_code_id);

-- PaaS point grant indexes
CREATE INDEX IF NOT EXISTS idx_paas_point_grants_developer_id ON public.paas_point_grants(developer_id);

-- PaaS reserve indexes
CREATE INDEX IF NOT EXISTS idx_paas_reserve_ai_recommendations_developer_id ON public.paas_reserve_ai_recommendations(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_allocations_developer_id ON public.paas_reserve_allocations(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_allocations_reserve_id ON public.paas_reserve_allocations(reserve_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_transactions_developer_id ON public.paas_reserve_transactions(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_transactions_reserve_id ON public.paas_reserve_transactions(reserve_id);

-- PaaS security event indexes
CREATE INDEX IF NOT EXISTS idx_paas_security_events_api_key_id ON public.paas_security_events(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_security_events_manual_override_by ON public.paas_security_events(manual_override_by);

-- PaaS transaction indexes
CREATE INDEX IF NOT EXISTS idx_paas_transactions_api_key_id ON public.paas_transactions(api_key_id);

-- Poem collaborator indexes
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_collaborative_poem_id ON public.poem_collaborators(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_user_id ON public.poem_collaborators(user_id);

-- Poem collection indexes
CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id ON public.poem_collections(collection_id);

-- Poem tag indexes
CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id ON public.poem_tags(tag_id);

-- Poem version indexes
CREATE INDEX IF NOT EXISTS idx_poem_versions_poem_id ON public.poem_versions(poem_id);

-- Prompt response indexes
CREATE INDEX IF NOT EXISTS idx_prompt_responses_poem_id ON public.prompt_responses(poem_id);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_user_id ON public.prompt_responses(user_id);

-- Reading list indexes
CREATE INDEX IF NOT EXISTS idx_reading_list_items_poem_id ON public.reading_list_items(poem_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_items_reading_list_id ON public.reading_list_items(reading_list_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON public.reading_lists(user_id);

-- User badge indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- User purchase indexes
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON public.user_purchases(item_id);

-- User tax transaction indexes
CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_user_id ON public.user_tax_transactions(user_id);

-- Workshop indexes
CREATE INDEX IF NOT EXISTS idx_workshop_members_user_id ON public.workshop_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_poem_id ON public.workshop_submissions(poem_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_submitted_by ON public.workshop_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_workshop_id ON public.workshop_submissions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshops_creator_id ON public.workshops(creator_id);

-- Writing goal indexes
CREATE INDEX IF NOT EXISTS idx_writing_goals_user_id ON public.writing_goals(user_id);

-- Zine indexes
CREATE INDEX IF NOT EXISTS idx_zine_poems_poem_id ON public.zine_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_zines_creator_id ON public.zines(creator_id);

-- =====================================================
-- SECTION 2: Remove Unused Index
-- =====================================================

DROP INDEX IF EXISTS idx_store_items_sale_ends_at;

-- =====================================================
-- SECTION 3: Consolidate Multiple Permissive Policies
-- =====================================================

-- Fix paas_developers SELECT policies
-- The broader policy "Developers can view all developer accounts" supersedes "Developers can view own developer account"
DROP POLICY IF EXISTS "Developers can view own developer account" ON public.paas_developers;
DROP POLICY IF EXISTS "Developers can view all developer accounts" ON public.paas_developers;

CREATE POLICY "Developers can view developer accounts"
  ON public.paas_developers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.paas_developers pd 
      WHERE pd.user_id = auth.uid()
    )
  );

-- Fix paas_point_accounts SELECT policies
DROP POLICY IF EXISTS "Developers can view own point account" ON public.paas_point_accounts;
DROP POLICY IF EXISTS "Developers can view all point accounts" ON public.paas_point_accounts;

CREATE POLICY "Developers can view point accounts"
  ON public.paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.paas_developers pd 
      WHERE pd.user_id = auth.uid()
    )
  );

-- Fix user_profiles UPDATE policies
-- Merge "Users can update own profile" and "Developers can update user profiles for point grants"
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Developers can update user profiles for point grants" ON public.user_profiles;

CREATE POLICY "Users and developers can update profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.paas_developers pd 
      WHERE pd.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.paas_developers pd 
      WHERE pd.user_id = auth.uid()
    )
  );

-- =====================================================
-- SECTION 4: Fix Function Search Path Security
-- =====================================================

CREATE OR REPLACE FUNCTION public.should_collect_maintenance_tax(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_developer boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.paas_developers
    WHERE user_id = p_user_id
  ) INTO v_is_developer;
  
  RETURN NOT v_is_developer;
END;
$$;