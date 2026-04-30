/* Direct message persistence for Orbit (1:1 conversations). */

CREATE TABLE IF NOT EXISTS public.orbit_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT orbit_conversations_distinct_users CHECK (user_a_id <> user_b_id),
    CONSTRAINT orbit_conversations_sorted_users CHECK (user_a_id < user_b_id),
    CONSTRAINT orbit_conversations_unique_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_orbit_conversations_user_a
    ON public.orbit_conversations (user_a_id, last_message_at DESC NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orbit_conversations_user_b
    ON public.orbit_conversations (user_b_id, last_message_at DESC NULLS LAST, created_at DESC);

CREATE TABLE IF NOT EXISTS public.orbit_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.orbit_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orbit_messages_conversation_created
    ON public.orbit_messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_orbit_messages_sender_created
    ON public.orbit_messages (sender_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_orbit_conversation_from_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.orbit_conversations
    SET last_message = NEW.body,
        last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orbit_messages_touch_conversation ON public.orbit_messages;
CREATE TRIGGER trg_orbit_messages_touch_conversation
AFTER INSERT ON public.orbit_messages
FOR EACH ROW
EXECUTE FUNCTION public.touch_orbit_conversation_from_message();

ALTER TABLE public.orbit_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orbit_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orbit participants read conversations" ON public.orbit_conversations;
CREATE POLICY "Orbit participants read conversations"
    ON public.orbit_conversations FOR SELECT
    USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DROP POLICY IF EXISTS "Orbit participants create conversations" ON public.orbit_conversations;
CREATE POLICY "Orbit participants create conversations"
    ON public.orbit_conversations FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND created_by = auth.uid()
        AND (auth.uid() = user_a_id OR auth.uid() = user_b_id)
    );

DROP POLICY IF EXISTS "Orbit participants read messages" ON public.orbit_messages;
CREATE POLICY "Orbit participants read messages"
    ON public.orbit_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.orbit_conversations oc
            WHERE oc.id = orbit_messages.conversation_id
              AND (auth.uid() = oc.user_a_id OR auth.uid() = oc.user_b_id)
        )
    );

DROP POLICY IF EXISTS "Orbit participants send messages" ON public.orbit_messages;
CREATE POLICY "Orbit participants send messages"
    ON public.orbit_messages FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND sender_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.orbit_conversations oc
            WHERE oc.id = orbit_messages.conversation_id
              AND (auth.uid() = oc.user_a_id OR auth.uid() = oc.user_b_id)
        )
    );
