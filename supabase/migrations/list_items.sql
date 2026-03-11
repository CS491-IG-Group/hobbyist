/* List items: items inside each list. */
CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,   /* FK → lists.id */
    title TEXT NOT NULL,                                                   /* e.g. movie/book/game name */
    external_id TEXT,                                                      /* optional external ID, e.g. TMDB/ISBN/game ID */
    status TEXT,                                                           /* e.g. 'planned' | 'in_progress' | 'done' */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
