/* Item likes: one like per user per item (e.g. favorite). */
CREATE TABLE IF NOT EXISTS public.item_likes (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    item_id INT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,   /* FK → items.id */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, item_id)
);
