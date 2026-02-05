# Tax System Update - January 2026

## Overview

The Poetry Suite economy now has three types of taxes to maintain economic balance and fund ongoing development.

## Tax Rates

| Tax Type | Rate | Frequency | Collection Period |
|----------|------|-----------|-------------------|
| **Purchase Tax** | 1.5% | On every purchase | Per transaction |
| **Monthly Tax** | 10% | Monthly | 1st of each month |
| **Maintenance Tax** | 3.25% | Quarterly | Jan, Apr, Jul, Oct |

## What Changed

### Purchase Tax Reduction
- **Previous Rate**: 2%
- **New Rate**: 1.5%
- **Applied to**: Store item purchases
- **Effect**: Users save 0.5% on all purchases

### New Maintenance Tax
- **Rate**: 3.25%
- **Applied to**: All user point balances
- **Collection**: Quarterly (January, April, July, October)
- **Purpose**: Platform maintenance and infrastructure costs

## Tax Distribution

All tax revenue is split equally:
- **50%** → Developer Payment Pool
- **50%** → Reserve Fund

### Developer Payment Pool
Funds distributed equally among active PaaS developers each period.

### Reserve Fund
Used for:
- Emergency economic interventions
- Special events and contests
- Community grants
- System stability

## How Taxes Are Calculated

### Purchase Tax (1.5%)
```
Item Price: 1000 points
Tax: 15 points (1.5%)
Total Cost: 1015 points

Distribution:
- To Developers: 8 points
- To Reserve: 7 points
```

### Monthly Tax (10%)
```
User Balance: 5000 points
Tax: 500 points (10%)
New Balance: 4500 points

Distribution:
- To Developers: 250 points
- To Reserve: 250 points
```

### Maintenance Tax (3.25%)
```
User Balance: 10000 points
Tax: 325 points (3.25%)
New Balance: 9675 points

Distribution:
- To Developers: 163 points
- To Reserve: 162 points
```

## Collection Schedule

### Automated Collection
All taxes are collected automatically:

1. **Purchase Tax**: Instant (on purchase)
2. **Monthly Tax**: 1st of each month at 00:00 UTC
3. **Maintenance Tax**: 1st of January, April, July, October at 00:00 UTC

### Prevention of Double Collection
Each tax function checks if collection already occurred for the current period to prevent double-charging.

## Database Functions

### Available Functions

#### Calculate Monthly Tax
```sql
SELECT calculate_monthly_taxes_users();
```
Returns:
```json
{
  "success": true,
  "period": "2026-01",
  "tax_rate": 10.0,
  "users_taxed": 150,
  "total_tax_collected": 75000,
  "to_developers": 37500,
  "to_reserve": 37500
}
```

#### Calculate Maintenance Tax
```sql
SELECT calculate_maintenance_tax();
```
Returns:
```json
{
  "success": true,
  "period": "2026-Q1",
  "tax_rate": 3.25,
  "users_taxed": 150,
  "total_tax_collected": 24375,
  "to_developers": 12188,
  "to_reserve": 12187
}
```

#### Purchase Store Item
```sql
SELECT purchase_store_item(
  '123e4567-e89b-12d3-a456-426614174000'::uuid,  -- user_id
  '987fcdeb-51a2-43f7-8c9d-0123456789ab'::uuid   -- item_id
);
```
Returns:
```json
{
  "success": true,
  "item_price": 1000,
  "tax_amount": 15,
  "tax_rate": 1.5,
  "total_cost": 1015,
  "to_developers": 8,
  "to_reserve": 7
}
```

#### Check If Maintenance Tax Should Run
```sql
SELECT should_collect_maintenance_tax();
```
Returns: `true` in Jan/Apr/Jul/Oct, `false` otherwise

## Tax Transaction History

All taxes are recorded in the `user_tax_transactions` table:

```sql
SELECT
  tax_type,
  amount_points,
  tax_rate,
  transaction_period,
  amount_deleted,
  amount_to_reserve,
  processed_at
FROM user_tax_transactions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY processed_at DESC;
```

### Tax Types
- `purchase` - Purchase tax
- `monthly` - Monthly balance tax
- `maintenance` - Quarterly maintenance tax

## Economic Impact

### Revenue Projections

Assuming 1,000 active users with average balance of 5,000 points:

**Monthly Tax (10%)**
- Per user: 500 points
- Total collected: 500,000 points/month
- To developers: 250,000 points/month
- To reserve: 250,000 points/month

**Maintenance Tax (3.25% quarterly)**
- Per user: 163 points
- Total collected: 162,500 points/quarter
- To developers: 81,250 points/quarter
- To reserve: 81,250 points/quarter

**Purchase Tax (1.5% on transactions)**
- Varies by purchase volume
- Lower than before (was 2%)

### Annual Developer Funding

From taxes alone (excluding other revenue):
- Monthly tax: 3,000,000 points/year
- Maintenance tax: 325,000 points/year
- Purchase tax: ~200,000 points/year (estimated)
- **Total to developers: ~1,762,500 points/year**

## User Impact

### For Regular Users
- **Benefit**: Lower purchase tax (1.5% vs 2%)
- **New cost**: 3.25% maintenance tax quarterly
- **Net effect**: Slightly higher overall taxation, but more predictable

### For Active Shoppers
- Immediate savings on every purchase
- Quarterly maintenance tax is less than savings if purchasing frequently

### For Point Accumulators
- Monthly and maintenance taxes encourage spending
- Holding large balances is more expensive
- Promotes active participation in economy

## Migration Details

### Database Changes
- Updated `tax_settings` table with new rates
- Added `maintenance_tax_rate` column
- Created `calculate_maintenance_tax()` function
- Updated `purchase_store_item()` function
- Enhanced `developer_payment_pool` constraints

### Backward Compatibility
- All existing tax transactions preserved
- Previous tax rates deactivated but kept in history
- No data loss or corruption

### Applied Migration
Filename: `update_tax_rates_add_maintenance_tax.sql`

## Testing Recommendations

### Test Purchase Tax
```sql
-- Should apply 1.5% tax
SELECT purchase_store_item(user_id, item_id);
```

### Test Monthly Tax
```sql
-- Should apply 10% tax to all balances
SELECT calculate_monthly_taxes_users();
```

### Test Maintenance Tax
```sql
-- Should apply 3.25% tax to all balances
SELECT calculate_maintenance_tax();
```

### Verify Tax Rates
```sql
SELECT
  tax_rate as monthly_rate,
  purchase_tax_rate,
  maintenance_tax_rate,
  is_active
FROM tax_settings
WHERE is_active = true;
```

Expected result:
```
monthly_rate: 10.0
purchase_tax_rate: 1.5
maintenance_tax_rate: 3.25
is_active: true
```

## Future Adjustments

### Annual Inflation Adjustment
Tax rates automatically adjust by 1% annually to account for point inflation. This is calculated and applied automatically.

### Manual Adjustments
To update tax rates manually:

```sql
-- Deactivate current settings
UPDATE tax_settings SET is_active = false WHERE is_active = true;

-- Insert new settings
INSERT INTO tax_settings (
  tax_rate,
  purchase_tax_rate,
  maintenance_tax_rate,
  collection_frequency,
  is_active
) VALUES (
  10.0,  -- monthly tax
  1.5,   -- purchase tax
  3.25,  -- maintenance tax
  'monthly',
  true
);
```

## Monitoring

### View Total Tax Revenue
```sql
SELECT
  tax_type,
  SUM(amount_points) as total_collected,
  SUM(amount_deleted) as to_developers,
  SUM(amount_to_reserve) as to_reserve,
  COUNT(*) as transaction_count
FROM user_tax_transactions
WHERE processed_at >= date_trunc('month', now())
GROUP BY tax_type;
```

### View Developer Payment Pool
```sql
SELECT
  source_type,
  fiscal_period,
  total_collected_points,
  distributed_points,
  remaining_points
FROM developer_payment_pool
ORDER BY created_at DESC;
```

### View Reserve Fund
```sql
SELECT
  fund_type,
  remaining_amount,
  fiscal_year
FROM economy_funds
WHERE fund_type = 'reserve';
```

## Support

If you have questions about the tax system:
1. Check transaction history in your profile
2. Review this documentation
3. Contact platform administrators
4. Submit feedback through the app

## Summary

The new tax system balances:
- **Lower transaction costs** (1.5% purchase tax)
- **Sustainable funding** (quarterly maintenance)
- **Fair distribution** (50/50 split to developers and reserve)
- **Economic stability** (discourages hoarding, encourages activity)

This creates a healthy, self-sustaining economy that rewards active participation while funding continued development and platform maintenance.
