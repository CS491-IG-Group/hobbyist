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

export function hubDefaultTags(hub: string): string[] {
  return (HUB_DEFAULT_TAGS[hub] ?? []).map(normalizeTag).filter(Boolean);
}

/**
 * Hub default tags + optional post-specific tags + hobby slug (for declared-interest overlap).
 * Dedupes; order: hobby slug, hub defaults, extras.
 */
export function mergePostTags(hub: string, extra?: string[] | undefined): string[] {
  const hobby = hubNameToHobbySlug(hub);
  const parts = [
    ...(hobby ? [hobby] : []),
    ...hubDefaultTags(hub),
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
