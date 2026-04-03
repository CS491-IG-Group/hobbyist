"use client";

import { supabase } from "./supabase";

export type ContentEventType = "view" | "click" | "like" | "save" | "hide" | "report";

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
    // metadata: reserved for a future DB column; callers may still pass it for local debugging
  } = params;

  if (!userId || !sessionId) {
    return;
  }

  try {
    const { error } = await supabase.from("content_events").insert({
      user_id: userId,
      post_id: postId ?? null,
      item_id: itemId ?? null,
      hobby_id: hobbyId ?? null,
      event_type: eventType,
      dwell_ms: dwellMs ?? null,
      ui_location: uiLocation ?? null,
      device_type: deviceType ?? inferDeviceType(),
      session_id: sessionId,
    });
    if (error && process.env.NODE_ENV === "development") {
      console.warn("[analytics] content_events insert:", error.message);
    }
  } catch {
    // Swallow client-side analytics errors; they shouldn't break UX.
  }
}
