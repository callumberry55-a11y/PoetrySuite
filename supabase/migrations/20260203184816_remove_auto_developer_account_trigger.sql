/*
  # Remove Automatic Developer Account Creation Trigger

  ## Changes
  Removes the automatic developer account creation trigger that was
  causing conflicts during user signup.
  
  ## Details
  - Drops the on_auth_user_created_create_developer trigger
  - Drops the create_developer_account() trigger function
  - Keeps the create_developer_account(p_organization_name, p_google_developer_id) function
  - Developer accounts are now only created explicitly through the signup flow
  
  ## Reasoning
  The automatic trigger was:
  1. Using the wrong column (id instead of user_id)
  2. Creating developer accounts for ALL users, not just developers
  3. Not including required fields like organization_name
  4. Conflicting with our explicit signup flow in PaaSAuth component
*/

-- Drop the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_create_developer ON auth.users;

-- Drop the parameterless trigger function (keep the one with parameters)
DROP FUNCTION IF EXISTS create_developer_account() CASCADE;