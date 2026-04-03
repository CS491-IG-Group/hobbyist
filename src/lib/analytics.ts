"use client";

import { supabase } from "./supabase";

export type ContentEventType = "view" | "click" | "like" | "save" | "hide" | "report";

interface LogContentEventParams {
  userId: string | null;
  sessionId: string;
  eventType: ContentEventType;
  postId?: number;
  itemId?: number;
  hobbyId?: number;
  dwellMs?: number;
  uiLocation?: string;
  deviceType?: string;
}

export async function logContentEvent(params: LogContentEventParams) {
  const { userId, sessionId, eventType, postId, itemId, hobbyId, dwellMs, uiLocation, deviceType } = params;

  if (!userId) {
    return;
  }

  try {
    await supabase.from("content_events").insert({
      user_id: userId,
      post_id: postId ?? null,
      item_id: itemId ?? null,
      hobby_id: hobbyId ?? null,
      event_type: eventType,
      dwell_ms: dwellMs ?? null,
      ui_location: uiLocation ?? null,
      device_type: deviceType ?? (typeof window !== "undefined" ? "web" : null),
      session_id: sessionId,
    });
  } catch {
    // Swallow client-side analytics errors; they shouldn't break UX.
  }
}

