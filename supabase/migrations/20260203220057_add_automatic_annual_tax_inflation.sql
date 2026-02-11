/*
  # Add Automatic Annual Tax Inflation System

  1. New Features
    - Automatic 0.5% tax rate increase per year
    - Tracks tax rate history and adjustments
    - Function to apply annual inflation adjustment
  
  2. New Tables
    - `tax_rate_adjustments`
      - `id` (uuid, primary key)
      - `adjustment_year` (integer)
      - `previous_tax_rate` (numeric)
      - `new_tax_rate` (numeric)
      - `previous_purchase_tax_rate` (numeric)
      - `new_purchase_tax_rate` (numeric)
      - `adjustment_amount` (numeric) - always 0.5%
      - `reason` (text)
      - `applied_at` (timestamp)
      - `created_at` (timestamp)

  3. Changes
    - Add `next_adjustment_year` to tax_settings
    - Create apply_annual_tax_inflation() function
    - Track all rate changes for audit purposes
*/

-- Create tax rate adjustments tracking table
CREATE TABLE IF NOT EXISTS tax_rate_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_year integer NOT NULL,
  previous_tax_rate numeric NOT NULL,
  new_tax_rate numeric NOT NULL,
  previous_purchase_tax_rate numeric NOT NULL,
  new_purchase_tax_rate numeric NOT NULL,
  adjustment_amount numeric NOT NULL DEFAULT 0.5,
  reason text NOT NULL,
  applied_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(adjustment_year)
);

-- Enable RLS
ALTER TABLE tax_rate_adjustments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view tax adjustments
CREATE POLICY "Users can view tax rate adjustments"
  ON tax_rate_adjustments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for year lookups
CREATE INDEX IF NOT EXISTS idx_tax_rate_adjustments_year ON tax_rate_adjustments(adjustment_year DESC);

-- Add next adjustment year to tax_settings if column doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_settings' AND column_name = 'next_adjustment_year'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN next_adjustment_year integer DEFAULT EXTRACT(YEAR FROM now())::integer + 1;
  END IF;
END $$;

-- Function to apply annual tax inflation (0.5% increase)
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
  inflation_rate numeric := 0.5;
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

  -- Calculate new rates (add 0.5%)
  new_tax_rate := current_settings.tax_rate + inflation_rate;
  new_purchase_tax_rate := current_settings.purchase_tax_rate + inflation_rate;

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
    'Automatic annual inflation adjustment',
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
    'next_adjustment_year', current_year + 1
  );
END;
$$;

-- Create a view to show tax rate history
CREATE OR REPLACE VIEW tax_rate_history AS
SELECT 
  tra.id,
  tra.adjustment_year,
  tra.previous_tax_rate,
  tra.new_tax_rate,
  tra.previous_purchase_tax_rate,
  tra.new_purchase_tax_rate,
  tra.adjustment_amount,
  tra.reason,
  tra.applied_at,
  tra.created_at,
  (tra.new_tax_rate - tra.previous_tax_rate) as monthly_tax_increase,
  (tra.new_purchase_tax_rate - tra.previous_purchase_tax_rate) as purchase_tax_increase,
  ROUND(((tra.new_tax_rate - tra.previous_tax_rate) / tra.previous_tax_rate * 100), 2) as monthly_tax_increase_percent,
  ROUND(((tra.new_purchase_tax_rate - tra.previous_purchase_tax_rate) / tra.previous_purchase_tax_rate * 100), 2) as purchase_tax_increase_percent
FROM tax_rate_adjustments tra
ORDER BY tra.adjustment_year DESC;

-- Grant select on view to authenticated users
GRANT SELECT ON tax_rate_history TO authenticated;

-- Create a view to show current and projected tax rates
CREATE OR REPLACE VIEW tax_rate_projection AS
SELECT 
  ts.tax_rate as current_monthly_tax,
  ts.purchase_tax_rate as current_purchase_tax,
  ts.next_adjustment_year,
  ts.tax_rate + 0.5 as projected_monthly_tax_next_year,
  ts.purchase_tax_rate + 0.5 as projected_purchase_tax_next_year,
  ts.tax_rate + (0.5 * 5) as projected_monthly_tax_5_years,
  ts.purchase_tax_rate + (0.5 * 5) as projected_purchase_tax_5_years,
  ts.tax_rate + (0.5 * 10) as projected_monthly_tax_10_years,
  ts.purchase_tax_rate + (0.5 * 10) as projected_purchase_tax_10_years
FROM tax_settings ts
WHERE ts.is_active = true
ORDER BY ts.created_at DESC
LIMIT 1;

-- Grant select on projection view to authenticated users
GRANT SELECT ON tax_rate_projection TO authenticated;

-- Enable realtime for tax rate adjustments
ALTER PUBLICATION supabase_realtime ADD TABLE tax_rate_adjustments;
