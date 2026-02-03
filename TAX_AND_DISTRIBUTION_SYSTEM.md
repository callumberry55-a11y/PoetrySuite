# Tax and Weekly Distribution System

## Overview

This document describes the dual tax system and weekly point distribution implemented in the application.

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

## Database Functions

### For Users (Regular Points)

- `distribute_weekly_points()` - Distributes 10 points to all users
- `calculate_monthly_taxes_users()` - Calculates and applies monthly tax to users with positive balance

### For Developers (PaaS Economy)

- `calculate_monthly_taxes()` - Calculates and applies monthly tax to developers
- `apply_purchase_tax()` - Applies purchase tax on store transactions

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

## Implementation Notes

### Database Tables

- `user_tax_transactions` - Tracks all tax transactions for regular users
- `tax_transactions` - Tracks tax transactions for PaaS developers
- `weekly_distributions` - Tracks weekly point distributions
- `tax_settings` - Stores current tax rates and settings

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
