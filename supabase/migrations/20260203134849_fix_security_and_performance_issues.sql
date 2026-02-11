/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Indexes
  - Add missing index for `contests.runner_up_badge_id` foreign key
  - Remove duplicate index `idx_user_badges_user` (keeping `idx_user_badges_user_id`)

  ### 2. RLS Performance Optimization
  Optimize RLS policies to use `(select auth.uid())` instead of `auth.uid()` for better performance:
  - `ai_conversations`: 4 policies
  - `ai_messages`: 4 policies
  - `user_purchases`: 3 policies

  ### 3. Multiple Permissive Policies
  - Merge overlapping SELECT policies on `poems` table

  ### 4. Function Search Path
  - Fix search_path for functions: `handle_point_transaction`, `purchase_store_item`, `award_badge_points`
*/

-- ============================================================================
-- 1. ADD MISSING INDEX
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contests_runner_up_badge_id 
ON contests(runner_up_badge_id);

-- ============================================================================
-- 2. REMOVE DUPLICATE INDEX
-- ============================================================================

DROP INDEX IF EXISTS idx_user_badges_user;

-- ============================================================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES ON POEMS
-- ============================================================================

-- Drop the overlapping policies
DROP POLICY IF EXISTS "Public poems are viewable by all authenticated users" ON poems;
DROP POLICY IF EXISTS "Users can view own poems" ON poems;

-- Create a single combined policy
CREATE POLICY "Users can view poems"
  ON poems FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR is_public = true
  );

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - AI_CONVERSATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_conversations;
CREATE POLICY "Users can insert own conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversations" ON ai_conversations;
CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - AI_MESSAGES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own messages" ON ai_messages;
CREATE POLICY "Users can view own messages"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own messages" ON ai_messages;
CREATE POLICY "Users can insert own messages"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own messages" ON ai_messages;
CREATE POLICY "Users can update own messages"
  ON ai_messages FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own messages" ON ai_messages;
CREATE POLICY "Users can delete own messages"
  ON ai_messages FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES - USER_PURCHASES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own purchases" ON user_purchases;
CREATE POLICY "Users can create own purchases"
  ON user_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own purchases" ON user_purchases;
CREATE POLICY "Users can update own purchases"
  ON user_purchases FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 7. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix handle_point_transaction function
CREATE OR REPLACE FUNCTION handle_point_transaction(
  p_user_id uuid, 
  p_amount integer, 
  p_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_type = 'add' THEN
    UPDATE user_profiles
    SET 
      points_balance = points_balance + p_amount,
      points_earned_total = points_earned_total + p_amount
    WHERE user_id = p_user_id;
  ELSIF p_type = 'subtract' THEN
    UPDATE user_profiles
    SET points_balance = points_balance - p_amount
    WHERE user_id = p_user_id
    AND points_balance >= p_amount;

    IF NOT FOUND THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- Fix purchase_store_item function
CREATE OR REPLACE FUNCTION purchase_store_item(
  p_user_id uuid, 
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_price integer;
  v_user_balance integer;
  v_item_stock integer;
  v_purchase_id uuid;
BEGIN
  SELECT price, stock INTO v_item_price, v_item_stock
  FROM store_items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or not active');
  END IF;

  IF v_item_stock = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item out of stock');
  END IF;

  SELECT points_balance INTO v_user_balance
  FROM user_profiles
  WHERE user_id = p_user_id;

  IF v_user_balance < v_item_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  UPDATE user_profiles
  SET points_balance = points_balance - v_item_price
  WHERE user_id = p_user_id;

  IF v_item_stock > 0 THEN
    UPDATE store_items
    SET stock = stock - 1
    WHERE id = p_item_id;
  END IF;

  INSERT INTO user_purchases (user_id, item_id, price_paid)
  VALUES (p_user_id, p_item_id, v_item_price)
  RETURNING id INTO v_purchase_id;

  RETURN jsonb_build_object('success', true, 'purchase_id', v_purchase_id);
END;
$$;

-- Fix award_badge_points function
CREATE OR REPLACE FUNCTION award_badge_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_points integer;
BEGIN
  SELECT points INTO v_badge_points
  FROM badges
  WHERE id = NEW.badge_id;

  UPDATE user_profiles
  SET 
    points_balance = COALESCE(points_balance, 0) + v_badge_points,
    points_earned_total = COALESCE(points_earned_total, 0) + v_badge_points
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;