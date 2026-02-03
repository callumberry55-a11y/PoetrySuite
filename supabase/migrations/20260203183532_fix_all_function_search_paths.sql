/*
  # Fix All Function Search Path Security Issues
  
  ## Security Fix
  Ensures that ALL create_developer_account functions have immutable search_path
  to prevent search path manipulation attacks.
  
  This migration fixes the overloaded version of create_developer_account that
  accepts parameters.
*/

-- Fix the overloaded create_developer_account function with parameters
DROP FUNCTION IF EXISTS create_developer_account(text, text) CASCADE;

CREATE FUNCTION create_developer_account(
  p_organization_name text,
  p_google_developer_id text
)
RETURNS uuid
SECURITY DEFINER
SET search_path TO public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_developer_id uuid;
BEGIN
  INSERT INTO paas_developers (
    google_developer_id,
    email,
    organization_name,
    subscription_status
  )
  VALUES (
    p_google_developer_id,
    current_setting('request.jwt.claims', true)::json->>'email',
    p_organization_name,
    'inactive'
  )
  RETURNING id INTO v_developer_id;
  
  RETURN v_developer_id;
END;
$$;