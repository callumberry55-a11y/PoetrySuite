/*
  # Add Performance Optimization Indexes

  ## Overview
  This migration adds additional indexes to improve query performance throughout the application.

  ## New Indexes

  ### 1. `idx_poems_updated_at`
  - Index on `poems.updated_at` column
  - Improves performance when sorting poems by last update time
  - Used in the Library view for displaying recent poems

  ### 2. `idx_poems_user_public`
  - Composite index on `poems(user_id, is_public)`
  - Optimizes filtering poems by visibility status
  - Helps with queries that filter by both user and public/private status

  ### 3. `idx_poem_collections_poem_id`
  - Index on `poem_collections.poem_id`
  - Speeds up lookups when finding collections for a specific poem
  - Complements existing index on collection_id

  ### 4. `idx_writing_stats_date`
  - Index on `writing_stats.date` alone
  - Helps with date range queries in analytics

  ## Technical Details
  - All indexes use IF NOT EXISTS for safe rerunning
  - Indexes are B-tree (default) which is optimal for these use cases
  - DESC order used where appropriate for common query patterns
*/

-- Index for sorting poems by update time
CREATE INDEX IF NOT EXISTS idx_poems_updated_at
  ON poems(updated_at DESC);

-- Composite index for filtering poems by user and visibility
CREATE INDEX IF NOT EXISTS idx_poems_user_public
  ON poems(user_id, is_public);

-- Index on poem_id in poem_collections for reverse lookups
CREATE INDEX IF NOT EXISTS idx_poem_collections_poem_id
  ON poem_collections(poem_id);

-- Index on writing stats date for analytics queries
CREATE INDEX IF NOT EXISTS idx_writing_stats_date
  ON writing_stats(date DESC);