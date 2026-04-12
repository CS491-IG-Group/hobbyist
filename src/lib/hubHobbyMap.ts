/** Maps timeline hub display names to `hobbies.slug` (see zz_seed_hobbies migration). */
const HUB_TO_SLUG: Record<string, string> = {
  Cars: "cars",
  Fitness: "fitness",
  Technology: "technology",
  Movies: "movies",
  Photography: "photography",
  Cooking: "cooking",
  Gaming: "gaming",
};

export function hubNameToHobbySlug(hubName: string | null | undefined): string | null {
  if (!hubName) return null;
  return HUB_TO_SLUG[hubName] ?? null;
}
