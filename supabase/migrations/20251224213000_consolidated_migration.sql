
-- Create the user_profiles table
CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    phone TEXT,
    is_developer BOOLEAN DEFAULT FALSE,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_profiles_username_key UNIQUE (username)
);

-- Create the promote_to_developer function
CREATE OR REPLACE FUNCTION public.promote_to_developer(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF auth.uid() IN (SELECT user_id FROM public.user_profiles WHERE is_developer = TRUE) THEN
    UPDATE public.user_profiles
    SET is_developer = TRUE
    WHERE user_id = target_user_id;
  ELSE
    RAISE EXCEPTION 'You are not authorized to perform this action';
  END IF;
END;
$function$;

-- RLS policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual write access" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow developers to update profiles" ON public.user_profiles
FOR UPDATE USING (
  (SELECT is_developer FROM public.user_profiles WHERE user_id = auth.uid()) = TRUE
);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$function$;

-- Trigger to call handle_new_user on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

