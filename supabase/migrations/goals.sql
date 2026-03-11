/* Goals: goal definitions (global templates or user-specific goals). */
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,   /* NULL = global template; non-null = user-specific */
    title TEXT NOT NULL,                                                /* e.g. "Run 5km three times a week" */
    description TEXT,
    target_value NUMERIC,                                               /* e.g. 3, 12 */
    unit TEXT,                                                          /* e.g. 'runs', 'books' */
    period TEXT,                                                        /* e.g. 'weekly' | 'yearly' | 'none' */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
