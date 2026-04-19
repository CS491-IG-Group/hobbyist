/*
 * Legacy upgrade: posts used hobby_id; timeline is hub-scoped (public.hubs.id).
 * Skipped automatically when `posts` was created with hub_id only (fresh reset).
 */
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'hobby_id'
  ) THEN
    ALTER TABLE public.posts
      ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE;

    UPDATE public.posts p
    SET hub_id = (
      SELECT h.id
      FROM public.hubs h
      WHERE h.hobby_id = p.hobby_id
      ORDER BY h.name ASC
      LIMIT 1
    )
    WHERE p.hobby_id IS NOT NULL
      AND p.hub_id IS NULL;

    DELETE FROM public.posts WHERE hub_id IS NULL;

    ALTER TABLE public.posts ALTER COLUMN hub_id SET NOT NULL;

    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_hobby_id_fkey;
    ALTER TABLE public.posts DROP COLUMN hobby_id;
  END IF;
END $$;
