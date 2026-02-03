/*
  # Remove Duplicate Point Account Trigger

  ## Changes
  Removes the old duplicate trigger and function that were causing
  database errors during user signup.
  
  ## Details
  - Drops trigger_initialize_point_account trigger
  - Drops initialize_developer_point_account function
  - Keeps the newer auto_create_point_account trigger which has all required fields
*/

-- Drop the old duplicate trigger
DROP TRIGGER IF EXISTS trigger_initialize_point_account ON paas_developers;

-- Drop the old function
DROP FUNCTION IF EXISTS initialize_developer_point_account();