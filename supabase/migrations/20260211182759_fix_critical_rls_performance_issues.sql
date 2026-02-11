/*
  # Fix Critical RLS Performance and Security Issues
  
  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in critical RLS policies
    - This prevents re-evaluation for each row
    
  2. Security Fixes
    - Fix overly permissive reading_performances policies
    - Remove duplicate policies
    
  3. Tables Updated (High Priority)
    - tags (remove duplicates, optimize)
    - poem_tags (remove duplicates, optimize)
    - reading_performances (fix security)
    - writing_sessions (remove duplicates, optimize)
    - poetry_quizzes (remove duplicates, optimize)
    - quiz_attempts (remove duplicates, optimize)
*/

-- Tags (removing duplicate policies and optimizing)
DROP POLICY IF EXISTS "Users can create their own tags" ON public.tags CASCADE;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags CASCADE;
CREATE POLICY "Users can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags CASCADE;
DROP POLICY IF EXISTS "Users can view own tags" ON public.tags CASCADE;
CREATE POLICY "Users can view tags"
  ON public.tags FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags CASCADE;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags CASCADE;
CREATE POLICY "Users can update tags"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags CASCADE;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags CASCADE;
CREATE POLICY "Users can delete tags"
  ON public.tags FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Poem Tags (removing duplicate policies and optimizing)
DROP POLICY IF EXISTS "Users can tag their own poems" ON public.poem_tags CASCADE;
DROP POLICY IF EXISTS "Users can insert own poem tags" ON public.poem_tags CASCADE;
CREATE POLICY "Users can tag poems"
  ON public.poem_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.poems p
      WHERE p.id = poem_tags.poem_id
      AND p.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view tags on their poems" ON public.poem_tags CASCADE;
DROP POLICY IF EXISTS "Users can view own poem tags" ON public.poem_tags CASCADE;
CREATE POLICY "Users can view poem tags"
  ON public.poem_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.poems p
      WHERE p.id = poem_tags.poem_id
      AND p.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can remove tags from their poems" ON public.poem_tags CASCADE;
DROP POLICY IF EXISTS "Users can delete own poem tags" ON public.poem_tags CASCADE;
CREATE POLICY "Users can remove poem tags"
  ON public.poem_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.poems p
      WHERE p.id = poem_tags.poem_id
      AND p.user_id = (select auth.uid())
    )
  );

-- Reading Performances (FIX OVERLY PERMISSIVE POLICIES)
DROP POLICY IF EXISTS "Anyone can update performance reactions" ON public.reading_performances CASCADE;
CREATE POLICY "Users can update their performance reactions"
  ON public.reading_performances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reading_registrations rr
      WHERE rr.id = reading_performances.registration_id
      AND rr.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reading_registrations rr
      WHERE rr.id = reading_performances.registration_id
      AND rr.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Hosts and performers can record performances" ON public.reading_performances CASCADE;
CREATE POLICY "Performers can record performances"
  ON public.reading_performances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reading_registrations rr
      WHERE rr.id = reading_performances.registration_id
      AND rr.user_id = (select auth.uid())
    )
  );

-- Writing Sessions (consolidating duplicate policies)
DROP POLICY IF EXISTS "Users can create their own writing sessions" ON public.writing_sessions CASCADE;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.writing_sessions CASCADE;
CREATE POLICY "Create writing sessions"
  ON public.writing_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own writing sessions" ON public.writing_sessions CASCADE;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.writing_sessions CASCADE;
CREATE POLICY "Update writing sessions"
  ON public.writing_sessions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own writing sessions" ON public.writing_sessions CASCADE;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.writing_sessions CASCADE;
CREATE POLICY "View writing sessions"
  ON public.writing_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Poetry Quizzes (consolidating duplicate policies)
DROP POLICY IF EXISTS "Anyone can view active quizzes" ON public.poetry_quizzes CASCADE;
DROP POLICY IF EXISTS "Quiz creators can view their own quizzes" ON public.poetry_quizzes CASCADE;
CREATE POLICY "View quizzes"
  ON public.poetry_quizzes FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by = (select auth.uid()));

-- Quiz Attempts (consolidating)
DROP POLICY IF EXISTS "Users can view all attempts for leaderboard" ON public.quiz_attempts CASCADE;
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts CASCADE;
CREATE POLICY "View quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR completed_at IS NOT NULL);

-- Quiz Questions (consolidating)
DROP POLICY IF EXISTS "Anyone can view questions for active quizzes" ON public.quiz_questions CASCADE;
DROP POLICY IF EXISTS "Quiz creators can manage questions" ON public.quiz_questions CASCADE;
CREATE POLICY "Manage quiz questions"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.poetry_quizzes pq
      WHERE pq.id = quiz_questions.quiz_id
      AND (pq.is_active = true OR pq.created_by = (select auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.poetry_quizzes pq
      WHERE pq.id = quiz_questions.quiz_id
      AND pq.created_by = (select auth.uid())
    )
  );
