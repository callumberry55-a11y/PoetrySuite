/*
  # Fix Infinite Recursion in paas_developers Policy

  ## Problem
  The `should_collect_maintenance_tax` function is marked as SECURITY DEFINER and
  queries the `paas_developers` table. When RLS policies are checked during this
  query, it can cause infinite recursion errors.

  ## Solution
  Update the `should_collect_maintenance_tax` function to bypass RLS when checking
  if a user is a developer. Since the function is already SECURITY DEFINER and
  only checks existence (not returning sensitive data), this is safe.

  ## Security
  - Function remains SECURITY DEFINER with immutable search_path
  - Only checks if user is developer (boolean result)
  - No sensitive data is exposed
*/

-- Drop and recreate the function with RLS bypass for the developer check
DROP FUNCTION IF EXISTS should_collect_maintenance_tax(uuid);

CREATE OR REPLACE FUNCTION should_collect_maintenance_tax(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  last_tax_date timestamptz;
  is_developer boolean;
BEGIN
  -- Check if user is a developer (exempt from maintenance tax)
  -- Use dynamic SQL to bypass RLS and avoid infinite recursion
  EXECUTE format('SELECT EXISTS (SELECT 1 FROM paas_developers WHERE user_id = %L)', user_id_param)
  INTO is_developer;

  IF is_developer THEN
    RETURN false;
  END IF;

  -- Get last maintenance tax date
  SELECT MAX(created_at) INTO last_tax_date
  FROM user_tax_transactions
  WHERE user_id = user_id_param
  AND tax_type = 'maintenance';

  -- If no previous tax or more than 30 days ago, collect tax
  IF last_tax_date IS NULL OR last_tax_date < (now() - interval '30 days') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION should_collect_maintenance_tax(uuid) IS
'Checks if maintenance tax should be collected for a user (developers are exempt). Uses dynamic SQL to bypass RLS and prevent infinite recursion.';
