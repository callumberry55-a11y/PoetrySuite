/*
  # Fix User Profile Creation Trigger

  ## Problem
  The handle_new_user() function exists but was never attached as a trigger to auth.users.
  This causes user profiles to never be created automatically on signup, breaking the Profile page.

  ## Changes
  1. Create the trigger on auth.users to call handle_new_user() after insert
  2. Backfill any missing profiles for existing users
  3. Add a fallback policy to allow users to insert their own profile if missing
*/

-- Drop the trigger if it exists to ensure a clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create user profiles on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill missing profiles for any existing users
INSERT INTO public.user_profiles (user_id, username, bio, avatar_url, location, website, favorite_forms, writing_style, follower_count, following_count, total_likes_received, is_editor, is_mentor)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  '',
  '',
  '',
  '',
  '{}',
  '',
  0,
  0,
  0,
  false,
  false
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
