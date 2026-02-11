/*
  # Update Tax Rates and Add Maintenance Tax

  ## 1. Tax Rate Changes
    - **Purchase Tax**: 2% → 1.5%
    - **Monthly Tax**: 10% (unchanged)
    - **New Maintenance Tax**: 3.25% (quarterly collection)

  ## 2. New Tables
    - None (uses existing tax_settings and user_tax_transactions)

  ## 3. Tax Types
    - `purchase` - 1.5% tax on store purchases
    - `monthly` - 10% monthly tax on point balances
    - `maintenance` - 3.25% quarterly tax on point balances

  ## 4. Function Updates
    - Update purchase_store_item() to use 1.5% tax rate
    - Create calculate_maintenance_tax() function for quarterly collection

  ## 5. Tax Distribution
    - Purchase tax: 50% to developers, 50% to reserve
    - Monthly tax: 50% to developers, 50% to reserve
    - Maintenance tax: 50% to developers, 50% to reserve

  ## 6. Collection Schedule
    - Purchase tax: On every purchase
    - Monthly tax: First of each month
    - Maintenance tax: First day of Jan, Apr, Jul, Oct (quarterly)
*/

-- =====================================================
-- 1. Update Tax Rates
-- =====================================================

-- Deactivate all existing tax settings
UPDATE tax_settings SET is_active = false WHERE is_active = true;

-- Insert new tax settings with updated rates
INSERT INTO tax_settings (
  tax_rate,
  purchase_tax_rate,
  collection_frequency,
  is_active,
  next_adjustment_year
)
VALUES (
  10.0,  -- 10% monthly tax (unchanged)
  1.5,   -- 1.5% purchase tax (reduced from 2%)
  'monthly',
  true,
  EXTRACT(YEAR FROM now()) + 1
);

-- =====================================================
-- 2. Add Maintenance Tax Rate to Settings
-- =====================================================

-- Add maintenance_tax_rate column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_settings' AND column_name = 'maintenance_tax_rate'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN maintenance_tax_rate numeric DEFAULT 3.25;
  END IF;
END $$;

-- Update the active tax setting with maintenance tax rate
UPDATE tax_settings
SET maintenance_tax_rate = 3.25
WHERE is_active = true;

-- =====================================================
-- 3. Create Maintenance Tax Collection Function
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_maintenance_tax()
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
  -- Get current maintenance tax rate
  SELECT maintenance_tax_rate INTO current_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 3.25% if not found
  IF current_tax_rate IS NULL THEN
    current_tax_rate := 3.25;
  END IF;

  -- Get current quarter period (YYYY-QN format)
  current_period := to_char(now(), 'YYYY-Q"Q"Q');

  -- Check if maintenance tax already collected this quarter
  IF EXISTS (
    SELECT 1 FROM user_tax_transactions 
    WHERE transaction_period = current_period 
      AND tax_type = 'maintenance'
      AND status = 'completed'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Maintenance tax already collected for this quarter',
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
      -- Calculate maintenance tax (3.25%)
      tax_points := CEIL(user_record.points_balance * (current_tax_rate / 100));

      -- Skip if tax is 0
      IF tax_points = 0 THEN
        CONTINUE;
      END IF;

      -- Split tax: 50% to developers, 50% to reserve
      to_developers_points := CEIL(tax_points * 0.5);
      to_reserve_points := tax_points - to_developers_points;

      -- Record tax transaction
      INSERT INTO user_tax_transactions (
        user_id,
        amount_points,
        tax_rate,
        tax_type,
        transaction_period,
        amount_deleted,  -- Goes to developers
        amount_to_reserve,
        status,
        processed_at
      )
      VALUES (
        user_record.user_id,
        tax_points,
        current_tax_rate,
        'maintenance',
        current_period,
        to_developers_points,
        to_reserve_points,
        'completed',
        now()
      );

      -- Deduct tax from user balance
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
      'maintenance_tax',
      current_period
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add to reserve fund
  IF total_to_reserve > 0 THEN
    UPDATE economy_funds
    SET remaining_amount = remaining_amount + total_to_reserve
    WHERE fund_type = 'reserve' 
      AND fiscal_year = EXTRACT(YEAR FROM now())::integer;
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
-- 4. Update Purchase Function with New Tax Rate
-- =====================================================

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

  -- Get current purchase tax rate (now 1.5%)
  SELECT purchase_tax_rate INTO purchase_tax
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 1.5% if not set
  IF purchase_tax IS NULL THEN
    purchase_tax := 1.5;
  END IF;

  -- Calculate tax (1.5% of purchase price)
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
    amount_deleted,  -- Goes to developers
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

  -- Add to reserve fund
  IF to_reserve_amount > 0 THEN
    UPDATE economy_funds
    SET remaining_amount = remaining_amount + to_reserve_amount
    WHERE fund_type = 'reserve' 
      AND fiscal_year = EXTRACT(YEAR FROM now())::integer;
  END IF;

  RETURN json_build_object(
    'success', true,
    'item_price', item_price,
    'tax_amount', tax_amount,
    'tax_rate', purchase_tax,
    'total_cost', total_cost,
    'to_developers', to_developers_amount,
    'to_reserve', to_reserve_amount
  );
END;
$$;

-- =====================================================
-- 5. Update Developer Payment Pool Source Type Check
-- =====================================================

-- Drop existing constraint if it exists
DO $$
BEGIN
  ALTER TABLE developer_payment_pool 
  DROP CONSTRAINT IF EXISTS developer_payment_pool_source_type_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add new constraint with maintenance_tax included
ALTER TABLE developer_payment_pool
ADD CONSTRAINT developer_payment_pool_source_type_check
CHECK (source_type IN ('monthly_tax', 'purchase_tax', 'maintenance_tax'));

-- =====================================================
-- 6. Create Scheduled Job Helper Function
-- =====================================================

CREATE OR REPLACE FUNCTION should_collect_maintenance_tax()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_month integer;
BEGIN
  -- Get current month (1-12)
  current_month := EXTRACT(MONTH FROM now());
  
  -- Maintenance tax collected in January (1), April (4), July (7), October (10)
  RETURN current_month IN (1, 4, 7, 10);
END;
$$;

COMMENT ON FUNCTION should_collect_maintenance_tax() IS 
'Helper function to determine if maintenance tax should be collected this month (quarterly: Jan, Apr, Jul, Oct)';

COMMENT ON FUNCTION calculate_maintenance_tax() IS 
'Calculates and collects 3.25% maintenance tax from all user balances quarterly';
