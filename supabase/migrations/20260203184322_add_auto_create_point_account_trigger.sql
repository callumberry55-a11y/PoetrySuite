/*
  # Auto-create Point Account for New Developers

  ## Changes
  Creates a trigger to automatically create a point account when a new
  developer profile is created.
  
  ## Details
  - Trigger runs after INSERT on paas_developers
  - Creates paas_point_accounts entry with initial balance of 0
  - Ensures every developer has a point account
*/

-- Create function to auto-create point account
CREATE OR REPLACE FUNCTION create_point_account_for_developer()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path TO public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO paas_point_accounts (developer_id, balance_points, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (developer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_create_point_account ON paas_developers;

CREATE TRIGGER auto_create_point_account
  AFTER INSERT ON paas_developers
  FOR EACH ROW
  EXECUTE FUNCTION create_point_account_for_developer();