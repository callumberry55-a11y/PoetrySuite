/*
  # Drop Unused Indexes and Fix Function Security

  1. Drop indexes that aren't being used by queries
  2. Fix function with mutable search_path
*/

-- =====================================================
-- Drop Unused Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_book_clubs_private;
DROP INDEX IF EXISTS idx_book_club_members_club;
DROP INDEX IF EXISTS idx_book_club_discussions_club;
DROP INDEX IF EXISTS idx_reading_list_poems_list;
DROP INDEX IF EXISTS idx_reading_list_poems_poem;
DROP INDEX IF EXISTS idx_reading_list_poems_order;
DROP INDEX IF EXISTS idx_poem_shares_poem;
DROP INDEX IF EXISTS idx_poem_shares_public;
DROP INDEX IF EXISTS idx_study_groups_topic;
DROP INDEX IF EXISTS idx_study_groups_private;
DROP INDEX IF EXISTS idx_study_group_members_group;
DROP INDEX IF EXISTS idx_study_group_resources_group;
DROP INDEX IF EXISTS idx_study_group_resources_type;
DROP INDEX IF EXISTS idx_poetry_events_type;
DROP INDEX IF EXISTS idx_poetry_events_public;
DROP INDEX IF EXISTS idx_daily_writing_logs_date;
DROP INDEX IF EXISTS idx_poetry_glossary_category;
DROP INDEX IF EXISTS idx_poetry_glossary_term_search;
DROP INDEX IF EXISTS idx_famous_poems_author;
DROP INDEX IF EXISTS idx_famous_poems_era;
DROP INDEX IF EXISTS idx_famous_poems_form;
DROP INDEX IF EXISTS idx_famous_poems_search;
DROP INDEX IF EXISTS idx_writing_tips_category;
DROP INDEX IF EXISTS idx_writing_tips_difficulty;
DROP INDEX IF EXISTS idx_writing_tips_search;
DROP INDEX IF EXISTS idx_user_prompt_completions_prompt;
DROP INDEX IF EXISTS idx_user_prompt_completions_poem;
DROP INDEX IF EXISTS idx_forum_topics_category;
DROP INDEX IF EXISTS idx_forum_topics_activity;
DROP INDEX IF EXISTS idx_forum_topics_pinned;
DROP INDEX IF EXISTS idx_forum_replies_topic;
DROP INDEX IF EXISTS idx_forum_topic_likes_topic;
DROP INDEX IF EXISTS idx_forum_reply_likes_reply;
DROP INDEX IF EXISTS idx_collection_poems_collection;
DROP INDEX IF EXISTS idx_collection_poems_poem;
DROP INDEX IF EXISTS idx_poetry_collections_public;
DROP INDEX IF EXISTS idx_poem_favorites_poem;
DROP INDEX IF EXISTS idx_poem_bookmarks_user;
DROP INDEX IF EXISTS idx_poem_bookmarks_poem;
DROP INDEX IF EXISTS idx_poem_critiques_poem;
DROP INDEX IF EXISTS idx_poem_critiques_critic;
DROP INDEX IF EXISTS idx_writing_sessions_user;
DROP INDEX IF EXISTS idx_writing_sessions_date;

-- =====================================================
-- Fix Function Search Path
-- =====================================================

CREATE OR REPLACE FUNCTION should_collect_maintenance_tax(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  last_tax_date timestamptz;
  days_since_last_tax integer;
BEGIN
  SELECT MAX(created_at) INTO last_tax_date
  FROM user_tax_transactions
  WHERE user_id = p_user_id
  AND tax_type = 'maintenance';

  IF last_tax_date IS NULL THEN
    RETURN true;
  END IF;

  days_since_last_tax := EXTRACT(DAY FROM (now() - last_tax_date));
  
  RETURN days_since_last_tax >= 30;
END;
$$;