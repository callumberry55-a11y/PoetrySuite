
-- Create the user_profiles table
CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    phone TEXT,
    is_developer BOOLEAN DEFAULT FALSE,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_profiles_username_key UNIQUE (username)
);

-- Create the poems table
CREATE TABLE public.poems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    favorited BOOLEAN DEFAULT FALSE
);

-- Create the reactions table (for likes/comments)
CREATE TABLE public.reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poem_id, user_id, reaction_type)
);

-- Create the comments table
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the collections table
CREATE TABLE public.collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the tags table
CREATE TABLE public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Create the writing_stats table
CREATE TABLE public.writing_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    poems_written INTEGER DEFAULT 0,
    words_written INTEGER DEFAULT 0,
    minutes_writing INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Create the submissions table
CREATE TABLE public.submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    venue_name TEXT NOT NULL,
    venue_type TEXT,
    submission_date DATE NOT NULL,
    response_date DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the community_submissions table
CREATE TABLE public.community_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    submission_notes TEXT,
    review_notes TEXT,
    UNIQUE(user_id, poem_id)
);

-- Create the contests table
CREATE TABLE public.contests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    theme TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    voting_end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the push_subscriptions table
CREATE TABLE public.push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the feedback table
CREATE TABLE public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Function to update poem updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_poem_updated_at()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Trigger to update poem updated_at
CREATE TRIGGER update_poems_updated_at
  BEFORE UPDATE ON public.poems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poem_updated_at();

-- Function to update submission updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_submission_updated_at()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Trigger to update submission updated_at
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_submission_updated_at();

-- Function to update comment updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_comment_updated_at()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Trigger to update comment updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_updated_at();

-- RLS policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id OR TRUE);

CREATE POLICY "Allow individual write access" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individuals to update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for poems
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading own poems" ON public.poems
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow reading public poems" ON public.poems
FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Allow creating poems" ON public.poems
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow updating own poems" ON public.poems
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow deleting own poems" ON public.poems
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.reactions
FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reactions" ON public.reactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.reactions
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
FOR SELECT USING (TRUE);

CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections" ON public.collections
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tags" ON public.tags
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for writing_stats
ALTER TABLE public.writing_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stats" ON public.writing_stats
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own submissions" ON public.submissions
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for community_submissions
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved submissions" ON public.community_submissions
FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON public.community_submissions
FOR SELECT USING (
  (SELECT is_developer FROM public.user_profiles WHERE user_id = auth.uid()) = TRUE
);

CREATE POLICY "Users can submit poems" ON public.community_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions" ON public.community_submissions
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for contests
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contests" ON public.contests
FOR SELECT USING (TRUE);

-- RLS policies for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit feedback" ON public.feedback
FOR INSERT WITH CHECK (TRUE);

-- Create indexes for performance
CREATE INDEX idx_poems_user_id ON public.poems(user_id);
CREATE INDEX idx_poems_is_public ON public.poems(is_public);
CREATE INDEX idx_poems_created_at ON public.poems(created_at DESC);
CREATE INDEX idx_reactions_poem_id ON public.reactions(poem_id);
CREATE INDEX idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX idx_comments_poem_id ON public.comments(poem_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_community_submissions_user_id ON public.community_submissions(user_id);
CREATE INDEX idx_community_submissions_status ON public.community_submissions(status);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_writing_stats_user_id_date ON public.writing_stats(user_id, date);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, display_name)
  VALUES (new.id, new.email, new.email);
-- Trigger to call handle_new_user on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

