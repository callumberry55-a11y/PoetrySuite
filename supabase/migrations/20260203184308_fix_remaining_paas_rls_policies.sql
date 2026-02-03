/*
  # Fix Remaining PaaS RLS Policies

  ## Changes
  Updates RLS policies for paas_api_logs, paas_security_events, paas_rate_limits,
  and paas_point_grants to correctly check against the developer's user_id.
  
  ## Security
  - Developers can only access their own data
  - Policies use EXISTS to check user_id in paas_developers table
*/

-- Fix paas_api_logs policies
DROP POLICY IF EXISTS "Developers can view own API logs" ON paas_api_logs;

CREATE POLICY "Developers can view own API logs"
  ON paas_api_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_api_logs.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

-- Fix paas_security_events policies
DROP POLICY IF EXISTS "Developers can view own security events" ON paas_security_events;

CREATE POLICY "Developers can view own security events"
  ON paas_security_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_security_events.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

-- Fix paas_rate_limits policies
DROP POLICY IF EXISTS "Developers can view own rate limits" ON paas_rate_limits;

CREATE POLICY "Developers can view own rate limits"
  ON paas_rate_limits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_rate_limits.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );

-- Fix paas_point_grants policies
DROP POLICY IF EXISTS "Developers can view own grants" ON paas_point_grants;

CREATE POLICY "Developers can view own grants"
  ON paas_point_grants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paas_developers
      WHERE paas_developers.id = paas_point_grants.developer_id
        AND paas_developers.user_id = auth.uid()
    )
  );