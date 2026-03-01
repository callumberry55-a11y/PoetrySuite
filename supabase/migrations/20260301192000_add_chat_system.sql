/*
  # Add Chat System

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `name` (text) - Room name
      - `description` (text) - Room description
      - `created_at` (timestamptz)
      - `created_by` (uuid) - User who created the room
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid) - Foreign key to chat_rooms
      - `user_id` (uuid) - Foreign key to auth.users
      - `content` (text) - Message content
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all rooms
      - Read all messages in rooms
      - Create messages in rooms
      - Admin users can create rooms

  3. Indexes
    - Index on room_id for efficient message queries
    - Index on created_at for sorting messages
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Rooms Policies
CREATE POLICY "Anyone can view chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chat Messages Policies
CREATE POLICY "Anyone can view messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Insert default chat rooms
INSERT INTO chat_rooms (name, description) VALUES
  ('General', 'General discussion for all poetry enthusiasts'),
  ('Poetry Workshop', 'Share and critique poetry in progress'),
  ('Writing Prompts', 'Discuss daily writing prompts and challenges'),
  ('Book Club', 'Discuss featured poems and poets')
ON CONFLICT DO NOTHING;