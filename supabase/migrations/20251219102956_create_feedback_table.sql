/*
  # Create Feedback System

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key) - Unique identifier for each feedback entry
      - `user_id` (uuid, foreign key) - Reference to the user who submitted feedback
      - `category` (text) - Category of feedback (bug, feature, improvement, other)
      - `title` (text) - Brief title/subject of the feedback
      - `message` (text) - Detailed feedback message
      - `status` (text) - Status of feedback (new, reviewed, resolved, closed)
      - `created_at` (timestamptz) - Timestamp when feedback was submitted
      - `updated_at` (timestamptz) - Timestamp when feedback was last updated

  2. Security
    - Enable RLS on `feedback` table
    - Users can insert their own feedback
    - Users can view their own feedback
    - Developers (via service role) can view and update all feedback

  3. Indexes
    - Index on user_id for efficient user-specific queries
    - Index on status for filtering by status
    - Index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'other')),
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
