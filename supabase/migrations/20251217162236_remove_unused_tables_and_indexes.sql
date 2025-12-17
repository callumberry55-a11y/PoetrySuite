/*
  # Remove Unused Tables and Indexes

  ## Overview
  This migration removes unused database objects to improve security, reduce maintenance 
  overhead, and eliminate unused indexes that are consuming resources.

  ## Changes Made

  ### 1. Remove Unused Tables
  The following tables are not used in the application and are being removed:
  
  **Tables Removed:**
  - `poem_likes` - Like functionality not implemented in the application
  - `tags` - Tag functionality not implemented in the application  
  - `poem_tags` - Tag association table not needed
  
  **Benefits:**
  - Reduces attack surface by removing unused features
  - Eliminates unused indexes (idx_poem_likes_user_id, idx_poem_likes_poem_id, idx_poem_tags_tag_id)
  - Simplifies database schema and maintenance
  - Reduces backup and replication overhead

  ### 2. Remove Associated Functions and Triggers
  
  **Functions Removed:**
  - `increment_like_count()` - Only used by poem_likes
  - `decrement_like_count()` - Only used by poem_likes
  
  **Triggers Removed:**
  - `increment_poem_likes` - Associated with poem_likes
  - `decrement_poem_likes` - Associated with poem_likes

  ### 3. Clean Up poems Table
  
  **Columns Removed:**
  - `like_count` - Only used by poem_likes feature (not implemented)
  - `view_count` - Not used in the application
  
  ## Additional Security Recommendations
  
  The following security improvements require manual configuration through the 
  Supabase Dashboard and cannot be automated via SQL:
  
  ### Enable Leaked Password Protection
  1. Go to Authentication > Settings in Supabase Dashboard
  2. Enable "Password breach protection"
  3. This checks passwords against HaveIBeenPwned.org to prevent compromised passwords
  
  ### Fix Auth DB Connection Strategy
  1. Go to Project Settings > Database
  2. Under "Connection pooling", find "Auth pooler settings"  
  3. Change from "Fixed connection count (10)" to "Percentage-based allocation"
  4. Set to 15% (recommended for most applications)
  5. This allows Auth to scale properly with instance upgrades
  
  ## Important Notes
  - This is a destructive operation - dropped tables cannot be recovered
  - No user data is affected as these tables are empty and unused
  - Indexes on dropped tables are automatically removed
  - Foreign key constraints are automatically cleaned up
*/

-- ============================================================================
-- Remove Triggers First
-- ============================================================================

DROP TRIGGER IF EXISTS increment_poem_likes ON poem_likes;
DROP TRIGGER IF EXISTS decrement_poem_likes ON poem_likes;
DROP TRIGGER IF EXISTS on_like_added ON poem_likes;
DROP TRIGGER IF EXISTS on_like_removed ON poem_likes;

-- ============================================================================
-- Remove Functions
-- ============================================================================

DROP FUNCTION IF EXISTS public.increment_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_like_count() CASCADE;

-- ============================================================================
-- Remove Unused Tables (CASCADE handles foreign keys)
-- ============================================================================

DROP TABLE IF EXISTS poem_likes CASCADE;
DROP TABLE IF EXISTS poem_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- ============================================================================
-- Clean Up poems Table
-- ============================================================================

-- Remove columns that were only used by the dropped poem_likes feature
ALTER TABLE poems DROP COLUMN IF EXISTS like_count;
ALTER TABLE poems DROP COLUMN IF EXISTS view_count;