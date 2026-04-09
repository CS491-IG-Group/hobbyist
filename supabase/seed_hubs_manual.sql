/*
 * Run this in the Supabase Dashboard → SQL Editor if migrations were not applied
 * or hubs/hobbies rows are still missing.
 *
 * Safe to run multiple times (idempotent upserts).
 *
 * Requires base tables public.hobbies and public.hubs. Adds display columns on hubs if missing.
 */

ALTER TABLE public.hobbies
    ADD COLUMN IF NOT EXISTS "desc" TEXT;

ALTER TABLE public.hubs
    ADD COLUMN IF NOT EXISTS hobby_id INT REFERENCES public.hobbies(id) ON DELETE SET NULL;

ALTER TABLE public.hubs
    ADD COLUMN IF NOT EXISTS gradient_from TEXT;

ALTER TABLE public.hubs
    ADD COLUMN IF NOT EXISTS gradient_to TEXT;

ALTER TABLE public.hubs
    ADD COLUMN IF NOT EXISTS member_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.hubs
    ADD COLUMN IF NOT EXISTS post_count INT NOT NULL DEFAULT 0;

INSERT INTO public.hobbies (name, slug)
SELECT 'Gaming', 'gaming'
WHERE NOT EXISTS (SELECT 1 FROM public.hobbies WHERE slug = 'gaming');

INSERT INTO public.hobbies (name, slug)
SELECT 'Fitness', 'fitness'
WHERE NOT EXISTS (SELECT 1 FROM public.hobbies WHERE slug = 'fitness');

INSERT INTO public.hobbies (name, slug)
SELECT 'Comics', 'comics'
WHERE NOT EXISTS (SELECT 1 FROM public.hobbies WHERE slug = 'comics');

INSERT INTO public.hubs (slug, name, description, icon, gradient_from, gradient_to, member_count, post_count, hobby_id)
SELECT
    'resident-evil',
    'Resident Evil',
    'Survival horror, zombies, and lore. Discuss remakes, speedruns, and every terrifying encounter across the franchise.',
    '🧟',
    '#1a1a2e',
    '#6b0f1a',
    1240,
    3420,
    h.id
FROM public.hobbies h
WHERE h.slug = 'gaming'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to,
    member_count = EXCLUDED.member_count,
    post_count = EXCLUDED.post_count,
    hobby_id = EXCLUDED.hobby_id;

INSERT INTO public.hubs (slug, name, description, icon, gradient_from, gradient_to, member_count, post_count, hobby_id)
SELECT
    'spider-man',
    'Spider-Man',
    'Marvel comics, iconic runs, crossovers, and friendly neighborhood debates about the best era of Spidey.',
    '🕷️',
    '#1e3a8a',
    '#dc2626',
    890,
    2100,
    h.id
FROM public.hobbies h
WHERE h.slug = 'comics'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to,
    member_count = EXCLUDED.member_count,
    post_count = EXCLUDED.post_count,
    hobby_id = EXCLUDED.hobby_id;

INSERT INTO public.hubs (slug, name, description, icon, gradient_from, gradient_to, member_count, post_count, hobby_id)
SELECT
    'weight-training',
    'Weight Training',
    'Strength programs, form checks, PRs, and lifting science—barbells, dumbbells, and smart programming.',
    '🏋️',
    '#064e3b',
    '#059669',
    2100,
    5600,
    h.id
FROM public.hobbies h
WHERE h.slug = 'fitness'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to,
    member_count = EXCLUDED.member_count,
    post_count = EXCLUDED.post_count,
    hobby_id = EXCLUDED.hobby_id;

ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read hobbies" ON public.hobbies;
CREATE POLICY "Anyone can read hobbies"
    ON public.hobbies FOR SELECT
    USING (true);
