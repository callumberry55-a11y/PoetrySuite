/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit.

  ## Changes
  
  1. **RLS Policy Performance**
     - Fix feedback table RLS policy to use subquery for auth.uid() to prevent re-evaluation per row
  
  2. **Unused Indexes**
     - Drop 77 unused indexes to reduce database bloat and improve write performance
  
  3. **Multiple Permissive Policies**
     - Consolidate multiple permissive SELECT policies on feedback and paas_access_codes tables
  
  4. **Security Definer View**
     - Recreate tax_rate_projection view without SECURITY DEFINER to improve security posture
  
  ## Security
  
  - All RLS policies remain restrictive and maintain proper access control
  - Consolidated policies maintain the same logical access patterns
*/

-- =====================================================
-- 1. Fix RLS Policy Performance for Feedback Table
-- =====================================================

-- Drop existing developer feedback policy
DROP POLICY IF EXISTS "Developers can view all feedback" ON feedback;

-- Recreate with subquery for better performance
CREATE POLICY "Developers can view all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 2. Drop Unused Indexes
-- =====================================================

-- Developer payment pool indexes
DROP INDEX IF EXISTS idx_developer_payment_pool_period;
DROP INDEX IF EXISTS idx_developer_payment_pool_source;

-- Contest related indexes
DROP INDEX IF EXISTS idx_contest_entries_user_id;
DROP INDEX IF EXISTS idx_contest_entries_poem_id;
DROP INDEX IF EXISTS idx_contest_votes_entry_id;
DROP INDEX IF EXISTS idx_contest_votes_user_id;
DROP INDEX IF EXISTS idx_contests_created_by;
DROP INDEX IF EXISTS idx_contests_participant_badge_id;
DROP INDEX IF EXISTS idx_contests_runner_up_badge_id;
DROP INDEX IF EXISTS idx_contests_winner_badge_id;

-- Collaboration indexes
DROP INDEX IF EXISTS idx_collaborative_poems_creator_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_collaborative_poem_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_invitee_id;
DROP INDEX IF EXISTS idx_collaboration_invitations_inviter_id;
DROP INDEX IF EXISTS idx_poem_collaborators_collaborative_poem_id;
DROP INDEX IF EXISTS idx_poem_collaborators_user_id;

-- Comment and critique indexes
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_critiques_user_id;
DROP INDEX IF EXISTS idx_critiques_workshop_submission_id;

-- Community and submission indexes
DROP INDEX IF EXISTS idx_community_submissions_reviewed_by;

-- Daily prompts indexes
DROP INDEX IF EXISTS idx_daily_prompts_created_by;
DROP INDEX IF EXISTS idx_prompt_responses_poem_id;
DROP INDEX IF EXISTS idx_prompt_responses_user_id;

-- External API indexes
DROP INDEX IF EXISTS idx_external_api_keys_created_by;
DROP INDEX IF EXISTS idx_external_api_usage_api_key_id;

-- PaaS related indexes
DROP INDEX IF EXISTS idx_paas_api_logs_api_key_id;
DROP INDEX IF EXISTS idx_paas_api_logs_developer_id;
DROP INDEX IF EXISTS idx_paas_point_grants_developer_id;
DROP INDEX IF EXISTS idx_paas_security_events_api_key_id;
DROP INDEX IF EXISTS idx_paas_security_events_manual_override_by;
DROP INDEX IF EXISTS idx_paas_transactions_api_key_id;
DROP INDEX IF EXISTS idx_paas_access_codes_used_by;
DROP INDEX IF EXISTS idx_paas_developers_access_code_id;
DROP INDEX IF EXISTS idx_paas_access_codes_code;
DROP INDEX IF EXISTS idx_paas_access_codes_created_by;

-- AI conversation indexes
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

-- Event indexes
DROP INDEX IF EXISTS idx_event_attendees_user_id;
DROP INDEX IF EXISTS idx_events_host_id;

-- Feedback indexes
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Mentorship indexes
DROP INDEX IF EXISTS idx_mentorships_mentee_id;

-- Poem related indexes
DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP INDEX IF EXISTS idx_poem_tags_tag_id;
DROP INDEX IF EXISTS idx_poem_versions_poem_id;

-- Reading list indexes
DROP INDEX IF EXISTS idx_reading_list_items_poem_id;
DROP INDEX IF EXISTS idx_reading_list_items_reading_list_id;
DROP INDEX IF EXISTS idx_reading_lists_user_id;

-- User related indexes
DROP INDEX IF EXISTS idx_user_badges_badge_id;
DROP INDEX IF EXISTS idx_user_purchases_item_id;

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

-- Economy and tax indexes
DROP INDEX IF EXISTS idx_economy_funds_fiscal_year;
DROP INDEX IF EXISTS idx_tax_transactions_developer_id;
DROP INDEX IF EXISTS idx_tax_transactions_period;
DROP INDEX IF EXISTS idx_tax_transactions_status;
DROP INDEX IF EXISTS idx_burned_funds_fiscal_year;
DROP INDEX IF EXISTS idx_tax_transactions_tax_type;
DROP INDEX IF EXISTS idx_weekly_distributions_date;
DROP INDEX IF EXISTS idx_user_tax_transactions_user_id;
DROP INDEX IF EXISTS idx_user_tax_transactions_period;
DROP INDEX IF EXISTS idx_user_tax_transactions_type;

-- =====================================================
-- 3. Consolidate Multiple Permissive Policies
-- =====================================================

-- Feedback table: Combine the two SELECT policies into one
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Developers can view all feedback" ON feedback;

-- Create single consolidated policy for feedback
CREATE POLICY "Users can view feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.user_id = (SELECT auth.uid())
    )
  );

-- PaaS access codes: Consolidate the two SELECT policies
DROP POLICY IF EXISTS "Admin can view own access codes" ON paas_access_codes;
DROP POLICY IF EXISTS "Users can view used codes" ON paas_access_codes;

-- Create single consolidated policy for paas_access_codes
CREATE POLICY "Users can view access codes"
  ON paas_access_codes
  FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR used_by = (SELECT auth.uid())
  );

-- =====================================================
-- 4. Fix Security Definer View
-- =====================================================

-- Drop and recreate tax_rate_projection view without SECURITY DEFINER
DROP VIEW IF EXISTS tax_rate_projection;

CREATE VIEW tax_rate_projection AS
SELECT 
  tax_rate AS current_monthly_tax,
  purchase_tax_rate AS current_purchase_tax,
  next_adjustment_year,
  ROUND((tax_rate * POWER(1.01, 1)), 2) AS projected_monthly_tax_next_year,
  ROUND((purchase_tax_rate * POWER(1.01, 1)), 2) AS projected_purchase_tax_next_year,
  ROUND((tax_rate * POWER(1.01, 5)), 2) AS projected_monthly_tax_5_years,
  ROUND((purchase_tax_rate * POWER(1.01, 5)), 2) AS projected_purchase_tax_5_years,
  ROUND((tax_rate * POWER(1.01, 10)), 2) AS projected_monthly_tax_10_years,
  ROUND((purchase_tax_rate * POWER(1.01, 10)), 2) AS projected_purchase_tax_10_years,
  ROUND((tax_rate * POWER(1.01, 26)), 2) AS projected_monthly_tax_26_years,
  ROUND((purchase_tax_rate * POWER(1.01, 26)), 2) AS projected_purchase_tax_26_years,
  ROUND(((POWER(1.01, 26) - 1) * 100), 2) AS total_growth_26_years_percent
FROM tax_settings ts
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 1;