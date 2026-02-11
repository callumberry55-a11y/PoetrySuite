/*
  # Update Access Code System for Single-Use Codes

  ## Changes
  Updates the access code system to ensure each code can only be used once
  and is permanently linked to the developer account that uses it.
  
  ## Schema Updates
  1. **paas_access_codes table**
     - Add `used_by` column to track which user used the code
     - Add foreign key constraint to auth.users
  
  2. **paas_developers table**
     - Add `access_code_id` column to track which code was used
     - Add foreign key constraint to paas_access_codes
  
  ## Access Codes
  - Remove default POET2026 code
  - Add new single-use codes: GB4545, GB1245, GB4556, GB2732
  - Each code can only be used once (max_uses = 1)
  
  ## Security
  - Codes are permanently linked to developer accounts
  - Used codes cannot be reused by other developers
  - Bidirectional tracking (code -> user, developer -> code)
*/

-- Add used_by column to paas_access_codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paas_access_codes' AND column_name = 'used_by'
  ) THEN
    ALTER TABLE paas_access_codes 
    ADD COLUMN used_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add access_code_id column to paas_developers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paas_developers' AND column_name = 'access_code_id'
  ) THEN
    ALTER TABLE paas_developers 
    ADD COLUMN access_code_id uuid REFERENCES paas_access_codes(id);
  END IF;
END $$;

-- Remove old test code
DELETE FROM paas_access_codes WHERE code = 'POET2026';

-- Insert new single-use codes
INSERT INTO paas_access_codes (code, is_active, max_uses)
VALUES 
  ('GB4545', true, 1),
  ('GB1245', true, 1),
  ('GB4556', true, 1),
  ('GB2732', true, 1)
ON CONFLICT (code) DO NOTHING;

-- Update the verification function to link code to user
CREATE OR REPLACE FUNCTION verify_developer_access_code(access_code text, user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  code_record paas_access_codes%ROWTYPE;
  code_id uuid;
BEGIN
  -- Get the code record
  SELECT * INTO code_record
  FROM paas_access_codes
  WHERE code = access_code
  FOR UPDATE;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;
  
  -- Check if code is active
  IF NOT code_record.is_active THEN
    RAISE EXCEPTION 'Access code is no longer active';
  END IF;
  
  -- Check if code has expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < now() THEN
    RAISE EXCEPTION 'Access code has expired';
  END IF;
  
  -- Check if code has already been used
  IF code_record.used_by IS NOT NULL THEN
    RAISE EXCEPTION 'Access code has already been used';
  END IF;
  
  -- Check if code has reached max uses
  IF code_record.max_uses IS NOT NULL AND code_record.current_uses >= code_record.max_uses THEN
    RAISE EXCEPTION 'Access code has reached maximum uses';
  END IF;
  
  -- Mark code as used and link to user
  UPDATE paas_access_codes
  SET 
    current_uses = current_uses + 1,
    used_by = user_id,
    updated_at = now()
  WHERE id = code_record.id;
  
  -- Return the code ID for linking to developer account
  RETURN code_record.id;
END;
$$;

-- Create index for faster lookups on used_by
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_used_by ON paas_access_codes(used_by);

-- Create index for faster lookups on access_code_id in paas_developers
CREATE INDEX IF NOT EXISTS idx_paas_developers_access_code_id ON paas_developers(access_code_id);