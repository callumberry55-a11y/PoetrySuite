/*
  # Connect Daily Distribution to Economy Fund
  
  1. Changes
    - Update distribute_daily_points() to pull from economy_funds
    - Verify sufficient budget before distribution
    - Deduct distributed points from economy fund remaining_amount
    - Add proper error handling for insufficient funds
  
  2. Budget Tracking
    - Each distribution reduces the economy fund balance
    - Distribution fails if insufficient funds available
    - Tracks actual spend against £2.8 billion budget
  
  3. Security
    - Maintains SECURITY DEFINER for authorized execution
    - Proper search_path set for security
*/

-- Update the distribution function to use economy fund
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
  v_economy_fund_id uuid;
  v_remaining_budget numeric;
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

  -- Check economy fund for available budget
  SELECT id, remaining_amount::numeric INTO v_economy_fund_id, v_remaining_budget
  FROM economy_funds
  WHERE fund_type = 'rewards'
    AND fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Verify fund exists
  IF v_economy_fund_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Economy fund not found',
      'fiscal_year', EXTRACT(YEAR FROM CURRENT_DATE)
    );
  END IF;

  -- Verify sufficient budget
  IF v_remaining_budget < v_total_points THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient budget for distribution',
      'required', v_total_points,
      'available', v_remaining_budget
    );
  END IF;

  -- Distribute points to all users
  UPDATE user_profiles
  SET 
    points_balance = points_balance + v_points_per_user,
    points_earned_total = points_earned_total + v_points_per_user;

  -- Deduct from economy fund
  UPDATE economy_funds
  SET 
    remaining_amount = remaining_amount - v_total_points,
    updated_at = now()
  WHERE id = v_economy_fund_id;

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
    'total_points', v_total_points,
    'economy_fund_id', v_economy_fund_id,
    'remaining_budget', v_remaining_budget - v_total_points
  );
END;
$$;
