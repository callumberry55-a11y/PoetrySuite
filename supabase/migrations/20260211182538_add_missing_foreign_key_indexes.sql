/*
  # Add Missing Foreign Key Indexes
  
  1. Performance Improvements
    - Add indexes for all unindexed foreign keys
    - This dramatically improves query performance for JOIN operations
    
  2. Indexes Added
    - bingo_completions.poem_id
    - challenge_submissions.poem_id
    - circle_feedback.user_id
    - circle_submissions.poem_id, user_id
    - poetry_quizzes.created_by
    - poetry_swaps.created_by
    - public_readings.host_id
    - reading_performances.registration_id
    - reading_registrations.poem_id
    - roulette_results.poem_id
    - swap_participants.partner_id, poem_id
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_bingo_completions_poem_id 
  ON public.bingo_completions(poem_id);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_poem_id 
  ON public.challenge_submissions(poem_id);

CREATE INDEX IF NOT EXISTS idx_circle_feedback_user_id 
  ON public.circle_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_circle_submissions_poem_id 
  ON public.circle_submissions(poem_id);

CREATE INDEX IF NOT EXISTS idx_circle_submissions_user_id 
  ON public.circle_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_poetry_quizzes_created_by 
  ON public.poetry_quizzes(created_by);

CREATE INDEX IF NOT EXISTS idx_poetry_swaps_created_by 
  ON public.poetry_swaps(created_by);

CREATE INDEX IF NOT EXISTS idx_public_readings_host_id 
  ON public.public_readings(host_id);

CREATE INDEX IF NOT EXISTS idx_reading_performances_registration_id 
  ON public.reading_performances(registration_id);

CREATE INDEX IF NOT EXISTS idx_reading_registrations_poem_id 
  ON public.reading_registrations(poem_id);

CREATE INDEX IF NOT EXISTS idx_roulette_results_poem_id 
  ON public.roulette_results(poem_id);

CREATE INDEX IF NOT EXISTS idx_swap_participants_partner_id 
  ON public.swap_participants(partner_id);

CREATE INDEX IF NOT EXISTS idx_swap_participants_poem_id 
  ON public.swap_participants(poem_id);
