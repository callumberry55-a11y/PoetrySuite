/*
  # Fix PaaS Related Tables RLS Policies

  ## Changes
  Updates RLS policies for paas_point_accounts, paas_api_keys, and paas_transactions
  to correctly check against the developer's user_id through a join.
  
  ## Security
  - Developers can only access their own data
  - Policies use EXISTS to check user_id in paas_developers table
*/

-- Fix paas_point_accounts policies
DROP POLICY IF EXISTS "Developers can view own point account" ON paas_point_accounts;

CREATE POLICY "Developers can view own point account"
  ON paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_point_accounts.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

-- Fix paas_api_keys policies
DROP POLICY IF EXISTS "Developers can create own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can view own API keys" ON paas_api_keys;
DROP POLICY IF EXISTS "Developers can update own API keys" ON paas_api_keys;

CREATE POLICY "Developers can create own API keys"
  ON paas_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_api_keys.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can view own API keys"
  ON paas_api_keys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_api_keys.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can update own API keys"
  ON paas_api_keys
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_api_keys.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_api_keys.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

-- Fix paas_transactions policies
DROP POLICY IF EXISTS "Developers can view own transactions" ON paas_transactions;

CREATE POLICY "Developers can view own transactions"
  ON paas_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_transactions.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );