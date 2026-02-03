/*
  # Stanzalink PaaS Infrastructure

  1. New Tables
    - `paas_developers`
      - Developer accounts with Google OAuth verification
      - Subscription status (£35/month)
      - API access level and permissions
    
    - `paas_api_keys`
      - API keys for developers
      - Rate limits and permissions
      - Expiration and revocation tracking
    
    - `paas_point_accounts`
      - Point balance tracking (£0.75 per point)
      - Vesting schedules for grants
      - Transaction history
    
    - `paas_point_grants`
      - 3M point grants and milestone tracking
      - Vesting schedules based on mastery milestones
      - Unlock conditions
    
    - `paas_transactions`
      - All point movements
      - API call costs
      - Transfer history
    
    - `paas_api_logs`
      - API usage tracking
      - Endpoint access logs
      - Performance metrics
    
    - `paas_security_events`
      - AI Guard blocks and alerts
      - Manual override records
      - Threat detection logs
    
    - `paas_rate_limits`
      - Per-developer rate limiting
      - Endpoint-specific limits
      - Burst allowances

  2. Security
    - Enable RLS on all tables
    - Policies for developer access
    - Admin-only access to sensitive data
    
  3. Indexes
    - Performance indexes for API lookups
    - Transaction history queries
*/

-- Developer Accounts
CREATE TABLE IF NOT EXISTS paas_developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  google_developer_id text UNIQUE,
  email text NOT NULL,
  organization_name text,
  subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  subscription_amount_gbp decimal(10,2) DEFAULT 35.00,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Keys
CREATE TABLE IF NOT EXISTS paas_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  name text NOT NULL,
  permissions jsonb DEFAULT '{"neural": true, "economy": true, "social": true, "guard": true}'::jsonb,
  rate_limit_per_hour integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Point Accounts
CREATE TABLE IF NOT EXISTS paas_point_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance_points decimal(15,2) DEFAULT 0 CHECK (balance_points >= 0),
  balance_gbp decimal(15,2) GENERATED ALWAYS AS (balance_points * 0.75) STORED,
  total_earned decimal(15,2) DEFAULT 0,
  total_spent decimal(15,2) DEFAULT 0,
  vested_points decimal(15,2) DEFAULT 0,
  unvested_points decimal(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Point Grants (3M point system)
CREATE TABLE IF NOT EXISTS paas_point_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL,
  grant_type text NOT NULL CHECK (grant_type IN ('initial', 'milestone', 'bonus', 'manual')),
  total_points decimal(15,2) NOT NULL,
  vested_points decimal(15,2) DEFAULT 0,
  unvested_points decimal(15,2) NOT NULL,
  vesting_schedule jsonb DEFAULT '[]'::jsonb,
  milestone_name text,
  milestone_conditions jsonb,
  is_active boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  fully_vested_at timestamptz
);

-- Point Transactions
CREATE TABLE IF NOT EXISTS paas_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('api_call', 'transfer', 'grant', 'refund', 'subscription')),
  amount_points decimal(15,2) NOT NULL,
  amount_gbp decimal(15,2) GENERATED ALWAYS AS (amount_points * 0.75) STORED,
  balance_before decimal(15,2) NOT NULL,
  balance_after decimal(15,2) NOT NULL,
  endpoint text,
  api_key_id uuid REFERENCES paas_api_keys(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- API Usage Logs
CREATE TABLE IF NOT EXISTS paas_api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL,
  api_key_id uuid REFERENCES paas_api_keys(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  http_method text NOT NULL,
  status_code integer NOT NULL,
  request_size_bytes integer,
  response_size_bytes integer,
  response_time_ms integer,
  points_charged decimal(10,2),
  ip_address text,
  user_agent text,
  request_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Security Events
CREATE TABLE IF NOT EXISTS paas_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES paas_api_keys(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('blocked', 'override', 'threat_detected', 'rate_limit', 'suspicious_activity')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  endpoint text,
  reason text NOT NULL,
  ai_guard_decision jsonb,
  manual_override_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  override_reason text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Rate Limits
CREATE TABLE IF NOT EXISTS paas_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES paas_developers(id) ON DELETE CASCADE NOT NULL,
  endpoint_pattern text NOT NULL,
  requests_per_hour integer NOT NULL DEFAULT 1000,
  requests_per_day integer NOT NULL DEFAULT 10000,
  current_hour_count integer DEFAULT 0,
  current_day_count integer DEFAULT 0,
  hour_reset_at timestamptz DEFAULT date_trunc('hour', now() + interval '1 hour'),
  day_reset_at timestamptz DEFAULT date_trunc('day', now() + interval '1 day'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(developer_id, endpoint_pattern)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paas_developers_user_id ON paas_developers(user_id);
CREATE INDEX IF NOT EXISTS idx_paas_developers_google_id ON paas_developers(google_developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_keys_developer ON paas_api_keys(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_keys_hash ON paas_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_paas_transactions_developer ON paas_transactions(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_developer ON paas_api_logs(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_endpoint ON paas_api_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paas_security_events_developer ON paas_security_events(developer_id, created_at DESC);

-- Enable RLS
ALTER TABLE paas_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_point_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_point_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE paas_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Developers (view own data)
CREATE POLICY "Developers can view own developer account"
  ON paas_developers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Developers can update own account"
  ON paas_developers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Developers can view own API keys"
  ON paas_api_keys FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can create own API keys"
  ON paas_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can update own API keys"
  ON paas_api_keys FOR UPDATE
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()))
  WITH CHECK (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own point account"
  ON paas_point_accounts FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own grants"
  ON paas_point_grants FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own transactions"
  ON paas_transactions FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own API logs"
  ON paas_api_logs FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own security events"
  ON paas_security_events FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view own rate limits"
  ON paas_rate_limits FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM paas_developers WHERE user_id = auth.uid()));

-- Function to update point account balance
CREATE OR REPLACE FUNCTION update_point_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE paas_point_accounts
  SET 
    balance_points = NEW.balance_after,
    total_spent = CASE 
      WHEN NEW.amount_points < 0 THEN total_spent + ABS(NEW.amount_points)
      ELSE total_spent
    END,
    total_earned = CASE 
      WHEN NEW.amount_points > 0 THEN total_earned + NEW.amount_points
      ELSE total_earned
    END,
    updated_at = now()
  WHERE developer_id = NEW.developer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update balances
DROP TRIGGER IF EXISTS trigger_update_point_balance ON paas_transactions;
CREATE TRIGGER trigger_update_point_balance
  AFTER INSERT ON paas_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_point_balance();

-- Function to initialize point account when developer is created
CREATE OR REPLACE FUNCTION initialize_developer_point_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO paas_point_accounts (developer_id)
  VALUES (NEW.id)
  ON CONFLICT (developer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create point account
DROP TRIGGER IF EXISTS trigger_initialize_point_account ON paas_developers;
CREATE TRIGGER trigger_initialize_point_account
  AFTER INSERT ON paas_developers
  FOR EACH ROW
  EXECUTE FUNCTION initialize_developer_point_account();
