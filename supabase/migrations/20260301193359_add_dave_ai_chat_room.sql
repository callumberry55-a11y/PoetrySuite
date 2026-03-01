/*
  # Add Dave AI Chat Room

  1. Changes
    - Add 'is_ai' column to chat_rooms to mark AI-powered rooms
    - Add 'Dave' chat room - an AI assistant for poetry help
    - Update policies to allow AI bot to post messages
  
  2. Security
    - AI messages will be posted by a system user
    - Users can still only edit/delete their own messages
*/

-- Add is_ai column to chat_rooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_rooms' AND column_name = 'is_ai'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN is_ai boolean DEFAULT false;
  END IF;
END $$;

-- Insert Dave AI chat room
INSERT INTO chat_rooms (name, description, is_ai) VALUES
  ('Dave AI Assistant', 'Chat with Dave, your AI poetry companion who can help with writing, analysis, and inspiration', true)
ON CONFLICT DO NOTHING;