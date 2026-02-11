/*
  # Add Theme Preference to User Preferences

  1. Changes
    - Add `theme` column to `user_preferences` table to store dark/light mode preference
    - Add `notifications_enabled` column to track notification preferences
    - Update the table to support persistent user settings
  
  2. Security
    - No changes to RLS policies needed as they're already in place
*/

-- Add theme column to user_preferences if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'theme'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
  END IF;
END $$;

-- Add notifications_enabled column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'notifications_enabled'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN notifications_enabled boolean DEFAULT false;
  END IF;
END $$;
