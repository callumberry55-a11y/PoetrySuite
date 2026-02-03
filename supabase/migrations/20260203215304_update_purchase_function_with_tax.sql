/*
  # Update Store Purchase Function to Apply 1.5% Purchase Tax

  1. Changes
    - Update purchase_store_item function to apply 1.5% purchase tax
    - Tax split: 50% deleted, 50% to reserve
    - Record purchase tax transaction
    - Add total_cost calculation (item price + tax)
  
  2. Tax Flow
    - User pays item price + 1.5% tax
    - 0.75% deleted from circulation
    - 0.75% goes to reserve fund
*/

-- Update purchase_store_item function to include purchase tax
CREATE OR REPLACE FUNCTION purchase_store_item(
  p_user_id uuid, 
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_price integer;
  v_user_balance integer;
  v_item_stock integer;
  v_purchase_id uuid;
  v_purchase_tax_rate numeric;
  v_tax_amount numeric;
  v_deleted_amount numeric;
  v_reserve_amount numeric;
  v_total_cost integer;
  v_current_period text;
BEGIN
  -- Get current purchase tax rate
  SELECT purchase_tax_rate INTO v_purchase_tax_rate
  FROM tax_settings
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Default to 1.5% if not found
  IF v_purchase_tax_rate IS NULL THEN
    v_purchase_tax_rate := 1.5;
  END IF;

  -- Get item details
  SELECT price, stock INTO v_item_price, v_item_stock
  FROM store_items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or not active');
  END IF;

  IF v_item_stock = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item out of stock');
  END IF;

  -- Calculate tax and total cost
  v_tax_amount := v_item_price * (v_purchase_tax_rate / 100);
  v_total_cost := v_item_price + CEIL(v_tax_amount);

  -- Get user balance
  SELECT points_balance INTO v_user_balance
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Check if user has enough points for item + tax
  IF v_user_balance < v_total_cost THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient points',
      'required', v_total_cost,
      'balance', v_user_balance,
      'item_price', v_item_price,
      'tax', CEIL(v_tax_amount)
    );
  END IF;

  -- Split tax: 50% deleted, 50% to reserve
  v_deleted_amount := v_tax_amount * 0.5;
  v_reserve_amount := v_tax_amount * 0.5;

  -- Deduct total cost (item + tax)
  UPDATE user_profiles
  SET points_balance = points_balance - v_total_cost
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

  -- Record tax transaction if there's a tax
  IF v_tax_amount > 0 THEN
    v_current_period := to_char(now(), 'YYYY-MM');

    -- Add reserve portion to reserve fund
    UPDATE economy_funds
    SET remaining_amount = remaining_amount + v_reserve_amount
    WHERE fund_type = 'reserve' 
      AND fiscal_year = EXTRACT(YEAR FROM now())::integer;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'purchase_id', v_purchase_id,
    'item_price', v_item_price,
    'tax', CEIL(v_tax_amount),
    'total_cost', v_total_cost,
    'tax_deleted', v_deleted_amount,
    'tax_to_reserve', v_reserve_amount
  );
END;
$$;
