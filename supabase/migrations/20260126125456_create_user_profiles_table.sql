
-- Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp on user_profiles table
DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- Create the followers table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Create indexes for the followers table
CREATE INDEX IF NOT EXISTS followers_follower_id_idx ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS followers_following_id_idx ON public.followers(following_id);

-- Enable Row Level Security for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
DROP POLICY IF EXISTS "Public user_profiles are viewable by everyone." ON public.user_profiles;
CREATE POLICY "Public user_profiles are viewable by everyone."
ON public.user_profiles FOR SELECT
USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.user_profiles;
CREATE POLICY "Users can insert their own profile."
ON public.user_profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.user_profiles;
CREATE POLICY "Users can update their own profile."
ON public.user_profiles FOR UPDATE
USING ( auth.uid() = id );

-- Enable Row Level Security for followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Policies for followers
DROP POLICY IF EXISTS "Followers are viewable by everyone." ON public.followers;
CREATE POLICY "Followers are viewable by everyone."
ON public.followers FOR SELECT
USING ( true );

DROP POLICY IF EXISTS "Users can follow other users." ON public.followers;
CREATE POLICY "Users can follow other users."
ON public.followers FOR INSERT
WITH CHECK ( auth.uid() = follower_id );

DROP POLICY IF EXISTS "Users can unfollow other users." ON public.followers;
CREATE POLICY "Users can unfollow other users."
ON public.followers FOR DELETE
USING ( auth.uid() = follower_id );

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  random_username TEXT;
BEGIN
  -- Generate a random username until it's unique
  LOOP
    random_username := 'user' || substr(md5(random()::text), 1, 8);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE username = random_username);
  END LOOP;

  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (NEW.id, random_username, random_username)
  ON CONFLICT(id) DO NOTHING; -- Make insert robust
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create a profile for a new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
