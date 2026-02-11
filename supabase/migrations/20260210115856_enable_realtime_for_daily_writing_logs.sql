/*
  # Enable Realtime for Daily Writing Logs

  1. Changes
    - Enable realtime subscriptions for daily_writing_logs table
    - This allows the WritingStreaks component to receive real-time updates when writing sessions are logged

  2. Purpose
    - Provides instant feedback to users when they complete writing sessions
    - Updates the "Today's Activity" display in real-time
    - Enhances user experience by showing live progress
*/

-- Enable realtime for daily_writing_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'daily_writing_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE daily_writing_logs;
  END IF;
END $$;
