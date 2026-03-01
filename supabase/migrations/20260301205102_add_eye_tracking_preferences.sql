/*
  # Add Eye Tracking Preferences

  1. Changes to user_preferences table
    - Add eye_tracking_enabled (boolean)
    - Add eye_tracking_sensitivity (numeric)
    - Add eye_tracking_dwell_time (integer)
    - Add eye_tracking_smoothing (numeric)
    - Add eye_tracking_show_indicator (boolean)
    - Add eye_tracking_dwell_click (boolean)
    - Add eye_tracking_smooth_scroll (boolean)
    - Add eye_tracking_calibrated (boolean)

  2. Security
    - No RLS changes needed (already secured)
    - Fields are nullable for backward compatibility

  3. Notes
    - All eye tracking settings are stored per user
    - Calibration state is persisted
    - Default values ensure safe operation
    - Settings independent from hand gestures
*/

-- Add eye tracking preference columns to user_preferences
DO $$
BEGIN
  -- Eye tracking enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_enabled'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_enabled boolean DEFAULT false;
  END IF;

  -- Sensitivity (0.5 to 2.0, default 1.0)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_sensitivity'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_sensitivity numeric(3,1) DEFAULT 1.0 CHECK (eye_tracking_sensitivity >= 0.5 AND eye_tracking_sensitivity <= 2.0);
  END IF;

  -- Dwell time in milliseconds (500 to 3000, default 1500)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_dwell_time'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_dwell_time integer DEFAULT 1500 CHECK (eye_tracking_dwell_time >= 500 AND eye_tracking_dwell_time <= 3000);
  END IF;

  -- Smoothing factor (0.1 to 0.9, default 0.3)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_smoothing'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_smoothing numeric(2,1) DEFAULT 0.3 CHECK (eye_tracking_smoothing >= 0.1 AND eye_tracking_smoothing <= 0.9);
  END IF;

  -- Show gaze indicator
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_show_indicator'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_show_indicator boolean DEFAULT true;
  END IF;

  -- Enable dwell click
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_dwell_click'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_dwell_click boolean DEFAULT true;
  END IF;

  -- Enable smooth scroll
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_smooth_scroll'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_smooth_scroll boolean DEFAULT true;
  END IF;

  -- Calibration completed flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_calibrated'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN eye_tracking_calibrated boolean DEFAULT false;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.eye_tracking_enabled IS 'EXPERIMENTAL: Enable eye tracking for accessibility (use with extreme caution)';
COMMENT ON COLUMN user_preferences.eye_tracking_sensitivity IS 'Eye tracking sensitivity multiplier (0.5-2.0)';
COMMENT ON COLUMN user_preferences.eye_tracking_dwell_time IS 'Dwell time for click activation in milliseconds (500-3000)';
COMMENT ON COLUMN user_preferences.eye_tracking_smoothing IS 'Gaze smoothing factor (0.1-0.9, higher = smoother)';
COMMENT ON COLUMN user_preferences.eye_tracking_show_indicator IS 'Show visual gaze point indicator';
COMMENT ON COLUMN user_preferences.eye_tracking_dwell_click IS 'Enable dwell-to-click functionality';
COMMENT ON COLUMN user_preferences.eye_tracking_smooth_scroll IS 'Enable gaze-based smooth scrolling';
COMMENT ON COLUMN user_preferences.eye_tracking_calibrated IS 'Whether eye tracking has been calibrated for this user';
