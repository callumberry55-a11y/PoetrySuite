/*
  # Enable Realtime for Tax and Economy Tables

  1. Changes
    - Enable realtime for economy_funds table
    - Enable realtime for tax_settings table
    - Enable realtime for tax_transactions table
  
  2. Purpose
    - Allow real-time updates when tax is collected
    - Allow real-time updates when funds are allocated or spent
    - Provide live feedback to developers on tax transactions
*/

-- Enable realtime for economy_funds
ALTER PUBLICATION supabase_realtime ADD TABLE economy_funds;

-- Enable realtime for tax_settings
ALTER PUBLICATION supabase_realtime ADD TABLE tax_settings;

-- Enable realtime for tax_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE tax_transactions;
