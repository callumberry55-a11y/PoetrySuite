/*
  # Create Chat System

  1. New Tables
    - `public_chat_messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `content` (text) - Message content
      - `created_at` (timestamptz) - When message was sent
      - `updated_at` (timestamptz) - When message was last edited
      - `is_deleted` (boolean) - Soft delete flag

    - `conversations`
      - `id` (uuid, primary key) - Unique conversation identifier
      - `participant_1_id` (uuid, foreign key) - First participant
      - `participant_2_id` (uuid, foreign key) - Second participant
      - `created_at` (timestamptz) - When conversation started
      - `last_message_at` (timestamptz) - When last message was sent

    - `private_messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `conversation_id` (uuid, foreign key) - References conversations
      - `sender_id` (uuid, foreign key) - Message sender
      - `recipient_id` (uuid, foreign key) - Message recipient
      - `content` (text) - Message content
      - `read_at` (timestamptz) - When message was read
      - `created_at` (timestamptz) - When message was sent
      - `updated_at` (timestamptz) - When message was last edited
      - `is_deleted` (boolean) - Soft delete flag

  2. Security
    - Enable RLS on all tables
    - Public chat: Anyone authenticated can read and post
    - Private messages: Only conversation participants can access
    - Conversations: Only participants can view

  3. Indexes
    - Performance indexes on foreign keys and timestamp columns
    - Unique constraint on conversation participants to prevent duplicates
*/

-- Public Chat Messages Table
CREATE TABLE IF NOT EXISTS public_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

ALTER TABLE public_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public chat messages"
  ON public_chat_messages FOR SELECT
  TO authenticated
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can send public messages"
  ON public_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own public messages"
  ON public_chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own public messages"
  ON public_chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_public_chat_messages_user_id ON public_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_public_chat_messages_created_at ON public_chat_messages(created_at DESC);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_participants 
  ON conversations(LEAST(participant_1_id, participant_2_id), GREATEST(participant_1_id, participant_2_id));

-- Private Messages Table
CREATE TABLE IF NOT EXISTS private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their private messages"
  ON private_messages FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id) AND NOT is_deleted
  );

CREATE POLICY "Authenticated users can send private messages"
  ON private_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own private messages"
  ON private_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own private messages"
  ON private_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at DESC);

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER private_messages_update_conversation
  AFTER INSERT ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Trigger to update updated_at on public messages
CREATE OR REPLACE FUNCTION update_public_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER public_chat_messages_updated_at
  BEFORE UPDATE ON public_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_public_chat_messages_updated_at();

-- Trigger to update updated_at on private messages
CREATE OR REPLACE FUNCTION update_private_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER private_messages_updated_at
  BEFORE UPDATE ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_private_messages_updated_at();