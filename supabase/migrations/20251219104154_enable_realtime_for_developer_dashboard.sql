/*
  # Enable Realtime for Developer Dashboard

  1. Changes
    - Enable Realtime replication for tables monitored by developer dashboard:
      - user_profiles (user statistics)
      - poems (content statistics)
      - community_submissions (submission statistics)
      - feedback (user feedback tracking)
    
  2. Purpose
    - Allow real-time updates in the developer dashboard
    - Stats and feedback will update automatically without page refresh
    - Improves monitoring and response time for developers
*/

ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE poems;
ALTER PUBLICATION supabase_realtime ADD TABLE community_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;