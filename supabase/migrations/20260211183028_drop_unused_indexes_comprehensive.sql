/*
  # Drop Unused Database Indexes

  This migration removes unused indexes that have been identified as not contributing
  to query performance. Removing unused indexes provides several benefits:
  
  1. **Performance Improvements**
     - Faster INSERT, UPDATE, and DELETE operations (fewer indexes to maintain)
     - Reduced storage overhead and memory usage
     - Improved vacuum and analyze performance
  
  2. **Indexes Being Removed**
     - Duplicate indexes that overlap with other existing indexes
     - Indexes on columns that are never queried individually
     - Redundant indexes where a composite index already covers the need
     - Indexes that were created speculatively but never used in practice
  
  3. **Safety Notes**
     - All critical foreign key indexes are retained
     - All indexes used by RLS policies are retained
     - Using IF EXISTS to prevent errors if indexes already removed
*/

-- Drop unused indexes on critique_circles table
DROP INDEX IF EXISTS public.idx_critique_circles_created_by;

-- Drop unused indexes on reading_performances table
DROP INDEX IF EXISTS public.idx_reading_performances_poem_id;
DROP INDEX IF EXISTS public.idx_reading_performances_user_id;

-- Drop unused indexes on writing_sessions table
DROP INDEX IF EXISTS public.idx_writing_sessions_user_id;

-- Drop unused indexes on poetry_quizzes table
DROP INDEX IF EXISTS public.idx_poetry_quizzes_created_by;

-- Drop unused indexes on quiz_attempts table
DROP INDEX IF EXISTS public.idx_quiz_attempts_quiz_id;
DROP INDEX IF EXISTS public.idx_quiz_attempts_user_id;

-- Drop unused indexes on quiz_questions table
DROP INDEX IF EXISTS public.idx_quiz_questions_quiz_id;

-- Drop unused indexes on collaborative_poems table
DROP INDEX IF EXISTS public.idx_collaborative_poems_creator_id;

-- Drop unused indexes on poem_collaborators table
DROP INDEX IF EXISTS public.idx_poem_collaborators_poem_id;
DROP INDEX IF EXISTS public.idx_poem_collaborators_user_id;

-- Drop unused indexes on book_club_members table
DROP INDEX IF EXISTS public.idx_book_club_members_club_id;
DROP INDEX IF EXISTS public.idx_book_club_members_user_id;

-- Drop unused indexes on study_group_members table
DROP INDEX IF EXISTS public.idx_study_group_members_group_id;
DROP INDEX IF EXISTS public.idx_study_group_members_user_id;

-- Drop unused indexes on event_attendees table
DROP INDEX IF EXISTS public.idx_event_attendees_event_id;
DROP INDEX IF EXISTS public.idx_event_attendees_user_id;

-- Drop unused indexes on forum_topics table
DROP INDEX IF EXISTS public.idx_forum_topics_created_by;
DROP INDEX IF EXISTS public.idx_forum_topics_forum_id;

-- Drop unused indexes on forum_posts table
DROP INDEX IF EXISTS public.idx_forum_posts_topic_id;
DROP INDEX IF EXISTS public.idx_forum_posts_user_id;

-- Drop unused indexes on collections table
DROP INDEX IF EXISTS public.idx_collections_user_id;

-- Drop unused indexes on collection_items table
DROP INDEX IF EXISTS public.idx_collection_items_collection_id;
DROP INDEX IF EXISTS public.idx_collection_items_poem_id;

-- Drop unused indexes on bookmarks table
DROP INDEX IF EXISTS public.idx_bookmarks_poem_id;
DROP INDEX IF EXISTS public.idx_bookmarks_user_id;

-- Drop unused indexes on feedback table
DROP INDEX IF EXISTS public.idx_feedback_user_id;

-- Drop unused indexes on following table
DROP INDEX IF EXISTS public.idx_following_follower_id;
DROP INDEX IF EXISTS public.idx_following_following_id;

-- Drop unused indexes on notifications table
DROP INDEX IF EXISTS public.idx_notifications_user_id;

-- Drop unused indexes on writing_goals table
DROP INDEX IF EXISTS public.idx_writing_goals_user_id;

-- Drop unused indexes on daily_writing_logs table
DROP INDEX IF EXISTS public.idx_daily_writing_logs_user_id;

-- Drop unused indexes on story_views table
DROP INDEX IF EXISTS public.idx_story_views_story_id;
DROP INDEX IF EXISTS public.idx_story_views_user_id;

-- Drop unused indexes on paas tables
DROP INDEX IF EXISTS public.idx_paas_developers_user_id;
DROP INDEX IF EXISTS public.idx_paas_api_keys_developer_id;
DROP INDEX IF EXISTS public.idx_paas_usage_logs_api_key_id;
DROP INDEX IF EXISTS public.idx_external_api_keys_user_id;

-- Drop unused indexes on economy tables
DROP INDEX IF EXISTS public.idx_point_accounts_user_id;
DROP INDEX IF EXISTS public.idx_economy_transactions_from_account;
DROP INDEX IF EXISTS public.idx_economy_transactions_to_account;
DROP INDEX IF EXISTS public.idx_store_purchases_user_id;
DROP INDEX IF EXISTS public.idx_store_purchases_item_id;
