/*
  # Fix User Profile Creation for Phone Authentication

  ## Problem
  The handle_new_user() function assumes all users have an email address.
  For phone-only authentication, NEW.email is NULL, causing issues with username generation.

  ## Changes
  1. Update handle_new_user() function to support phone authentication
     - Use phone number for username when email is not available
     - Store phone number in user_profiles.phone column
     - Handle both email and phone auth gracefully
  
  ## Implementation
  - Check if email exists, use that for username generation
  - If no email, use phone number (last 10 digits) for username
  - Always store phone number in profile if available
*/

-- Drop and recreate the function with phone auth support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate username based on available data
  -- Priority: metadata username > email > phone number
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL THEN
    generated_username := NEW.raw_user_meta_data->>'username';
  ELSIF NEW.email IS NOT NULL THEN
    generated_username := split_part(NEW.email, '@', 1);
  ELSIF NEW.phone IS NOT NULL THEN
    -- Use last 10 digits of phone for username (removes country code)
    generated_username := 'user_' || right(regexp_replace(NEW.phone, '[^0-9]', '', 'g'), 10);
  ELSE
    -- Fallback to user ID if nothing else available
    generated_username := 'user_' || substring(NEW.id::text, 1, 8);
  END IF;

  -- Insert user profile with phone number if available
  INSERT INTO public.user_profiles (user_id, username, phone)
  VALUES (
    NEW.id,
    generated_username,
    NEW.phone
  );

  RETURN NEW;
END;
$$;
