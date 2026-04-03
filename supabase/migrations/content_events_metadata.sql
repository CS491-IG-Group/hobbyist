/* Flexible context for recommendations (hub slugs, client-only IDs, session position, etc.) */
ALTER TABLE public.content_events
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_content_events_metadata_gin
    ON public.content_events USING gin (metadata jsonb_path_ops);

/* Event rows may reference demo IDs or future server IDs not yet in posts/items */
ALTER TABLE public.content_events DROP CONSTRAINT IF EXISTS content_events_post_id_fkey;
ALTER TABLE public.content_events DROP CONSTRAINT IF EXISTS content_events_item_id_fkey;
