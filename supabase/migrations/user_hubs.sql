/* User hubs: which hubs a user has joined (many-to-many). */
CREATE TABLE IF NOT EXISTS public.user_hubs (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,     /* FK → hubs.id */
    role TEXT,                                                              /* e.g. 'member' | 'moderator' */
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, hub_id)
);
