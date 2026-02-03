/*
  # Fix PaaS Developers RLS Policies

  ## Changes
  Updates RLS policies for paas_developers table to correctly use user_id
  instead of id for authentication checks.
  
  ## Security
  - Developers can only view/update their own accounts
  - Uses user_id which links to auth.users.id
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Developers can view own developer account" ON paas_developers;
DROP POLICY IF EXISTS "Developers can update own account" ON paas_developers;

-- Create corrected policies using user_id
CREATE POLICY "Users can create own developer account"
  ON paas_developers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Developers can view own developer account"
  ON paas_developers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Developers can update own account"
  ON paas_developers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());