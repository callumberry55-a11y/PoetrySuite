/*
  # Link Contests to Badge System

  1. Changes
    - Add badge reward columns to contests table
    - Add winner badge column to track which badge winners receive
    - Add participant badge column for all participants
    - Keep prize_description for backwards compatibility but mark as optional
  
  2. Notes
    - Contests now award badges instead of cash prizes
    - Winners receive higher-tier badges
    - All participants can receive participation badges
  
  3. Security
    - No changes to RLS policies needed
*/

-- Add badge reward columns to contests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contests' AND column_name = 'winner_badge_id'
  ) THEN
    ALTER TABLE contests ADD COLUMN winner_badge_id uuid REFERENCES badges(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contests' AND column_name = 'participant_badge_id'
  ) THEN
    ALTER TABLE contests ADD COLUMN participant_badge_id uuid REFERENCES badges(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contests' AND column_name = 'runner_up_badge_id'
  ) THEN
    ALTER TABLE contests ADD COLUMN runner_up_badge_id uuid REFERENCES badges(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create contest-specific badges
INSERT INTO badges (name, description, icon, rank, category, requirement_type, requirement_value, points)
VALUES
  ('Contest Champion', 'Won a poetry contest', 'trophy', 'Anruth', 'achievement', 'contests_won', 1, 75),
  ('Silver Laureate', 'Placed 2nd or 3rd in a contest', 'medal', 'Cli', 'achievement', 'contests_placed', 1, 40),
  ('Contest Warrior', 'Participated in a poetry contest', 'shield', 'Fochlog', 'achievement', 'contests_participated', 1, 15)
ON CONFLICT (name) DO NOTHING;

-- Create index for faster badge lookups
CREATE INDEX IF NOT EXISTS idx_contests_winner_badge ON contests(winner_badge_id);
CREATE INDEX IF NOT EXISTS idx_contests_participant_badge ON contests(participant_badge_id);
