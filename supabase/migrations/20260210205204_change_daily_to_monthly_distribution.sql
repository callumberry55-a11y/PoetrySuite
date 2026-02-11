/*
  # Change Daily Distribution to Monthly Distribution

  1. Changes
    - Rename daily_distributions table to monthly_distributions
    - Update function to distribute 735 points monthly instead of 20 daily
    - Rename function from distribute_daily_points to distribute_monthly_points
    - Update cron schedule from daily to monthly (1st of every month)
    - Update view to reflect monthly distributions

  2. Details
    - Points per distribution: 20 daily (600/month) → 735 monthly
    - Distribution frequency: Daily → Monthly (1st of month)
    - Total points per month: ~600 → 735

  3. Security
    - Maintains existing RLS policies
    - Ensures one distribution per month maximum
*/

-- Rename the table from daily_distributions to monthly_distributions
ALTER TABLE IF EXISTS daily_distributions RENAME TO monthly_distributions;

-- Update the index name
DROP INDEX IF EXISTS idx_daily_distributions_date;
CREATE INDEX IF NOT EXISTS idx_monthly_distributions_date ON monthly_distributions(distribution_date DESC);

-- Drop old view
DROP VIEW IF EXISTS daily_distributions_summary;

-- Update the distribution function to distribute 735 points monthly
CREATE OR REPLACE FUNCTION distribute_monthly_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_points_per_user integer := 735;
  v_users_count integer := 0;
  v_total_points integer := 0;
  v_distribution_date date := CURRENT_DATE;
  v_distribution_id uuid;
  v_economy_fund_balance bigint;
  v_total_needed bigint;
BEGIN
  -- Check if distribution already happened this month
  IF EXISTS (
    SELECT 1 FROM monthly_distributions
    WHERE EXTRACT(YEAR FROM distribution_date) = EXTRACT(YEAR FROM v_distribution_date)
      AND EXTRACT(MONTH FROM distribution_date) = EXTRACT(MONTH FROM v_distribution_date)
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Distribution already completed this month',
      'date', v_distribution_date
    );
  END IF;

  -- Count users who will receive points
  SELECT COUNT(*) INTO v_users_count
  FROM user_profiles;

  -- Calculate total points to distribute
  v_total_points := v_users_count * v_points_per_user;
  v_total_needed := v_total_points;

  -- Check economy fund balance
  SELECT points_balance INTO v_economy_fund_balance
  FROM economy_funds
  WHERE id = '00000000-0000-0000-0000-000000000001';

  -- Ensure enough funds
  IF v_economy_fund_balance < v_total_needed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient economy fund balance',
      'balance', v_economy_fund_balance,
      'needed', v_total_needed
    );
  END IF;

  -- Deduct from economy fund
  UPDATE economy_funds
  SET points_balance = points_balance - v_total_needed
  WHERE id = '00000000-0000-0000-0000-000000000001';

  -- Distribute points to all users
  UPDATE user_profiles
  SET
    points_balance = points_balance + v_points_per_user,
    points_earned_total = points_earned_total + v_points_per_user;

  -- Record the distribution
  INSERT INTO monthly_distributions (
    distribution_date,
    points_per_user,
    users_count,
    total_points_distributed
  )
  VALUES (
    v_distribution_date,
    v_points_per_user,
    v_users_count,
    v_total_points
  )
  RETURNING id INTO v_distribution_id;

  RETURN json_build_object(
    'success', true,
    'distribution_id', v_distribution_id,
    'date', v_distribution_date,
    'points_per_user', v_points_per_user,
    'users_count', v_users_count,
    'total_points', v_total_points
  );
END;
$$;

-- Update the old daily function to call monthly (for backwards compatibility)
CREATE OR REPLACE FUNCTION distribute_daily_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Redirect to monthly distribution
  RETURN distribute_monthly_points();
END;
$$;

-- Keep weekly function as alias too
CREATE OR REPLACE FUNCTION distribute_weekly_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Redirect to monthly distribution
  RETURN distribute_monthly_points();
END;
$$;

-- Create a new view for monthly distributions
CREATE OR REPLACE VIEW monthly_distributions_summary AS
SELECT
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(MONTH FROM distribution_date) as month_number,
  EXTRACT(YEAR FROM distribution_date) as year
FROM monthly_distributions
ORDER BY distribution_date DESC;

-- Grant select on view to authenticated users
GRANT SELECT ON monthly_distributions_summary TO authenticated;

-- Update RLS policy name
DROP POLICY IF EXISTS "Users can view daily distributions" ON monthly_distributions;
CREATE POLICY "Users can view monthly distributions"
  ON monthly_distributions
  FOR SELECT
  TO authenticated
  USING (true);

-- Update the cron schedule to run monthly (1st of month at 00:00 UTC)
SELECT cron.unschedule('daily-point-distribution');

SELECT cron.schedule(
  'monthly-point-distribution',
  '0 0 1 * *',
  $$SELECT distribute_monthly_points()$$
);

-- Add comment for documentation
COMMENT ON FUNCTION distribute_monthly_points() IS
'Distributes 735 points monthly to all users on the 1st of every month at 00:00 UTC';
