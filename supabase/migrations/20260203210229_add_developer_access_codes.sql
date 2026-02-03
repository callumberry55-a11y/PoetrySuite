/*
  # Add Developer Access Code System

  ## Changes
  Creates a system for managing developer access codes to prevent
  unauthorized registration on the PaaS platform.
  
  ## New Tables
  - `paas_access_codes`
    - `id` (uuid, primary key)
    - `code` (text, unique) - The access code
    - `is_active` (boolean) - Whether code is currently valid
    - `max_uses` (integer, nullable) - Max number of uses (null = unlimited)
    - `current_uses` (integer) - Number of times used
    - `expires_at` (timestamptz, nullable) - When code expires (null = never)
    - `created_by` (uuid, nullable) - Admin who created the code
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ## Security
  - RLS enabled on paas_access_codes
  - Only authenticated users can verify codes (for signup)
  - No policies for reading/writing (only functions can manage)
  
  ## Functions
  - `verify_developer_access_code(code text)` - Verifies and increments usage
*/

-- Create access codes table
CREATE TABLE IF NOT EXISTS paas_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE paas_access_codes ENABLE ROW LEVEL SECURITY;

-- No public policies - only functions can access

-- Function to verify access code
CREATE OR REPLACE FUNCTION verify_developer_access_code(access_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  code_record paas_access_codes%ROWTYPE;
BEGIN
  -- Get the code record
  SELECT * INTO code_record
  FROM paas_access_codes
  WHERE code = access_code
  FOR UPDATE;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if code is active
  IF NOT code_record.is_active THEN
    RETURN false;
  END IF;
  
  -- Check if code has expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < now() THEN
    RETURN false;
  END IF;
  
  -- Check if code has reached max uses
  IF code_record.max_uses IS NOT NULL AND code_record.current_uses >= code_record.max_uses THEN
    RETURN false;
  END IF;
  
  -- Increment usage counter
  UPDATE paas_access_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = now()
  WHERE id = code_record.id;
  
  RETURN true;
END;
$$;

-- Insert a default access code for testing (change this in production!)
INSERT INTO paas_access_codes (code, is_active, max_uses)
VALUES ('POET2026', true, NULL)
ON CONFLICT (code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_code ON paas_access_codes(code) WHERE is_active = true;