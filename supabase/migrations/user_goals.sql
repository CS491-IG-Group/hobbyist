/* User goals: per-user goal instances with progress. */
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,   /* FK → users.id */
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,   /* FK → goals.id */
    current_value NUMERIC NOT NULL DEFAULT 0,
    status TEXT,                                                           /* e.g. 'active' | 'completed' | 'archived' */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
