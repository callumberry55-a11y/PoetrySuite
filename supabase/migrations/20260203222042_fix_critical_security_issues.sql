/*
  # Fix Critical Security and Performance Issues

  1. **Missing Index**
    - Add index for `paas_access_codes.created_by` foreign key

  2. **Auth RLS Performance Optimization**
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row
    - Applies to: paas_developers, paas_api_keys, paas_point_accounts, paas_point_grants,
      paas_transactions, paas_api_logs, paas_security_events, paas_rate_limits,
      tax_transactions, user_tax_transactions

  3. **Missing RLS Policies**
    - Add RLS policies for `paas_access_codes` table

  4. **Security Notes**
    - Unused indexes are preserved (may be needed for future queries)
    - Security definer views are intentional for controlled access
*/

-- =====================================================
-- 1. Add Missing Foreign Key Index
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_paas_access_codes_created_by 
ON paas_access_codes(created_by);

-- =====================================================
-- 2. Fix Auth RLS Performance Issues
-- =====================================================

-- paas_developers table
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

-- paas_api_keys table
DROP POLICY IF EXISTS "Developers can view own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can create own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can update own API keys" ON paas_api_keys;

CREATE POLICY "Developers can view own API keys"
  ON paas_api_keys FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can create own API keys"
  ON paas_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Developers can update own API keys"
  ON paas_api_keys FOR UPDATE
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_point_accounts table
DROP POLICY IF EXISTS "Developers can view own point account" ON paas_point_accounts;

CREATE POLICY "Developers can view own point account"
  ON paas_point_accounts FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_point_grants table
DROP POLICY IF EXISTS "Developers can view own grants" ON paas_point_grants;

CREATE POLICY "Developers can view own grants"
  ON paas_point_grants FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_transactions table
DROP POLICY IF EXISTS "Developers can view own transactions" ON paas_transactions;

CREATE POLICY "Developers can view own transactions"
  ON paas_transactions FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_api_logs table
DROP POLICY IF EXISTS "Developers can view own API logs" ON paas_api_logs;

CREATE POLICY "Developers can view own API logs"
  ON paas_api_logs FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_security_events table
DROP POLICY IF EXISTS "Developers can view own security events" ON paas_security_events;

CREATE POLICY "Developers can view own security events"
  ON paas_security_events FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- paas_rate_limits table
DROP POLICY IF EXISTS "Developers can view own rate limits" ON paas_rate_limits;

CREATE POLICY "Developers can view own rate limits"
  ON paas_rate_limits FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- tax_transactions table
DROP POLICY IF EXISTS "Developers can view own tax transactions" ON tax_transactions;

CREATE POLICY "Developers can view own tax transactions"
  ON tax_transactions FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = (select auth.uid())
    )
  );

-- user_tax_transactions table
DROP POLICY IF EXISTS "Users can view own tax transactions" ON user_tax_transactions;

CREATE POLICY "Users can view own tax transactions"
  ON user_tax_transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 3. Add RLS Policies for paas_access_codes
-- =====================================================

-- Admin can view all access codes
CREATE POLICY "Admin can view all access codes"
  ON paas_access_codes FOR SELECT
  TO authenticated
  USING (
    created_by = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = (select auth.uid()) 
      AND is_editor = true
    )
  );

-- Admin can create access codes
CREATE POLICY "Admin can create access codes"
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

-- Admin can update access codes
CREATE POLICY "Admin can update access codes"
  ON paas_access_codes FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = (select auth.uid()) 
      AND is_editor = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = (select auth.uid()) 
      AND is_editor = true
    )
  );

-- Users can view codes they've used
CREATE POLICY "Users can view codes they've used"
  ON paas_access_codes FOR SELECT
  TO authenticated
  USING (used_by = (select auth.uid()));
