/* Items: specific things inside a hobby (e.g. Breaking Bad, 5x5 program, freestyle drills). */
CREATE TABLE IF NOT EXISTS public.items (
    id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hobby_id INT NOT NULL REFERENCES public.hobbies(id) ON DELETE CASCADE,   /* FK → hobbies.id */
    name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50),   /* e.g. show, book, game, routine, video */
    description TEXT,
    image_url VARCHAR(500),
    slug VARCHAR(255) NOT NULL,   /* URL-friendly name, unique within hobby; e.g. breaking-bad */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (hobby_id, slug)
);
