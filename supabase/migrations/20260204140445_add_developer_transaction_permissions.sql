/*
  # Add Developer Transaction Logging Permissions

  1. Changes
    - Allow developers to create transaction records for audit logging
    - Enables proper audit trail for manual point grants

  2. Security
    - Only authenticated developers can create transactions
    - Maintains complete audit trail for all point distributions

  3. Notes
    - Required for admin panel to log point grant transactions
    - Ensures accountability and transparency
*/

-- Allow developers to create transaction records for audit logging
CREATE POLICY "Developers can create transaction records"
  ON paas_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );