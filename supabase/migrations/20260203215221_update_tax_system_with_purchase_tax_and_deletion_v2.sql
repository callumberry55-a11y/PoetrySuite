/*
  # Update Tax System with Purchase Tax and Tax Distribution

  1. Changes
    - Add purchase_tax_rate to tax_settings (1.5%)
    - Update tax_transactions to track tax type (monthly or purchase)
    - Add tax distribution fields (amount_deleted, amount_to_reserve)
    - Update calculate_monthly_taxes function to split taxes:
      - 50% (2.5% of 5%) deleted from circulation
      - 50% (2.5% of 5%) goes to reserve fund
  
  2. New Features
    - Purchase tax on store transactions
    - Tax deletion to control inflation
    - Tax distribution tracking for transparency

  3. Tax Breakdown
    - Monthly Tax: 5% on earnings
      - 2.5% deleted from economy
      - 2.5% to reserve fund
    - Purchase Tax: 1.5% on purchases
      - Split same way as monthly tax
*/

-- Add purchase_tax_rate to tax_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_settings' AND column_name = 'purchase_tax_rate'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN purchase_tax_rate numeric NOT NULL DEFAULT 1.5 CHECK (purchase_tax_rate >= 0 AND purchase_tax_rate <= 100);
  END IF;
END $$;

-- Add tax_type to tax_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_transactions' AND column_name = 'tax_type'
  ) THEN
    ALTER TABLE tax_transactions ADD COLUMN tax_type text NOT NULL DEFAULT 'monthly' CHECK (tax_type IN ('monthly', 'purchase'));
  END IF;
END $$;

-- Add distribution tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_transactions' AND column_name = 'amount_deleted'
  ) THEN
    ALTER TABLE tax_transactions ADD COLUMN amount_deleted numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_transactions' AND column_name = 'amount_to_reserve'
  ) THEN
    ALTER TABLE tax_transactions ADD COLUMN amount_to_reserve numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update tax settings to include purchase tax
UPDATE tax_settings
SET purchase_tax_rate = 1.5
WHERE is_active = true;

-- Update the calculate_monthly_taxes function with new tax distribution
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
  FOR dev_record IN 
    SELECT 
      d.id as developer_id,
      pa.balance_points,
      pa.balance_gbp
    FROM paas_developers d
    JOIN paas_point_accounts pa ON d.id = pa.developer_id
    WHERE pa.balance_points > 0
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

-- Drop and recreate purchase tax function with correct return type
DROP FUNCTION IF EXISTS apply_purchase_tax(uuid, numeric, numeric);

CREATE FUNCTION apply_purchase_tax(
  p_developer_id uuid,
  p_purchase_amount_points numeric,
  p_purchase_amount_gbp numeric
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_purchase_tax_rate numeric;
  tax_points numeric;
  tax_gbp numeric;
  deleted_gbp numeric;
  reserve_gbp numeric;
  current_period text;
  result json;
BEGIN
  -- Get current active purchase tax rate
  SELECT purchase_tax_rate INTO current_purchase_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get current period
  current_period := to_char(now(), 'YYYY-MM');

  -- Calculate purchase tax (1.5%)
  tax_points := p_purchase_amount_points * (current_purchase_tax_rate / 100);
  tax_gbp := p_purchase_amount_gbp * (current_purchase_tax_rate / 100);

  -- Split tax: 50% deleted, 50% to reserve
  deleted_gbp := tax_gbp * 0.5;
  reserve_gbp := tax_gbp * 0.5;

  -- Record purchase tax transaction
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
    p_developer_id,
    tax_points,
    tax_gbp,
    current_purchase_tax_rate,
    'purchase',
    current_period,
    deleted_gbp,
    reserve_gbp,
    'completed',
    now()
  );

  -- Deduct tax from point account
  UPDATE paas_point_accounts
  SET 
    balance_points = balance_points - tax_points,
    balance_gbp = balance_gbp - tax_gbp,
    total_spent = total_spent + tax_points
  WHERE developer_id = p_developer_id;

  -- Add reserve portion to reserve fund
  UPDATE economy_funds
  SET remaining_amount = remaining_amount + reserve_gbp
  WHERE fund_type = 'reserve' 
    AND fiscal_year = EXTRACT(YEAR FROM now())::integer;

  -- Return result
  result := json_build_object(
    'success', true,
    'tax_applied', tax_gbp,
    'deleted', deleted_gbp,
    'to_reserve', reserve_gbp
  );

  RETURN result;
END;
$$;

-- Create index for tax_type
CREATE INDEX IF NOT EXISTS idx_tax_transactions_tax_type ON tax_transactions(tax_type);
