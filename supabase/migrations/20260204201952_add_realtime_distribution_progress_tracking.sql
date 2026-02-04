/*
  # Add Real-Time Distribution Progress Tracking

  1. New Tables
    - `distribution_progress`
      - `id` (uuid, primary key)
      - `distribution_date` (date) - The date of distribution
      - `status` (text) - Status: 'running', 'completed', 'failed'
      - `total_users` (integer) - Total users to process
      - `processed_users` (integer) - Users processed so far
      - `progress_percentage` (numeric) - Percentage complete (0-100)
      - `current_batch` (integer) - Current batch number
      - `total_batches` (integer) - Total number of batches
      - `points_per_user` (integer) - Points distributed per user
      - `total_points_distributed` (integer) - Total points distributed so far
      - `error_message` (text, nullable) - Error message if failed
      - `started_at` (timestamptz) - When distribution started
      - `completed_at` (timestamptz, nullable) - When distribution completed
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on distribution_progress table
    - Authenticated users can view progress
    - Only system functions can insert/update

  3. Performance
    - Index on distribution_date for quick lookups
    - Index on status for filtering active distributions

  4. Realtime
    - Enable realtime for live progress updates
*/

-- =====================================================
-- 1. Create Distribution Progress Table
-- =====================================================

CREATE TABLE IF NOT EXISTS distribution_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_date date NOT NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  total_users integer NOT NULL DEFAULT 0,
  processed_users integer NOT NULL DEFAULT 0,
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_batch integer NOT NULL DEFAULT 0,
  total_batches integer NOT NULL DEFAULT 0,
  points_per_user integer NOT NULL DEFAULT 20,
  total_points_distributed integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_distribution_progress_date 
  ON distribution_progress(distribution_date DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_progress_status 
  ON distribution_progress(status) 
  WHERE status = 'running';

-- =====================================================
-- 3. Enable Row Level Security
-- =====================================================

ALTER TABLE distribution_progress ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view progress
CREATE POLICY "Authenticated users can view distribution progress"
  ON distribution_progress
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 4. Enable Realtime
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE distribution_progress;

-- =====================================================
-- 5. Add Comments
-- =====================================================

COMMENT ON TABLE distribution_progress IS 
'Tracks real-time progress of daily point distributions with batch processing updates';

COMMENT ON COLUMN distribution_progress.progress_percentage IS 
'Percentage of users processed (0-100), updated after each batch';

COMMENT ON COLUMN distribution_progress.status IS 
'Current status: running (in progress), completed (finished successfully), failed (error occurred)';
