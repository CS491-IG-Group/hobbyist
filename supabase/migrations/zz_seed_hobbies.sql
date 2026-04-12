/* Canonical hobbies aligned with timeline hub labels (for user_hobbies + post hobby_id).
   Runs after hobbies / user_hobbies DDL (filename prefix zz_). */
INSERT INTO public.hobbies (name, slug, "desc")
VALUES
  ('Cars', 'cars', 'Automotive and car culture'),
  ('Fitness', 'fitness', 'Workouts, training, and wellness'),
  ('Technology', 'technology', 'Gadgets, software, and tech news'),
  ('Movies', 'movies', 'Film and TV discussion'),
  ('Photography', 'photography', 'Cameras, editing, and visual art'),
  ('Cooking', 'cooking', 'Recipes, food, and kitchen skills'),
  ('Gaming', 'gaming', 'Video games and esports')
ON CONFLICT (slug) DO NOTHING;
