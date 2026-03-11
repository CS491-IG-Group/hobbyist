/* Hubs: canonical list of hubs/categories (e.g. Cars, Fitness, Technology). */
CREATE TABLE IF NOT EXISTS public.hubs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,      /* URL-friendly key, e.g. 'cars', 'fitness' */
    name TEXT NOT NULL,             /* Display name */
    description TEXT,
    icon TEXT,                      /* Optional emoji or icon name */
    color TEXT,                     /* Optional color token or hex */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
