/*
  # Fix Security Definer Views

  1. **Security Improvement**
    - Change all views from SECURITY DEFINER to SECURITY INVOKER
    - This ensures views execute with the privileges of the querying user
    - Allows RLS policies to work properly on underlying tables
    - Reduces security risk from privilege escalation

  2. **Views Updated**
    - user_tax_history
    - weekly_distributions_summary
    - tax_rate_history
    - tax_rate_projection
*/

-- =====================================================
-- 1. Fix user_tax_history View
-- =====================================================

CREATE OR REPLACE VIEW user_tax_history 
WITH (security_invoker = true) AS
SELECT 
  utt.id,
  utt.user_id,
  utt.amount_points,
  utt.tax_rate,
  utt.tax_type,
  utt.transaction_period,
  utt.amount_deleted,
  utt.amount_to_reserve,
  utt.status,
  utt.processed_at,
  utt.created_at,
  EXTRACT(YEAR FROM TO_DATE(utt.transaction_period, 'YYYY-MM')) as year,
  EXTRACT(MONTH FROM TO_DATE(utt.transaction_period, 'YYYY-MM')) as month
FROM user_tax_transactions utt
ORDER BY utt.processed_at DESC;

-- =====================================================
-- 2. Fix weekly_distributions_summary View
-- =====================================================

CREATE OR REPLACE VIEW weekly_distributions_summary 
WITH (security_invoker = true) AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(WEEK FROM distribution_date) as week_number,
  EXTRACT(YEAR FROM distribution_date) as year
FROM weekly_distributions
ORDER BY distribution_date DESC;

-- =====================================================
-- 3. Fix tax_rate_history View
-- =====================================================

CREATE OR REPLACE VIEW tax_rate_history 
WITH (security_invoker = true) AS
SELECT 
  tra.id,
  tra.adjustment_year,
  tra.previous_tax_rate,
  tra.new_tax_rate,
  tra.previous_purchase_tax_rate,
  tra.new_purchase_tax_rate,
  tra.adjustment_amount,
  tra.reason,
  tra.applied_at,
  tra.created_at,
  (tra.new_tax_rate - tra.previous_tax_rate) as monthly_tax_increase,
  (tra.new_purchase_tax_rate - tra.previous_purchase_tax_rate) as purchase_tax_increase,
  ROUND(((tra.new_tax_rate - tra.previous_tax_rate) / tra.previous_tax_rate * 100), 2) as monthly_tax_increase_percent,
  ROUND(((tra.new_purchase_tax_rate - tra.previous_purchase_tax_rate) / tra.previous_purchase_tax_rate * 100), 2) as purchase_tax_increase_percent
FROM tax_rate_adjustments tra
ORDER BY tra.adjustment_year DESC;

-- =====================================================
-- 4. Fix tax_rate_projection View
-- =====================================================

CREATE OR REPLACE VIEW tax_rate_projection 
WITH (security_invoker = true) AS
SELECT 
  ts.tax_rate as current_monthly_tax,
  ts.purchase_tax_rate as current_purchase_tax,
  ts.next_adjustment_year,
  ts.tax_rate + 0.5 as projected_monthly_tax_next_year,
  ts.purchase_tax_rate + 0.5 as projected_purchase_tax_next_year,
  ts.tax_rate + (0.5 * 5) as projected_monthly_tax_5_years,
  ts.purchase_tax_rate + (0.5 * 5) as projected_purchase_tax_5_years,
  ts.tax_rate + (0.5 * 10) as projected_monthly_tax_10_years,
  ts.purchase_tax_rate + (0.5 * 10) as projected_purchase_tax_10_years
FROM tax_settings ts
WHERE ts.is_active = true
ORDER BY ts.created_at DESC
LIMIT 1;
