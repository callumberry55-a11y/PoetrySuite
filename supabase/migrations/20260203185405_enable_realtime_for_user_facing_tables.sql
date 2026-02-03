/*
  # Enable Real-Time for User-Facing Tables

  ## Changes
  Enables Supabase real-time subscriptions for user-facing content tables
  so users see updates immediately without refreshing.
  
  ## Tables Enabled
  - poems (new poems, edits)
  - comments (new comments)
  - reactions (likes, reactions)
  - contests (contest updates)
  - contest_entries (new entries)
  - contest_votes (voting in real-time)
  - badges (badge awards)
  - user_badges (user achievements)
  - store_items (store updates)
  - collaborative_poems (collaboration updates)
  - poem_collaborators (collaborator changes)
  - poem_collections (collection updates)
  - poem_tags (tagging updates)
  - poem_versions (version history)
  - zine_poems (zine updates)
  
  ## Security
  Real-time subscriptions respect RLS policies.
*/

-- Enable real-time for content tables
ALTER PUBLICATION supabase_realtime ADD TABLE poems;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE contests;
ALTER PUBLICATION supabase_realtime ADD TABLE contest_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE contest_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE badges;
ALTER PUBLICATION supabase_realtime ADD TABLE user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE store_items;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborative_poems;
ALTER PUBLICATION supabase_realtime ADD TABLE poem_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE poem_collections;
ALTER PUBLICATION supabase_realtime ADD TABLE poem_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE poem_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE zine_poems;