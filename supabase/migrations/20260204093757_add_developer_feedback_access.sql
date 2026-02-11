/*
  # Add Developer Access to Feedback

  This migration enables developers to view all user feedback in their dashboard.

  ## Changes
  
  1. **RLS Policy**
     - Add policy allowing developers to view all feedback submissions
     - Checks if the user has a developer account in `paas_developers` table
  
  ## Security
  
  - Only users with a developer profile can access all feedback
  - Regular users continue to only see their own feedback
*/

-- Create policy for developers to view all feedback
CREATE POLICY "Developers can view all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.user_id = auth.uid()
    )
  );