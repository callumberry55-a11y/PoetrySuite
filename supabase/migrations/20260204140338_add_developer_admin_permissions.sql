/*
  # Add Developer Admin Permissions for Point Management

  1. Changes
    - Add RLS policy allowing developers to update user_profiles
    - Developers can grant points to users through the admin panel
    - Add RLS policy allowing developers to view paas_developers table

  2. Security
    - Only verified developers in paas_developers table can update user profiles
    - Maintains audit trail through existing logging
    - Users can still only update their own profiles normally

  3. Notes
    - This enables the manual point distribution feature in the developer dashboard
    - Developers must have an active account in paas_developers table
*/

-- Allow developers to update user profiles for point management
CREATE POLICY "Developers can update user profiles for point grants"
  ON user_profiles
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

-- Allow developers to search paas_developers table
CREATE POLICY "Developers can view all developer accounts"
  ON paas_developers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );

-- Create index for better performance on developer lookups
CREATE INDEX IF NOT EXISTS idx_paas_developers_user_id
  ON paas_developers(user_id);