/*
  # Major Economic Policy Updates

  1. **Budget Changes**
    - Set global points budget to 10.8 billion points
    - Create budget tracking table for transparency
  
  2. **Tax Rate Updates**
    - Monthly tax rate: 5% → 10%
    - Purchase tax rate: 1.5% → 2%
    
  3. **Universal Basic Income**
    - Deposit 350 points to all active user accounts
    
  4. **Developer Payment System**
    - Create developer payment pool table
    - Redirect deleted tax amounts to developer payments instead
    - Update tax collection function to fund developer pool
    
  5. **Function Updates**
    - Update calculate_monthly_taxes_users() to redirect funds to developers
    - Update purchase_store_item() to redirect funds to developers
*/

-- =====================================================
-- 1. Create Budget Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS economy_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_points_budget numeric NOT NULL,
  allocated_points numeric NOT NULL DEFAULT 0,
  remaining_points numeric NOT NULL,
  fiscal_year integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE economy_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view budget"
  ON economy_budget FOR SELECT
  TO authenticated
  USING (true);

-- Set initial budget to 10.8 billion points
INSERT INTO economy_budget (total_points_budget, remaining_points, fiscal_year, notes)
VALUES (10800000000, 10800000000, EXTRACT(YEAR FROM now()), 'Initial budget set to 10.8 billion points')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Create Developer Payment Pool
-- =====================================================

CREATE TABLE IF NOT EXISTS developer_payment_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_collected_points integer NOT NULL DEFAULT 0,
  distributed_points integer NOT NULL DEFAULT 0,
  remaining_points integer NOT NULL DEFAULT 0,
  source_type text NOT NULL CHECK (source_type IN ('monthly_tax', 'purchase_tax')),
  fiscal_period text NOT NULL, -- YYYY-MM format
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE developer_payment_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view developer pool"
  ON developer_payment_pool FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_developer_payment_pool_period ON developer_payment_pool(fiscal_period);
CREATE INDEX IF NOT EXISTS idx_developer_payment_pool_source ON developer_payment_pool(source_type);

-- =====================================================
-- 3. Update Tax Rates
-- =====================================================

-- Deactivate old tax settings
UPDATE tax_settings SET is_active = false WHERE is_active = true;

-- Insert new tax settings with 10% monthly and 2% purchase tax
INSERT INTO tax_settings (
  tax_rate,
  purchase_tax_rate,
  collection_frequency,
  is_active,
  next_adjustment_year
)
VALUES (
  10.0,  -- 10% monthly tax
  2.0,   -- 2% purchase tax
  'monthly',
  true,
  EXTRACT(YEAR FROM now()) + 1
);

-- =====================================================
-- 4. Deposit 350 Points to All Active Users
-- =====================================================

-- Add 350 points to all user accounts
UPDATE user_profiles
SET 
  points_balance = points_balance + 350,
  points_earned_total = points_earned_total + 350
WHERE user_id IS NOT NULL;

-- =====================================================
-- 5. Update Monthly Tax Function for Users
-- =====================================================

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
  total_to_developers integer := 0;
  total_to_reserve integer := 0;
BEGIN
  -- Get current active tax rate
  SELECT tax_rate INTO current_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 10% if not found
  IF current_tax_rate IS NULL THEN
    current_tax_rate := 10;
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
  FOR user_record IN 
    SELECT 
      user_id,
      points_balance
    FROM user_profiles
    WHERE points_balance > 0
  LOOP
    DECLARE
      tax_points integer;
      to_developers_points integer;
      to_reserve_points integer;
    BEGIN
      -- Calculate total tax (10%)
      tax_points := CEIL(user_record.points_balance * (current_tax_rate / 100));

      -- Skip if tax is 0
      IF tax_points = 0 THEN
        CONTINUE;
      END IF;

      -- NEW: Split tax: 50% to developers, 50% to reserve
      to_developers_points := CEIL(tax_points * 0.5);
      to_reserve_points := tax_points - to_developers_points;

      -- Record tax transaction
      INSERT INTO user_tax_transactions (
        user_id,
        amount_points,
        tax_rate,
        tax_type,
        transaction_period,
        amount_deleted,  -- Now goes to developers instead
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
        to_developers_points,  -- This now funds developers
        to_reserve_points,
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
      total_to_developers := total_to_developers + to_developers_points;
      total_to_reserve := total_to_reserve + to_reserve_points;

    END;
  END LOOP;

  -- Add collected tax to developer payment pool
  IF total_to_developers > 0 THEN
    INSERT INTO developer_payment_pool (
      total_collected_points,
      remaining_points,
      source_type,
      fiscal_period
    )
    VALUES (
      total_to_developers,
      total_to_developers,
      'monthly_tax',
      current_period
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'period', current_period,
    'tax_rate', current_tax_rate,
    'users_taxed', total_users_taxed,
    'total_tax_collected', total_tax_collected,
    'to_developers', total_to_developers,
    'to_reserve', total_to_reserve
  );
END;
$$;

-- =====================================================
-- 6. Update Purchase Function to Use Developer Pool
-- =====================================================

-- Drop existing function first
DROP FUNCTION IF EXISTS purchase_store_item(uuid, uuid);

CREATE OR REPLACE FUNCTION purchase_store_item(
  p_user_id uuid,
  p_item_id uuid
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  item_price integer;
  user_balance integer;
  purchase_tax numeric;
  tax_amount integer;
  total_cost integer;
  to_developers_amount integer;
  to_reserve_amount integer;
  current_period text;
BEGIN
  -- Get item price
  SELECT price INTO item_price
  FROM store_items
  WHERE id = p_item_id AND is_active = true;

  IF item_price IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or inactive');
  END IF;

  -- Get current purchase tax rate
  SELECT purchase_tax_rate INTO purchase_tax
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 2% if not set
  IF purchase_tax IS NULL THEN
    purchase_tax := 2.0;
  END IF;

  -- Calculate tax (2% of purchase price)
  tax_amount := CEIL(item_price * (purchase_tax / 100));
  total_cost := item_price + tax_amount;

  -- Split tax: 50% to developers, 50% to reserve
  to_developers_amount := CEIL(tax_amount * 0.5);
  to_reserve_amount := tax_amount - to_developers_amount;

  -- Get user balance
  SELECT points_balance INTO user_balance
  FROM user_profiles
  WHERE user_id = p_user_id;

  IF user_balance < total_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  -- Deduct points from user
  UPDATE user_profiles
  SET points_balance = points_balance - total_cost
  WHERE user_id = p_user_id;

  -- Record purchase
  INSERT INTO user_purchases (user_id, item_id, price_paid)
  VALUES (p_user_id, p_item_id, total_cost);

  -- Record tax transaction
  current_period := to_char(now(), 'YYYY-MM');
  INSERT INTO user_tax_transactions (
    user_id,
    amount_points,
    tax_rate,
    tax_type,
    transaction_period,
    amount_deleted,  -- Now goes to developers
    amount_to_reserve,
    status,
    processed_at
  )
  VALUES (
    p_user_id,
    tax_amount,
    purchase_tax,
    'purchase',
    current_period,
    to_developers_amount,
    to_reserve_amount,
    'completed',
    now()
  );

  -- Add to developer payment pool
  IF to_developers_amount > 0 THEN
    INSERT INTO developer_payment_pool (
      total_collected_points,
      remaining_points,
      source_type,
      fiscal_period
    )
    VALUES (
      to_developers_amount,
      to_developers_amount,
      'purchase_tax',
      current_period
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'item_price', item_price,
    'tax_amount', tax_amount,
    'total_cost', total_cost,
    'to_developers', to_developers_amount,
    'to_reserve', to_reserve_amount
  );
END;
$$;

-- =====================================================
-- 7. Create Function to Distribute to Developers
-- =====================================================

CREATE OR REPLACE FUNCTION distribute_to_developers(
  p_period text DEFAULT NULL
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  target_period text;
  pool_record RECORD;
  developer_record RECORD;
  total_developers integer;
  points_per_developer integer;
  total_distributed integer := 0;
BEGIN
  -- Use provided period or current period
  target_period := COALESCE(p_period, to_char(now(), 'YYYY-MM'));

  -- Get total available points from pool
  SELECT 
    SUM(remaining_points) as total_points
  INTO pool_record
  FROM developer_payment_pool
  WHERE fiscal_period = target_period
    AND remaining_points > 0;

  IF pool_record.total_points IS NULL OR pool_record.total_points = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No points available for distribution',
      'period', target_period
    );
  END IF;

  -- Count active developers
  SELECT COUNT(*) INTO total_developers
  FROM paas_developers
  WHERE subscription_status = 'active';

  IF total_developers = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No active developers to distribute to',
      'period', target_period
    );
  END IF;

  -- Calculate points per developer (equal distribution)
  points_per_developer := FLOOR(pool_record.total_points / total_developers);

  -- Distribute to each active developer
  FOR developer_record IN
    SELECT id FROM paas_developers WHERE subscription_status = 'active'
  LOOP
    -- Add points to developer account
    UPDATE paas_point_accounts
    SET 
      balance_points = balance_points + points_per_developer,
      total_earned = total_earned + points_per_developer
    WHERE developer_id = developer_record.id;

    total_distributed := total_distributed + points_per_developer;
  END LOOP;

  -- Update pool to mark as distributed
  UPDATE developer_payment_pool
  SET 
    distributed_points = distributed_points + total_distributed,
    remaining_points = remaining_points - total_distributed,
    updated_at = now()
  WHERE fiscal_period = target_period
    AND remaining_points > 0;

  RETURN json_build_object(
    'success', true,
    'period', target_period,
    'total_distributed', total_distributed,
    'developers_paid', total_developers,
    'points_per_developer', points_per_developer
  );
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE economy_budget;
ALTER PUBLICATION supabase_realtime ADD TABLE developer_payment_pool;
