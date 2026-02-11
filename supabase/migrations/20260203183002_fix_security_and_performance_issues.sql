/*
  # Fix Security and Performance Issues
  
  ## Critical Security Fixes
  1. Fix RLS policies that allow unrestricted access (always true)
     - external_api_keys delete/update policies
     - external_api_usage insert policy
  
  ## Performance Improvements
  2. Add missing indexes on foreign keys
     - external_api_keys.created_by
     - paas_api_logs.api_key_id
     - paas_point_grants.developer_id
     - paas_security_events.api_key_id
     - paas_security_events.manual_override_by
     - paas_transactions.api_key_id
  
  3. Optimize RLS policies (use subqueries for auth functions)
     - Prevents re-evaluation of auth functions for each row
     - Improves query performance at scale
  
  4. Fix function search paths (security issue)
     - Set explicit search_path for functions
  
  5. Remove unused indexes to reduce overhead
*/

-- ================================================
-- SECTION 1: Add Missing Indexes on Foreign Keys
-- ================================================

-- Create indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_external_api_keys_created_by 
  ON external_api_keys(created_by);

CREATE INDEX IF NOT EXISTS idx_paas_api_logs_api_key_id 
  ON paas_api_logs(api_key_id);

CREATE INDEX IF NOT EXISTS idx_paas_point_grants_developer_id 
  ON paas_point_grants(developer_id);

CREATE INDEX IF NOT EXISTS idx_paas_security_events_api_key_id 
  ON paas_security_events(api_key_id);

CREATE INDEX IF NOT EXISTS idx_paas_security_events_manual_override_by 
  ON paas_security_events(manual_override_by);

CREATE INDEX IF NOT EXISTS idx_paas_transactions_api_key_id 
  ON paas_transactions(api_key_id);

-- ================================================
-- SECTION 2: Fix Critical RLS Policy Security Issues
-- ================================================

-- Fix external_api_keys policies that allow unrestricted access
DROP POLICY IF EXISTS "Authenticated users can delete API keys" ON external_api_keys;
DROP POLICY IF EXISTS "Authenticated users can update API keys" ON external_api_keys;

-- Create secure policies that check ownership
CREATE POLICY "Users can delete own API keys"
  ON external_api_keys
  FOR DELETE
  TO authenticated
  USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Users can update own API keys"
  ON external_api_keys
  FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

-- Fix external_api_usage policy
DROP POLICY IF EXISTS "Service role can insert usage records" ON external_api_usage;

-- Create proper policy for usage records (only allow insertion with valid API key)
CREATE POLICY "System can insert usage records for valid keys"
  ON external_api_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM external_api_keys 
      WHERE external_api_keys.id = external_api_usage.api_key_id
      AND external_api_keys.is_active = true
    )
  );

-- ================================================
-- SECTION 3: Optimize RLS Policies with Subqueries
-- ================================================

-- external_api_keys
DROP POLICY IF EXISTS "Authenticated users can create API keys" ON external_api_keys;
CREATE POLICY "Authenticated users can create API keys"
  ON external_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

-- paas_developers
DROP POLICY IF EXISTS "Users can create own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Developers can view own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Developers can update own account" ON paas_developers;

CREATE POLICY "Users can create own developer account"
  ON paas_developers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Developers can view own developer account"
  ON paas_developers
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Developers can update own account"
  ON paas_developers
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- paas_api_keys
DROP POLICY IF EXISTS "Developers can view own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can create own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can update own API keys" ON paas_api_keys;

CREATE POLICY "Developers can view own API keys"
  ON paas_api_keys
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

CREATE POLICY "Developers can create own API keys"
  ON paas_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (developer_id = (SELECT auth.uid()));

CREATE POLICY "Developers can update own API keys"
  ON paas_api_keys
  FOR UPDATE
  TO authenticated
  USING (developer_id = (SELECT auth.uid()))
  WITH CHECK (developer_id = (SELECT auth.uid()));

-- paas_point_accounts
DROP POLICY IF EXISTS "Developers can view own point account" ON paas_point_accounts;

CREATE POLICY "Developers can view own point account"
  ON paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- paas_point_grants
DROP POLICY IF EXISTS "Developers can view own grants" ON paas_point_grants;

CREATE POLICY "Developers can view own grants"
  ON paas_point_grants
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- paas_transactions
DROP POLICY IF EXISTS "Developers can view own transactions" ON paas_transactions;

CREATE POLICY "Developers can view own transactions"
  ON paas_transactions
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- paas_api_logs
DROP POLICY IF EXISTS "Developers can view own API logs" ON paas_api_logs;

CREATE POLICY "Developers can view own API logs"
  ON paas_api_logs
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- paas_security_events
DROP POLICY IF EXISTS "Developers can view own security events" ON paas_security_events;

CREATE POLICY "Developers can view own security events"
  ON paas_security_events
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- paas_rate_limits
DROP POLICY IF EXISTS "Developers can view own rate limits" ON paas_rate_limits;

CREATE POLICY "Developers can view own rate limits"
  ON paas_rate_limits
  FOR SELECT
  TO authenticated
  USING (developer_id = (SELECT auth.uid()));

-- ================================================
-- SECTION 4: Fix Function Search Paths
-- ================================================

-- Fix update_point_balance function
CREATE OR REPLACE FUNCTION update_point_balance()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE paas_point_accounts
    SET 
      balance_points = balance_points + NEW.amount_points,
      balance_gbp = balance_gbp + NEW.amount_gbp,
      total_earned = CASE WHEN NEW.amount_points > 0 THEN total_earned + NEW.amount_points ELSE total_earned END,
      total_spent = CASE WHEN NEW.amount_points < 0 THEN total_spent + ABS(NEW.amount_points) ELSE total_spent END,
      updated_at = NOW()
    WHERE developer_id = NEW.developer_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix initialize_developer_point_account function
CREATE OR REPLACE FUNCTION initialize_developer_point_account()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO paas_point_accounts (developer_id, balance_points, balance_gbp)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (developer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Fix create_developer_account function
CREATE OR REPLACE FUNCTION create_developer_account()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO paas_developers (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ================================================
-- SECTION 5: Remove Unused Indexes
-- ================================================

-- Remove indexes that have not been used
DROP INDEX IF EXISTS idx_feedback_user_id;
DROP INDEX IF EXISTS idx_feedback_status;
DROP INDEX IF EXISTS idx_feedback_created_at;
DROP INDEX IF EXISTS idx_community_submissions_status;
DROP INDEX IF EXISTS idx_community_submissions_poem_id;
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;
DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP INDEX IF EXISTS idx_poem_tags_tag_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_comments_created_at;
DROP INDEX IF EXISTS idx_bookmarks_poem;
DROP INDEX IF EXISTS idx_bookmarks_user;
DROP INDEX IF EXISTS idx_reading_lists_user;
DROP INDEX IF EXISTS idx_reading_list_items_list;
DROP INDEX IF EXISTS idx_reading_list_items_poem;
DROP INDEX IF EXISTS idx_poem_versions_poem;
DROP INDEX IF EXISTS idx_poem_versions_created;
DROP INDEX IF EXISTS idx_workshops_creator;
DROP INDEX IF EXISTS idx_workshop_members_workshop;
DROP INDEX IF EXISTS idx_workshop_members_user;
DROP INDEX IF EXISTS idx_workshop_submissions_workshop;
DROP INDEX IF EXISTS idx_workshop_submissions_poem;
DROP INDEX IF EXISTS idx_workshop_submissions_user;
DROP INDEX IF EXISTS idx_critiques_submission;
DROP INDEX IF EXISTS idx_critiques_user;
DROP INDEX IF EXISTS idx_collaborative_poems_creator;
DROP INDEX IF EXISTS idx_poem_collaborators_poem;
DROP INDEX IF EXISTS idx_poem_collaborators_user;
DROP INDEX IF EXISTS idx_collaboration_invitations_poem;
DROP INDEX IF EXISTS idx_collaboration_invitations_invitee;
DROP INDEX IF EXISTS idx_collaboration_invitations_inviter_id;
DROP INDEX IF EXISTS idx_prompt_responses_prompt;
DROP INDEX IF EXISTS idx_prompt_responses_user;
DROP INDEX IF EXISTS idx_prompt_responses_poem_id;
DROP INDEX IF EXISTS idx_writing_streaks_user;
DROP INDEX IF EXISTS idx_challenge_participations_challenge;
DROP INDEX IF EXISTS idx_challenge_participations_user;
DROP INDEX IF EXISTS idx_challenge_participations_poem_id;
DROP INDEX IF EXISTS idx_challenges_created_by;
DROP INDEX IF EXISTS idx_poems_favorited;
DROP INDEX IF EXISTS idx_tags_user_id;
DROP INDEX IF EXISTS idx_writing_stats_user_date;
DROP INDEX IF EXISTS idx_logs_created_at;
DROP INDEX IF EXISTS idx_follows_follower;
DROP INDEX IF EXISTS idx_writing_goals_user;
DROP INDEX IF EXISTS idx_writing_goals_dates;
DROP INDEX IF EXISTS idx_contest_entries_contest;
DROP INDEX IF EXISTS idx_contest_entries_user;
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_votes_contest;
DROP INDEX IF EXISTS idx_contest_votes_entry;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_contests_winner_badge;
DROP INDEX IF EXISTS idx_contests_participant_badge;
DROP INDEX IF EXISTS idx_contests_runner_up_badge_id;
DROP INDEX IF EXISTS idx_events_start_time;
DROP INDEX IF EXISTS idx_events_host;
DROP INDEX IF EXISTS idx_events_status;
DROP INDEX IF EXISTS idx_event_attendees_event;
DROP INDEX IF EXISTS idx_event_attendees_user;
DROP INDEX IF EXISTS idx_anthologies_curator;
DROP INDEX IF EXISTS idx_anthologies_published;
DROP INDEX IF EXISTS idx_anthology_submissions_anthology;
DROP INDEX IF EXISTS idx_anthology_submissions_poem;
DROP INDEX IF EXISTS idx_mentorships_mentor;
DROP INDEX IF EXISTS idx_mentorships_mentee;
DROP INDEX IF EXISTS idx_mentorships_status;
DROP INDEX IF EXISTS idx_zines_creator;
DROP INDEX IF EXISTS idx_zines_public;
DROP INDEX IF EXISTS idx_zine_poems_zine;
DROP INDEX IF EXISTS idx_zine_poems_poem;
DROP INDEX IF EXISTS idx_daily_prompts_created_by;
DROP INDEX IF EXISTS idx_user_badges_badge_id;
DROP INDEX IF EXISTS idx_badges_rank;
DROP INDEX IF EXISTS idx_badges_category;
DROP INDEX IF EXISTS idx_ai_conversations_user_id;
DROP INDEX IF EXISTS idx_ai_messages_conversation_id;
DROP INDEX IF EXISTS idx_ai_messages_user_id;
DROP INDEX IF EXISTS idx_store_items_category;
DROP INDEX IF EXISTS idx_user_purchases_item_id;
DROP INDEX IF EXISTS idx_paas_developers_google_id;
DROP INDEX IF EXISTS idx_paas_api_keys_developer;
DROP INDEX IF EXISTS idx_paas_api_keys_hash;
DROP INDEX IF EXISTS idx_paas_transactions_developer;
DROP INDEX IF EXISTS idx_paas_api_logs_developer;
DROP INDEX IF EXISTS idx_paas_api_logs_endpoint;
DROP INDEX IF EXISTS idx_paas_security_events_developer;
DROP INDEX IF EXISTS idx_external_api_keys_key_hash;
DROP INDEX IF EXISTS idx_external_api_keys_is_active;
DROP INDEX IF EXISTS idx_external_api_usage_api_key_id;
DROP INDEX IF EXISTS idx_external_api_usage_created_at;
DROP INDEX IF EXISTS idx_external_api_usage_endpoint;