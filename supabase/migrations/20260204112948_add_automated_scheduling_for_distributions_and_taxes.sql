/*
  # Add Automated Scheduling for Distributions and Taxes
  
  1. Extension
    - Enable pg_cron extension for automated job scheduling
    
  2. Scheduled Jobs
    - Daily distribution: Runs at 00:00 UTC every day
    - Grant funding: Runs at 00:00 UTC on the 1st of every month
    - Tax collection: Runs at 00:00 UTC on the 2nd of every month
    
  3. Job Details
    - `distribute_daily_points`: Distributes 20 points to all users daily
    - `process_monthly_grant_funding`: Placeholder for grant distribution
    - `calculate_monthly_taxes_users`: Collects 10% tax from users with positive balances
    
  4. Security
    - All cron jobs run with proper security definer functions
    - Jobs are idempotent (can be run multiple times safely)
*/

-- =====================================================
-- 1. Enable pg_cron Extension
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- =====================================================
-- 2. Create Placeholder Function for Grant Funding
-- =====================================================

CREATE OR REPLACE FUNCTION process_monthly_grant_funding()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder function for monthly grant funding
  -- This should be implemented with actual grant distribution logic
  
  RAISE NOTICE 'Grant funding scheduled for 1st of month - function to be implemented';
  
  RETURN json_build_object(
    'success', true,
    'message', 'Grant funding function placeholder executed',
    'date', CURRENT_DATE
  );
END;
$$;

-- =====================================================
-- 3. Schedule Daily Point Distribution
-- =====================================================
-- Runs at 00:00 UTC every day
-- Distributes 20 points to all users

SELECT cron.schedule(
  'daily-point-distribution',
  '0 0 * * *',
  $$SELECT distribute_daily_points()$$
);

-- =====================================================
-- 4. Schedule Grant Funding (1st of Month)
-- =====================================================
-- Runs at 00:00 UTC on the 1st of every month

SELECT cron.schedule(
  'monthly-grant-funding',
  '0 0 1 * *',
  $$SELECT process_monthly_grant_funding()$$
);

-- =====================================================
-- 5. Schedule Tax Collection (2nd of Month)
-- =====================================================
-- Runs at 00:00 UTC on the 2nd of every month
-- Collects taxes from all users with positive balances

SELECT cron.schedule(
  'monthly-tax-collection',
  '0 0 2 * *',
  $$SELECT calculate_monthly_taxes_users()$$
);

-- =====================================================
-- 6. Grant Permissions
-- =====================================================
-- Allow authenticated users to view cron jobs (read-only)

GRANT SELECT ON cron.job TO authenticated;

-- =====================================================
-- 7. Add Comments for Documentation
-- =====================================================

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for automated point distribution and tax collection';

COMMENT ON FUNCTION process_monthly_grant_funding() IS 
'Placeholder function for monthly grant funding on the 1st of every month';

COMMENT ON FUNCTION distribute_daily_points() IS 
'Distributes 20 points daily to all users at 00:00 UTC';

COMMENT ON FUNCTION calculate_monthly_taxes_users() IS 
'Collects 10% monthly tax from users with positive balances on the 2nd of every month';
