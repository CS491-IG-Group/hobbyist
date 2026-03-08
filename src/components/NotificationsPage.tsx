"use client";
import React, { useState } from "react";

const NOTIFICATIONS = [
    {
        id: 1,
        type: "like",
        user: "Jordan Lee",
        avatar: "💪",
        avatarBg: "linear-gradient(135deg, #064e3b, #065f46)",
        text: "liked your post in",
        hub: "Fitness",
        hubColor: "#10b981",
        preview: "Finally hit a 200kg deadlift after 2 years...",
        time: "2m ago",
        unread: true,
    },
    {
        id: 2,
        type: "follow",
        user: "Sam Chen",
        avatar: "💻",
        avatarBg: "linear-gradient(135deg, #1c1917, #44403c)",
        text: "started following you",
        hub: null,
        hubColor: null,
        preview: null,
        time: "15m ago",
        unread: true,
    },
    {
        id: 3,
        type: "comment",
        user: "Maya Patel",
        avatar: "🎬",
        avatarBg: "linear-gradient(135deg, #831843, #9d174d)",
        text: "commented on your post in",
        hub: "Movies",
        hubColor: "#ec4899",
        preview: "Totally agree, Dune 2 was incredible! 🎥",
        time: "1h ago",
        unread: true,
    },
    {
        id: 4,
        type: "hub",
        user: "Cars Hub",
        avatar: "🚗",
        avatarBg: "linear-gradient(135deg, #1e1b4b, #1e40af)",
        text: "is trending right now —",
        hub: "Cars",
        hubColor: "#3b82f6",
        preview: "42 new posts in the last hour",
        time: "2h ago",
        unread: false,
    },
    {
        id: 5,
        type: "like",
        user: "Chris Booker",
        avatar: "📸",
        avatarBg: "linear-gradient(135deg, #1e3a5f, #1e40af)",
        text: "liked your post in",
        hub: "Photography",
        hubColor: "#6366f1",
        preview: "Golden hour in the mountains hit different...",
        time: "3h ago",
        unread: false,
    },
    {
        id: 6,
        type: "follow",
        user: "Alex Rivera",
        avatar: "🚗",
        avatarBg: "linear-gradient(135deg, #1e1b4b, #1e40af)",
        text: "started following you",
        hub: null,
        hubColor: null,
        preview: null,
        time: "5h ago",
        unread: false,
    },
    {
        id: 7,
        type: "comment",
        user: "Taylor Kim",
        avatar: "🍳",
        avatarBg: "linear-gradient(135deg, #14532d, #166534)",
        text: "commented on your post in",
        hub: "Cooking",
        hubColor: "#ef4444",
        preview: "That ramen recipe looks insane, sharing this!",
        time: "1d ago",
        unread: false,
    },
    {
        id: 8,
        type: "hub",
        user: "Gaming Hub",
        avatar: "🎮",
        avatarBg: "linear-gradient(135deg, #2e1065, #5b21b6)",
        text: "just launched —",
        hub: "Gaming",
        hubColor: "#8b5cf6",
        preview: "Be one of the first members to join!",
        time: "1d ago",
        unread: false,
    },
];

function NotifIcon({ type }: { type: string }) {
    if (type === "like") return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ec4899" stroke="#ec4899" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
    if (type === "comment") return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
    if (type === "follow") return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    );
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter(n => n.unread).length;

    const displayed = activeTab === "unread"
        ? notifications.filter(n => n.unread)
        : notifications;

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    const markRead = (id: number) =>
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

    return (
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            <div className="px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs font-semibold transition-all hover:opacity-80"
                            style={{ color: "#a78bfa" }}>
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-5 p-1 rounded-xl"
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    {(["all", "unread"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                            style={{
                                background: activeTab === tab ? "var(--gradient-btn)" : "transparent",
                                color: activeTab === tab ? "#fff" : "var(--text-muted)",
                            }}>
                            {tab === "unread" ? `Unread (${unreadCount})` : "All"}
                        </button>
                    ))}
                </div>

                {/* Notifications list */}
                <div className="space-y-2">
                    {displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3"
                            style={{ color: "var(--text-muted)" }}>
                            <div className="text-4xl">🔔</div>
                            <p className="text-sm font-semibold">You're all caught up!</p>
                            <p className="text-xs">No unread notifications.</p>
                        </div>
                    ) : (
                        displayed.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => markRead(notif.id)}
                                className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:opacity-90"
                                style={{
                                    background: notif.unread ? "var(--surface)" : "transparent",
                                    border: `1px solid ${notif.unread ? "var(--border)" : "transparent"}`,
                                }}>

                                {/* Avatar with type icon */}
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                                        style={{ background: notif.avatarBg }}>
                                        {notif.avatar}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                                        <NotifIcon type={notif.type} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">
                                        <span className="font-semibold">{notif.user}</span>
                                        <span style={{ color: "var(--text-dim)" }}> {notif.text} </span>
                                        {notif.hub && (
                                            <span className="font-semibold" style={{ color: notif.hubColor ?? undefined }}>
                                                {notif.hub}
                                            </span>
                                        )}
                                    </p>
                                    {notif.preview && (
                                        <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                                            "{notif.preview}"
                                        </p>
                                    )}
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{notif.time}</p>
                                </div>

                                {/* Unread dot */}
                                {notif.unread && (
                                    <div className="w-2 h-2 rounded-full shrink-0 mt-1"
                                        style={{ background: "#a78bfa" }} />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}