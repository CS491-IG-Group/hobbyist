"use client";
import React, { useState, useEffect } from "react";
import OrbitLogo from "./OrbitLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface JoinedHub {
  categoryId: string;
  hubId: string;
  name: string;
  emoji: string;
  color: string;
}

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  onLogout: () => void;
  onSelectHub?: (categoryId: string, hubId: string) => void;
  unreadCount?: number;
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function OrbitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const joinedHubs: JoinedHub[] = [
  { categoryId: "gaming", hubId: "resident-evil", name: "Resident Evil", emoji: "🧟", color: "#6b0f1a" },
  { categoryId: "music", hubId: "bad-bunny", name: "Bad Bunny", emoji: "🐰", color: "#10b981" },
];

export default function Sidebar({ activeNav, setActiveNav, onLogout, onSelectHub, unreadCount = 0 }: SidebarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  const navItems: NavItem[] = [
    { id: "timeline", label: "timeline", icon: <HomeIcon /> },
    { id: "orbit", label: "orbit", icon: <OrbitIcon /> },
    { id: "discover", label: "discover", icon: <CompassIcon /> },
    { id: "notifications", label: "alerts", icon: <BellIcon /> },
    { id: "profile", label: "profile", icon: <PersonIcon /> },
  ];

  return (
    <aside className="flex flex-col h-screen sticky top-0 w-[100px] shrink-0"
      style={{ background: "var(--bg)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="flex flex-col items-center pt-5 pb-4">
        <OrbitLogo size={40} />
        <span className="text-xs font-bold mt-1" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
          orbit.r
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 px-2 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className="relative flex flex-col items-center gap-1 w-full py-3 px-2 rounded-xl transition-all"
            style={{
              background: activeNav === item.id ? "var(--surface2)" : "transparent",
              color: activeNav === item.id ? "#a78bfa" : "var(--text-dim)",
            }}>
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
            {/* Unread badge on bell */}
            {item.id === "notifications" && unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: "#ec4899" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="w-full px-4 my-3">
          <div style={{ height: "1px", background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Joined Hubs */}
        <div className="flex flex-col items-center gap-1 w-full">
          {joinedHubs.map(hub => (
            <button
              key={hub.hubId}
              onClick={() => onSelectHub?.(hub.categoryId, hub.hubId)}
              className="flex flex-col items-center gap-1 w-full py-2 px-2 rounded-xl transition-all hover:opacity-80"
              style={{ color: "var(--text-dim)" }}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: `${hub.color}25`, border: `1px solid ${hub.color}40` }}>
                {hub.emoji}
              </span>
              <span className="text-[9px] font-medium leading-tight text-center" style={{ color: "var(--text-dim)" }}>{hub.name}</span>
            </button>
          ))}
        </div>

      </nav>

      {/* Theme toggle */}
      <div className="px-2">
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 w-full py-3 rounded-xl transition-all hover:opacity-80"
          style={{ color: "var(--text-dim)" }}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          <span className="text-[10px]">{theme === "dark" ? "light" : "dark"}</span>
        </button>
      </div>

      {/* Log out */}
      <div className="px-2 pb-4">
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 w-full py-3 rounded-xl transition-all hover:opacity-80"
          style={{ color: "var(--text-muted)" }}>
          <LogOutIcon />
          <span className="text-[10px]">log out</span>
        </button>
      </div>
    </aside>
  );
}