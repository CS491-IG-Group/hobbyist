"use client";

import { supabase } from "./supabase";
import { hubNameToHobbySlug } from "./hubHobbyMap";
import { normalizeTag } from "./hubTags";

/**
 * Timeline ranking (linear score model) — no LLM.
 *
 * 1. **Affinity** — Walk recent `content_events`. Weight hubs, creators, hobbies (slug),
 *    **tags** (from metadata `tags` / `tag`), and penalties (`hub`, `hobby_slug`, …).
 *
 * 2. **Profile hobbies** — Rows in `user_hobbies` add a fixed boost when `hobbySlug` matches.
 *
 * 3. **Post score** — hub + creator − penalty + joined hub + profile hobby + hobby affinity
 *    + **tag affinity** (per-tag overlap with learned weights; hobby slug tag skipped to avoid
 *    double-counting the hobby bucket) + popularity (log likes).
 */

const JOINED_HUB_BOOST = 2.5;
const PROFILE_HOBBY_BOOST = 2.2;
const POPULARITY_K = 0.2;
const MAX_EVENTS = 1000;

const DWELL_SCALE_MS = 10_000;
const DWELL_CAP = 2.2;
const DWELL_STRENGTH = 0.55;

/** Event → hobby slug bucket uses gentler weights than hub (same signal, different axis). */
const HOBBY_WEIGHT_SCALE = 0.45;

/** Tag bucket: same events also bump tags in metadata; scaled down vs hub. */
const TAG_WEIGHT_SCALE = 0.35;

const WEIGHT: Record<
  string,
  { hub: number; creator: number; postPenalty?: number; hubOnly?: boolean }
> = {
  like: { hub: 3, creator: 3 },
  save: { hub: 5, creator: 4 },
  unsave: { hub: -1.5, creator: -1.5 },
  join: { hub: 4, creator: 0, hubOnly: true },
  leave: { hub: -2, creator: 0, hubOnly: true },
  create_post: { hub: 3, creator: 0, hubOnly: true },
  hide: { hub: -3, creator: 0, postPenalty: 12, hubOnly: true },
  report: { hub: -5, creator: 0, postPenalty: 20, hubOnly: true },
};

export interface UserAffinity {
  hub: Record<string, number>;
  creator: Record<string, number>;
  hobby: Record<string, number>;
  /** Normalized tag → weight from interactions (metadata `tags` / `tag`). */
  tag: Record<string, number>;
  postPenalty: Record<number, number>;
}

export interface RankableTimelinePost {
  id: number;
  user: string;
  handle: string;
  hub: string;
  /** Matches `hobbies.slug` when the post sits in a known hub category. */
  hobbySlug: string | null;
  /** Normalized tags (hub defaults + post-specific); hobby slug may appear for profile overlap. */
  tags: string[];
  likes: number;
}

type EventRow = {
  event_type: string;
  post_id: number | null;
  dwell_ms: number | null;
  metadata: Record<string, unknown> | null;
};

function strMeta(meta: Record<string, unknown> | null, key: string): string | null {
  if (!meta) return null;
  const v = meta[key];
  return typeof v === "string" ? v : null;
}

function hubFromMeta(meta: Record<string, unknown> | null): string | null {
  return strMeta(meta, "hub") ?? strMeta(meta, "hub_name");
}

function hobbySlugFromMeta(meta: Record<string, unknown> | null): string | null {
  const direct = strMeta(meta, "hobby_slug");
  if (direct) return direct.trim().toLowerCase();
  return hubNameToHobbySlug(hubFromMeta(meta));
}

/** Read tags from event metadata (`tags` array or comma-separated `tag`). */
export function tagsFromMeta(meta: Record<string, unknown> | null): string[] {
  if (!meta) return [];
  const raw = meta["tags"];
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is string => typeof x === "string")
      .map((x) => normalizeTag(x))
      .filter(Boolean);
  }
  const single = meta["tag"];
  if (typeof single === "string") {
    return single
      .split(",")
      .map((x) => normalizeTag(x))
      .filter(Boolean);
  }
  return [];
}

function applyTagsFromMeta(
  meta: Record<string, unknown> | null,
  tagRec: Record<string, number>,
  hubDelta: number
) {
  if (hubDelta === 0) return;
  const hobby = hobbySlugFromMeta(meta);
  for (const t of tagsFromMeta(meta)) {
    if (hobby && t === hobby) continue;
    addScore(tagRec, t, hubDelta * TAG_WEIGHT_SCALE);
  }
}

function addScore(rec: Record<string, number>, key: string, delta: number) {
  if (!key || delta === 0) return;
  rec[key] = (rec[key] ?? 0) + delta;
}

function addPenalty(rec: Record<number, number>, postId: number, delta: number) {
  if (delta === 0) return;
  rec[postId] = (rec[postId] ?? 0) + delta;
}

export function normalizeHandle(h: string): string {
  return h.trim().toLowerCase();
}

function stableTieBreak(id: number): number {
  return ((id >>> 0) * 2654435761) >>> 0;
}

function applyHobbyFromMeta(
  meta: Record<string, unknown> | null,
  hobby: Record<string, number>,
  hubDelta: number
) {
  const slug = hobbySlugFromMeta(meta);
  if (slug && hubDelta !== 0) {
    addScore(hobby, slug, hubDelta * HOBBY_WEIGHT_SCALE);
  }
}

function applyStandardEvent(
  row: EventRow,
  hub: Record<string, number>,
  creator: Record<string, number>,
  hobby: Record<string, number>,
  tag: Record<string, number>,
  postPenalty: Record<number, number>
) {
  const w = WEIGHT[row.event_type];
  if (!w) return;

  const meta = row.metadata;
  const hubName = hubFromMeta(meta);
  const author = strMeta(meta, "author_handle");

  if (hubName) {
    addScore(hub, hubName, w.hub);
    applyHobbyFromMeta(meta, hobby, w.hub);
    applyTagsFromMeta(meta, tag, w.hub);
  }
  if (!w.hubOnly && author) addScore(creator, normalizeHandle(author), w.creator);

  if (w.postPenalty != null && row.post_id != null) {
    addPenalty(postPenalty, row.post_id, w.postPenalty);
  }
}

function aggregateEventsToAffinity(rows: EventRow[]): UserAffinity {
  const hub: Record<string, number> = {};
  const creator: Record<string, number> = {};
  const hobby: Record<string, number> = {};
  const tag: Record<string, number> = {};
  const postPenalty: Record<number, number> = {};

  for (const row of rows) {
    if (WEIGHT[row.event_type]) {
      applyStandardEvent(row, hub, creator, hobby, tag, postPenalty);
      continue;
    }

    const meta = row.metadata;
    const hubName = hubFromMeta(meta);
    const author = strMeta(meta, "author_handle");

    if (row.event_type === "follow") {
      const target = strMeta(meta, "target_handle");
      if (target) addScore(creator, normalizeHandle(target), 3);
      continue;
    }

    if (row.event_type === "view" && row.post_id != null) {
      const dwell = row.dwell_ms ?? 0;
      const d = Math.min(dwell / DWELL_SCALE_MS, DWELL_CAP) * DWELL_STRENGTH;
      if (hubName) {
        addScore(hub, hubName, d);
        applyHobbyFromMeta(meta, hobby, d);
        applyTagsFromMeta(meta, tag, d);
      }
      if (author) addScore(creator, normalizeHandle(author), d);
      continue;
    }

    if (row.event_type === "click") {
      const action = strMeta(meta, "action");
      if (action === "post_card_tap" || action === "comment_button_tap") {
        if (hubName) {
          addScore(hub, hubName, 1);
          applyHobbyFromMeta(meta, hobby, 1);
          applyTagsFromMeta(meta, tag, 1);
        }
        if (author) addScore(creator, normalizeHandle(author), 0.9);
      }
    }
  }

  return { hub, creator, hobby, tag, postPenalty };
}

export type FetchRecommendationContextResult =
  | { ok: true; affinity: UserAffinity; profileHobbySlugs: string[] }
  | { ok: false };

export async function fetchRecommendationContext(userId: string): Promise<FetchRecommendationContextResult> {
  const [eventsRes, userHobbiesRes] = await Promise.all([
    supabase
      .from("content_events")
      .select("event_type, post_id, dwell_ms, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_EVENTS),
    supabase.from("user_hobbies").select("hobby_id").eq("user_id", userId),
  ]);

  if (eventsRes.error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recommendations] content_events:", eventsRes.error.message);
    }
    return { ok: false };
  }

  let profileHobbySlugs: string[] = [];
  if (userHobbiesRes.error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recommendations] user_hobbies:", userHobbiesRes.error.message);
    }
  } else {
    const ids = (userHobbiesRes.data ?? []).map((r: { hobby_id: number }) => r.hobby_id).filter(Boolean);
    if (ids.length > 0) {
      const { data: slugRows, error: slugErr } = await supabase.from("hobbies").select("slug").in("id", ids);
      if (slugErr && process.env.NODE_ENV === "development") {
        console.warn("[recommendations] hobbies slug fetch:", slugErr.message);
      } else {
        profileHobbySlugs = (slugRows ?? []).map((r: { slug: string }) => r.slug).filter(Boolean);
      }
    }
  }

  return {
    ok: true,
    affinity: aggregateEventsToAffinity((eventsRes.data ?? []) as EventRow[]),
    profileHobbySlugs,
  };
}

/** @deprecated Use fetchRecommendationContext for hobby-aware ranking. */
export async function fetchUserAffinity(userId: string) {
  const res = await fetchRecommendationContext(userId);
  if (!res.ok) return { ok: false as const };
  return { ok: true as const, affinity: res.affinity };
}

function tagAffinityScore(post: RankableTimelinePost, affinity: UserAffinity): number {
  let s = 0;
  const tags = post.tags ?? [];
  for (const t of tags) {
    if (post.hobbySlug && t === post.hobbySlug) continue;
    s += affinity.tag[t] ?? 0;
  }
  return s;
}

export function scorePostForUser(
  post: RankableTimelinePost,
  affinity: UserAffinity | null,
  joinedHubs: string[],
  profileHobbySlugs: string[]
): number {
  let score = 0;
  if (affinity) {
    score += affinity.hub[post.hub] ?? 0;
    score += affinity.creator[normalizeHandle(post.handle)] ?? 0;
    score -= affinity.postPenalty[post.id] ?? 0;
    if (post.hobbySlug) {
      score += affinity.hobby[post.hobbySlug] ?? 0;
    }
    score += tagAffinityScore(post, affinity);
  }
  if (joinedHubs.includes(post.hub)) score += JOINED_HUB_BOOST;
  if (post.hobbySlug && profileHobbySlugs.includes(post.hobbySlug)) {
    score += PROFILE_HOBBY_BOOST;
  }
  score += POPULARITY_K * Math.log10(post.likes + 10);
  return score;
}

export function rankTimelinePosts<T extends RankableTimelinePost>(
  posts: T[],
  affinity: UserAffinity | null,
  joinedHubs: string[],
  profileHobbySlugs: string[] = []
): T[] {
  const mine = posts.filter((p) => p.user === "You");
  const rest = posts.filter((p) => p.user !== "You");

  const scored = rest.map((p) => ({
    p,
    score: scorePostForUser(p, affinity, joinedHubs, profileHobbySlugs),
    tie: stableTieBreak(p.id),
  }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tie - b.tie;
  });

  mine.sort((a, b) => b.id - a.id);
  return [...mine, ...scored.map((s) => s.p)];
}
