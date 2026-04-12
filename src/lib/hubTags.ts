import { hubNameToHobbySlug } from "./hubHobbyMap";

/** Normalize for overlap scoring and analytics (lowercase, trim, spaces → hyphen). */
export function normalizeTag(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Curated hub-level tags (cross-cutting; hobby slug is added separately in merge). */
const HUB_DEFAULT_TAGS: Record<string, string[]> = {
  Cars: ["motorsport", "mods", "track"],
  Fitness: ["strength", "training", "pr"],
  Technology: ["hardware", "dev", "apple-silicon"],
  Movies: ["imax", "sci-fi", "reviews"],
  Photography: ["film", "landscape", "golden-hour"],
  Cooking: ["recipes", "from-scratch", "asian"],
  Gaming: ["esports", "pc", "consoles"],
};

/** Same defaults as `HUB_DEFAULT_TAGS`, keyed by `hobbies.slug` (works for any hub display name). */
const HOBBY_SLUG_DEFAULT_TAGS: Record<string, string[]> = {
  cars: ["motorsport", "mods", "track"],
  fitness: ["strength", "training", "pr"],
  technology: ["hardware", "dev", "apple-silicon"],
  movies: ["imax", "sci-fi", "reviews"],
  photography: ["film", "landscape", "golden-hour"],
  cooking: ["recipes", "from-scratch", "asian"],
  gaming: ["esports", "pc", "consoles"],
  comics: ["variants", "runs", "crossovers"],
};

export function hubDefaultTags(hub: string): string[] {
  return (HUB_DEFAULT_TAGS[hub] ?? []).map(normalizeTag).filter(Boolean);
}

function defaultTagsForHobbySlug(slug: string | null | undefined): string[] {
  if (!slug) return [];
  const key = slug.trim().toLowerCase();
  return (HOBBY_SLUG_DEFAULT_TAGS[key] ?? []).map(normalizeTag).filter(Boolean);
}

/**
 * Hub default tags + optional post-specific tags + hobby slug (for declared-interest overlap).
 * Pass `hobbySlug` from `hobbies.slug` when the UI label is a hub name (e.g. "Weight Training")
 * so defaults still apply; otherwise only `extra` tags may appear.
 * Dedupes; order: hobby slug, hub defaults, extras.
 */
export function mergePostTags(
  hub: string,
  extra?: string[] | undefined,
  hobbySlug?: string | null
): string[] {
  const slugFromJoin = hobbySlug?.trim().toLowerCase() || null;
  const slugFromLabel = hubNameToHobbySlug(hub);
  const hobby = slugFromJoin || slugFromLabel;

  const defaultsFromSlug = defaultTagsForHobbySlug(hobby);
  const defaultsFromHubName = hubDefaultTags(hub);
  const defaults = defaultsFromSlug.length > 0 ? defaultsFromSlug : defaultsFromHubName;

  const parts = [
    ...(hobby ? [hobby] : []),
    ...defaults,
    ...(extra ?? []).map(normalizeTag),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of parts) {
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
