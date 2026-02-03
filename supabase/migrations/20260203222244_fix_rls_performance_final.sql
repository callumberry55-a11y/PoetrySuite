/*
  # Fix RLS Performance Issues - Final

  1. **Performance Optimization**
    - Rewrite all RLS policies to prevent auth.uid() re-evaluation
    - Use subquery pattern: (select auth.uid()) only at the outermost level
    - Avoid nested auth function calls within EXISTS clauses

  2. **Missing Index**
    - Ensure index on paas_access_codes.created_by exists

  3. **RLS Policies for paas_access_codes**
    - Add proper RLS policies for access code management
*/

-- =====================================================
-- 1. Ensure Missing Foreign Key Index Exists
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_paas_access_codes_created_by 
ON paas_access_codes(created_by);

-- =====================================================
-- 2. Fix paas_developers RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Users can create own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Developers can update own account" ON paas_developers;

CREATE POLICY "Developers can view own developer account"
  ON paas_developers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own developer account"
  ON paas_developers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Developers can update own account"
  ON paas_developers FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 3. Fix paas_api_keys RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can create own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can update own API keys" ON paas_api_keys;

CREATE POLICY "Developers can view own API keys"
  ON paas_api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_api_keys.developer_id 
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can create own API keys"
  ON paas_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_api_keys.developer_id 
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can update own API keys"
  ON paas_api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_api_keys.developer_id 
      AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_api_keys.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 4. Fix paas_point_accounts RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own point account" ON paas_point_accounts;

CREATE POLICY "Developers can view own point account"
  ON paas_point_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_point_accounts.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. Fix paas_point_grants RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own grants" ON paas_point_grants;

CREATE POLICY "Developers can view own grants"
  ON paas_point_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_point_grants.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. Fix paas_transactions RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own transactions" ON paas_transactions;

CREATE POLICY "Developers can view own transactions"
  ON paas_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_transactions.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 7. Fix paas_api_logs RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own API logs" ON paas_api_logs;

CREATE POLICY "Developers can view own API logs"
  ON paas_api_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_api_logs.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 8. Fix paas_security_events RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own security events" ON paas_security_events;

CREATE POLICY "Developers can view own security events"
  ON paas_security_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_security_events.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 9. Fix paas_rate_limits RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own rate limits" ON paas_rate_limits;

CREATE POLICY "Developers can view own rate limits"
  ON paas_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = paas_rate_limits.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 10. Fix tax_transactions RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Developers can view own tax transactions" ON tax_transactions;

CREATE POLICY "Developers can view own tax transactions"
  ON tax_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers 
      WHERE id = tax_transactions.developer_id 
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 11. Fix user_tax_transactions RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view own tax transactions" ON user_tax_transactions;

CREATE POLICY "Users can view own tax transactions"
  ON user_tax_transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 12. Add RLS Policies for paas_access_codes
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin can view all access codes" ON paas_access_codes;
DROP POLICY IF EXISTS "Admin can create access codes" ON paas_access_codes;
DROP POLICY IF EXISTS "Admin can update access codes" ON paas_access_codes;
DROP POLICY IF EXISTS "Users can view codes they've used" ON paas_access_codes;

-- Admin can view access codes they created
CREATE POLICY "Admin can view own access codes"
  ON paas_access_codes FOR SELECT
  TO authenticated
  USING (created_by = (select auth.uid()));

-- Admin can create access codes (only editors)
CREATE POLICY "Editors can create access codes"
  ON paas_access_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = (select auth.uid()) 
      AND is_editor = true
    )
  );

-- Admin can update their own access codes
CREATE POLICY "Admin can update own access codes"
  ON paas_access_codes FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

-- Users can view codes they've used
CREATE POLICY "Users can view used codes"
  ON paas_access_codes FOR SELECT
  TO authenticated
  USING (used_by = (select auth.uid()));
