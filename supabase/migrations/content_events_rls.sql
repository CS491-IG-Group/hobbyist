/* Row-level security: users may insert and read only their own analytics rows. */
ALTER TABLE public.content_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own content_events" ON public.content_events;
DROP POLICY IF EXISTS "Users insert own content_events" ON public.content_events;

CREATE POLICY "Users read own content_events"
  ON public.content_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own content_events"
  ON public.content_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
