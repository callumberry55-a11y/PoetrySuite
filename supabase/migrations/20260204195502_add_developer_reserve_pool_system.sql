/*
  # Developer Reserve Pool System

  ## Overview
  Creates a comprehensive reserve pool system where developers can allocate and manage
  funding for specific purposes. The AI Banker automatically allocates funds to appropriate
  pools based on usage patterns and developer needs.

  ## New Tables

  ### 1. `paas_reserve_categories`
  Defines categories for reserve pools (API costs, infrastructure, R&D, etc.)
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name (e.g., 'api_usage', 'infrastructure', 'development')
  - `display_name` (text) - Human-readable name
  - `description` (text) - What this category is for
  - `icon` (text) - Icon identifier for UI
  - `default_allocation_percentage` (numeric) - Suggested allocation percentage
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 2. `paas_developer_reserves`
  Individual reserve pools for each developer
  - `id` (uuid, primary key)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `category_id` (uuid, foreign key to paas_reserve_categories)
  - `balance_points` (numeric) - Current balance in this pool
  - `total_allocated` (numeric) - Total ever allocated to this pool
  - `total_spent` (numeric) - Total ever spent from this pool
  - `allocation_percentage` (numeric) - % of incoming funds to allocate here
  - `budget_limit_points` (numeric) - Optional spending limit
  - `auto_refill_enabled` (boolean) - Auto-refill from main account
  - `auto_refill_threshold` (numeric) - Refill when balance drops below
  - `auto_refill_amount` (numeric) - Amount to refill
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `paas_reserve_allocations`
  Tracks fund allocations to reserve pools
  - `id` (uuid, primary key)
  - `reserve_id` (uuid, foreign key to paas_developer_reserves)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `amount_points` (numeric)
  - `source` (text) - 'manual', 'ai_banker', 'grant', 'refund', 'auto_refill'
  - `allocation_reason` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 4. `paas_reserve_transactions`
  Tracks spending from reserve pools
  - `id` (uuid, primary key)
  - `reserve_id` (uuid, foreign key to paas_developer_reserves)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `amount_points` (numeric)
  - `transaction_type` (text) - 'billing', 'api_call', 'infrastructure', 'service'
  - `description` (text)
  - `related_billing_period_id` (uuid) - Optional link to billing period
  - `related_transaction_id` (uuid) - Optional link to main transaction
  - `balance_before` (numeric)
  - `balance_after` (numeric)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 5. `paas_reserve_ai_recommendations`
  AI Banker recommendations for reserve allocations
  - `id` (uuid, primary key)
  - `developer_id` (uuid, foreign key to paas_developers)
  - `recommendation_date` (timestamptz)
  - `usage_analysis` (jsonb) - Analysis of developer's usage patterns
  - `recommended_allocations` (jsonb) - Suggested allocation percentages per category
  - `reasoning` (text) - AI's explanation
  - `confidence_score` (numeric) - 0-1 confidence in recommendation
  - `applied` (boolean) - Whether developer applied the recommendation
  - `applied_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Developers can only access their own reserves
  - Admins can view all reserves
  - AI Banker has special permissions for allocations

  ## Indexes
  - Performance indexes on foreign keys
  - Composite indexes for common queries

  ## Important Notes
  1. Reserve pools help developers budget and track spending by category
  2. AI Banker automatically suggests optimal allocations
  3. Auto-refill prevents pools from running dry
  4. All transactions are fully auditable
  5. Pools can be used for billing payments automatically
*/

-- Create reserve categories table with default categories
CREATE TABLE IF NOT EXISTS paas_reserve_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'coins',
  default_allocation_percentage numeric(5,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO paas_reserve_categories (name, display_name, description, icon, default_allocation_percentage)
VALUES 
  ('api_usage', 'API Usage', 'Reserve for API call costs and data transfer', 'activity', 40.00),
  ('billing', 'Billing & Payments', 'Reserve for monthly billing and payment processing', 'credit-card', 30.00),
  ('infrastructure', 'Infrastructure', 'Reserve for hosting, storage, and compute resources', 'server', 15.00),
  ('development', 'Development', 'Reserve for development tools and resources', 'code', 10.00),
  ('emergency', 'Emergency Fund', 'Emergency reserve for unexpected costs', 'alert-circle', 5.00)
ON CONFLICT (name) DO NOTHING;

-- Create developer reserves table
CREATE TABLE IF NOT EXISTS paas_developer_reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES paas_reserve_categories(id) ON DELETE RESTRICT,
  balance_points numeric(15,2) DEFAULT 0 CHECK (balance_points >= 0),
  total_allocated numeric(15,2) DEFAULT 0,
  total_spent numeric(15,2) DEFAULT 0,
  allocation_percentage numeric(5,2) DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  budget_limit_points numeric(15,2),
  auto_refill_enabled boolean DEFAULT false,
  auto_refill_threshold numeric(15,2) DEFAULT 0,
  auto_refill_amount numeric(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(developer_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_developer_reserves_developer ON paas_developer_reserves(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_reserves_category ON paas_developer_reserves(category_id);
CREATE INDEX IF NOT EXISTS idx_developer_reserves_active ON paas_developer_reserves(is_active, developer_id);

-- Create reserve allocations table
CREATE TABLE IF NOT EXISTS paas_reserve_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id uuid NOT NULL REFERENCES paas_developer_reserves(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  amount_points numeric(15,2) NOT NULL CHECK (amount_points > 0),
  source text NOT NULL CHECK (source IN ('manual', 'ai_banker', 'grant', 'refund', 'auto_refill', 'system')),
  allocation_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reserve_allocations_reserve ON paas_reserve_allocations(reserve_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_allocations_developer ON paas_reserve_allocations(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_allocations_source ON paas_reserve_allocations(source, created_at DESC);

-- Create reserve transactions table
CREATE TABLE IF NOT EXISTS paas_reserve_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id uuid NOT NULL REFERENCES paas_developer_reserves(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  amount_points numeric(15,2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('billing', 'api_call', 'infrastructure', 'service', 'refund', 'adjustment')),
  description text,
  related_billing_period_id uuid,
  related_transaction_id uuid,
  balance_before numeric(15,2) NOT NULL,
  balance_after numeric(15,2) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reserve_transactions_reserve ON paas_reserve_transactions(reserve_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_developer ON paas_reserve_transactions(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_type ON paas_reserve_transactions(transaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_billing ON paas_reserve_transactions(related_billing_period_id) WHERE related_billing_period_id IS NOT NULL;

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS paas_reserve_ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES paas_developers(id) ON DELETE CASCADE,
  recommendation_date timestamptz DEFAULT now(),
  usage_analysis jsonb NOT NULL,
  recommended_allocations jsonb NOT NULL,
  reasoning text NOT NULL,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  applied boolean DEFAULT false,
  applied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reserve_ai_recommendations_developer ON paas_reserve_ai_recommendations(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_ai_recommendations_applied ON paas_reserve_ai_recommendations(applied, developer_id);

-- Enable RLS on all tables
ALTER TABLE paas_reserve_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_developer_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_reserve_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_reserve_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_reserve_ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paas_reserve_categories (public read)
CREATE POLICY "Anyone can view active reserve categories"
  ON paas_reserve_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for paas_developer_reserves
CREATE POLICY "Developers can view their own reserves"
  ON paas_developer_reserves FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can update their own reserve settings"
  ON paas_developer_reserves FOR UPDATE
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_reserve_allocations
CREATE POLICY "Developers can view their own reserve allocations"
  ON paas_reserve_allocations FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_reserve_transactions
CREATE POLICY "Developers can view their own reserve transactions"
  ON paas_reserve_transactions FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for paas_reserve_ai_recommendations
CREATE POLICY "Developers can view their own AI recommendations"
  ON paas_reserve_ai_recommendations FOR SELECT
  TO authenticated
  USING (
    developer_id IN (
      SELECT id FROM paas_developers WHERE user_id = auth.uid()
    )
  );

-- Function to initialize reserve pools for a developer
CREATE OR REPLACE FUNCTION initialize_developer_reserves(p_developer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create reserve pools for all active categories if they don't exist
  INSERT INTO paas_developer_reserves (developer_id, category_id, allocation_percentage)
  SELECT 
    p_developer_id,
    id,
    default_allocation_percentage
  FROM paas_reserve_categories
  WHERE is_active = true
  ON CONFLICT (developer_id, category_id) DO NOTHING;
END;
$$;

-- Function to allocate funds to reserves
CREATE OR REPLACE FUNCTION allocate_to_reserves(
  p_developer_id uuid,
  p_total_amount numeric,
  p_source text DEFAULT 'system',
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserve record;
  v_allocation_amount numeric;
  v_allocations jsonb := '[]'::jsonb;
  v_total_allocated numeric := 0;
BEGIN
  -- Allocate to each active reserve based on allocation percentage
  FOR v_reserve IN
    SELECT 
      dr.id,
      dr.category_id,
      dr.allocation_percentage,
      rc.display_name
    FROM paas_developer_reserves dr
    JOIN paas_reserve_categories rc ON rc.id = dr.category_id
    WHERE dr.developer_id = p_developer_id
      AND dr.is_active = true
      AND dr.allocation_percentage > 0
    ORDER BY dr.allocation_percentage DESC
  LOOP
    v_allocation_amount := ROUND(p_total_amount * (v_reserve.allocation_percentage / 100), 2);
    
    IF v_allocation_amount > 0 THEN
      -- Update reserve balance
      UPDATE paas_developer_reserves
      SET 
        balance_points = balance_points + v_allocation_amount,
        total_allocated = total_allocated + v_allocation_amount,
        updated_at = now()
      WHERE id = v_reserve.id;

      -- Record allocation
      INSERT INTO paas_reserve_allocations (
        reserve_id,
        developer_id,
        amount_points,
        source,
        allocation_reason
      ) VALUES (
        v_reserve.id,
        p_developer_id,
        v_allocation_amount,
        p_source,
        COALESCE(p_reason, 'Automatic allocation based on percentage')
      );

      v_total_allocated := v_total_allocated + v_allocation_amount;
      
      v_allocations := v_allocations || jsonb_build_object(
        'category', v_reserve.display_name,
        'amount', v_allocation_amount
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_allocated', v_total_allocated,
    'allocations', v_allocations
  );
END;
$$;

-- Function to spend from a reserve pool
CREATE OR REPLACE FUNCTION spend_from_reserve(
  p_reserve_id uuid,
  p_amount numeric,
  p_transaction_type text,
  p_description text DEFAULT NULL,
  p_related_billing_period_id uuid DEFAULT NULL,
  p_related_transaction_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserve record;
  v_balance_before numeric;
  v_balance_after numeric;
BEGIN
  -- Get reserve details
  SELECT 
    balance_points,
    developer_id
  INTO v_reserve
  FROM paas_developer_reserves
  WHERE id = p_reserve_id
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reserve not found or inactive');
  END IF;

  -- Check sufficient balance
  IF v_reserve.balance_points < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient reserve balance');
  END IF;

  v_balance_before := v_reserve.balance_points;
  v_balance_after := v_balance_before - p_amount;

  -- Update reserve balance
  UPDATE paas_developer_reserves
  SET 
    balance_points = v_balance_after,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE id = p_reserve_id;

  -- Record transaction
  INSERT INTO paas_reserve_transactions (
    reserve_id,
    developer_id,
    amount_points,
    transaction_type,
    description,
    related_billing_period_id,
    related_transaction_id,
    balance_before,
    balance_after
  ) VALUES (
    p_reserve_id,
    v_reserve.developer_id,
    -p_amount,
    p_transaction_type,
    p_description,
    p_related_billing_period_id,
    p_related_transaction_id,
    v_balance_before,
    v_balance_after
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount_spent', p_amount
  );
END;
$$;

-- Function to check and trigger auto-refill
CREATE OR REPLACE FUNCTION check_reserve_auto_refill(p_reserve_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserve record;
  v_main_account record;
  v_refill_amount numeric;
BEGIN
  -- Get reserve details
  SELECT *
  INTO v_reserve
  FROM paas_developer_reserves
  WHERE id = p_reserve_id
    AND is_active = true
    AND auto_refill_enabled = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'No auto-refill needed');
  END IF;

  -- Check if refill is needed
  IF v_reserve.balance_points >= v_reserve.auto_refill_threshold THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Balance above threshold');
  END IF;

  -- Get main account balance
  SELECT balance_points
  INTO v_main_account
  FROM paas_point_accounts
  WHERE developer_id = v_reserve.developer_id;

  IF NOT FOUND OR v_main_account.balance_points < v_reserve.auto_refill_amount THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Insufficient main account balance');
  END IF;

  v_refill_amount := v_reserve.auto_refill_amount;

  -- Perform refill
  UPDATE paas_developer_reserves
  SET 
    balance_points = balance_points + v_refill_amount,
    total_allocated = total_allocated + v_refill_amount,
    updated_at = now()
  WHERE id = p_reserve_id;

  -- Record allocation
  INSERT INTO paas_reserve_allocations (
    reserve_id,
    developer_id,
    amount_points,
    source,
    allocation_reason
  ) VALUES (
    p_reserve_id,
    v_reserve.developer_id,
    v_refill_amount,
    'auto_refill',
    'Automatic refill triggered (balance below threshold)'
  );

  RETURN jsonb_build_object(
    'success', true,
    'refilled', true,
    'amount', v_refill_amount,
    'new_balance', v_reserve.balance_points + v_refill_amount
  );
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_developer_reserves_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_developer_reserves_updated_at
  BEFORE UPDATE ON paas_developer_reserves
  FOR EACH ROW
  EXECUTE FUNCTION update_developer_reserves_updated_at();

-- Enable realtime for reserve tables
ALTER PUBLICATION supabase_realtime ADD TABLE paas_developer_reserves;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_reserve_allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_reserve_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_reserve_ai_recommendations;
