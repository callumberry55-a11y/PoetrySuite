/*
  # Add Phone Number to User Profiles

  1. Changes
    - Add `phone` column to `user_profiles` table to store user phone numbers

  2. Security
    - Phone numbers are personal information protected by existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;
END $$;