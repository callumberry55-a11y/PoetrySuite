/*
  # Add Developer Permissions for Point Account Management

  1. Changes
    - Allow developers to create point accounts for other developers
    - Allow developers to update point accounts for other developers
    - Enables full admin panel functionality for point distribution

  2. Security
    - Only authenticated developers can create/update point accounts
    - All transactions are still logged in paas_transactions
    - Maintains audit trail

  3. Notes
    - Required for manual point distribution to developers
    - Works with existing developer authentication
*/

-- Allow developers to create point accounts for other developers
CREATE POLICY "Developers can create point accounts"
  ON paas_point_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );

-- Allow developers to update point accounts for point grants
CREATE POLICY "Developers can update point accounts for grants"
  ON paas_point_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );

-- Allow developers to view all point accounts for admin purposes
CREATE POLICY "Developers can view all point accounts"
  ON paas_point_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );