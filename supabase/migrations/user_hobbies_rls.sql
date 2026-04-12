ALTER TABLE public.user_hobbies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own user_hobbies" ON public.user_hobbies;
DROP POLICY IF EXISTS "Users insert own user_hobbies" ON public.user_hobbies;
DROP POLICY IF EXISTS "Users delete own user_hobbies" ON public.user_hobbies;

CREATE POLICY "Users read own user_hobbies"
  ON public.user_hobbies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own user_hobbies"
  ON public.user_hobbies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own user_hobbies"
  ON public.user_hobbies FOR DELETE
  USING (auth.uid() = user_id);
