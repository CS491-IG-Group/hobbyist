"use client";

import { useEffect, useRef } from "react";
import { logContentEvent } from "./analytics";

const MIN_DWELL_MS = 450;

interface UseContentImpressionArgs {
  userId: string | null;
  sessionId: string;
  uiLocation: string;
  metadata: Record<string, unknown>;
  threshold?: number;
  enabled?: boolean;
  postId?: number;
  itemId?: number;
  hobbyId?: number;
}

/**
 * Logs a single `view` with dwell_ms when the element was visible long enough, then scrolled away or unmounted.
 */
export function useContentImpression({
  userId,
  sessionId,
  uiLocation,
  metadata,
  threshold = 0.35,
  enabled = true,
  postId,
  itemId,
  hobbyId,
}: UseContentImpressionArgs) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visibleSinceRef = useRef<number | null>(null);
  const hasSeenIntersectRef = useRef(false);
  const metaRef = useRef(metadata);
  metaRef.current = metadata;

  useEffect(() => {
    if (!enabled || !userId || !sessionId) return;
    const el = ref.current;
    if (!el) return;

    const flushDwell = (reason: "hidden" | "unmount") => {
      if (visibleSinceRef.current === null) return;
      const dwell = Date.now() - visibleSinceRef.current;
      visibleSinceRef.current = null;
      if (dwell < MIN_DWELL_MS) return;
      void logContentEvent({
        userId,
        sessionId,
        eventType: "view",
        uiLocation,
        dwellMs: dwell,
        postId,
        itemId,
        hobbyId,
        metadata: { ...metaRef.current, impression_flush: reason },
      });
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            hasSeenIntersectRef.current = true;
            if (visibleSinceRef.current === null) {
              visibleSinceRef.current = Date.now();
            }
          } else if (hasSeenIntersectRef.current) {
            flushDwell("hidden");
          }
        }
      },
      { threshold: [0, threshold, 0.75] }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      flushDwell("unmount");
    };
  }, [
    userId,
    sessionId,
    uiLocation,
    enabled,
    threshold,
    postId,
    itemId,
    hobbyId,
  ]);

  return ref;
}
