/*
  # Change Weekly Distribution to Daily Distribution
  
  1. Changes
    - Rename weekly_distributions table to daily_distributions
    - Update function to distribute 20 points daily instead of 10 weekly
    - Rename function from distribute_weekly_points to distribute_daily_points
    - Update view to reflect daily distributions
  
  2. Details
    - Points per distribution: 10 → 20
    - Distribution frequency: Weekly → Daily
    - Total points per week: 10 → 140 (20 × 7 days)
  
  3. Security
    - Maintains existing RLS policies
    - Ensures one distribution per day maximum
*/

-- Rename the table from weekly_distributions to daily_distributions
ALTER TABLE IF EXISTS weekly_distributions RENAME TO daily_distributions;

-- Update the index name
DROP INDEX IF EXISTS idx_weekly_distributions_date;
CREATE INDEX IF NOT EXISTS idx_daily_distributions_date ON daily_distributions(distribution_date DESC);

-- Drop old view
DROP VIEW IF EXISTS weekly_distributions_summary;

-- Update the distribution function to distribute 20 points daily
CREATE OR REPLACE FUNCTION distribute_daily_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_points_per_user integer := 20;
  v_users_count integer := 0;
  v_total_points integer := 0;
  v_distribution_date date := CURRENT_DATE;
  v_distribution_id uuid;
BEGIN
  -- Check if distribution already happened today
  IF EXISTS (
    SELECT 1 FROM daily_distributions 
    WHERE distribution_date = v_distribution_date
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Distribution already completed today',
      'date', v_distribution_date
    );
  END IF;

  -- Count users who will receive points
  SELECT COUNT(*) INTO v_users_count
  FROM user_profiles;

  -- Calculate total points to distribute
  v_total_points := v_users_count * v_points_per_user;

  -- Distribute points to all users
  UPDATE user_profiles
  SET 
    points_balance = points_balance + v_points_per_user,
    points_earned_total = points_earned_total + v_points_per_user;

  -- Record the distribution
  INSERT INTO daily_distributions (
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

-- Keep the old function as an alias for backwards compatibility
CREATE OR REPLACE FUNCTION distribute_weekly_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simply call the new daily distribution function
  RETURN distribute_daily_points();
END;
$$;

-- Create a new view for daily distributions
CREATE OR REPLACE VIEW daily_distributions_summary AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(DOW FROM distribution_date) as day_of_week,
  EXTRACT(WEEK FROM distribution_date) as week_number,
  EXTRACT(YEAR FROM distribution_date) as year
FROM daily_distributions
ORDER BY distribution_date DESC;

-- Grant select on view to authenticated users
GRANT SELECT ON daily_distributions_summary TO authenticated;

-- Update RLS policy name
DROP POLICY IF EXISTS "Users can view weekly distributions" ON daily_distributions;
CREATE POLICY "Users can view daily distributions"
  ON daily_distributions
  FOR SELECT
  TO authenticated
  USING (true);
