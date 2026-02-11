/*
  # Add Points System and Store

  1. New Tables
    - `store_items` - Items available for purchase in the points store
      - `id` (uuid, primary key)
      - `name` (text) - Item name
      - `description` (text) - Item description
      - `category` (text) - Type of item (badge, theme, title, avatar, feature)
      - `price` (integer) - Cost in points
      - `stock` (integer) - Available quantity (-1 for unlimited)
      - `icon` (text) - Icon identifier
      - `metadata` (jsonb) - Additional data (colors, badge details, etc.)
      - `is_active` (boolean) - Whether item is available for purchase
      - `created_at` (timestamptz)
    
    - `user_purchases` - Track user purchases from store
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User who made purchase
      - `item_id` (uuid) - Item purchased
      - `price_paid` (integer) - Points spent
      - `purchased_at` (timestamptz)
      - `is_active` (boolean) - Whether purchase is currently active/equipped
  
  2. Changes
    - Add `points_balance` column to user_profiles
    - Add `points_earned_total` column to track lifetime points
  
  3. Security
    - Enable RLS on new tables
    - Add policies for viewing and purchasing items
    - Users can only purchase with their own points
  
  4. Initial Store Items
    - Special badges
    - Profile themes
    - Titles/flair
*/

-- Add points columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'points_balance'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN points_balance integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'points_earned_total'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN points_earned_total integer DEFAULT 0;
  END IF;
END $$;

-- Create store_items table
CREATE TABLE IF NOT EXISTS store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('badge', 'theme', 'title', 'avatar', 'feature', 'boost')),
  price integer NOT NULL CHECK (price >= 0),
  stock integer DEFAULT -1,
  icon text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
  price_paid integer NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_items
CREATE POLICY "Anyone can view active store items"
  ON store_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_purchases
CREATE POLICY "Users can view own purchases"
  ON user_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON user_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases"
  ON user_purchases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_is_active ON store_items(is_active);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);

-- Insert initial store items

-- Special Badges
INSERT INTO store_items (name, description, category, price, icon, metadata)
VALUES
  ('Emerald Bard', 'A special emerald badge for dedicated poets', 'badge', 500, 'gem', '{"rank": "Cli", "color": "emerald"}'),
  ('Ruby Poet', 'An exclusive ruby badge for passionate writers', 'badge', 750, 'gem', '{"rank": "Anruth", "color": "ruby"}'),
  ('Diamond Laureate', 'The most prestigious diamond badge', 'badge', 1500, 'crown', '{"rank": "Ollamh", "color": "diamond"}'),
  ('Celtic Knot Master', 'Ancient Celtic symbol of mastery', 'badge', 1000, 'infinity', '{"rank": "Anruth", "color": "gold"}');

-- Profile Themes
INSERT INTO store_items (name, description, category, price, icon, metadata)
VALUES
  ('Ocean Theme', 'Calming blue ocean theme for your profile', 'theme', 300, 'waves', '{"primary": "#0EA5E9", "secondary": "#0284C7"}'),
  ('Forest Theme', 'Peaceful green forest theme', 'theme', 300, 'tree-pine', '{"primary": "#10B981", "secondary": "#059669"}'),
  ('Sunset Theme', 'Warm orange and pink sunset theme', 'theme', 300, 'sunset', '{"primary": "#F97316", "secondary": "#FB923C"}'),
  ('Midnight Theme', 'Deep purple midnight theme', 'theme', 400, 'moon', '{"primary": "#8B5CF6", "secondary": "#7C3AED"}');

-- Titles/Flair
INSERT INTO store_items (name, description, category, price, icon, metadata)
VALUES
  ('Verse Weaver', 'Display "Verse Weaver" title on your profile', 'title', 200, 'sparkles', '{"title": "Verse Weaver", "color": "blue"}'),
  ('Rhyme Master', 'Display "Rhyme Master" title on your profile', 'title', 200, 'music', '{"title": "Rhyme Master", "color": "purple"}'),
  ('Poetry Scholar', 'Display "Poetry Scholar" title on your profile', 'title', 250, 'graduation-cap', '{"title": "Poetry Scholar", "color": "green"}'),
  ('Bardic Legend', 'Display "Bardic Legend" title on your profile', 'title', 500, 'crown', '{"title": "Bardic Legend", "color": "gold"}');

-- Boosts/Features
INSERT INTO store_items (name, description, category, price, icon, metadata)
VALUES
  ('Spotlight Boost', 'Feature your poem on the feed for 24 hours', 'boost', 150, 'zap', '{"duration": 24, "type": "spotlight"}'),
  ('Double Points Day', 'Earn 2x points for 24 hours', 'boost', 250, 'sparkles', '{"duration": 24, "multiplier": 2}'),
  ('Extra AI Prompts', 'Get 50 additional AI prompt generations', 'feature', 100, 'cpu', '{"amount": 50, "type": "ai_prompts"}');

-- Function to handle point transactions
CREATE OR REPLACE FUNCTION handle_point_transaction(
  p_user_id uuid,
  p_amount integer,
  p_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_type = 'add' THEN
    UPDATE user_profiles
    SET 
      points_balance = points_balance + p_amount,
      points_earned_total = points_earned_total + p_amount
    WHERE user_id = p_user_id;
  ELSIF p_type = 'subtract' THEN
    UPDATE user_profiles
    SET points_balance = points_balance - p_amount
    WHERE user_id = p_user_id
    AND points_balance >= p_amount;
    
    IF NOT FOUND THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to purchase item from store
CREATE OR REPLACE FUNCTION purchase_store_item(
  p_user_id uuid,
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_price integer;
  v_user_balance integer;
  v_item_stock integer;
  v_purchase_id uuid;
BEGIN
  -- Get item details
  SELECT price, stock INTO v_item_price, v_item_stock
  FROM store_items
  WHERE id = p_item_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or not active');
  END IF;
  
  -- Check stock
  IF v_item_stock = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item out of stock');
  END IF;
  
  -- Get user balance
  SELECT points_balance INTO v_user_balance
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  IF v_user_balance < v_item_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points
  UPDATE user_profiles
  SET points_balance = points_balance - v_item_price
  WHERE user_id = p_user_id;
  
  -- Update stock if not unlimited
  IF v_item_stock > 0 THEN
    UPDATE store_items
    SET stock = stock - 1
    WHERE id = p_item_id;
  END IF;
  
  -- Create purchase record
  INSERT INTO user_purchases (user_id, item_id, price_paid)
  VALUES (p_user_id, p_item_id, v_item_price)
  RETURNING id INTO v_purchase_id;
  
  RETURN jsonb_build_object('success', true, 'purchase_id', v_purchase_id);
END;
$$;
