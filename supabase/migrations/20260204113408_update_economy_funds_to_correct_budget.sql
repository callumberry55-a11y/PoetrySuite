/*
  # Update Economy Funds to Correct Budget Values
  
  1. Changes
    - Update Rewards Fund from £1.4B to £2.8B (doubled)
    - Update Reserve Fund from £0.75B to £1.5B (doubled)
    - Grant Fund remains at £3.0B (no change)
    
  2. Budget Summary
    - Old Total: £5.15B GBP
    - New Total: £7.3B GBP
    - Increase: +£2.15B GBP (+42%)
    
  3. Rationale
    - Stronger economic foundation as documented in GRANT_FUNDING_BREAKDOWN.md
    - Enhanced stability with doubled reserves
    - Increased capacity for user rewards
    - Better emergency reserves for long-term sustainability
    
  4. Point Allocation
    - Annual point budget: 4.0 billion points
    - Monthly allocation: 333.33 million points
    - Daily allocation: ~10.96 million points
    
  5. Security
    - Only updates amounts, all RLS policies remain unchanged
    - No changes to table structure or permissions
*/

-- Update Rewards Fund from 1.4B to 2.8B (doubled)
UPDATE economy_funds
SET 
  allocated_amount = 2800000000,
  remaining_amount = 2800000000,
  updated_at = now()
WHERE fund_type = 'rewards' AND fiscal_year = 2026;

-- Update Reserve Fund from 0.75B to 1.5B (doubled)
UPDATE economy_funds
SET 
  allocated_amount = 1500000000,
  remaining_amount = 1500000000,
  updated_at = now()
WHERE fund_type = 'reserve' AND fiscal_year = 2026;

-- Verify the totals (for documentation purposes)
-- Grant: £3,000,000,000
-- Rewards: £2,800,000,000
-- Reserve: £1,500,000,000
-- Total: £7,300,000,000

COMMENT ON TABLE economy_funds IS 
'Economy funding pools totaling £7.3B GBP for fiscal year 2026. 
Grant Fund: £3.0B, Rewards Fund: £2.8B, Reserve Fund: £1.5B';
