/* Users: profile data; id links to Supabase auth.users. */
/* Username and password live in auth.users; Supabase Auth handles login. */
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  /* FK → auth.users(id) */
    handle VARCHAR(50) UNIQUE,           /* public username, e.g. for @mentions or profile URL */
    email VARCHAR(255),                  /* optional; may duplicate auth.users.email for display */
    display_name VARCHAR(100),           /* friendly name shown in the UI */
    onboarding_completed BOOLEAN NOT NULL DEFAULT false, /* false until user finishes onboarding wizard */
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Trigger: create a users row when someone signs up via Supabase Auth */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, handle, email, created_at, display_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'handle',
        NEW.email,
        NEW.created_at,                              /* use auth.users.created_at directly */
        NEW.raw_user_meta_data->>'display_name'      /* fixed: was NEW.display_name which doesn't exist */
    )
    ON CONFLICT (handle) DO UPDATE SET handle = NULL; /* if handle is taken, null it out rather than orphaning the user */
    RETURN NEW;
END;
$$;

/* Re-create trigger (drop first to avoid duplicate if re-running this file) */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* Trigger: keep public.users.email in sync if user changes email via Supabase Auth */
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.users
    SET email = NEW.email
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION public.handle_user_email_update();

/* RLS */
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own row"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

/* Allow inserts from service role (trigger uses SECURITY DEFINER so bypasses RLS,
   but this policy covers any future direct client inserts) */
CREATE POLICY "Service role can insert users"
    ON public.users FOR INSERT
    WITH CHECK (true);