/*
  # AI Security Guard System

  1. New Tables
    - `security_guard_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for user-related events)
      - `event_type` (text) - login, registration, password_change, suspicious_activity, etc.
      - `severity` (text) - low, medium, high, critical
      - `ip_address` (text)
      - `user_agent` (text)
      - `metadata` (jsonb) - additional event details
      - `risk_score` (integer) - 0-100
      - `blocked` (boolean) - whether the action was blocked
      - `ai_analysis` (text) - AI-generated analysis
      - `created_at` (timestamptz)
      
    - `security_guard_patterns`
      - `id` (uuid, primary key)
      - `pattern_type` (text) - failed_login, rapid_requests, unusual_location, etc.
      - `threshold` (integer) - number of occurrences to trigger
      - `time_window_minutes` (integer) - time window for pattern detection
      - `severity` (text)
      - `auto_block` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      
    - `security_guard_blocks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `ip_address` (text, nullable)
      - `block_type` (text) - user, ip, email_domain
      - `reason` (text)
      - `blocked_until` (timestamptz, nullable) - null means permanent
      - `created_by` (text) - ai or admin
      - `created_at` (timestamptz)
      
    - `security_guard_alerts`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references security_guard_events)
      - `alert_type` (text)
      - `message` (text)
      - `acknowledged` (boolean)
      - `acknowledged_by` (uuid, nullable)
      - `acknowledged_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only admins and the AI system can write
    - Admins can read all security events
    - Users can see their own security events (limited view)

  3. Functions
    - `log_security_event` - Log security events
    - `check_security_blocks` - Check if user/IP is blocked
    - `analyze_security_pattern` - Detect suspicious patterns
    - `create_security_alert` - Create alerts for admins
*/

-- Create security guard events table
CREATE TABLE IF NOT EXISTS security_guard_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  blocked boolean DEFAULT false,
  ai_analysis text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_guard_events_user_id ON security_guard_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_guard_events_event_type ON security_guard_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_guard_events_created_at ON security_guard_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_guard_events_severity ON security_guard_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_guard_events_ip ON security_guard_events(ip_address);

-- Create security patterns table
CREATE TABLE IF NOT EXISTS security_guard_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text NOT NULL UNIQUE,
  threshold integer NOT NULL DEFAULT 5,
  time_window_minutes integer NOT NULL DEFAULT 60,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_block boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create security blocks table
CREATE TABLE IF NOT EXISTS security_guard_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  block_type text NOT NULL CHECK (block_type IN ('user', 'ip', 'email_domain')),
  reason text NOT NULL,
  blocked_until timestamptz,
  created_by text NOT NULL DEFAULT 'ai',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_guard_blocks_user_id ON security_guard_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_security_guard_blocks_ip ON security_guard_blocks(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_guard_blocks_until ON security_guard_blocks(blocked_until);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS security_guard_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES security_guard_events(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_guard_alerts_event_id ON security_guard_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_security_guard_alerts_acknowledged ON security_guard_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_guard_alerts_created_at ON security_guard_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE security_guard_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_guard_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_guard_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_guard_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_guard_events
CREATE POLICY "Users can view own security events"
  ON security_guard_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert security events"
  ON security_guard_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for security_guard_patterns
CREATE POLICY "Anyone can view active patterns"
  ON security_guard_patterns FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for security_guard_blocks
CREATE POLICY "Users can view own blocks"
  ON security_guard_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for security_guard_alerts
CREATE POLICY "Service role can manage alerts"
  ON security_guard_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_severity text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_risk_score integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO security_guard_events (
    user_id,
    event_type,
    severity,
    ip_address,
    user_agent,
    metadata,
    risk_score
  ) VALUES (
    p_user_id,
    p_event_type,
    p_severity,
    p_ip_address,
    p_user_agent,
    p_metadata,
    p_risk_score
  ) RETURNING id INTO v_event_id;

  -- Create alert if severity is high or critical
  IF p_severity IN ('high', 'critical') THEN
    INSERT INTO security_guard_alerts (
      event_id,
      alert_type,
      message
    ) VALUES (
      v_event_id,
      'security_threat',
      format('Security event: %s (severity: %s, risk score: %s)', p_event_type, p_severity, p_risk_score)
    );
  END IF;

  RETURN v_event_id;
END;
$$;

-- Function to check if user/IP is blocked
CREATE OR REPLACE FUNCTION check_security_blocks(
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS TABLE (
  is_blocked boolean,
  block_reason text,
  blocked_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    true as is_blocked,
    b.reason as block_reason,
    b.blocked_until
  FROM security_guard_blocks b
  WHERE
    (b.user_id = p_user_id OR b.ip_address = p_ip_address)
    AND (b.blocked_until IS NULL OR b.blocked_until > now())
  ORDER BY b.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::timestamptz;
  END IF;
END;
$$;

-- Function to analyze security patterns
CREATE OR REPLACE FUNCTION analyze_security_pattern(
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_event_type text DEFAULT NULL
)
RETURNS TABLE (
  pattern_detected boolean,
  pattern_type text,
  event_count bigint,
  should_block boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pattern RECORD;
  v_event_count bigint;
BEGIN
  FOR v_pattern IN
    SELECT * FROM security_guard_patterns
    WHERE is_active = true
      AND (p_event_type IS NULL OR pattern_type = p_event_type)
  LOOP
    SELECT COUNT(*) INTO v_event_count
    FROM security_guard_events
    WHERE
      (p_user_id IS NULL OR user_id = p_user_id)
      AND (p_ip_address IS NULL OR ip_address = p_ip_address)
      AND event_type = v_pattern.pattern_type
      AND created_at > now() - (v_pattern.time_window_minutes || ' minutes')::interval;

    IF v_event_count >= v_pattern.threshold THEN
      RETURN QUERY SELECT
        true,
        v_pattern.pattern_type,
        v_event_count,
        v_pattern.auto_block;
      RETURN;
    END IF;
  END LOOP;

  RETURN QUERY SELECT false, NULL::text, 0::bigint, false;
END;
$$;

-- Insert default security patterns
INSERT INTO security_guard_patterns (pattern_type, threshold, time_window_minutes, severity, auto_block) VALUES
  ('failed_login', 5, 15, 'high', true),
  ('rapid_registration', 3, 60, 'medium', false),
  ('password_change', 3, 60, 'medium', false),
  ('unusual_activity', 10, 30, 'high', false),
  ('suspicious_ip', 1, 1, 'critical', true)
ON CONFLICT (pattern_type) DO NOTHING;

-- Enable realtime for security events
ALTER PUBLICATION supabase_realtime ADD TABLE security_guard_events;
ALTER PUBLICATION supabase_realtime ADD TABLE security_guard_alerts;