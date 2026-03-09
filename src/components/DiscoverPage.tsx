"use client";
import React from "react";
import categories from "./hubData";

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

export default function DiscoverPage({ onSelectCategory }: DiscoverPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
      >
        Discover new hubs
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <HubCard
            key={cat.id}
            hub={cat}
            onClick={() => onSelectCategory?.(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
