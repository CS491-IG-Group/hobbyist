"use client";
import React from "react";

interface Hub {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
}

/** Placeholder hubs; later pull from Supabase `hobbies` table. */
const hubs: Hub[] = [
  {
    id: "gaming",
    name: "Gaming",
    description: "Talk about your favorite games, share tips, and find co-op buddies.",
    emoji: "🎮",
    gradientFrom: "#4c1d95",
    gradientTo: "#7c3aed",
  },
  {
    id: "anime",
    name: "Anime & Manga",
    description: "Discuss the latest seasons, share recommendations, and debate best arcs.",
    emoji: "🌸",
    gradientFrom: "#831843",
    gradientTo: "#be185d",
  },
  {
    id: "music",
    name: "Music",
    description: "Share playlists, discover new artists, and chat about concerts.",
    emoji: "🎵",
    gradientFrom: "#1e3a5f",
    gradientTo: "#3b82f6",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Track workouts, share routines, and motivate each other to stay active.",
    emoji: "💪",
    gradientFrom: "#14532d",
    gradientTo: "#22c55e",
  },
  {
    id: "reading",
    name: "Reading",
    description: "Book clubs, reviews, and reading challenges for every genre.",
    emoji: "📚",
    gradientFrom: "#78350f",
    gradientTo: "#d97706",
  },
  {
    id: "art",
    name: "Art & Design",
    description: "Showcase your creations, get feedback, and find creative inspiration.",
    emoji: "🎨",
    gradientFrom: "#701a75",
    gradientTo: "#c026d3",
  },
];

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function HubCard({ hub }: { hub: Hub }) {
  return (
    <div
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

export default function DiscoverPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
      >
        Discover new hubs
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hubs.map((hub) => (
          <HubCard key={hub.id} hub={hub} />
        ))}
      </div>
    </div>
  );
}
