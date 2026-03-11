/* Lists: user-owned lists (e.g. Movies to Watch, Books to Read). */
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    title TEXT NOT NULL,
    type TEXT,                                                             /* e.g. 'movies' | 'books' | 'games' | 'generic' */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
