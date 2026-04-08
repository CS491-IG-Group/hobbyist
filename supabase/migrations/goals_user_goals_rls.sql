/* Row Level Security for user-owned goals and progress rows. */

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON public.goals FOR SELECT
    USING (owner_user_id = auth.uid());

CREATE POLICY "Users can insert own goals"
    ON public.goals FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update own goals"
    ON public.goals FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
    ON public.goals FOR DELETE
    USING (owner_user_id = auth.uid());

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_goals"
    ON public.user_goals FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user_goals"
    ON public.user_goals FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.goals g
            WHERE g.id = goal_id AND g.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own user_goals"
    ON public.user_goals FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own user_goals"
    ON public.user_goals FOR DELETE
    USING (user_id = auth.uid());
