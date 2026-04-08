"use client";
import React, { useEffect, useMemo, useState } from "react";
import categories from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { supabase } from "../lib/supabase";

interface Hub {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function HubCard({ hub, onClick }: { hub: Hub; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Banner image area */}
      <div
        className="w-[140px] shrink-0 flex items-center justify-center text-3xl"
        style={{
          background: `linear-gradient(135deg, ${hub.gradientFrom} 0%, ${hub.gradientTo} 100%)`,
          minHeight: "140px",
        }}
      >
        <span className="text-4xl drop-shadow-lg">{hub.emoji}</span>
      </div>

      {/* Info area */}
      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        <div>
          <h3
            className="text-base font-bold mb-1"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
          >
            {hub.name}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {hub.description}
          </p>
        </div>

        <div className="flex justify-end mt-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
            style={{
              background: "rgba(139, 92, 246, 0.15)",
              color: "#a78bfa",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <ArrowIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiscoverPageProps {
  onSelectCategory?: (categoryId: string) => void;
}

interface HobbyRow {
  id: number;
  name: string;
  slug: string;
  desc?: string | null;
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split(/[-_ ]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function hashToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

export default function DiscoverPage({ onSelectCategory }: DiscoverPageProps) {
  const { userId, sessionId } = useAnalytics();
  const [hobbiesLoading, setHobbiesLoading] = useState(true);
  const [hobbiesError, setHobbiesError] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<HobbyRow[]>([]);
  const dwellRef = useContentImpression({
    userId,
    sessionId,
    uiLocation: "discover",
    metadata: { kind: "discover_root_dwell" },
  });

  useEffect(() => {
    let cancelled = false;
    const loadHobbies = async () => {
      setHobbiesLoading(true);
      setHobbiesError(null);
      try {
        const { data, error } = await supabase
          .from("hobbies")
          .select("id,name,slug,desc")
          .order("name", { ascending: true });

        if (cancelled) return;
        if (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[discover] hobbies load failed", error);
          }
          setHobbies([]);
          setHobbiesError(error.message);
          return;
        }
        setHobbies((data ?? []) as HobbyRow[]);
      } finally {
        if (!cancelled) setHobbiesLoading(false);
      }
    };

    void loadHobbies();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void logContentEvent({
      userId,
      sessionId,
      eventType: "view",
      uiLocation: "discover",
      metadata: { screen: "discover_root" },
    });
  }, [userId, sessionId]);

  const visibleCategories: Hub[] = useMemo(() => {
    if (hobbiesLoading) return [];

    // If hobbies couldn't be loaded (RLS, offline, etc), fall back to mock categories.
    if (!hobbies || hobbies.length === 0) return categories;

    const palette = [
      { from: "#4c1d95", to: "#7c3aed" },
      { from: "#7f1d1d", to: "#ef4444" },
      { from: "#064e3b", to: "#10b981" },
      { from: "#1e3a8a", to: "#3b82f6" },
      { from: "#831843", to: "#ec4899" },
      { from: "#78350f", to: "#f59e0b" },
      { from: "#312e81", to: "#6366f1" },
      { from: "#0f172a", to: "#334155" },
    ];

    return hobbies.map((h) => {
      const slug = String(h.slug);
      const backendDesc = (h.desc ?? "").trim();
      const existing = categories.find((c) => c.id === slug);
      if (existing) {
        return {
          id: existing.id,
          name: h.name || existing.name,
          description: backendDesc || existing.description,
          emoji: existing.emoji,
          gradientFrom: existing.gradientFrom,
          gradientTo: existing.gradientTo,
        };
      }

      const idx = hashToIndex(slug, palette.length);
      const colors = palette[idx] ?? palette[0];
      const name = h.name || titleCaseFromSlug(slug);
      return {
        id: slug,
        name,
        description: backendDesc || `Explore hubs for ${name}.`,
        emoji: "✨",
        gradientFrom: colors.from,
        gradientTo: colors.to,
      };
    });
  }, [hobbies, hobbiesLoading]);

  return (
    <div ref={dwellRef} className="max-w-4xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
      >
        Discover new hubs
      </h1>

      {hobbiesError && (
        <p className="text-xs mb-4" style={{ color: "#f87171" }}>
          {hobbiesError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hobbiesLoading && (
          <div className="md:col-span-2">
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              Loading hobbies…
            </p>
          </div>
        )}
        {visibleCategories.map((cat) => (
          <HubCard
            key={cat.id}
            hub={cat}
            onClick={() => {
              void logContentEvent({
                userId,
                sessionId,
                eventType: "click",
                uiLocation: "discover",
                metadata: { action: "open_category", category_id: cat.id, category_name: cat.name },
              });
              onSelectCategory?.(cat.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
