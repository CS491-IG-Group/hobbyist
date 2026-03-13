import { supabase } from "./supabase";

export type ContentEvent = {
  userId: string | null;
  sessionId: string;
  eventType: string;
  uiLocation: string;
  postId?: number;
  itemId?: number;
  hobbyId?: number;
  dwellMs?: number;
  deviceType?: string | null;
};

export async function logContentEvent(event: ContentEvent) {
  const {
    userId,
    sessionId,
    eventType,
    uiLocation,
    postId,
    itemId,
    hobbyId,
    dwellMs,
    deviceType,
  } = event;

  if (!userId || !sessionId) return;

  await supabase.from("content_events").insert({
    user_id: userId,
    session_id: sessionId,
    event_type: eventType,
    ui_location: uiLocation,
    post_id: postId ?? null,
    item_id: itemId ?? null,
    hobby_id: hobbyId ?? null,
    dwell_ms: dwellMs ?? null,
    device_type: deviceType ?? null,
  });
}

