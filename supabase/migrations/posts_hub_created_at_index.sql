/* Speed up hub feed reads: WHERE hub_id = ? ORDER BY created_at */
CREATE INDEX IF NOT EXISTS idx_posts_hub_id_created_at
    ON public.posts (hub_id, created_at DESC);
