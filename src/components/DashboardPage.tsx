"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DiscoverPage from "./DiscoverPage";
import CategoryPage from "./CategoryPage";
import HubPage from "./HubPage";
import TimelinePage from "./TimelinePage";
import NicheFeed from "./NicheFeed";
import ProfilePage from "./ProfilePage";
import NotificationsPage from "./NotificationsPage";

type SubPage =
  | null
  | { type: "category"; categoryId: string }
  | { type: "hub"; categoryId: string; hubId: string };

interface Props {
  onLogout: () => void;
}

function GoalCard({ label, current, total, onIncrement, onDecrement, onDelete }: {
  label: string;
  current: number;
  total: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium leading-snug" style={{ color: "var(--text)" }}>{label}</span>
        <button onClick={onDelete} className="shrink-0 hover:opacity-80" style={{ color: "var(--text-muted)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onDecrement}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          −
        </button>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: "var(--gradient-btn)" }} />
        </div>
        <button onClick={onIncrement}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "#a78bfa" }}>
          +
        </button>
      </div>
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{current} / {total}</span>
        <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage({ onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("timeline");
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [unreadCount, setUnreadCount] = useState(3);

  /** Wrap setActiveNav so we reset subPage when switching sections */
  function handleNav(id: string) {
    setActiveNav(id);
    setSubPage(null);
  }

  const [goals, setGoals] = useState([
    { id: 1, label: "Run 5km three times a week", current: 2, total: 3 },
    { id: 2, label: "Read 12 books this year", current: 4, total: 12 },
    { id: 3, label: "Cook a new recipe every week", current: 6, total: 8 },
  ]);

  const [lists, setLists] = useState([
    { id: 1, label: "🎬 Movies to Watch", count: 8 },
    { id: 2, label: "📚 Books to Read", count: 5 },
    { id: 3, label: "🎮 Games to Play", count: 12 },
  ]);

  const hubs = [
    { id: 1, name: "Cars", emoji: "🚗", color: "#3b82f6" },
    { id: 2, name: "Fitness", emoji: "💪", color: "#10b981" },
    { id: 3, name: "Technology", emoji: "💻", color: "#f59e0b" },
    { id: 4, name: "Movies", emoji: "🎬", color: "#ec4899" },
    { id: 5, name: "Photography", emoji: "📸", color: "#6366f1" },
    { id: 6, name: "Cooking", emoji: "🍳", color: "#ef4444" },
    { id: 7, name: "Gaming", emoji: "🎮", color: "#8b5cf6" },
  ];

  const incrementGoal = (id: number) =>
    setGoals(prev => prev.map(g => g.id === id && g.current < g.total ? { ...g, current: g.current + 1 } : g));

  const decrementGoal = (id: number) =>
    setGoals(prev => prev.map(g => g.id === id && g.current > 0 ? { ...g, current: g.current - 1 } : g));

  const deleteGoal = (id: number) =>
    setGoals(prev => prev.filter(g => g.id !== id));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar activeNav={activeNav} setActiveNav={handleNav} onLogout={onLogout} unreadCount={unreadCount} />

      <main className="flex-1 overflow-y-auto">
        {activeNav === "timeline" ? (
          <TimelinePage />
        ) : activeNav === "discover" ? (
          subPage?.type === "hub" ? (
            <HubPage
              categoryId={subPage.categoryId}
              hubId={subPage.hubId}
              onBack={() => setSubPage({ type: "category", categoryId: subPage.categoryId })}
            />
          ) : subPage?.type === "category" ? (
            <CategoryPage
              categoryId={subPage.categoryId}
              onBack={() => setSubPage(null)}
              onSelectHub={(hubId) =>
                setSubPage({ type: "hub", categoryId: subPage.categoryId, hubId })
              }
            />
          ) : (
            <DiscoverPage
              onSelectCategory={(categoryId) =>
                setSubPage({ type: "category", categoryId })
              }
            />
          )
        ) : activeNav === "orbit" ? (
          <NicheFeed />
        ) : activeNav === "profile" ? (
          <ProfilePage />
        ) : activeNav === "notifications" ? (
          <NotificationsPage />
        ) : null}
      </main>

      <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen overflow-y-auto p-4 gap-5"
        style={{ borderLeft: "1px solid var(--border)" }}>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Goals</h3>
            <button
              onClick={() => setGoals(prev => [...prev, { id: Date.now(), label: "New goal", current: 0, total: 5 }])}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base hover:opacity-80 transition-all"
              style={{ background: "var(--gradient-btn)" }}>+</button>
          </div>
          <div className="space-y-2">
            {goals.map(g => (
              <GoalCard
                key={g.id}
                label={g.label}
                current={g.current}
                total={g.total}
                onIncrement={() => incrementGoal(g.id)}
                onDecrement={() => decrementGoal(g.id)}
                onDelete={() => deleteGoal(g.id)}
              />
            ))}
            {goals.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                No goals yet. Hit + to add one!
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--border)" }} />

        {/* Lists */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Lists</h3>
            <button
              onClick={() => setLists(prev => [...prev, { id: Date.now(), label: "New list", count: 0 }])}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base hover:opacity-80 transition-all"
              style={{ background: "var(--gradient-btn)" }}>+</button>
          </div>
          <div className="space-y-2">
            {lists.map(list => (
              <div key={list.id}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <span className="text-sm font-medium">{list.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                    {list.count}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--border)" }} />

        {/* Hubs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>My Hubs</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {hubs.map(hub => (
              <div key={hub.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: `${hub.color}15`, color: hub.color, border: `1px solid ${hub.color}30` }}>
                <span>{hub.emoji}</span>
                <span>{hub.name}</span>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}