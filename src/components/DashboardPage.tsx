"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface Props {
  onLogout: () => void;
}

function GoalCard({ label, current, total }: { label: string; current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg px-2 py-1 text-xs font-bold shrink-0"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-dim)", minWidth: "3rem", textAlign: "center" }}>
            {current}/{total}
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button className="text-lg leading-none" style={{ color: "#a78bfa" }}>+</button>
          <button className="text-lg leading-none" style={{ color: "var(--text-muted)" }}>−</button>
          <button className="text-xs" style={{ color: "var(--text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-btn)" }} />
      </div>
    </div>
  );
}

export default function DashboardPage({ onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("dash");

  /** Placeholder; later from Supabase (e.g. goals table if added). */
  const goals = [
    { label: "Complete Honkai Star Rail story", current: 3, total: 5 },
    { label: "Read 12 manga volumes", current: 8, total: 12 },
    { label: "Finish Spy x Family anime", current: 2, total: 3 },
  ];

  /** Placeholder; later from Supabase lists + list_items for current user. */
  const lists = ["To Read", "Must Play"];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* Profile: later from public.users (display_name → name, handle, avatar_url) + count from user_hobbies for "Hubs joined". */}
          <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)" }}>
            <div className="h-44 relative"
              style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #7c3aed 100%)" }}>
              {[...Array(20)].map((_, i) => (
                <div key={i}
                  className="absolute w-0.5 h-0.5 rounded-full bg-white opacity-60"
                  style={{ left: `${(i * 47 + 13) % 100}%`, top: `${(i * 31 + 7) % 100}%` }} />
              ))}
            </div>

            <div className="px-6 pb-6" style={{ background: "var(--surface)" }}>
              <div className="w-24 h-24 rounded-2xl -mt-12 mb-4 overflow-hidden"
                style={{ border: "3px solid var(--surface)", background: "var(--surface2)" }}>
                <div className="w-full h-full flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>
                  🎮
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Mika Tanaka</h2>
                  <p className="text-sm mb-2" style={{ color: "#a78bfa" }}>@mikatanaka</p>
                  <p className="text-sm max-w-sm" style={{ color: "var(--text-dim)" }}>
                    Gamer, anime enthusiast, and bookworm. Always on the hunt for the next great story! ✨
                  </p>
                </div>
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Hubs joined</p>
                    <p className="font-bold" style={{ color: "#a78bfa" }}>15</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Friends</p>
                    <p className="font-bold" style={{ color: "#a78bfa" }}>284</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {["Update Profile", "Account Settings"].map(label => (
              <button key={label}
                className="py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Posts: later from public.posts (join users, hobbies); post_type, body, optional item_id. */}
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>My Posts</h3>
          <div className="space-y-3">
            {[
              {
                tag: "Genshin Impact",
                text: "Finally pulled Neuvillette after saving for months! His animations are absolutely gorgeous and his playstyle is so smooth. Best hydro DPS hands down! Who else got him? 💧✨",
              },
              {
                tag: "Anime",
                text: "Just finished Frieren: Beyond Journey's End and I'm completely speechless. The way it handles grief and time is unlike anything I've seen in anime. Absolute masterpiece. 🌟",
              },
            ].map((post, i) => (
              <div key={i} className="rounded-2xl p-4 flex gap-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-xl shrink-0"
                  style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>
                  <div className="w-full h-full flex items-center justify-center text-sm">🎮</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold">Mika Tanaka</span>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
                      {post.tag}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-dim)" }}>{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <aside className="hidden lg:block w-72 shrink-0 sticky top-0 h-screen overflow-y-auto p-4 space-y-4"
        style={{ borderLeft: "1px solid var(--border)" }}>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Goals</h3>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base"
              style={{ background: "var(--gradient-btn)" }}>+</button>
          </div>
          <div className="space-y-2">
            {goals.map(g => <GoalCard key={g.label} {...g} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Lists</h3>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base"
              style={{ background: "var(--gradient-btn)" }}>+</button>
          </div>
          <div className="space-y-2">
            {lists.map(list => (
              <button key={list}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all hover:opacity-80"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <span className="text-sm font-medium">{list}</span>
                <span style={{ color: "var(--text-muted)" }}>›</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Hubs</h3>
          </div>
          {/* Later: list from user_hobbies + hobbies for current user. */}
        </div>
      </aside>
    </div>
  );
}