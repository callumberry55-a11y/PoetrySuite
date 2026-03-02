/*
  # Add Foreign Key Constraint to Chat Messages

  1. Changes
    - Add foreign key constraint from chat_messages.user_id to user_profiles.user_id
    - This ensures referential integrity between chat messages and user profiles
    - Required for proper JOIN operations in the chat-service edge function

  2. Security
    - No changes to RLS policies (already configured)
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_messages_user_id_fkey'
  ) THEN
    ALTER TABLE chat_messages
      ADD CONSTRAINT chat_messages_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
      ON DELETE CASCADE;
  END IF;
END $$;
