/*
  # Create Community Submissions Table

  ## Overview
  This migration creates a community submissions system where users can submit poems 
  for community review and approval. Only a specific admin user can approve or reject submissions.

  ## New Tables
  
  ### `community_submissions`
  - `id` (uuid, primary key) - Unique identifier for each submission
  - `user_id` (uuid, foreign key) - User who submitted the poem
  - `poem_id` (uuid, foreign key) - Reference to the poem being submitted
  - `status` (text) - Current status: pending, approved, or rejected
  - `submitted_at` (timestamptz) - When the submission was created
  - `reviewed_at` (timestamptz, nullable) - When the submission was reviewed
  - `reviewed_by` (uuid, nullable) - Admin user who reviewed the submission
  - `submission_notes` (text, nullable) - Optional notes from the submitter
  - `review_notes` (text, nullable) - Optional notes from the reviewer

  ## Security

  ### Row Level Security (RLS)
  - Users can create submissions for their own poems
  - Users can view their own submissions regardless of status
  - All authenticated users can view approved submissions
  - Only the admin user (ee83f990-591a-4b31-80cc-0655c2b32010) can update submissions to approve/reject them
  - Admin user can view all submissions

  ## Indexes
  - Index on `user_id` for faster user-specific queries
  - Index on `status` for filtering by submission status
  - Index on `poem_id` to prevent duplicate submissions
*/

-- Create community_submissions table
CREATE TABLE IF NOT EXISTS community_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  submission_notes text,
  review_notes text,
  UNIQUE(poem_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_submissions_user_id ON community_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_submissions_status ON community_submissions(status);
CREATE INDEX IF NOT EXISTS idx_community_submissions_poem_id ON community_submissions(poem_id);

-- Enable RLS
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create submissions for their own poems
CREATE POLICY "Users can create community submissions for own poems"
  ON community_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_id
      AND poems.user_id = auth.uid()
    )
  );

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own community submissions"
  ON community_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: All authenticated users can view approved submissions
CREATE POLICY "Anyone can view approved community submissions"
  ON community_submissions
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Policy: Admin user can view all submissions
CREATE POLICY "Admin can view all community submissions"
  ON community_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = 'ee83f990-591a-4b31-80cc-0655c2b32010'::uuid);

-- Policy: Only admin user can update submissions (approve/reject)
CREATE POLICY "Admin can update community submissions"
  ON community_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = 'ee83f990-591a-4b31-80cc-0655c2b32010'::uuid)
  WITH CHECK (auth.uid() = 'ee83f990-591a-4b31-80cc-0655c2b32010'::uuid);

-- Policy: Admin can delete submissions
CREATE POLICY "Admin can delete community submissions"
  ON community_submissions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = 'ee83f990-591a-4b31-80cc-0655c2b32010'::uuid);