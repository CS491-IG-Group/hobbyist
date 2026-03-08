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

export default function Sidebar({ activeNav, setActiveNav, onLogout, unreadCount = 0 }: SidebarProps) {
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

      </nav>

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