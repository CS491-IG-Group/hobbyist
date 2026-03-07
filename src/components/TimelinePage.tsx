"use client";
import React, { useState } from "react";

const POSTS = [
    {
        id: 1,
        user: "Alex Rivera",
        handle: "@alexrivera",
        avatar: "🚗",
        avatarBg: "linear-gradient(135deg, #1e1b4b, #1e40af)",
        hub: "Cars",
        hubColor: "#3b82f6",
        time: "2m ago",
        text: "Just got back from a track day in my STI and nothing beats a perfectly executed apex. The car is an absolute weapon when you dial in the suspension right 🔧🏁",
        image: null,
        likes: 214,
        comments: 53,
        reposts: 28,
    },
    {
        id: 2,
        user: "Jordan Lee",
        handle: "@jordanlee",
        avatar: "💪",
        avatarBg: "linear-gradient(135deg, #064e3b, #065f46)",
        hub: "Fitness",
        hubColor: "#10b981",
        time: "15m ago",
        text: "Finally hit a 200kg deadlift after 2 years of consistent training. The grind is real but moments like this make it all worth it. Trust the process 💚",
        image: null,
        likes: 389,
        comments: 74,
        reposts: 45,
    },
    {
        id: 3,
        user: "Sam Chen",
        handle: "@samchen",
        avatar: "💻",
        avatarBg: "linear-gradient(135deg, #1c1917, #44403c)",
        hub: "Technology",
        hubColor: "#f59e0b",
        time: "1h ago",
        text: "The new M4 MacBook Pro benchmarks are wild. Single core scores beating workstation chips from 2 years ago. Apple Silicon is genuinely changing the game for developers 🚀",
        image: null,
        likes: 512,
        comments: 118,
        reposts: 89,
    },
    {
        id: 4,
        user: "Maya Patel",
        handle: "@mayapatel",
        avatar: "🎬",
        avatarBg: "linear-gradient(135deg, #831843, #9d174d)",
        hub: "Movies",
        hubColor: "#ec4899",
        time: "2h ago",
        text: "Dune Part 2 is a cinematic masterpiece. Villeneuve is operating on a completely different level. The IMAX experience was absolutely breathtaking 🎥✨",
        image: null,
        likes: 631,
        comments: 142,
        reposts: 97,
    },
    {
        id: 5,
        user: "Chris Booker",
        handle: "@chrisbooker",
        avatar: "📸",
        avatarBg: "linear-gradient(135deg, #1e3a5f, #1e40af)",
        hub: "Photography",
        hubColor: "#6366f1",
        time: "3h ago",
        text: "Golden hour in the mountains hit different this weekend. Shot on film with my Contax T2 — there is something about analog photography that digital just cannot replicate 🌄",
        image: null,
        likes: 428,
        comments: 63,
        reposts: 51,
    },
    {
        id: 6,
        user: "Taylor Kim",
        handle: "@taylorkim",
        avatar: "🍳",
        avatarBg: "linear-gradient(135deg, #14532d, #166534)",
        hub: "Cooking",
        hubColor: "#ef4444",
        time: "5h ago",
        text: "Made homemade ramen from scratch — 12 hours for the tonkotsu broth and worth every minute. The depth of flavor is insane compared to anything store bought 🍜🔥",
        image: null,
        likes: 295,
        comments: 67,
        reposts: 38,
    },
];

const FILTERS = ["All", "Cars", "Fitness", "Technology", "Movies", "Photography", "Cooking"];

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function RepostIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
    );
}

function PostCard({ post }: { post: typeof POSTS[0] }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    };

    return (
        <div className="rounded-2xl p-5 transition-all hover:border-purple-500/30"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: post.avatarBg }}>
                        {post.avatar}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{post.user}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.handle}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                    background: `${post.hubColor}20`,
                                    color: post.hubColor,
                                    border: `1px solid ${post.hubColor}40`
                                }}>
                                {post.hub}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.time}</span>
                        </div>
                    </div>
                </div>

                <button style={{ color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>
                {post.text}
            </p>

            {/* Divider */}
            <div className="h-px mb-3" style={{ background: "var(--border)" }} />

            {/* Actions */}
            <div className="flex items-center gap-5">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 text-xs transition-all hover:scale-105"
                    style={{ color: liked ? "#ec4899" : "var(--text-muted)" }}>
                    <HeartIcon filled={liked} />
                    <span>{likeCount}</span>
                </button>

                <button className="flex items-center gap-1.5 text-xs transition-all hover:scale-105"
                    style={{ color: "var(--text-muted)" }}>
                    <CommentIcon />
                    <span>{post.comments}</span>
                </button>

                <button className="flex items-center gap-1.5 text-xs transition-all hover:scale-105"
                    style={{ color: "var(--text-muted)" }}>
                    <RepostIcon />
                    <span>{post.reposts}</span>
                </button>
            </div>
        </div>
    );
}

export default function TimelinePage() {
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered = activeFilter === "All"
        ? POSTS
        : POSTS.filter(p => p.hub === activeFilter);

    return (
        <div className="flex flex-1 min-h-screen" style={{ background: "var(--bg)" }}>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-6">

                    {/* Header */}
                    <h1 className="text-xl font-bold mb-5" style={{ fontFamily: "Syne, sans-serif" }}>Timeline</h1>

                    {/* Filter pills */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                                style={{
                                    background: activeFilter === f ? "var(--gradient-btn)" : "var(--surface2)",
                                    color: activeFilter === f ? "#fff" : "var(--text-muted)",
                                    border: `1px solid ${activeFilter === f ? "transparent" : "var(--border)"}`,
                                }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Create post box */}
                    <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>
                            ✨
                        </div>
                        <div className="flex-1 rounded-xl px-4 py-2.5 text-sm cursor-text"
                            style={{ background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            Share something with your hubs...
                        </div>
                        <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white shrink-0"
                            style={{ background: "var(--gradient-btn)" }}>
                            Post
                        </button>
                    </div>

                    {/* Posts */}
                    <div className="space-y-3">
                        {filtered.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto p-4"
                style={{ borderLeft: "1px solid var(--border)" }}>

                {/* Trending hubs */}
                <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "Syne, sans-serif" }}>Trending Hubs</h3>
                <div className="space-y-2 mb-6">
                    {[
                        { name: "Cars", members: "18.2k", color: "#3b82f6", emoji: "🚗" },
                        { name: "Fitness", members: "24.5k", color: "#10b981", emoji: "💪" },
                        { name: "Technology", members: "31.1k", color: "#f59e0b", emoji: "💻" },
                        { name: "Movies", members: "15.8k", color: "#ec4899", emoji: "🎬" },
                        { name: "Photography", members: "9.3k", color: "#6366f1", emoji: "📸" },
                    ].map(hub => (
                        <button key={hub.name}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
                            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                            <span className="text-base">{hub.emoji}</span>
                            <div className="flex-1 text-left">
                                <p className="text-xs font-semibold">{hub.name}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hub.members} members</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `${hub.color}20`, color: hub.color }}>
                                Join
                            </span>
                        </button>
                    ))}
                </div>

                {/* Suggested friends */}
                <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "Syne, sans-serif" }}>Suggested Friends</h3>
                <div className="space-y-2">
                    {[
                        { name: "Jordan Lee", handle: "@jordanlee", avatar: "💪", bg: "linear-gradient(135deg, #064e3b, #065f46)" },
                        { name: "Sam Chen", handle: "@samchen", avatar: "💻", bg: "linear-gradient(135deg, #1c1917, #44403c)" },
                        { name: "Maya Patel", handle: "@mayapatel", avatar: "🎬", bg: "linear-gradient(135deg, #831843, #9d174d)" },
                    ].map(friend => (
                        <div key={friend.handle}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                                style={{ background: friend.bg }}>
                                {friend.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{friend.name}</p>
                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{friend.handle}</p>
                            </div>
                            <button className="text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0"
                                style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}