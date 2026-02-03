/*
  # Add Weekly Point Distribution System

  1. New Features
    - Weekly 10-point bonus for all users
    - Points are tax-free until the next month
    - Track weekly distributions in a new table
    - Function to distribute points to all users
  
  2. New Tables
    - `weekly_distributions`
      - `id` (uuid, primary key)
      - `distribution_date` (date)
      - `points_per_user` (integer)
      - `users_count` (integer)
      - `total_points` (integer)
      - `created_at` (timestamp)

  3. Changes
    - Update monthly tax to skip users with 0 balance (already done but reinforced)
    - Create distribute_weekly_points() function
*/

-- Create weekly distributions tracking table
CREATE TABLE IF NOT EXISTS weekly_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_date date NOT NULL,
  points_per_user integer NOT NULL DEFAULT 10,
  users_count integer NOT NULL DEFAULT 0,
  total_points_distributed integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weekly_distributions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view distributions
CREATE POLICY "Users can view weekly distributions"
  ON weekly_distributions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for date lookups
CREATE INDEX IF NOT EXISTS idx_weekly_distributions_date ON weekly_distributions(distribution_date DESC);

-- Function to distribute weekly points to all users
CREATE OR REPLACE FUNCTION distribute_weekly_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_points_per_user integer := 10;
  v_users_count integer := 0;
  v_total_points integer := 0;
  v_distribution_date date := CURRENT_DATE;
  v_distribution_id uuid;
BEGIN
  -- Check if distribution already happened today
  IF EXISTS (
    SELECT 1 FROM weekly_distributions 
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
  INSERT INTO weekly_distributions (
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

-- Ensure monthly tax skips users with 0 balance (reinforcement)
-- The function already checks balance_points > 0, but let's make it explicit
CREATE OR REPLACE FUNCTION calculate_monthly_taxes()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_tax_rate numeric;
  current_period text;
  dev_record RECORD;
BEGIN
  -- Get current active tax rate
  SELECT tax_rate INTO current_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get current period (YYYY-MM format)
  current_period := to_char(now(), 'YYYY-MM');

  -- Loop through all developers with point accounts
  -- IMPORTANT: Only tax users with balance > 0
  FOR dev_record IN 
    SELECT 
      d.id as developer_id,
      pa.balance_points,
      pa.balance_gbp
    FROM paas_developers d
    JOIN paas_point_accounts pa ON d.id = pa.developer_id
    WHERE pa.balance_points > 0 AND pa.balance_gbp > 0
  LOOP
    -- Calculate tax amounts
    DECLARE
      tax_points numeric;
      tax_gbp numeric;
      deleted_points numeric;
      deleted_gbp numeric;
      reserve_points numeric;
      reserve_gbp numeric;
    BEGIN
      -- Calculate total tax (5%)
      tax_points := dev_record.balance_points * (current_tax_rate / 100);
      tax_gbp := dev_record.balance_gbp * (current_tax_rate / 100);

      -- Split tax: 50% deleted, 50% to reserve
      deleted_points := tax_points * 0.5;
      deleted_gbp := tax_gbp * 0.5;
      reserve_points := tax_points * 0.5;
      reserve_gbp := tax_gbp * 0.5;

      -- Record tax transaction
      INSERT INTO tax_transactions (
        developer_id,
        amount_points,
        amount_gbp,
        tax_rate,
        tax_type,
        transaction_period,
        amount_deleted,
        amount_to_reserve,
        status,
        processed_at
      )
      VALUES (
        dev_record.developer_id,
        tax_points,
        tax_gbp,
        current_tax_rate,
        'monthly',
        current_period,
        deleted_gbp,
        reserve_gbp,
        'completed',
        now()
      );

      -- Deduct total tax from point account
      UPDATE paas_point_accounts
      SET 
        balance_points = balance_points - tax_points,
        balance_gbp = balance_gbp - tax_gbp,
        total_spent = total_spent + tax_points
      WHERE developer_id = dev_record.developer_id;

      -- Add only 50% (reserve portion) to reserve fund
      UPDATE economy_funds
      SET remaining_amount = remaining_amount + reserve_gbp
      WHERE fund_type = 'reserve' 
        AND fiscal_year = EXTRACT(YEAR FROM now())::integer;

      -- Note: The other 50% (deleted portion) is removed from circulation entirely

    END;
  END LOOP;
END;
$$;

-- Create a view to show recent distributions
CREATE OR REPLACE VIEW weekly_distributions_summary AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(WEEK FROM distribution_date) as week_number,
  EXTRACT(YEAR FROM distribution_date) as year
FROM weekly_distributions
ORDER BY distribution_date DESC;

-- Grant select on view to authenticated users
GRANT SELECT ON weekly_distributions_summary TO authenticated;
