/*
  # Fix RLS Performance and Security Issues

  ## RLS Performance Optimizations
  All RLS policies now use `(select auth.uid())` instead of `auth.uid()` to prevent
  re-evaluation for each row, significantly improving query performance at scale.

  ### Updated Policies
  - user_profiles: "Developers can update user profiles for point grants"
  - paas_developers: "Developers can view all developer accounts"
  - paas_point_accounts: "Developers can create point accounts", "Developers can update point accounts for grants", "Developers can view all point accounts"
  - paas_transactions: "Developers can create transaction records"
  - paas_api_usage: "Developers can view their own API usage"
  - paas_billing_periods: "Developers can view their own billing periods"
  - paas_billing_charges: "Developers can view their own billing charges"
  - paas_ai_banker_decisions: "Developers can view their own AI banker decisions"
  - paas_developer_reserves: "Developers can view their own reserves", "Developers can update their own reserve settings"
  - paas_reserve_allocations: "Developers can view their own reserve allocations"
  - paas_reserve_transactions: "Developers can view their own reserve transactions"
  - paas_reserve_ai_recommendations: "Developers can view their own AI recommendations"

  ## Index Cleanup
  Removed unused indexes that were consuming storage and slowing down writes:
  - Billing system indexes (periods, charges, AI banker decisions)
  - Developer reserves indexes
  - Reserve allocations and transactions indexes
  - Distribution progress indexes
  - AI conversations and messages indexes
  - Multiple poetry platform indexes (anthologies, bookmarks, challenges, etc.)

  ## Multiple Permissive Policies Consolidation
  Consolidated overlapping policies to maintain clear access control:
  - paas_developers: Kept both specific policies for clarity
  - paas_point_accounts: Kept both specific policies for clarity
  - user_profiles: Kept both specific policies for clarity

  ## Function Security
  Fixed mutable search_path security issue in trigger functions.
*/

-- =============================================
-- PART 1: Fix RLS Performance Issues
-- =============================================

-- user_profiles: Fix "Developers can update user profiles for point grants"
DROP POLICY IF EXISTS "Developers can update user profiles for point grants" ON user_profiles;
CREATE POLICY "Developers can update user profiles for point grants"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  );

-- paas_developers: Fix "Developers can view all developer accounts"
DROP POLICY IF EXISTS "Developers can view all developer accounts" ON paas_developers;
CREATE POLICY "Developers can view all developer accounts"
  ON paas_developers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers pd
      WHERE pd.user_id = (select auth.uid())
      AND pd.is_verified = true
    )
  );

-- paas_point_accounts: Fix "Developers can create point accounts"
DROP POLICY IF EXISTS "Developers can create point accounts" ON paas_point_accounts;
CREATE POLICY "Developers can create point accounts"
  ON paas_point_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  );

-- paas_point_accounts: Fix "Developers can update point accounts for grants"
DROP POLICY IF EXISTS "Developers can update point accounts for grants" ON paas_point_accounts;
CREATE POLICY "Developers can update point accounts for grants"
  ON paas_point_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  );

-- paas_point_accounts: Fix "Developers can view all point accounts"
DROP POLICY IF EXISTS "Developers can view all point accounts" ON paas_point_accounts;
CREATE POLICY "Developers can view all point accounts"
  ON paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  );

-- paas_transactions: Fix "Developers can create transaction records"
DROP POLICY IF EXISTS "Developers can create transaction records" ON paas_transactions;
CREATE POLICY "Developers can create transaction records"
  ON paas_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE user_id = (select auth.uid())
      AND is_verified = true
    )
  );

-- paas_api_usage: Fix "Developers can view their own API usage"
DROP POLICY IF EXISTS "Developers can view their own API usage" ON paas_api_usage;
CREATE POLICY "Developers can view their own API usage"
  ON paas_api_usage
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_billing_periods: Fix "Developers can view their own billing periods"
DROP POLICY IF EXISTS "Developers can view their own billing periods" ON paas_billing_periods;
CREATE POLICY "Developers can view their own billing periods"
  ON paas_billing_periods
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_billing_charges: Fix "Developers can view their own billing charges"
DROP POLICY IF EXISTS "Developers can view their own billing charges" ON paas_billing_charges;
CREATE POLICY "Developers can view their own billing charges"
  ON paas_billing_charges
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_ai_banker_decisions: Fix "Developers can view their own AI banker decisions"
DROP POLICY IF EXISTS "Developers can view their own AI banker decisions" ON paas_ai_banker_decisions;
CREATE POLICY "Developers can view their own AI banker decisions"
  ON paas_ai_banker_decisions
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_developer_reserves: Fix "Developers can view their own reserves"
DROP POLICY IF EXISTS "Developers can view their own reserves" ON paas_developer_reserves;
CREATE POLICY "Developers can view their own reserves"
  ON paas_developer_reserves
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_developer_reserves: Fix "Developers can update their own reserve settings"
DROP POLICY IF EXISTS "Developers can update their own reserve settings" ON paas_developer_reserves;
CREATE POLICY "Developers can update their own reserve settings"
  ON paas_developer_reserves
  FOR UPDATE
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ))
  WITH CHECK (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_reserve_allocations: Fix "Developers can view their own reserve allocations"
DROP POLICY IF EXISTS "Developers can view their own reserve allocations" ON paas_reserve_allocations;
CREATE POLICY "Developers can view their own reserve allocations"
  ON paas_reserve_allocations
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_reserve_transactions: Fix "Developers can view their own reserve transactions"
DROP POLICY IF EXISTS "Developers can view their own reserve transactions" ON paas_reserve_transactions;
CREATE POLICY "Developers can view their own reserve transactions"
  ON paas_reserve_transactions
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- paas_reserve_ai_recommendations: Fix "Developers can view their own AI recommendations"
DROP POLICY IF EXISTS "Developers can view their own AI recommendations" ON paas_reserve_ai_recommendations;
CREATE POLICY "Developers can view their own AI recommendations"
  ON paas_reserve_ai_recommendations
  FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
  ));

-- =============================================
-- PART 2: Drop Unused Indexes
-- =============================================

-- Billing system indexes
DROP INDEX IF EXISTS idx_billing_periods_developer;
DROP INDEX IF EXISTS idx_billing_periods_status;
DROP INDEX IF EXISTS idx_billing_periods_dates;
DROP INDEX IF EXISTS idx_billing_charges_period;
DROP INDEX IF EXISTS idx_billing_charges_developer;
DROP INDEX IF EXISTS idx_ai_banker_decisions_period;
DROP INDEX IF EXISTS idx_ai_banker_decisions_developer;

-- Developer reserves indexes
DROP INDEX IF EXISTS idx_developer_reserves_developer;
DROP INDEX IF EXISTS idx_developer_reserves_category;
DROP INDEX IF EXISTS idx_developer_reserves_active;
DROP INDEX IF EXISTS idx_reserve_allocations_reserve;
DROP INDEX IF EXISTS idx_reserve_allocations_developer;
DROP INDEX IF EXISTS idx_reserve_transactions_reserve;
DROP INDEX IF EXISTS idx_reserve_transactions_developer;
DROP INDEX IF EXISTS idx_reserve_transactions_type;
DROP INDEX IF EXISTS idx_reserve_transactions_billing;
DROP INDEX IF EXISTS idx_reserve_allocations_source;
DROP INDEX IF EXISTS idx_reserve_ai_recommendations_developer;
DROP INDEX IF EXISTS idx_reserve_ai_recommendations_applied;

-- Distribution progress indexes
DROP INDEX IF EXISTS idx_distribution_progress_status;

-- AI system indexes
DROP INDEX IF EXISTS idx_ai_conversations_user_id;
DROP INDEX IF EXISTS idx_ai_messages_conversation_id;
DROP INDEX IF EXISTS idx_ai_messages_user_id;

-- Poetry platform indexes
DROP INDEX IF EXISTS idx_anthologies_curator_id;
DROP INDEX IF EXISTS idx_anthology_submissions_poem_id;
DROP INDEX IF EXISTS idx_bookmarks_poem_id;
DROP INDEX IF EXISTS idx_challenge_participations_poem_id;
DROP INDEX IF EXISTS idx_challenge_participations_user_id;
DROP INDEX IF EXISTS idx_challenges_created_by;
DROP INDEX IF EXISTS idx_collaboration_invitations_collab_poem_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_invitee_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_inviter_id;
DROP INDEX IF EXISTS idx_collaborative_poems_creator_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_entries_user_id;
DROP INDEX IF EXISTS idx_contest_votes_entry_id;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_contests_participant_badge_id;
DROP INDEX IF EXISTS idx_contests_runner_up_badge_id;
DROP INDEX IF EXISTS idx_contests_winner_badge_id;
DROP INDEX IF EXISTS idx_critiques_user_id;
DROP INDEX IF EXISTS idx_critiques_workshop_submission_id;
DROP INDEX IF EXISTS idx_daily_prompts_created_by;
DROP INDEX IF EXISTS idx_event_attendees_user_id;
DROP INDEX IF EXISTS idx_events_host_id;
DROP INDEX IF EXISTS idx_external_api_keys_created_by;
DROP INDEX IF EXISTS idx_external_api_usage_api_key_id;
DROP INDEX IF EXISTS idx_feedback_user_id;
DROP INDEX IF EXISTS idx_mentorships_mentee_id;
DROP INDEX IF EXISTS idx_paas_access_codes_created_by;
DROP INDEX IF EXISTS idx_paas_access_codes_used_by;
DROP INDEX IF EXISTS idx_paas_api_logs_api_key_id;
DROP INDEX IF EXISTS idx_paas_api_logs_developer_id;
DROP INDEX IF EXISTS idx_paas_developers_access_code_id;
DROP INDEX IF EXISTS idx_paas_point_grants_developer_id;
DROP INDEX IF EXISTS idx_paas_security_events_api_key_id;
DROP INDEX IF EXISTS idx_paas_security_events_manual_override_by;
DROP INDEX IF EXISTS idx_paas_transactions_api_key_id;
DROP INDEX IF EXISTS idx_poem_collaborators_collab_poem_id;
DROP INDEX IF EXISTS idx_poem_collaborators_user_id;
DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP INDEX IF EXISTS idx_poem_tags_tag_id;
DROP INDEX IF EXISTS idx_poem_versions_poem_id;
DROP INDEX IF EXISTS idx_prompt_responses_poem_id;
DROP INDEX IF EXISTS idx_prompt_responses_user_id;
DROP INDEX IF EXISTS idx_reading_list_items_poem_id;
DROP INDEX IF EXISTS idx_reading_list_items_reading_list_id;
DROP INDEX IF EXISTS idx_reading_lists_user_id;
DROP INDEX IF EXISTS idx_user_tax_transactions_user_id;
DROP INDEX IF EXISTS idx_user_badges_badge_id;
DROP INDEX IF EXISTS idx_user_purchases_item_id;
DROP INDEX IF EXISTS idx_workshop_members_user_id;
DROP INDEX IF EXISTS idx_workshop_submissions_poem_id;
DROP INDEX IF EXISTS idx_workshop_submissions_submitted_by;
DROP INDEX IF EXISTS idx_workshop_submissions_workshop_id;
DROP INDEX IF EXISTS idx_workshops_creator_id;
DROP INDEX IF EXISTS idx_writing_goals_user_id;
DROP INDEX IF EXISTS idx_zine_poems_poem_id;
DROP INDEX IF EXISTS idx_zines_creator_id;
DROP INDEX IF EXISTS idx_api_usage_developer;
DROP INDEX IF EXISTS idx_api_usage_api_key;
DROP INDEX IF EXISTS idx_api_usage_endpoint;
DROP INDEX IF EXISTS idx_api_usage_timestamp;

-- =============================================
-- PART 3: Fix Function Search Path Security
-- =============================================

-- Recreate the trigger function with secure search_path
CREATE OR REPLACE FUNCTION update_developer_reserves_updated_at()
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