/*
  # Add Monthly Tax System for Regular Users

  1. Changes
    - Create calculate_monthly_taxes_users() for regular users (user_profiles)
    - Only tax users with balance > 0
    - Apply 5% monthly tax with 50/50 split (deleted/reserve)
    - Track tax transactions separately
  
  2. Tax Rules
    - If points_balance = 0, no tax applied
    - 5% tax on positive balances
    - 50% of tax deleted from circulation
    - 50% of tax goes to reserve fund
*/

-- Create tax transactions table for regular users if not exists
CREATE TABLE IF NOT EXISTS user_tax_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_points integer NOT NULL,
  tax_rate numeric NOT NULL,
  tax_type text NOT NULL CHECK (tax_type IN ('monthly', 'purchase')),
  transaction_period text NOT NULL,
  amount_deleted integer NOT NULL DEFAULT 0,
  amount_to_reserve integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_tax_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own tax transactions
CREATE POLICY "Users can view own tax transactions"
  ON user_tax_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_user_id ON user_tax_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_period ON user_tax_transactions(transaction_period);
CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_type ON user_tax_transactions(tax_type);

-- Function to calculate monthly taxes for regular users
CREATE OR REPLACE FUNCTION calculate_monthly_taxes_users()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_tax_rate numeric;
  current_period text;
  user_record RECORD;
  total_users_taxed integer := 0;
  total_tax_collected integer := 0;
  total_deleted integer := 0;
  total_to_reserve integer := 0;
BEGIN
  -- Get current active tax rate
  SELECT tax_rate INTO current_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 5% if not found
  IF current_tax_rate IS NULL THEN
    current_tax_rate := 5;
  END IF;

  -- Get current period (YYYY-MM format)
  current_period := to_char(now(), 'YYYY-MM');

  -- Check if tax already collected this period
  IF EXISTS (
    SELECT 1 FROM user_tax_transactions 
    WHERE transaction_period = current_period 
      AND tax_type = 'monthly'
      AND status = 'completed'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Monthly tax already collected for this period',
      'period', current_period
    );
  END IF;

  -- Loop through all users with positive balances
  -- CRITICAL: Only tax users with balance > 0
  FOR user_record IN 
    SELECT 
      user_id,
      points_balance
    FROM user_profiles
    WHERE points_balance > 0
  LOOP
    DECLARE
      tax_points integer;
      deleted_points integer;
      reserve_points integer;
    BEGIN
      -- Calculate total tax (5%)
      tax_points := CEIL(user_record.points_balance * (current_tax_rate / 100));

      -- Skip if tax is 0
      IF tax_points = 0 THEN
        CONTINUE;
      END IF;

      -- Split tax: 50% deleted, 50% to reserve
      deleted_points := CEIL(tax_points * 0.5);
      reserve_points := tax_points - deleted_points; -- Ensure they sum correctly

      -- Record tax transaction
      INSERT INTO user_tax_transactions (
        user_id,
        amount_points,
        tax_rate,
        tax_type,
        transaction_period,
        amount_deleted,
        amount_to_reserve,
        status,
        processed_at
      )
      VALUES (
        user_record.user_id,
        tax_points,
        current_tax_rate,
        'monthly',
        current_period,
        deleted_points,
        reserve_points,
        'completed',
        now()
      );

      -- Deduct total tax from user balance
      UPDATE user_profiles
      SET points_balance = points_balance - tax_points
      WHERE user_id = user_record.user_id;

      -- Accumulate totals
      total_users_taxed := total_users_taxed + 1;
      total_tax_collected := total_tax_collected + tax_points;
      total_deleted := total_deleted + deleted_points;
      total_to_reserve := total_to_reserve + reserve_points;

    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'period', current_period,
    'tax_rate', current_tax_rate,
    'users_taxed', total_users_taxed,
    'total_tax_collected', total_tax_collected,
    'total_deleted', total_deleted,
    'total_to_reserve', total_to_reserve
  );
END;
$$;

-- Create a view for users to see their tax history
CREATE OR REPLACE VIEW user_tax_history AS
SELECT 
  utt.id,
  utt.user_id,
  utt.amount_points,
  utt.tax_rate,
  utt.tax_type,
  utt.transaction_period,
  utt.amount_deleted,
  utt.amount_to_reserve,
  utt.status,
  utt.processed_at,
  utt.created_at,
  EXTRACT(YEAR FROM TO_DATE(utt.transaction_period, 'YYYY-MM')) as year,
  EXTRACT(MONTH FROM TO_DATE(utt.transaction_period, 'YYYY-MM')) as month
FROM user_tax_transactions utt
ORDER BY utt.processed_at DESC;

-- Grant select on view to authenticated users (they can only see their own via RLS)
GRANT SELECT ON user_tax_history TO authenticated;

-- Enable realtime for tax transactions
ALTER PUBLICATION supabase_realtime ADD TABLE user_tax_transactions;
