/* Posts: Twitter-style timeline (text, review, or recommendation). */
CREATE TABLE IF NOT EXISTS public.posts (
    id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    hobby_id INT NOT NULL REFERENCES public.hobbies(id) ON DELETE CASCADE,   /* FK → hobbies.id */
    item_id INT REFERENCES public.items(id) ON DELETE SET NULL,   /* FK → items.id; set when post is about an item */
    post_type VARCHAR(20) NOT NULL,   /* text, review, or reco */
    body TEXT NOT NULL,
    image_url VARCHAR(500),   /* optional screenshot/attachment */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
