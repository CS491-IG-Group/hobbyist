"use client";

import { supabase } from "./supabase";

/** Aggregated implicit preferences learned from `content_events`. */
export interface UserAffinity {
  hub: Record<string, number>;
  creator: Record<string, number>;
  /** Extra downrank weight per post id (hide/report). */
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

function normalizeHandle(h: string): string {
  return h.trim().toLowerCase();
}

/** Deterministic tie-break so ordering does not flicker between renders. */
function stableTieBreak(id: number): number {
  return ((id >>> 0) * 2654435761) >>> 0;
}

function aggregateEventsToAffinity(rows: EventRow[]): UserAffinity {
  const hub: Record<string, number> = {};
  const creator: Record<string, number> = {};
  const postPenalty: Record<number, number> = {};

  for (const row of rows) {
    const meta = row.metadata;
    const hubName = hubFromMeta(meta);
    const author = strMeta(meta, "author_handle");

    switch (row.event_type) {
      case "like":
        if (hubName) addScore(hub, hubName, 3);
        if (author) addScore(creator, normalizeHandle(author), 3);
        break;
      case "save":
        if (hubName) addScore(hub, hubName, 5);
        if (author) addScore(creator, normalizeHandle(author), 4);
        break;
      case "unsave":
        if (hubName) addScore(hub, hubName, -1.5);
        if (author) addScore(creator, normalizeHandle(author), -1.5);
        break;
      case "join":
        if (hubName) addScore(hub, hubName, 4);
        break;
      case "leave":
        if (hubName) addScore(hub, hubName, -2);
        break;
      case "follow": {
        const target = strMeta(meta, "target_handle");
        if (target) addScore(creator, normalizeHandle(target), 3);
        break;
      }
      case "create_post":
        if (hubName) addScore(hub, hubName, 3);
        break;
      case "hide":
        if (row.post_id != null) addPenalty(postPenalty, row.post_id, 12);
        if (hubName) addScore(hub, hubName, -3);
        break;
      case "report":
        if (row.post_id != null) addPenalty(postPenalty, row.post_id, 20);
        if (hubName) addScore(hub, hubName, -5);
        break;
      case "view":
        if (row.post_id != null) {
          const dwell = row.dwell_ms ?? 0;
          const d = Math.min(dwell / 10000, 2.2);
          if (hubName) addScore(hub, hubName, d * 0.55);
          if (author) addScore(creator, normalizeHandle(author), d * 0.55);
        }
        break;
      case "click": {
        const action = strMeta(meta, "action");
        if (action === "post_card_tap" || action === "comment_button_tap") {
          if (hubName) addScore(hub, hubName, 1);
          if (author) addScore(creator, normalizeHandle(author), 0.9);
        }
        break;
      }
      default:
        break;
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
    .limit(1000);

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
  if (joinedHubs.includes(post.hub)) score += 2.5;
  score += Math.log10(post.likes + 10) * 0.2;
  return score;
}

/** Keeps your own posts at the top (newest first), ranks the rest by affinity. */
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
