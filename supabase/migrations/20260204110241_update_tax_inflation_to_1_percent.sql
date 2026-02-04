/*
  # Update Tax Inflation System

  1. Changes
    - Increase annual tax inflation from 0.5% to 1.0%
    - Add 26% cap on tax rates (prevents infinite growth)
    - Update projection view to reflect new 1% inflation and 26% cap
    
  2. Impact
    - Faster tax rate growth to stabilize economy
    - Prevents tax rates from growing beyond reasonable limits
    - More predictable long-term economic planning
*/

-- Update the apply_annual_tax_inflation function to use 1% instead of 0.5%
-- and add 26% cap
CREATE OR REPLACE FUNCTION apply_annual_tax_inflation()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_year integer;
  current_settings RECORD;
  new_tax_rate numeric;
  new_purchase_tax_rate numeric;
  adjustment_id uuid;
  inflation_rate numeric := 1.0;  -- Changed from 0.5 to 1.0
  max_tax_rate numeric := 26.0;   -- New: 26% cap
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM now())::integer;

  -- Get current active tax settings
  SELECT 
    tax_rate,
    purchase_tax_rate,
    next_adjustment_year,
    id
  INTO current_settings
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if current settings exist
  IF current_settings IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No active tax settings found',
      'year', current_year
    );
  END IF;

  -- Check if adjustment already applied this year
  IF EXISTS (
    SELECT 1 FROM tax_rate_adjustments 
    WHERE adjustment_year = current_year
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Inflation adjustment already applied for this year',
      'year', current_year
    );
  END IF;

  -- Check if it's time for adjustment
  IF current_year < current_settings.next_adjustment_year THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not yet time for annual adjustment',
      'current_year', current_year,
      'next_adjustment_year', current_settings.next_adjustment_year
    );
  END IF;

  -- Calculate new rates (add 1.0%)
  new_tax_rate := current_settings.tax_rate + inflation_rate;
  new_purchase_tax_rate := current_settings.purchase_tax_rate + inflation_rate;

  -- Apply 26% cap
  IF new_tax_rate > max_tax_rate THEN
    new_tax_rate := max_tax_rate;
  END IF;
  
  IF new_purchase_tax_rate > max_tax_rate THEN
    new_purchase_tax_rate := max_tax_rate;
  END IF;

  -- Check if rates are already at cap
  IF current_settings.tax_rate >= max_tax_rate AND current_settings.purchase_tax_rate >= max_tax_rate THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Tax rates already at maximum cap',
      'max_rate', max_tax_rate,
      'current_tax_rate', current_settings.tax_rate,
      'current_purchase_tax_rate', current_settings.purchase_tax_rate
    );
  END IF;

  -- Record the adjustment
  INSERT INTO tax_rate_adjustments (
    adjustment_year,
    previous_tax_rate,
    new_tax_rate,
    previous_purchase_tax_rate,
    new_purchase_tax_rate,
    adjustment_amount,
    reason,
    applied_at
  )
  VALUES (
    current_year,
    current_settings.tax_rate,
    new_tax_rate,
    current_settings.purchase_tax_rate,
    new_purchase_tax_rate,
    inflation_rate,
    'Automatic annual inflation adjustment (1% per year, 26% cap)',
    now()
  )
  RETURNING id INTO adjustment_id;

  -- Update the current tax settings with new rates
  UPDATE tax_settings
  SET 
    tax_rate = new_tax_rate,
    purchase_tax_rate = new_purchase_tax_rate,
    next_adjustment_year = current_year + 1
  WHERE id = current_settings.id;

  RETURN json_build_object(
    'success', true,
    'adjustment_id', adjustment_id,
    'year', current_year,
    'previous_tax_rate', current_settings.tax_rate,
    'new_tax_rate', new_tax_rate,
    'previous_purchase_tax_rate', current_settings.purchase_tax_rate,
    'new_purchase_tax_rate', new_purchase_tax_rate,
    'inflation_rate', inflation_rate,
    'max_tax_rate', max_tax_rate,
    'next_adjustment_year', current_year + 1
  );
END;
$$;

-- Update the tax_rate_projection view to use 1% inflation and 26% cap
CREATE OR REPLACE VIEW tax_rate_projection AS
SELECT 
  ts.tax_rate as current_monthly_tax,
  ts.purchase_tax_rate as current_purchase_tax,
  ts.next_adjustment_year,
  -- Next year projection (capped at 26%)
  LEAST(ts.tax_rate + 1.0, 26.0) as projected_monthly_tax_next_year,
  LEAST(ts.purchase_tax_rate + 1.0, 26.0) as projected_purchase_tax_next_year,
  -- 5 years projection (capped at 26%)
  LEAST(ts.tax_rate + (1.0 * 5), 26.0) as projected_monthly_tax_5_years,
  LEAST(ts.purchase_tax_rate + (1.0 * 5), 26.0) as projected_purchase_tax_5_years,
  -- 10 years projection (capped at 26%)
  LEAST(ts.tax_rate + (1.0 * 10), 26.0) as projected_monthly_tax_10_years,
  LEAST(ts.purchase_tax_rate + (1.0 * 10), 26.0) as projected_purchase_tax_10_years,
  -- Show years until cap is reached
  CASE 
    WHEN ts.tax_rate >= 26.0 THEN 0
    ELSE CEIL((26.0 - ts.tax_rate) / 1.0)
  END as years_until_monthly_cap,
  CASE 
    WHEN ts.purchase_tax_rate >= 26.0 THEN 0
    ELSE CEIL((26.0 - ts.purchase_tax_rate) / 1.0)
  END as years_until_purchase_cap
FROM tax_settings ts
WHERE ts.is_active = true
ORDER BY ts.created_at DESC
LIMIT 1;

-- Grant select on projection view to authenticated users
GRANT SELECT ON tax_rate_projection TO authenticated;

-- Update default for adjustment_amount in tax_rate_adjustments
ALTER TABLE tax_rate_adjustments 
  ALTER COLUMN adjustment_amount SET DEFAULT 1.0;
