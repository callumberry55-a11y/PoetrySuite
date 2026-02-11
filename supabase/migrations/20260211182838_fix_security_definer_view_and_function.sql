/*
  # Fix Security Definer View and Function Search Path
  
  1. Security Improvements
    - Remove SECURITY DEFINER from monthly_distributions_summary view
    - Fix mutable search_path in update_quiz_updated_at function
    
  2. Changes
    - Recreate monthly_distributions_summary view without SECURITY DEFINER
    - Set stable search_path for update_quiz_updated_at function
*/

-- Drop and recreate monthly_distributions_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.monthly_distributions_summary CASCADE;

CREATE VIEW public.monthly_distributions_summary AS
SELECT 
  id,
  distribution_date,
  points_per_user,
  users_count,
  total_points_distributed,
  created_at,
  EXTRACT(month FROM distribution_date) AS month_number,
  EXTRACT(year FROM distribution_date) AS year
FROM public.monthly_distributions
ORDER BY distribution_date DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.monthly_distributions_summary TO authenticated;

-- Fix update_quiz_updated_at function search_path
DROP FUNCTION IF EXISTS public.update_quiz_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_quiz_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it existed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'poetry_quizzes'
  ) THEN
    DROP TRIGGER IF EXISTS update_quiz_updated_at_trigger ON public.poetry_quizzes;
    CREATE TRIGGER update_quiz_updated_at_trigger
      BEFORE UPDATE ON public.poetry_quizzes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_quiz_updated_at();
  END IF;
END $$;
