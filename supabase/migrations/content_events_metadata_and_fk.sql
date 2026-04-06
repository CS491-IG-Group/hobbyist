/* Upgrades older DBs: metadata column + drop optional FKs so demo/client ids always insert. Safe if constraints/column already removed or present. */
ALTER TABLE public.content_events
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE public.content_events DROP CONSTRAINT IF EXISTS content_events_post_id_fkey;
ALTER TABLE public.content_events DROP CONSTRAINT IF EXISTS content_events_item_id_fkey;
ALTER TABLE public.content_events DROP CONSTRAINT IF EXISTS content_events_hobby_id_fkey;

CREATE INDEX IF NOT EXISTS idx_content_events_ui_location_created_at
  ON public.content_events (ui_location, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_events_metadata_gin
  ON public.content_events USING gin (metadata);
