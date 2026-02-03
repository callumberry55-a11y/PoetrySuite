/*
  # Fix Function Search Path Security
  
  ## Security Fix
  Ensures that the create_developer_account function has an immutable search_path
  to prevent search path manipulation attacks.
  
  The function is recreated with:
  - SECURITY DEFINER (runs with creator privileges)
  - SET search_path = public, pg_temp (explicit, immutable path)
  
  This prevents malicious users from manipulating the search_path to hijack
  function behavior.
*/

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS create_developer_account() CASCADE;

CREATE FUNCTION create_developer_account()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path TO public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO paas_developers (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger if it was dropped
DROP TRIGGER IF EXISTS on_auth_user_created_create_developer ON auth.users;

CREATE TRIGGER on_auth_user_created_create_developer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_developer_account();