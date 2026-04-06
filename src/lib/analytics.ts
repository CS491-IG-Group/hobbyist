"use client";

import { supabase } from "./supabase";

export type ContentEventType =
  | "view"
  | "click"
  | "like"
  | "save"
  | "unsave"
  | "hide"
  | "report"
  | "join"
  | "leave"
  | "follow"
  | "message"
  | "create_post";

export type ContentEventMetadata = Record<string, unknown>;

export interface LogContentEventParams {
  userId: string | null;
  sessionId: string;
  eventType: ContentEventType;
  postId?: number;
  itemId?: number;
  hobbyId?: number;
  dwellMs?: number;
  uiLocation?: string;
  deviceType?: string;
  metadata?: ContentEventMetadata;
}

export function inferDeviceType(): string {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  if (/Mobi|Android/i.test(ua)) return "mobile";
  return "desktop";
}

function sanitizeMetadata(meta: ContentEventMetadata | undefined): Record<string, unknown> | null {
  if (!meta || Object.keys(meta).length === 0) return null;
  try {
    return JSON.parse(JSON.stringify(meta)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function logContentEvent(params: LogContentEventParams) {
  const {
    userId,
    sessionId,
    eventType,
    postId,
    itemId,
    hobbyId,
    dwellMs,
    uiLocation,
    deviceType,
    metadata,
  } = params;

  if (!userId || !sessionId) {
    return;
  }

  const row: Record<string, unknown> = {
    user_id: userId,
    post_id: postId ?? null,
    item_id: itemId ?? null,
    hobby_id: hobbyId ?? null,
    event_type: eventType,
    dwell_ms: dwellMs ?? null,
    ui_location: uiLocation ?? null,
    device_type: deviceType ?? inferDeviceType(),
    session_id: sessionId,
  };

  const meta = sanitizeMetadata(metadata);
  if (meta) row.metadata = meta;

  try {
    const { error } = await supabase.from("content_events").insert(row);
    if (error && process.env.NODE_ENV === "development") {
      console.warn("[analytics] content_events insert:", error.message);
    }
  } catch {
    // Swallow client-side analytics errors; they shouldn't break UX.
  }
}
