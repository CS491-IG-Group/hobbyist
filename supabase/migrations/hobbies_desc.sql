/* Backfill: older hobbies DDL had no description column; some projects use NOT NULL "desc". */
ALTER TABLE public.hobbies
  ADD COLUMN IF NOT EXISTS "desc" VARCHAR(300) NOT NULL DEFAULT '';
