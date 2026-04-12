/* Canonical hobbies aligned with timeline hub labels (for user_hobbies + post hobby_id).
   Runs after hobbies / user_hobbies DDL (filename prefix zz_). */
INSERT INTO public.hobbies (name, slug)
VALUES
  ('Cars', 'cars'),
  ('Fitness', 'fitness'),
  ('Technology', 'technology'),
  ('Movies', 'movies'),
  ('Photography', 'photography'),
  ('Cooking', 'cooking'),
  ('Gaming', 'gaming')
ON CONFLICT (slug) DO NOTHING;
