/*
  # Remove Hand Gesture and Eye Tracking Features

  1. Changes to user_preferences table
    - Remove hand_gesture_enabled
    - Remove hand_gesture_sensitivity
    - Remove hand_gesture_delay
    - Remove hand_gesture_show_feedback
    - Remove hand_gesture_enabled_gestures
    - Remove hand_gesture_mappings
    - Remove eye_tracking_enabled
    - Remove eye_tracking_sensitivity
    - Remove eye_tracking_dwell_time
    - Remove eye_tracking_smoothing
    - Remove eye_tracking_show_indicator
    - Remove eye_tracking_dwell_click
    - Remove eye_tracking_smooth_scroll
    - Remove eye_tracking_calibrated

  2. Notes
    - Keeping AI Security Guard System intact
    - All other user preferences remain unchanged
*/

-- Remove hand gesture columns from user_preferences
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_enabled'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_enabled;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_sensitivity'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_sensitivity;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_delay'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_delay;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_show_feedback'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_show_feedback;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_enabled_gestures'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_enabled_gestures;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_mappings'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN hand_gesture_mappings;
  END IF;

  -- Remove eye tracking columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_enabled'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_enabled;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_sensitivity'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_sensitivity;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_dwell_time'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_dwell_time;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_smoothing'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_smoothing;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_show_indicator'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_show_indicator;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_dwell_click'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_dwell_click;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_smooth_scroll'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_smooth_scroll;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'eye_tracking_calibrated'
  ) THEN
    ALTER TABLE user_preferences DROP COLUMN eye_tracking_calibrated;
  END IF;
END $$;
