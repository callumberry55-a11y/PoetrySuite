/*
  # Add User Profiles UPDATE and INSERT Policies
  
  1. Changes
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile
  
  2. Security
    - Users can only modify their own profile data
    - Policies enforce user_id matches authenticated user
*/

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());