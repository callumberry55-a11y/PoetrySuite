/*
  # Enable Real-Time for Remaining Critical Tables

  ## Changes
  Enables Supabase real-time subscriptions for remaining critical tables
  where users expect immediate updates.
  
  ## Tables Enabled
  - user_profiles (profile updates)
  - user_preferences (settings changes)
  - follows (follow notifications)
  - bookmarks (bookmark updates)
  - user_purchases (purchase confirmations)
  - writing_goals, writing_stats, writing_streaks (progress tracking)
  - workshops, workshop_members, workshop_submissions (workshops)
  - challenges, challenge_participations (challenges)
  - anthologies, anthology_submissions (anthologies)
  - events, event_attendees (events)
  - ai_conversations, ai_messages (AI chat)
  - collections, reading_lists, reading_list_items (collections)
  - critiques, feedback (feedback)
  - mentorships (mentoring)
  - daily_prompts, prompt_responses (prompts)
  - zines (zines)
  
  ## Security
  Real-time subscriptions respect RLS policies.
*/

-- User and social tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE user_purchases;

-- Progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE writing_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE writing_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE writing_streaks;

-- Workshops
ALTER PUBLICATION supabase_realtime ADD TABLE workshops;
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_members;
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_submissions;

-- Challenges
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_participations;

-- Anthologies
ALTER PUBLICATION supabase_realtime ADD TABLE anthologies;
ALTER PUBLICATION supabase_realtime ADD TABLE anthology_submissions;

-- Events
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendees;

-- AI features
ALTER PUBLICATION supabase_realtime ADD TABLE ai_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;

-- Collections and reading
ALTER PUBLICATION supabase_realtime ADD TABLE collections;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_list_items;

-- Feedback and mentoring
ALTER PUBLICATION supabase_realtime ADD TABLE critiques;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE mentorships;

-- Prompts
ALTER PUBLICATION supabase_realtime ADD TABLE daily_prompts;
ALTER PUBLICATION supabase_realtime ADD TABLE prompt_responses;

-- Publishing
ALTER PUBLICATION supabase_realtime ADD TABLE zines;

-- Other
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE community_submissions;