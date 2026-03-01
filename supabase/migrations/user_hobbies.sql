/* User hobbies: which hobbies a user follows/joins (many-to-many). */
CREATE TABLE IF NOT EXISTS public.user_hobbies (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    hobby_id INT NOT NULL REFERENCES public.hobbies(id) ON DELETE CASCADE,   /* FK → hobbies.id */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, hobby_id)
);
