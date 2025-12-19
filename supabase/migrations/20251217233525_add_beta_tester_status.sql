/*
  # Add Beta Tester Status to User Profiles

  1. Changes
    - Add `is_beta_tester` column to `user_profiles` table
    - Add `beta_enrolled_at` timestamp to track when user joined beta program
    - Add `beta_feedback_count` to track beta feedback submissions
    - Create `beta_features` table to manage feature flags
    - Create `beta_feedback` table for beta tester feedback

  2. Security
    - Users can view their own beta status
    - Users can update their own beta enrollment
    - Only beta testers can submit feedback
    - All tables have RLS enabled
*/

-- Add beta tester columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_beta_tester'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_beta_tester boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'beta_enrolled_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN beta_enrolled_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'beta_feedback_count'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN beta_feedback_count integer DEFAULT 0;
  END IF;
END $$;

-- Create beta_features table for feature flags
CREATE TABLE IF NOT EXISTS beta_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE beta_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled beta features"
  ON beta_features FOR SELECT
  USING (is_enabled = true);

-- Create beta_feedback table
CREATE TABLE IF NOT EXISTS beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'suggestion', 'praise', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beta testers can view own feedback"
  ON beta_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Beta testers can create feedback"
  ON beta_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_beta_tester = true
    )
  );

CREATE POLICY "Beta testers can update own feedback"
  ON beta_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Beta testers can delete own feedback"
  ON beta_feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for beta tester queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_beta_tester ON user_profiles(is_beta_tester) WHERE is_beta_tester = true;
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON beta_feedback(created_at DESC);

-- Insert some initial beta features
INSERT INTO beta_features (name, description, is_enabled) VALUES
  ('advanced_ai_analysis', 'Advanced AI-powered poetry analysis and suggestions', true),
  ('collaborative_writing', 'Real-time collaborative poetry writing with other users', true),
  ('voice_recording', 'Record audio performances of your poems', true),
  ('advanced_metrics', 'Detailed analytics on writing patterns and improvement', true),
  ('custom_themes', 'Create and customize your own color themes', true)
ON CONFLICT (name) DO NOTHING;