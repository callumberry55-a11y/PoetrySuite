/*
  # Enable Real-Time for PaaS Tables

  ## Changes
  Enables Supabase real-time subscriptions for PaaS dashboard tables
  so the developer dashboard updates automatically when data changes.
  
  ## Tables Enabled
  - paas_developers (profile updates)
  - paas_point_accounts (balance changes)
  - paas_api_keys (new keys, revocations)
  - paas_transactions (new transactions)
  
  ## Security
  Real-time subscriptions still respect RLS policies, so developers
  can only see their own data in real-time.
*/

-- Enable real-time for PaaS tables
ALTER PUBLICATION supabase_realtime ADD TABLE paas_developers;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_point_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_api_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE paas_transactions;