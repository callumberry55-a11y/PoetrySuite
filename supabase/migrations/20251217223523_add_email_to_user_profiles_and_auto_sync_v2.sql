/*
  # Add Email to User Profiles and Auto-Sync

  1. Changes
    - Add `email` column to `user_profiles` table
    - Create trigger to automatically create/update profiles when users sign up
    - Backfill existing users with their email addresses

  2. Security
    - Maintain existing RLS policies
    - Allow authenticated users to view all profiles for chat functionality

  3. Important Notes
    - This enables users to be discoverable in chat by email
    - Profiles are automatically created for all new users
    - Existing users will have profiles created with their emails
*/

-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill existing users
INSERT INTO user_profiles (user_id, email, display_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  updated_at = now();

-- Drop old policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policy to allow authenticated users to view all profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);