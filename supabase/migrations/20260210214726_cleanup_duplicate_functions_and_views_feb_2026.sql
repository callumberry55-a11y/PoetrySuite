/*
  # Cleanup Duplicate Functions and Views - February 2026

  ## Summary
  This migration cleans up duplicate function definitions and ensures proper security
  settings for views and functions.

  ## Changes

  ### 1. Drop Old Function Version
  Removes the old `should_collect_maintenance_tax()` function without parameters
  that has insecure settings (no search_path configuration).

  ### 2. Verify View Security
  Ensures the monthly_distributions_summary view is properly created without
  SECURITY DEFINER semantics.

  ## Security Notes
  - The parameterized version of should_collect_maintenance_tax(uuid) with
    proper security settings will remain
  - All views are created with standard security (INVOKER rights)
*/

-- =====================================================
-- Drop Old Insecure Function Version
-- =====================================================

-- Drop the old version without parameters that has no search_path security
DROP FUNCTION IF EXISTS should_collect_maintenance_tax();

-- =====================================================
-- Recreate View to Ensure No Security Definer
-- =====================================================

-- Drop and recreate the view to ensure it has no SECURITY DEFINER
DROP VIEW IF EXISTS monthly_distributions_summary CASCADE;

CREATE OR REPLACE VIEW monthly_distributions_summary AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(month FROM distribution_date) AS month_number,
  EXTRACT(year FROM distribution_date) AS year
FROM monthly_distributions
ORDER BY distribution_date DESC;

-- Grant appropriate permissions
GRANT SELECT ON monthly_distributions_summary TO authenticated;