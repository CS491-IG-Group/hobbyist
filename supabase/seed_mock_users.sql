-- Mock users seed for demos (Supabase SQL Editor-safe).
-- This script is idempotent: rerunning updates the same users.

BEGIN;

-- 1) Ensure crypt() is available for password hashing in auth.users.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Define deterministic mock users.
WITH seed_users AS (
  SELECT
    '11111111-1111-4111-8111-111111111111'::uuid AS id,
    'alex.rivera.demo@hobbyist.app'::text        AS email,
    'alexrivera'::text                           AS handle,
    'Alex Rivera'::text                          AS display_name,
    'CS student who likes building social apps.'::text AS bio,
    true                                         AS onboarding_completed
  UNION ALL
  SELECT
    '22222222-2222-4222-8222-222222222222'::uuid,
    'maya.chen.demo@hobbyist.app',
    'mayachen',
    'Maya Chen',
    'Designer focused on UX and community events.',
    true
  UNION ALL
  SELECT
    '33333333-3333-4333-8333-333333333333'::uuid,
    'noah.patel.demo@hobbyist.app',
    'noahpatel',
    'Noah Patel',
    'Backend dev into fitness, food, and film.',
    true
  UNION ALL
  SELECT
    '44444444-4444-4444-8444-444444444444'::uuid,
    'zoe.martin.demo@hobbyist.app',
    'zoemartin',
    'Zoe Martin',
    'Photographer and gamer who enjoys meetups.',
    true
  UNION ALL
  SELECT
    '55555555-5555-4555-8555-555555555555'::uuid,
    'liam.brown.demo@hobbyist.app',
    'liambrown',
    'Liam Brown',
    'Runner and music producer, always learning.',
    false
),
insert_auth AS (
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_anonymous
  )
  SELECT
    su.id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    su.email,
    crypt('DemoPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'handle', su.handle,
      'display_name', su.display_name
    ),
    now(),
    now(),
    false
  FROM seed_users su
  ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = EXCLUDED.email_confirmed_at,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      updated_at = now()
  RETURNING id
)
INSERT INTO public.users (
  id,
  handle,
  email,
  display_name,
  onboarding_completed,
  bio,
  created_at
)
SELECT
  su.id,
  su.handle,
  su.email,
  su.display_name,
  su.onboarding_completed,
  su.bio,
  now()
FROM seed_users su
ON CONFLICT (id) DO UPDATE
  SET
    handle = EXCLUDED.handle,
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    onboarding_completed = EXCLUDED.onboarding_completed,
    bio = EXCLUDED.bio;

-- 3) Optionally attach mock users to up to 2 hobbies each (if hobbies exist).
WITH hobby_pairs AS (
  SELECT
    u.id AS user_id,
    h.id AS hobby_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY h.id) AS rn
  FROM public.users u
  JOIN public.hobbies h ON true
  WHERE u.email LIKE '%.demo@hobbyist.app'
)
INSERT INTO public.user_hobbies (user_id, hobby_id)
SELECT user_id, hobby_id
FROM hobby_pairs
WHERE rn <= 2
ON CONFLICT (user_id, hobby_id) DO NOTHING;

COMMIT;

-- Login password for all seeded users:
--   DemoPass123!
