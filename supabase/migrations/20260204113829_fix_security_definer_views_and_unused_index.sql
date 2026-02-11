/*
  # Fix Security Definer Views and Remove Unused Index
  
  1. Security Improvements
    - Recreate `daily_distributions_summary` view without SECURITY DEFINER
    - Recreate `tax_rate_projection` view without SECURITY DEFINER
    - Views now run with invoker's permissions (more secure)
    - Prevents privilege escalation vulnerabilities
    
  2. Performance Optimization
    - Remove unused index `idx_daily_distributions_date`
    - Index was not being used by any queries
    - Reduces storage overhead and write performance impact
    
  3. Impact
    - Views still function identically for authorized users
    - Improved security posture by removing SECURITY DEFINER
    - Slightly improved write performance on daily_distributions table
    
  4. Notes
    - SECURITY DEFINER allows views to bypass RLS and run with creator's permissions
    - SECURITY INVOKER (default) is safer as it respects caller's permissions
    - These views only read data, so SECURITY DEFINER is unnecessary
*/

-- Drop unused index
DROP INDEX IF EXISTS idx_daily_distributions_date;

-- Recreate daily_distributions_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS daily_distributions_summary;

CREATE VIEW daily_distributions_summary 
WITH (security_invoker = true) AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(dow FROM distribution_date) AS day_of_week,
  EXTRACT(week FROM distribution_date) AS week_number,
  EXTRACT(year FROM distribution_date) AS year
FROM daily_distributions
ORDER BY distribution_date DESC;

-- Grant appropriate permissions
GRANT SELECT ON daily_distributions_summary TO authenticated;

-- Recreate tax_rate_projection view without SECURITY DEFINER
DROP VIEW IF EXISTS tax_rate_projection;

CREATE VIEW tax_rate_projection 
WITH (security_invoker = true) AS
SELECT 
  tax_rate AS current_monthly_tax,
  purchase_tax_rate AS current_purchase_tax,
  next_adjustment_year,
  LEAST(tax_rate + 1.0, 26.0) AS projected_monthly_tax_next_year,
  LEAST(purchase_tax_rate + 1.0, 26.0) AS projected_purchase_tax_next_year,
  LEAST(tax_rate + (1.0 * 5), 26.0) AS projected_monthly_tax_5_years,
  LEAST(purchase_tax_rate + (1.0 * 5), 26.0) AS projected_purchase_tax_5_years,
  LEAST(tax_rate + (1.0 * 10), 26.0) AS projected_monthly_tax_10_years,
  LEAST(purchase_tax_rate + (1.0 * 10), 26.0) AS projected_purchase_tax_10_years,
  CASE
    WHEN tax_rate >= 26.0 THEN 0
    ELSE CEIL((26.0 - tax_rate) / 1.0)
  END AS years_until_monthly_cap,
  CASE
    WHEN purchase_tax_rate >= 26.0 THEN 0
    ELSE CEIL((26.0 - purchase_tax_rate) / 1.0)
  END AS years_until_purchase_cap
FROM tax_settings ts
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 1;

-- Grant appropriate permissions
GRANT SELECT ON tax_rate_projection TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW daily_distributions_summary IS 
'Summary view of daily point distributions with date extractions. Runs with SECURITY INVOKER for enhanced security.';

COMMENT ON VIEW tax_rate_projection IS 
'Tax rate projections over time with cap calculations. Runs with SECURITY INVOKER for enhanced security.';
