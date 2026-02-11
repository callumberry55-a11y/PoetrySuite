/*
  # Add Tax and Funding System

  1. New Tables
    - `economy_funds`
      - `id` (uuid, primary key)
      - `fund_type` (text) - grant, rewards, reserve
      - `allocated_amount` (numeric) - total allocated
      - `remaining_amount` (numeric) - remaining balance
      - `currency` (text) - GBP
      - `fiscal_year` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tax_settings`
      - `id` (uuid, primary key)
      - `tax_rate` (numeric) - percentage (e.g., 5.0 for 5%)
      - `collection_frequency` (text) - monthly, quarterly, annual
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tax_transactions`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key)
      - `amount_points` (numeric)
      - `amount_gbp` (numeric)
      - `tax_rate` (numeric)
      - `transaction_period` (text) - e.g., "2026-02"
      - `status` (text) - pending, completed, failed
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read tax settings
    - Add policies for developers to read their own tax transactions
    - Restrict fund management to admins only

  3. Initial Data
    - Set up default tax rate of 5%
    - Initialize funds for current fiscal year
    - Grant money: 3,000,000,000 GBP
    - Allocated rewards: 1,400,000,000 GBP
    - System reserve: 750,000,000 GBP
*/

-- Create economy_funds table
CREATE TABLE IF NOT EXISTS economy_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_type text NOT NULL CHECK (fund_type IN ('grant', 'rewards', 'reserve')),
  allocated_amount numeric NOT NULL DEFAULT 0,
  remaining_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP',
  fiscal_year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_economy_funds_fund_type ON economy_funds(fund_type);
CREATE INDEX IF NOT EXISTS idx_economy_funds_fiscal_year ON economy_funds(fiscal_year);

-- Create tax_settings table
CREATE TABLE IF NOT EXISTS tax_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rate numeric NOT NULL DEFAULT 5.0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  collection_frequency text NOT NULL DEFAULT 'monthly' CHECK (collection_frequency IN ('monthly', 'quarterly', 'annual')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tax_transactions table
CREATE TABLE IF NOT EXISTS tax_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  amount_points numeric NOT NULL DEFAULT 0,
  amount_gbp numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL,
  transaction_period text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tax_transactions_developer_id ON tax_transactions(developer_id);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_period ON tax_transactions(transaction_period);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_status ON tax_transactions(status);

-- Enable RLS
ALTER TABLE economy_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for economy_funds (read-only for authenticated users)
CREATE POLICY "Anyone can view economy funds"
  ON economy_funds FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tax_settings (read-only for authenticated users)
CREATE POLICY "Anyone can view tax settings"
  ON tax_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tax_transactions
CREATE POLICY "Developers can view own tax transactions"
  ON tax_transactions FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_economy_funds_updated_at ON economy_funds;
CREATE TRIGGER update_economy_funds_updated_at
  BEFORE UPDATE ON economy_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_settings_updated_at ON tax_settings;
CREATE TRIGGER update_tax_settings_updated_at
  BEFORE UPDATE ON tax_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial tax settings (5% monthly)
INSERT INTO tax_settings (tax_rate, collection_frequency, is_active)
VALUES (5.0, 'monthly', true)
ON CONFLICT DO NOTHING;

-- Insert initial economy funds for fiscal year 2026
INSERT INTO economy_funds (fund_type, allocated_amount, remaining_amount, currency, fiscal_year)
VALUES 
  ('grant', 3000000000, 3000000000, 'GBP', 2026),
  ('rewards', 1400000000, 1400000000, 'GBP', 2026),
  ('reserve', 750000000, 750000000, 'GBP', 2026)
ON CONFLICT DO NOTHING;

-- Function to calculate and record monthly taxes
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
    BEGIN
      tax_points := dev_record.balance_points * (current_tax_rate / 100);
      tax_gbp := dev_record.balance_gbp * (current_tax_rate / 100);

      -- Record tax transaction
      INSERT INTO tax_transactions (
        developer_id,
        amount_points,
        amount_gbp,
        tax_rate,
        transaction_period,
        status,
        processed_at
      )
      VALUES (
        dev_record.developer_id,
        tax_points,
        tax_gbp,
        current_tax_rate,
        current_period,
        'completed',
        now()
      );

      -- Deduct tax from point account
      UPDATE paas_point_accounts
      SET 
        balance_points = balance_points - tax_points,
        balance_gbp = balance_gbp - tax_gbp,
        total_spent = total_spent + tax_points
      WHERE developer_id = dev_record.developer_id;

      -- Add tax to reserve fund
      UPDATE economy_funds
      SET remaining_amount = remaining_amount + tax_gbp
      WHERE fund_type = 'reserve' 
        AND fiscal_year = EXTRACT(YEAR FROM now())::integer;

    END;
  END LOOP;
END;
$$;
