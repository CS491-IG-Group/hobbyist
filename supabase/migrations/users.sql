/* Users: profile data; id links to Supabase auth.users. */
/* Username and password live in auth.users; Supabase Auth handles login. */
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  /* FK → auth.users(id) */
    handle VARCHAR(50) UNIQUE,   /* public username, e.g. for @mentions or profile URL */
    email VARCHAR(255),          /* optional; may duplicate auth.users.email for display */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Trigger: create a users row when someone signs up via Supabase Auth */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, handle, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'handle',
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* RLS: anyone can read users; users can only update their own row */
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own row"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);
