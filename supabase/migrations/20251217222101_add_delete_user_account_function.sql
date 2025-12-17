/*
  # Add User Account Deletion Function

  1. Function
    - `delete_user_account()` - Securely deletes all user data and the user account
  
  2. What Gets Deleted
    - User's poems
    - User's collections
    - User's comments
    - User's reactions
    - User's community submissions
    - User's analytics data
    - User's profile information
    - User's auth account
  
  3. Security
    - Function can only be called by authenticated users
    - Each user can only delete their own account
    - All deletions happen in a single transaction for data consistency
  
  4. Important Notes
    - This operation is irreversible
    - All related data is permanently deleted
    - Foreign key constraints handle cascading deletes where configured
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS delete_user_account();

-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's community submissions (if table exists)
  DELETE FROM community_submissions WHERE user_id = current_user_id;

  -- Delete user's reactions
  DELETE FROM poem_reactions WHERE user_id = current_user_id;

  -- Delete user's comments
  DELETE FROM poem_comments WHERE user_id = current_user_id;

  -- Delete user's collections
  DELETE FROM poem_collections WHERE user_id = current_user_id;

  -- Delete user's poems
  DELETE FROM poems WHERE user_id = current_user_id;

  -- Delete user's analytics data
  DELETE FROM user_analytics WHERE user_id = current_user_id;

  -- Delete user's profile
  DELETE FROM user_profiles WHERE id = current_user_id;

  -- Delete the auth user (this will sign them out)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;