/*
  # AI Banker Billing System

  ## Overview
  Creates a comprehensive billing system for PaaS API keys with AI-powered dynamic pricing.
  The AI Banker analyzes usage patterns and calculates intelligent pricing based on various factors.

  ## New Tables

  ### 1. `paas_api_usage`
  Tracks individual API calls for billing purposes.
  - `id` (uuid, primary key)
  - `api_key_id` (uuid, foreign key to paas_api_keys)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `endpoint` (text) - Which endpoint was called
  - `request_size` (integer) - Size of request in bytes
  - `response_size` (integer) - Size of response in bytes
  - `execution_time_ms` (integer) - How long the request took
  - `status_code` (integer) - HTTP status code
  - `timestamp` (timestamptz)
  - `metadata` (jsonb) - Additional tracking data

  ### 2. `paas_billing_periods`
  Tracks billing periods for each developer.
  - `id` (uuid, primary key)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `period_start` (timestamptz)
  - `period_end` (timestamptz)
  - `total_requests` (integer)
  - `total_data_transferred_mb` (numeric)
  - `total_execution_time_ms` (bigint)
  - `base_cost_points` (numeric)
  - `ai_calculated_cost_points` (numeric) - Cost calculated by AI Banker
  - `final_cost_points` (numeric) - Final cost after adjustments
  - `ai_reasoning` (text) - AI's explanation for pricing
  - `status` (text) - 'pending', 'calculated', 'billed', 'paid'
  - `billed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. `paas_billing_charges`
  Individual charges within a billing period.
  - `id` (uuid, primary key)
  - `billing_period_id` (uuid, foreign key to paas_billing_periods)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `charge_type` (text) - 'api_call', 'data_transfer', 'compute_time', 'premium_feature'
  - `quantity` (numeric)
  - `unit_price_points` (numeric)
  - `total_points` (numeric)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 4. `paas_pricing_tiers`
  AI Banker pricing configuration and tiers.
  - `id` (uuid, primary key)
  - `tier_name` (text) - 'free', 'starter', 'professional', 'enterprise'
  - `min_requests_per_day` (integer)
  - `max_requests_per_day` (integer)
  - `base_cost_per_1000_requests` (numeric)
  - `data_cost_per_mb` (numeric)
  - `compute_cost_per_second` (numeric)
  - `discount_percentage` (numeric)
  - `ai_pricing_enabled` (boolean)
  - `active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `paas_ai_banker_decisions`
  Tracks AI Banker's pricing decisions for analysis and improvement.
  - `id` (uuid, primary key)
  - `billing_period_id` (uuid, foreign key to paas_billing_periods)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `usage_summary` (jsonb)
  - `ai_analysis` (text)
  - `base_calculation` (numeric)
  - `ai_adjustment_factor` (numeric)
  - `final_cost` (numeric)
  - `reasoning` (text)
  - `model_version` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Developers can view their own usage and billing
  - Only system and admins can insert usage data
  - AI Banker function has special permissions

  ## Indexes
  - Performance indexes on foreign keys and timestamp columns
  - Composite indexes for common queries

  ## Important Notes
  1. All monetary values are in points (not currency)
  2. AI Banker runs periodically to calculate billing
  3. Billing periods are typically daily or weekly
  4. System tracks detailed usage for transparency
*/

-- Create paas_api_usage table
CREATE TABLE IF NOT EXISTS paas_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES paas_api_keys(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_size integer DEFAULT 0,
  response_size integer DEFAULT 0,
  execution_time_ms integer DEFAULT 0,
  status_code integer NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON paas_api_usage(developer_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key ON paas_api_usage(api_key_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON paas_api_usage(endpoint, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON paas_api_usage(timestamp DESC);

-- Create paas_billing_periods table
CREATE TABLE IF NOT EXISTS paas_billing_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_requests integer DEFAULT 0,
  total_data_transferred_mb numeric(12,2) DEFAULT 0,
  total_execution_time_ms bigint DEFAULT 0,
  base_cost_points numeric(15,2) DEFAULT 0,
  ai_calculated_cost_points numeric(15,2) DEFAULT 0,
  final_cost_points numeric(15,2) DEFAULT 0,
  ai_reasoning text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'billed', 'paid', 'cancelled')),
  billed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_periods_developer ON paas_billing_periods(developer_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_billing_periods_status ON paas_billing_periods(status, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_billing_periods_dates ON paas_billing_periods(period_start, period_end);

-- Create paas_billing_charges table
CREATE TABLE IF NOT EXISTS paas_billing_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_period_id uuid NOT NULL REFERENCES paas_billing_periods(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  charge_type text NOT NULL CHECK (charge_type IN ('api_call', 'data_transfer', 'compute_time', 'premium_feature', 'adjustment')),
  quantity numeric(15,2) NOT NULL,
  unit_price_points numeric(10,4) NOT NULL,
  total_points numeric(15,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_charges_period ON paas_billing_charges(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_billing_charges_developer ON paas_billing_charges(developer_id, created_at DESC);

-- Create paas_pricing_tiers table with default tiers
CREATE TABLE IF NOT EXISTS paas_pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text UNIQUE NOT NULL,
  min_requests_per_day integer NOT NULL,
  max_requests_per_day integer,
  base_cost_per_1000_requests numeric(10,2) NOT NULL,
  data_cost_per_mb numeric(10,4) NOT NULL,
  compute_cost_per_second numeric(10,4) NOT NULL,
  discount_percentage numeric(5,2) DEFAULT 0,
  ai_pricing_enabled boolean DEFAULT true,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default pricing tiers
INSERT INTO paas_pricing_tiers (tier_name, min_requests_per_day, max_requests_per_day, base_cost_per_1000_requests, data_cost_per_mb, compute_cost_per_second, discount_percentage, ai_pricing_enabled)
VALUES 
  ('free', 0, 100, 0, 0, 0, 0, false),
  ('starter', 101, 1000, 10, 0.05, 0.01, 0, true),
  ('professional', 1001, 10000, 8, 0.04, 0.008, 10, true),
  ('enterprise', 10001, NULL, 5, 0.03, 0.005, 20, true)
ON CONFLICT (tier_name) DO NOTHING;

-- Create paas_ai_banker_decisions table
CREATE TABLE IF NOT EXISTS paas_ai_banker_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_period_id uuid NOT NULL REFERENCES paas_billing_periods(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  usage_summary jsonb NOT NULL,
  ai_analysis text NOT NULL,
  base_calculation numeric(15,2) NOT NULL,
  ai_adjustment_factor numeric(5,2) NOT NULL,
  final_cost numeric(15,2) NOT NULL,
  reasoning text NOT NULL,
  model_version text DEFAULT 'gemini-1.5-flash',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_banker_decisions_period ON paas_ai_banker_decisions(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_ai_banker_decisions_developer ON paas_ai_banker_decisions(developer_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE paas_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_billing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_billing_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_ai_banker_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paas_api_usage
CREATE POLICY "Developers can view their own API usage"
  ON paas_api_usage FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_billing_periods
CREATE POLICY "Developers can view their own billing periods"
  ON paas_billing_periods FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_billing_charges
CREATE POLICY "Developers can view their own billing charges"
  ON paas_billing_charges FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_pricing_tiers (public read)
CREATE POLICY "Anyone can view active pricing tiers"
  ON paas_pricing_tiers FOR SELECT
  TO authenticated
  USING (active = true);

-- RLS Policies for paas_ai_banker_decisions
CREATE POLICY "Developers can view their own AI banker decisions"
  ON paas_ai_banker_decisions FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- Function to aggregate usage for billing period
CREATE OR REPLACE FUNCTION calculate_period_usage(p_billing_period_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period record;
  v_usage record;
BEGIN
  -- Get billing period details
  SELECT * INTO v_period
  FROM paas_billing_periods
  WHERE id = p_billing_period_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Billing period not found';
  END IF;

  -- Aggregate usage data
  SELECT 
    COUNT(*) as total_requests,
    COALESCE(SUM((request_size + response_size)::numeric / 1048576), 0) as total_mb,
    COALESCE(SUM(execution_time_ms), 0) as total_exec_ms
  INTO v_usage
  FROM paas_api_usage
  WHERE developer_id = v_period.developer_id
    AND timestamp >= v_period.period_start
    AND timestamp < v_period.period_end;

  -- Update billing period with aggregated data
  UPDATE paas_billing_periods
  SET 
    total_requests = v_usage.total_requests,
    total_data_transferred_mb = v_usage.total_mb,
    total_execution_time_ms = v_usage.total_exec_ms
  WHERE id = p_billing_period_id;
END;
$$;

-- Function to calculate base cost
CREATE OR REPLACE FUNCTION calculate_base_cost(p_billing_period_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period record;
  v_tier record;
  v_base_cost numeric := 0;
  v_avg_requests_per_day numeric;
BEGIN
  -- Get billing period details
  SELECT * INTO v_period
  FROM paas_billing_periods
  WHERE id = p_billing_period_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Billing period not found';
  END IF;

  -- Calculate average requests per day
  v_avg_requests_per_day := v_period.total_requests / 
    GREATEST(1, EXTRACT(EPOCH FROM (v_period.period_end - v_period.period_start)) / 86400);

  -- Find appropriate pricing tier
  SELECT * INTO v_tier
  FROM paas_pricing_tiers
  WHERE active = true
    AND v_avg_requests_per_day >= min_requests_per_day
    AND (max_requests_per_day IS NULL OR v_avg_requests_per_day <= max_requests_per_day)
  ORDER BY min_requests_per_day DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- Default to free tier
    SELECT * INTO v_tier
    FROM paas_pricing_tiers
    WHERE tier_name = 'free';
  END IF;

  -- Calculate base cost
  v_base_cost := 
    (v_period.total_requests::numeric / 1000 * v_tier.base_cost_per_1000_requests) +
    (v_period.total_data_transferred_mb * v_tier.data_cost_per_mb) +
    (v_period.total_execution_time_ms::numeric / 1000 * v_tier.compute_cost_per_second);

  -- Apply tier discount
  v_base_cost := v_base_cost * (1 - v_tier.discount_percentage / 100);

  -- Update billing period
  UPDATE paas_billing_periods
  SET base_cost_points = v_base_cost
  WHERE id = p_billing_period_id;

  RETURN v_base_cost;
END;
$$;

-- Enable realtime for billing tables
ALTER PUBLICATION supabase_realtime ADD TABLE paas_api_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_billing_periods;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_billing_charges;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_ai_banker_decisions;
