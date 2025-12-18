/*
  # Create Collaborative Writing Tables

  1. New Tables
    - `collaborative_sessions`
      - `id` (uuid, primary key)
      - `title` (text) - Session title
      - `content` (text) - The collaborative poem content
      - `created_by` (uuid) - User who created the session
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean) - Whether session is still active
      - `participant_count` (integer) - Computed count of participants

    - `collab_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamptz)

    - `collab_updates`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text) - Description of the update
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Authenticated users can create sessions
    - Participants can view and edit their sessions
    - Anyone can view active sessions (to browse and join)
    - Only creator can end a session

  3. Indexes
    - Index on session_id for participants and updates
    - Index on is_active for filtering active sessions
    - Index on created_at for sorting
*/

-- Create collaborative_sessions table
CREATE TABLE IF NOT EXISTS collaborative_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  participant_count integer DEFAULT 0
);

-- Create collab_participants table
CREATE TABLE IF NOT EXISTS collab_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES collaborative_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create collab_updates table
CREATE TABLE IF NOT EXISTS collab_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES collaborative_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_updates ENABLE ROW LEVEL SECURITY;

-- Policies for collaborative_sessions
CREATE POLICY "Anyone can view active sessions"
  ON collaborative_sessions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create sessions"
  ON collaborative_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update session content"
  ON collaborative_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE collab_participants.session_id = collaborative_sessions.id
      AND collab_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collab_participants
      WHERE collab_participants.session_id = collaborative_sessions.id
      AND collab_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can delete session"
  ON collaborative_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for collab_participants
CREATE POLICY "Anyone can view participants"
  ON collab_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join sessions"
  ON collab_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON collab_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for collab_updates
CREATE POLICY "Anyone can view updates"
  ON collab_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Participants can create updates"
  ON collab_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM collab_participants
      WHERE collab_participants.session_id = collab_updates.session_id
      AND collab_participants.user_id = auth.uid()
    )
  );

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaborative_sessions
  SET participant_count = (
    SELECT COUNT(*)
    FROM collab_participants
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
  )
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant count
DROP TRIGGER IF EXISTS update_participant_count_trigger ON collab_participants;
CREATE TRIGGER update_participant_count_trigger
AFTER INSERT OR DELETE ON collab_participants
FOR EACH ROW
EXECUTE FUNCTION update_participant_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collab_sessions_active ON collaborative_sessions(is_active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_collab_sessions_created_by ON collaborative_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_collab_participants_session ON collab_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_collab_participants_user ON collab_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_updates_session ON collab_updates(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collab_updates_user ON collab_updates(user_id);
