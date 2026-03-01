/*
  # Add Hand Gesture Preferences

  1. Changes to user_preferences table
    - Add hand_gesture_enabled (boolean)
    - Add hand_gesture_sensitivity (numeric)
    - Add hand_gesture_delay (integer)
    - Add hand_gesture_show_feedback (boolean)
    - Add hand_gesture_enabled_gestures (text array)
    - Add hand_gesture_mappings (jsonb)

  2. Security
    - No RLS changes needed (already secured)
    - Fields are nullable for backward compatibility

  3. Notes
    - All hand gesture settings are stored per user
    - Enabled gestures stored as array for flexibility
    - Gesture mappings stored as JSON for customization
    - Default values ensure safe operation
*/

-- Add hand gesture preference columns to user_preferences
DO $$
BEGIN
  -- Hand gesture enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_enabled'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_enabled boolean DEFAULT false;
  END IF;

  -- Sensitivity (0.5 to 2.0, default 1.0)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_sensitivity'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_sensitivity numeric(3,1) DEFAULT 1.0 CHECK (hand_gesture_sensitivity >= 0.5 AND hand_gesture_sensitivity <= 2.0);
  END IF;

  -- Gesture delay in milliseconds (200 to 2000, default 500)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_delay'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_delay integer DEFAULT 500 CHECK (hand_gesture_delay >= 200 AND hand_gesture_delay <= 2000);
  END IF;

  -- Show visual feedback
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_show_feedback'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_show_feedback boolean DEFAULT true;
  END IF;

  -- Enabled gestures (array of gesture names)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_enabled_gestures'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_enabled_gestures text[] DEFAULT ARRAY['open_palm', 'fist', 'thumbs_up', 'swipe_left', 'swipe_right'];
  END IF;

  -- Gesture to action mappings (stored as JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'hand_gesture_mappings'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN hand_gesture_mappings jsonb DEFAULT '{
      "open_palm": "click",
      "fist": "back",
      "thumbs_up": "scroll_up",
      "thumbs_down": "scroll_down",
      "swipe_left": "back",
      "swipe_right": "forward",
      "peace": "menu",
      "pointing": "click"
    }'::jsonb;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.hand_gesture_enabled IS 'EXPERIMENTAL: Enable hand gesture recognition for accessibility (use with caution)';
COMMENT ON COLUMN user_preferences.hand_gesture_sensitivity IS 'Hand gesture detection sensitivity multiplier (0.5-2.0)';
COMMENT ON COLUMN user_preferences.hand_gesture_delay IS 'Minimum delay between gesture detections in milliseconds (200-2000)';
COMMENT ON COLUMN user_preferences.hand_gesture_show_feedback IS 'Show visual feedback when gestures are detected';
COMMENT ON COLUMN user_preferences.hand_gesture_enabled_gestures IS 'Array of enabled gesture types';
COMMENT ON COLUMN user_preferences.hand_gesture_mappings IS 'JSON mapping of gestures to actions';
