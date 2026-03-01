-- Test Script: Verify Likes & Comments System
-- Run this in Supabase SQL Editor to verify cross-user visibility

-- ============================================
-- TEST 1: Verify RLS Policies Exist
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as "using_clause",
  with_check
FROM pg_policies
WHERE tablename IN ('reactions', 'comments')
ORDER BY tablename, cmd;

-- Expected Results:
-- You should see policies like:
-- - "Anyone can view reactions" (SELECT with USING: true)
-- - "Anyone can view comments" (SELECT with USING: true)
-- - Policies for INSERT/UPDATE/DELETE with auth.uid() checks


-- ============================================
-- TEST 2: Verify Realtime is Enabled
-- ============================================

SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('reactions', 'comments');

-- Expected Results:
-- Both 'reactions' and 'comments' should appear in results


-- ============================================
-- TEST 3: Verify Indexes Exist
-- ============================================

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('reactions', 'comments')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected Results:
-- idx_reactions_poem_id
-- idx_reactions_user_id
-- idx_comments_poem_id
-- idx_comments_user_id
-- idx_comments_created_at


-- ============================================
-- TEST 4: Verify Helper Functions Exist
-- ============================================

SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_poem_like_count',
    'get_poem_comment_count',
    'user_has_liked_poem'
  );

-- Expected Results:
-- All three functions should appear


-- ============================================
-- TEST 5: Sample Data Test (if you have test poems)
-- ============================================

-- Get a sample poem ID (replace with actual poem ID)
-- SELECT id FROM poems WHERE is_public = true LIMIT 1;

-- Then test the helper functions (replace 'YOUR-POEM-ID' with actual ID):
-- SELECT get_poem_like_count('YOUR-POEM-ID');
-- SELECT get_poem_comment_count('YOUR-POEM-ID');


-- ============================================
-- TEST 6: Verify Foreign Keys and Constraints
-- ============================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('reactions', 'comments')
ORDER BY tc.table_name;

-- Expected Results:
-- reactions.poem_id -> poems.id
-- reactions.user_id -> auth.users.id
-- comments.poem_id -> poems.id
-- comments.user_id -> auth.users.id
