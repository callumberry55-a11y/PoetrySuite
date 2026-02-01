/*
  # Fix Security Issues - Indexes and RLS Optimization

  1. Indexes
    - Add missing indexes for foreign keys to improve query performance
    - This prevents full table scans when joining or filtering by foreign keys
  
  2. RLS Policy Optimization
    - Optimize auth function calls in RLS policies using SELECT wrapper
    - This prevents re-evaluation of auth.uid() for each row
  
  3. Policy Consolidation
    - Remove duplicate/overlapping policies to simplify security model
    - Ensures clearer permission logic

  ## Changes

  ### Add Missing Foreign Key Indexes
*/

-- Challenge participations
CREATE INDEX IF NOT EXISTS idx_challenge_participations_poem_id 
  ON challenge_participations(poem_id);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_created_by 
  ON challenges(created_by);

-- Collaboration invitations
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_inviter_id 
  ON collaboration_invitations(inviter_id);

-- Contest entries
CREATE INDEX IF NOT EXISTS idx_contest_entries_poem_id 
  ON contest_entries(poem_id);

-- Contest votes
CREATE INDEX IF NOT EXISTS idx_contest_votes_user_id 
  ON contest_votes(user_id);

-- Contests
CREATE INDEX IF NOT EXISTS idx_contests_created_by 
  ON contests(created_by);

-- Daily prompts
CREATE INDEX IF NOT EXISTS idx_daily_prompts_created_by 
  ON daily_prompts(created_by);

-- Prompt responses
CREATE INDEX IF NOT EXISTS idx_prompt_responses_poem_id 
  ON prompt_responses(poem_id);

-- User badges
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id 
  ON user_badges(badge_id);

/*
  ### Optimize RLS Policies for user_profiles
  
  Drop and recreate policies with optimized auth.uid() calls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate with optimized auth calls
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

/*
  ### Consolidate Duplicate Policies
  
  Remove overlapping policies and keep the most specific ones
*/

-- For poems table, keep both policies as they serve different purposes:
-- 1. Users viewing their own poems (including drafts)
-- 2. Users viewing public poems from others

-- For user_profiles, remove duplicate SELECT policies
DROP POLICY IF EXISTS "Allow individual read access" ON user_profiles;

-- Keep "Public profiles are viewable by authenticated users" as it's more comprehensive

-- For user_profiles UPDATE, remove the redundant policies
DROP POLICY IF EXISTS "Allow individual write access" ON user_profiles;
DROP POLICY IF EXISTS "Allow developers to update profiles" ON user_profiles;

-- Keep "Users can update own profile" as it's the correct one