/* Post likes: one like per user per post. */
CREATE TABLE IF NOT EXISTS public.post_likes (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    post_id INT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,   /* FK → posts.id */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);
