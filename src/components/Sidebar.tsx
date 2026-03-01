"use client";
import React from "react";
import OrbitLogo from "./OrbitLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  onLogout: () => void;
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

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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

export default function Sidebar({ activeNav, setActiveNav, onLogout }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: "timeline", label: "timeline", icon: <HomeIcon /> },
    { id: "discover", label: "discover", icon: <CompassIcon /> },
    { id: "dash", label: "dash", icon: <GridIcon /> },
  ];

  const hubs = [
    { id: "resident-evil", label: "Resident Evil" },
    { id: "jujutsu-kaisen", label: "Jujutsu Kaisen" },
  ];

  return (
    <aside className="flex flex-col h-screen sticky top-0 w-[100px] shrink-0"
      style={{ background: "var(--bg)", borderRight: "1px solid var(--border)" }}>

      <div className="flex flex-col items-center pt-5 pb-4">
        <OrbitLogo size={40} />
        <span className="text-xs font-bold mt-1" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
          orbit.r
        </span>
      </div>

      <nav className="flex flex-col items-center gap-1 px-2 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className="flex flex-col items-center gap-1 w-full py-3 px-2 rounded-xl transition-all"
            style={{
              background: activeNav === item.id ? "var(--surface2)" : "transparent",
              color: activeNav === item.id ? "#a78bfa" : "var(--text-dim)",
            }}>
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        <div className="w-full border-t mt-2 pt-2" style={{ borderColor: "var(--border)" }}>
          {hubs.map(hub => (
            <button key={hub.id}
              className="flex flex-col items-center gap-1 w-full py-2.5 rounded-xl transition-all hover:opacity-80">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-xs"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {hub.label.slice(0, 2)}
              </div>
              <span className="text-[9px] text-center leading-tight w-full truncate px-1"
                style={{ color: "var(--text-muted)" }}>
                {hub.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

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