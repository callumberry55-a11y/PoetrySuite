/*
  # Add Monthly Sales System

  1. Changes to store_items table
    - Add `discount_percentage` column (0-100, default 0 for no discount)
    - Add `sale_ends_at` column (timestamptz, null if not on sale)
    - Add `original_price` column to track pre-discount price

  2. Indexes
    - Index on sale_ends_at for efficient querying of active sales

  3. Security
    - No RLS changes needed (inherits existing policies)

  4. Initial Sale Items
    - Set up 4 items with different discount tiers:
      - 75% off
      - 50% off
      - 30% off
      - 25% off
*/

-- Add discount columns to store_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_items' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE store_items ADD COLUMN discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_items' AND column_name = 'sale_ends_at'
  ) THEN
    ALTER TABLE store_items ADD COLUMN sale_ends_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_items' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE store_items ADD COLUMN original_price integer;
  END IF;
END $$;

-- Create index for efficient sale queries
CREATE INDEX IF NOT EXISTS idx_store_items_sale_ends_at ON store_items(sale_ends_at) WHERE sale_ends_at IS NOT NULL;

-- Add some sample sale items (75% off, 50% off, 30% off, 25% off)
-- These will be on sale until the end of the current month

DO $$
DECLARE
  sale_end_date timestamptz := (date_trunc('month', now()) + interval '1 month')::timestamptz;
BEGIN
  -- 75% off item
  INSERT INTO store_items (
    name,
    description,
    category,
    price,
    original_price,
    discount_percentage,
    sale_ends_at,
    stock,
    icon,
    metadata,
    is_active
  ) VALUES (
    'Premium Poetry Badge',
    'Exclusive premium badge showing your dedication to the craft. Limited time offer!',
    'badge',
    250,
    1000,
    75,
    sale_end_date,
    -1,
    'crown',
    '{"color": "gold", "rarity": "legendary"}'::jsonb,
    true
  ) ON CONFLICT DO NOTHING;

  -- 50% off item
  INSERT INTO store_items (
    name,
    description,
    category,
    price,
    original_price,
    discount_percentage,
    sale_ends_at,
    stock,
    icon,
    metadata,
    is_active
  ) VALUES (
    'Ocean Blue Theme',
    'Beautiful ocean-inspired theme for your profile. Half price this month!',
    'theme',
    500,
    1000,
    50,
    sale_end_date,
    -1,
    'palette',
    '{"primaryColor": "#0077be", "accentColor": "#00a8e8"}'::jsonb,
    true
  ) ON CONFLICT DO NOTHING;

  -- 30% off item
  INSERT INTO store_items (
    name,
    description,
    category,
    price,
    original_price,
    discount_percentage,
    sale_ends_at,
    stock,
    icon,
    metadata,
    is_active
  ) VALUES (
    'Master Poet Title',
    'Display your expertise with this prestigious title. Special discount!',
    'title',
    700,
    1000,
    30,
    sale_end_date,
    -1,
    'award',
    '{"titleText": "Master Poet", "titleColor": "purple"}'::jsonb,
    true
  ) ON CONFLICT DO NOTHING;

  -- 25% off item
  INSERT INTO store_items (
    name,
    description,
    category,
    price,
    original_price,
    discount_percentage,
    sale_ends_at,
    stock,
    icon,
    metadata,
    is_active
  ) VALUES (
    'Weekly Points Boost',
    'Double your weekly points for 7 days. Save 25% today!',
    'boost',
    750,
    1000,
    25,
    sale_end_date,
    50,
    'zap',
    '{"duration": "7 days", "multiplier": 2}'::jsonb,
    true
  ) ON CONFLICT DO NOTHING;
END $$;
