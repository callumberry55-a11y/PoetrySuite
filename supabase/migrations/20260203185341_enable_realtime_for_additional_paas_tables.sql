/*
  # Enable Real-Time for Additional PaaS Tables

  ## Changes
  Enables Supabase real-time subscriptions for additional PaaS tables
  used in admin dashboards and monitoring.
  
  ## Tables Enabled
  - paas_api_logs (real-time API monitoring)
  - paas_security_events (real-time security alerts)
  - paas_point_grants (real-time point grants)
  - paas_rate_limits (rate limit updates)
  
  ## Security
  Real-time subscriptions respect RLS policies.
*/

-- Enable real-time for additional PaaS tables
ALTER PUBLICATION supabase_realtime ADD TABLE paas_api_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_security_events;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_point_grants;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_rate_limits;