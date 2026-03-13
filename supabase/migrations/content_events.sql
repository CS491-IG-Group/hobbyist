/* Content events: logs user behavior (views, clicks, likes, saves, hides, reports, etc.) */
CREATE TABLE IF NOT EXISTS public.content_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    /* Who did the action */
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    /* What it was about (all nullable so we can reuse for different surfaces) */
    post_id INT REFERENCES public.posts(id) ON DELETE CASCADE,     /* when the event is about a post */
    item_id INT REFERENCES public.items(id) ON DELETE CASCADE,     /* when the event is about a specific item */
    hobby_id INT REFERENCES public.hobbies(id) ON DELETE CASCADE,  /* context hobby / hub */

    /* What happened */
    event_type TEXT NOT NULL,        /* e.g. 'view', 'click', 'like', 'save', 'hide', 'report' */
    dwell_ms INTEGER,                /* time spent on the item/view in milliseconds, mainly for 'view' */

    /* Where and how it happened (context) */
    ui_location TEXT,                /* e.g. 'home_feed', 'hobby_feed', 'item_detail', 'profile' */
    device_type TEXT,                /* e.g. 'mobile', 'desktop' */
    session_id UUID,                 /* client-generated session id */

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Helpful indexes for typical analytics / recommendation queries */
CREATE INDEX IF NOT EXISTS idx_content_events_user_created_at
    ON public.content_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_events_post_created_at
    ON public.content_events (post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_events_item_created_at
    ON public.content_events (item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_events_event_type_created_at
    ON public.content_events (event_type, created_at DESC);

