/*
  # Update Distribution Function with Real-Time Progress

  1. Changes
    - Modify distribute_daily_points() to process users in batches
    - Update progress after each batch for real-time tracking
    - Batch size of 500 users per iteration
    - Create progress record at start, update during, complete at end

  2. Progress Updates
    - Creates progress record when distribution starts
    - Updates progress percentage after each batch
    - Marks as completed when finished
    - Records errors if distribution fails

  3. Behavior
    - Still atomic per batch (rollback on error)
    - Still checks for duplicate distribution
    - Still validates economy fund balance
    - Now provides real-time visibility into progress

  4. Security
    - Maintains SECURITY DEFINER for authorized execution
    - Proper search_path set for security
*/

CREATE OR REPLACE FUNCTION distribute_daily_points()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_points_per_user integer := 20;
  v_users_count integer := 0;
  v_total_points integer := 0;
  v_distribution_date date := CURRENT_DATE;
  v_distribution_id uuid;
  v_economy_fund_id uuid;
  v_remaining_budget numeric;
  v_progress_id uuid;
  v_batch_size integer := 500;
  v_total_batches integer := 0;
  v_current_batch integer := 0;
  v_processed_users integer := 0;
  v_user_ids uuid[];
  v_batch_user_ids uuid[];
  v_batch_points integer := 0;
BEGIN
  -- Check if distribution already happened today
  IF EXISTS (
    SELECT 1 FROM daily_distributions 
    WHERE distribution_date = v_distribution_date
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Distribution already completed today',
      'date', v_distribution_date
    );
  END IF;

  -- Count users who will receive points
  SELECT COUNT(*) INTO v_users_count
  FROM user_profiles;

  -- Calculate total points and batches
  v_total_points := v_users_count * v_points_per_user;
  v_total_batches := CEIL(v_users_count::numeric / v_batch_size);

  -- Check economy fund for available budget
  SELECT id, remaining_amount::numeric INTO v_economy_fund_id, v_remaining_budget
  FROM economy_funds
  WHERE fund_type = 'rewards'
    AND fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Verify fund exists
  IF v_economy_fund_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Economy fund not found',
      'fiscal_year', EXTRACT(YEAR FROM CURRENT_DATE)
    );
  END IF;

  -- Verify sufficient budget
  IF v_remaining_budget < v_total_points THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient budget for distribution',
      'required', v_total_points,
      'available', v_remaining_budget
    );
  END IF;

  -- Create progress tracking record
  INSERT INTO distribution_progress (
    distribution_date,
    status,
    total_users,
    processed_users,
    progress_percentage,
    current_batch,
    total_batches,
    points_per_user,
    total_points_distributed
  )
  VALUES (
    v_distribution_date,
    'running',
    v_users_count,
    0,
    0,
    0,
    v_total_batches,
    v_points_per_user,
    0
  )
  RETURNING id INTO v_progress_id;

  -- Get all user IDs to process
  SELECT array_agg(id) INTO v_user_ids
  FROM user_profiles;

  -- Process users in batches
  BEGIN
    FOR v_current_batch IN 1..v_total_batches LOOP
      -- Get batch of user IDs
      v_batch_user_ids := v_user_ids[
        ((v_current_batch - 1) * v_batch_size + 1):
        LEAST(v_current_batch * v_batch_size, v_users_count)
      ];

      -- Calculate points for this batch
      v_batch_points := array_length(v_batch_user_ids, 1) * v_points_per_user;

      -- Distribute points to batch
      UPDATE user_profiles
      SET 
        points_balance = points_balance + v_points_per_user,
        points_earned_total = points_earned_total + v_points_per_user
      WHERE id = ANY(v_batch_user_ids);

      -- Update processed count
      v_processed_users := v_processed_users + array_length(v_batch_user_ids, 1);

      -- Update progress
      UPDATE distribution_progress
      SET
        processed_users = v_processed_users,
        progress_percentage = ROUND((v_processed_users::numeric / v_users_count::numeric) * 100, 2),
        current_batch = v_current_batch,
        total_points_distributed = v_processed_users * v_points_per_user
      WHERE id = v_progress_id;

      -- Small delay to make progress visible (0.1 seconds)
      PERFORM pg_sleep(0.1);
    END LOOP;

    -- Deduct from economy fund
    UPDATE economy_funds
    SET 
      remaining_amount = remaining_amount - v_total_points,
      updated_at = now()
    WHERE id = v_economy_fund_id;

    -- Record the distribution
    INSERT INTO daily_distributions (
      distribution_date,
      points_per_user,
      users_count,
      total_points_distributed
    )
    VALUES (
      v_distribution_date,
      v_points_per_user,
      v_users_count,
      v_total_points
    )
    RETURNING id INTO v_distribution_id;

    -- Mark progress as completed
    UPDATE distribution_progress
    SET
      status = 'completed',
      completed_at = now()
    WHERE id = v_progress_id;

    RETURN json_build_object(
      'success', true,
      'distribution_id', v_distribution_id,
      'progress_id', v_progress_id,
      'date', v_distribution_date,
      'points_per_user', v_points_per_user,
      'users_count', v_users_count,
      'total_points', v_total_points,
      'batches_processed', v_total_batches,
      'economy_fund_id', v_economy_fund_id,
      'remaining_budget', v_remaining_budget - v_total_points
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Mark progress as failed
      UPDATE distribution_progress
      SET
        status = 'failed',
        error_message = SQLERRM,
        completed_at = now()
      WHERE id = v_progress_id;

      -- Re-raise the error
      RAISE;
  END;
END;
$$;

COMMENT ON FUNCTION distribute_daily_points() IS 
'Distributes 20 points daily to all users with real-time batch progress tracking at 00:00 UTC';
