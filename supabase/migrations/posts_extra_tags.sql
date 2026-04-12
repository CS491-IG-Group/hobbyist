/* User-authored tags on posts (merged in app with hub defaults via mergePostTags). */
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS extra_tags TEXT[] NOT NULL DEFAULT '{}';
