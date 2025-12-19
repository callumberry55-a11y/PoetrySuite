/*
  # Create System Configuration Tables

  1. New Tables
    - `system_config`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Configuration key name
      - `value` (jsonb) - Configuration value
      - `category` (text) - Category for grouping (features, limits, ai, etc.)
      - `description` (text) - Human-readable description
      - `data_type` (text) - Type of value (boolean, number, string, json)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - User who last updated
    
    - `config_history`
      - `id` (uuid, primary key)
      - `config_id` (uuid) - Reference to system_config
      - `old_value` (jsonb)
      - `new_value` (jsonb)
      - `changed_by` (uuid)
      - `change_reason` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only developers can read configuration
    - Only developers can update configuration
    - All changes are logged to history
*/

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL DEFAULT '',
  data_type text NOT NULL DEFAULT 'string',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create config_history table
CREATE TABLE IF NOT EXISTS config_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES system_config(id) ON DELETE CASCADE,
  old_value jsonb NOT NULL,
  new_value jsonb NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  change_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_history ENABLE ROW LEVEL SECURITY;

-- Policies for system_config (developers only)
CREATE POLICY "Developers can read system config"
  ON system_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can update system config"
  ON system_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can insert system config"
  ON system_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  );

-- Policies for config_history (developers only)
CREATE POLICY "Developers can read config history"
  ON config_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  );

CREATE POLICY "Developers can insert config history"
  ON config_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_developer = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_config_history_config_id ON config_history(config_id);
CREATE INDEX IF NOT EXISTS idx_config_history_created_at ON config_history(created_at DESC);

-- Insert default system configurations
INSERT INTO system_config (key, value, category, description, data_type) VALUES
  ('rate_limit_api', '{"requests_per_minute": 60, "burst": 100}', 'limits', 'API rate limiting configuration', 'json'),
  ('feature_ai_assistant', '{"enabled": true, "model": "gpt-4"}', 'features', 'AI writing assistant configuration', 'json'),
  ('feature_community_submissions', '{"enabled": true, "require_approval": true}', 'features', 'Community submissions feature settings', 'json'),
  ('feature_contests', '{"enabled": true, "allow_voting": true}', 'features', 'Poetry contests feature settings', 'json'),
  ('max_poems_per_user', '{"value": 1000}', 'limits', 'Maximum poems a user can create', 'json'),
  ('maintenance_mode', '{"enabled": false, "message": "System maintenance in progress"}', 'system', 'Maintenance mode settings', 'json'),
  ('notification_settings', '{"email_enabled": true, "push_enabled": true}', 'notifications', 'Notification system settings', 'json'),
  ('storage_limits', '{"max_file_size_mb": 10, "max_total_storage_mb": 500}', 'limits', 'Storage limits for user uploads', 'json')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE system_config;
ALTER PUBLICATION supabase_realtime ADD TABLE config_history;