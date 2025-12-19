/*
  # Add Developer Role Support

  1. Changes
    - Add `is_developer` column to `user_profiles` table
    - Create function to promote users to developer status
    - Add index for faster developer lookups

  2. Security
    - Only developers can promote other users to developer status
*/

-- Add is_developer column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_developer'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_developer boolean DEFAULT false;
  END IF;
END $$;

-- Create index for developer lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_developer 
  ON user_profiles(is_developer) 
  WHERE is_developer = true;

-- Create function to promote user to developer
CREATE OR REPLACE FUNCTION promote_to_developer(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET is_developer = true
  WHERE user_id = target_user_id;
END;
$$;