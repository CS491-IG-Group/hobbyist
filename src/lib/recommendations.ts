"use client";

import { supabase } from "./supabase";

/**
 * Simple timeline ranking (linear score model)
 *
 * 1. **Affinity** — Walk recent `content_events` (newest first, capped). For each row,
 *    add weighted points to:
 *    - per–hub totals (topic interest),
 *    - per–creator totals (handle in metadata),
 *    - optional penalties keyed by `post_id` (strong negative feedback).
 *
 * 2. **Post score** — For each feed card:
 *        score = hubAffinity[hub]
 *              + creatorAffinity[handle]
 *              - postPenalty[id]
 *              + JOINED_HUB_BOOST   if the user joined that hub
 *              + POPULARITY_K * log10(likes + 10)
 *
 * 3. **Order** — Posts authored as "You" stay on top (newest first). Everyone else
 *    sorts by `score` descending; ties use a stable hash of `id` so the list does not flicker.
 */

/** Extra points when the post's hub is in the user's joined list. */
const JOINED_HUB_BOOST = 2.5;

/** How much global like count nudges ordering (sublinear via log). */
const POPULARITY_K = 0.2;

/** Max recent events to scan (keeps client work bounded). */
const MAX_EVENTS = 1000;

/** Dwell → affinity: min(dwell_ms / DWELL_SCALE_MS, DWELL_CAP) * DWELL_STRENGTH */
const DWELL_SCALE_MS = 10_000;
const DWELL_CAP = 2.2;
const DWELL_STRENGTH = 0.55;

/** Points added to hub / creator for a single event (when metadata has hub / author_handle). */
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
  postPenalty: Record<number, number>;
}

export interface RankableTimelinePost {
  id: number;
  user: string;
  handle: string;
  hub: string;
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

function applyStandardEvent(
  row: EventRow,
  hub: Record<string, number>,
  creator: Record<string, number>,
  postPenalty: Record<number, number>
) {
  const w = WEIGHT[row.event_type];
  if (!w) return;

  const meta = row.metadata;
  const hubName = hubFromMeta(meta);
  const author = strMeta(meta, "author_handle");

  if (hubName) addScore(hub, hubName, w.hub);
  if (!w.hubOnly && author) addScore(creator, normalizeHandle(author), w.creator);

  if (w.postPenalty != null && row.post_id != null) {
    addPenalty(postPenalty, row.post_id, w.postPenalty);
  }
}

function aggregateEventsToAffinity(rows: EventRow[]): UserAffinity {
  const hub: Record<string, number> = {};
  const creator: Record<string, number> = {};
  const postPenalty: Record<number, number> = {};

  for (const row of rows) {
    if (WEIGHT[row.event_type]) {
      applyStandardEvent(row, hub, creator, postPenalty);
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
      if (hubName) addScore(hub, hubName, d);
      if (author) addScore(creator, normalizeHandle(author), d);
      continue;
    }

    if (row.event_type === "click") {
      const action = strMeta(meta, "action");
      if (action === "post_card_tap" || action === "comment_button_tap") {
        if (hubName) addScore(hub, hubName, 1);
        if (author) addScore(creator, normalizeHandle(author), 0.9);
      }
    }
  }

  return { hub, creator, postPenalty };
}

export type FetchAffinityResult =
  | { ok: true; affinity: UserAffinity }
  | { ok: false };

export async function fetchUserAffinity(userId: string): Promise<FetchAffinityResult> {
  const { data, error } = await supabase
    .from("content_events")
    .select("event_type, post_id, dwell_ms, metadata")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_EVENTS);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recommendations] content_events:", error.message);
    }
    return { ok: false };
  }

  return { ok: true, affinity: aggregateEventsToAffinity((data ?? []) as EventRow[]) };
}

export function scorePostForUser(
  post: RankableTimelinePost,
  affinity: UserAffinity | null,
  joinedHubs: string[]
): number {
  let score = 0;
  if (affinity) {
    score += affinity.hub[post.hub] ?? 0;
    score += affinity.creator[normalizeHandle(post.handle)] ?? 0;
    score -= affinity.postPenalty[post.id] ?? 0;
  }
  if (joinedHubs.includes(post.hub)) score += JOINED_HUB_BOOST;
  score += POPULARITY_K * Math.log10(post.likes + 10);
  return score;
}

export function rankTimelinePosts<T extends RankableTimelinePost>(
  posts: T[],
  affinity: UserAffinity | null,
  joinedHubs: string[]
): T[] {
  const mine = posts.filter((p) => p.user === "You");
  const rest = posts.filter((p) => p.user !== "You");

  const scored = rest.map((p) => ({
    p,
    score: scorePostForUser(p, affinity, joinedHubs),
    tie: stableTieBreak(p.id),
  }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tie - b.tie;
  });

  mine.sort((a, b) => b.id - a.id);
  return [...mine, ...scored.map((s) => s.p)];
}
