/* Row level security for timeline posts: anyone can read; authenticated users may insert their own rows. */
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
CREATE POLICY "Anyone can read posts"
    ON public.posts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert own posts" ON public.posts;
CREATE POLICY "Users insert own posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
