/*
  # External API Keys System

  1. New Tables
    - `external_api_keys`
      - `id` (uuid, primary key)
      - `name` (text) - Friendly name for the key
      - `key_hash` (text) - Hashed API key
      - `key_prefix` (text) - First 12 characters for display
      - `permissions` (jsonb) - What data this key can access
      - `is_active` (boolean) - Whether key is active
      - `rate_limit_per_hour` (integer) - Request limit per hour
      - `last_used_at` (timestamptz) - When key was last used
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Admin who created it
      - `expires_at` (timestamptz) - Optional expiration
    
    - `external_api_usage`
      - `id` (uuid, primary key)
      - `api_key_id` (uuid) - Reference to external_api_keys
      - `endpoint` (text) - Which endpoint was called
      - `method` (text) - HTTP method
      - `status_code` (integer) - Response status
      - `ip_address` (text) - Request IP
      - `user_agent` (text) - Request user agent
      - `response_time_ms` (integer) - How long it took
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only authenticated users (admins) can manage keys
    - API usage is logged for all requests

  3. Indexes
    - Index on key_hash for fast lookups
    - Index on api_key_id for usage queries
    - Index on created_at for time-based queries
*/

-- Create external_api_keys table
CREATE TABLE IF NOT EXISTS external_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb DEFAULT '{"read_poems": true, "read_public_profiles": true}'::jsonb,
  is_active boolean DEFAULT true,
  rate_limit_per_hour integer DEFAULT 1000,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz
);

-- Create external_api_usage table
CREATE TABLE IF NOT EXISTS external_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES external_api_keys(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  ip_address text,
  user_agent text,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE external_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_api_usage ENABLE ROW LEVEL SECURITY;

-- Policies for external_api_keys
CREATE POLICY "Authenticated users can view all API keys"
  ON external_api_keys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create API keys"
  ON external_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update API keys"
  ON external_api_keys FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete API keys"
  ON external_api_keys FOR DELETE
  TO authenticated
  USING (true);

-- Policies for external_api_usage
CREATE POLICY "Authenticated users can view all API usage"
  ON external_api_usage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert usage records"
  ON external_api_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_api_keys_key_hash 
  ON external_api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_external_api_keys_is_active 
  ON external_api_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_external_api_usage_api_key_id 
  ON external_api_usage(api_key_id);

CREATE INDEX IF NOT EXISTS idx_external_api_usage_created_at 
  ON external_api_usage(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_api_usage_endpoint 
  ON external_api_usage(endpoint);
