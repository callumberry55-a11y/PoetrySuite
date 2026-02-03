# Tax and Weekly Distribution System

## Overview

This document describes the dual tax system, weekly point distribution, and automatic annual tax inflation implemented in the application.

## Tax System

### 1. Monthly Tax (5%)

**Applies to:** All users with positive point balances

**Rate:** 5% of current balance

**Distribution:**
- 50% (2.5%) deleted from circulation to control inflation
- 50% (2.5%) added to reserve fund

**Important Rules:**
- Users with 0 points are NEVER taxed
- Tax is calculated at the beginning of each month
- Tracked in `user_tax_transactions` table

### 2. Purchase Tax (1.5%)

**Applies to:** All store purchases

**Rate:** 1.5% of purchase price

**Distribution:**
- 50% (0.75%) deleted from circulation
- 50% (0.75%) added to reserve fund

**Important Rules:**
- Applied automatically during checkout
- Total cost = item price + tax
- Tax amount shown separately to users

## Weekly Point Distribution

### Automatic Weekly Bonus

**Amount:** 10 points per user

**Frequency:** Every week

**Eligibility:** All registered users

**Tax Treatment:**
- Points are tax-free when distributed
- They enter the user's balance immediately
- They become subject to monthly tax starting the next month

### How It Works

1. Every week, the system distributes 10 points to each user
2. Points are added to `points_balance` in `user_profiles`
3. Distribution is tracked in `weekly_distributions` table
4. Users can spend these points immediately with only the 1.5% purchase tax
5. At the beginning of next month, if balance > 0, the 5% monthly tax applies

## Automatic Tax Inflation

### Annual Tax Rate Adjustment

**Inflation Rate:** 0.5% per year

**Frequency:** Once per year

**Applies To:** Both monthly tax rate and purchase tax rate

**Purpose:** Maintain economic balance and control long-term inflation

### How It Works

1. Every year, both tax rates automatically increase by 0.5%
2. Example progression:
   - Year 1: Monthly 5.0%, Purchase 1.5%
   - Year 2: Monthly 5.5%, Purchase 2.0%
   - Year 3: Monthly 6.0%, Purchase 2.5%
   - Year 4: Monthly 6.5%, Purchase 3.0%
   - Year 5: Monthly 7.0%, Purchase 3.5%

3. All adjustments are tracked in the `tax_rate_adjustments` table
4. The `tax_settings` table tracks the next scheduled adjustment year
5. Adjustments are applied automatically via the `apply_annual_tax_inflation()` function

### Tax Rate Projections

Users can view projected tax rates for future years:
- **1 year:** Current rate + 0.5%
- **5 years:** Current rate + 2.5%
- **10 years:** Current rate + 5.0%

### Economic Impact

**Benefits:**
- Prevents excessive hoarding of points
- Encourages active participation in the economy
- Maintains purchasing power over time
- Creates predictable, transparent system growth

**Protection Mechanisms:**
- Zero-balance users are never taxed (even with rate increases)
- Weekly bonus points remain tax-free until the following month
- All rate changes are publicly visible and auditable
- Historical adjustments are preserved for transparency

## Database Functions

### For Users (Regular Points)

- `distribute_weekly_points()` - Distributes 10 points to all users
- `calculate_monthly_taxes_users()` - Calculates and applies monthly tax to users with positive balance

### For Developers (PaaS Economy)

- `calculate_monthly_taxes()` - Calculates and applies monthly tax to developers
- `apply_purchase_tax()` - Applies purchase tax on store transactions

### For Tax Management

- `apply_annual_tax_inflation()` - Applies automatic 0.5% increase to both tax rates
  - Checks if adjustment is due based on `next_adjustment_year`
  - Records adjustment in `tax_rate_adjustments` table
  - Updates `tax_settings` with new rates
  - Schedules next adjustment for following year
  - Returns detailed adjustment information

## Tax Protection

Users are protected from taxation in the following scenarios:

1. **Zero Balance Protection:** Users with exactly 0 points are never taxed
2. **Weekly Bonus:** The 10 weekly points can be used immediately without monthly tax
3. **Current Month Exemption:** Points earned during a month are not taxed until the following month

## Example Scenarios

### Scenario 1: New User

- Week 1: User receives 10 points (balance: 10)
- Week 2: User receives 10 points (balance: 20)
- Week 3: User receives 10 points (balance: 30)
- Week 4: User receives 10 points (balance: 40)
- End of Month 1: No tax applied (these are the current month's earnings)
- Beginning of Month 2: 5% tax applied = 2 points (balance: 38)

### Scenario 2: User with Zero Balance

- User has 0 points
- Monthly tax runs
- User is skipped (no tax applied)
- User receives 10 points weekly bonus
- Still no monthly tax until next month

### Scenario 3: Store Purchase

- User has 100 points
- Wants to buy item for 50 points
- Purchase tax: 50 × 1.5% = 1 point (rounded up)
- Total cost: 51 points
- After purchase: 49 points remaining

### Scenario 4: Long-Term User with Inflation

**Year 1:**
- User starts with 0 points
- Receives 10 points per week × 52 weeks = 520 points earned
- Tax rate: 5%
- End of year balance after monthly taxes: ~450 points

**Year 2:**
- Tax rate increases to 5.5% (automatic 0.5% inflation)
- Receives 10 points per week × 52 weeks = 520 points earned
- Starting balance: 450 + 520 = 970 points
- End of year balance after monthly taxes: ~870 points

**Year 3:**
- Tax rate increases to 6.0%
- Pattern continues with gradually increasing tax rates
- User is incentivized to spend points rather than hoard

**Key Takeaway:** The automatic inflation system ensures points remain active in the economy while protecting users who actively participate (via weekly bonuses that offset inflation).

## Implementation Notes

### Database Tables

- `user_tax_transactions` - Tracks all tax transactions for regular users
- `tax_transactions` - Tracks tax transactions for PaaS developers
- `weekly_distributions` - Tracks weekly point distributions
- `tax_settings` - Stores current tax rates, settings, and next adjustment year
- `tax_rate_adjustments` - Historical record of all tax rate increases

### Security

- All tax and distribution functions use `SECURITY DEFINER`
- Row Level Security (RLS) enabled on all tables
- Users can only view their own tax transactions
- Weekly distribution can only be triggered by authorized functions

### Realtime Updates

- Tax transactions support realtime subscriptions
- Users receive immediate notification of tax deductions
- Weekly distributions are logged with timestamps

## Future Enhancements

1. Admin dashboard for manual weekly distribution triggers
2. Tax holiday periods during special events
3. Graduated tax rates based on balance tiers
4. Tax refund system for special circumstances
5. Detailed tax reporting and analytics
6. Automated scheduled execution of annual tax inflation adjustments
7. Community voting mechanism for inflation rate changes
8. Dynamic inflation rates based on economic indicators
9. Tax rate caps to prevent excessive taxation over time
10. Notification system to alert users before tax adjustments
