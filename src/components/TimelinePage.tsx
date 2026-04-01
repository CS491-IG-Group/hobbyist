"use client";
import React, { useState, useEffect } from "react";
import HubPage from "./HubsProfile";
import { logContentEvent } from "../lib/analytics";

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
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop",
        likes: 295,
        comments: 67,
        reposts: 38,
    },
];

const FILTERS = ["All", "Cars", "Fitness", "Technology", "Movies", "Photography", "Cooking"];

const HUBS_LIST = ["Cars", "Fitness", "Technology", "Movies", "Photography", "Cooking", "Gaming"];

const HUB_COLORS: Record<string, string> = {
    Cars: "#3b82f6", Fitness: "#10b981", Technology: "#f59e0b",
    Movies: "#ec4899", Photography: "#6366f1", Cooking: "#ef4444", Gaming: "#8b5cf6",
};

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

// Assign a random-ish height class per post so masonry looks varied
const HEIGHT_CLASSES = ["h-48", "h-56", "h-64", "h-72", "h-52", "h-60"];

interface PostCardProps {
    post: typeof POSTS[0];
    userId: string | null;
    sessionId: string;
    heightClass: string;
}

function PostCard({ post, userId, sessionId, heightClass }: PostCardProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [hovered, setHovered] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        await logContentEvent({
            userId, sessionId, eventType: "like", postId: post.id, uiLocation: "timeline",
        });
    };

    // Text-only posts get a colored gradient background
    const isTextOnly = !post.image;

    return (
        <div
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* Image or colored block */}
            <div className={`relative ${isTextOnly ? "h-36" : heightClass} overflow-hidden`}>
                {post.image ? (
                    <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-5"
                        style={{ background: `linear-gradient(135deg, ${post.hubColor}30, ${post.hubColor}10)` }}>
                        <p className="text-sm font-medium text-center leading-relaxed"
                            style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                            {post.text}
                        </p>
                    </div>
                )}

                {/* Hub pill — top left */}
                <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md"
                        style={{
                            background: `${post.hubColor}cc`,
                            color: "#fff",
                            boxShadow: `0 2px 8px ${post.hubColor}60`,
                        }}>
                        {post.hub}
                    </span>
                </div>

                {/* Like button — top right, appears on hover */}
                <button
                    onClick={handleLike}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                    style={{
                        background: liked ? "#ec489980" : "rgba(0,0,0,0.45)",
                        color: liked ? "#fff" : "rgba(255,255,255,0.8)",
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "scale(1)" : "scale(0.8)",
                        transition: "opacity 0.2s, transform 0.2s",
                    }}>
                    <HeartIcon filled={liked} />
                </button>
            </div>

            {/* Caption + user info below image */}
            <div className="px-3 pt-3 pb-3">
                {/* Show caption only for image posts (text-only already shows it in the card) */}
                {post.image && (
                    <p className="text-xs leading-relaxed mb-2.5 line-clamp-2"
                        style={{ color: "var(--text-dim)" }}>
                        {post.text}
                    </p>
                )}

                {/* User row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0"
                            style={{ background: post.avatarBg }}>
                            {post.avatar}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{post.user}</p>
                            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{post.time}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <span className="flex items-center gap-1 text-[10px]"
                            style={{ color: liked ? "#ec4899" : "var(--text-muted)" }}>
                            <HeartIcon filled={liked} />
                            {likeCount}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <CommentIcon />
                            {post.comments}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatePostModal({ onClose, onPost }: { onClose: () => void; onPost: (text: string, hub: string) => void }) {
    const [text, setText] = React.useState("");
    const [selectedHub, setSelectedHub] = React.useState("");
    const maxChars = 280;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Create Post</h2>
                    <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>✨</div>
                        <div>
                            <p className="text-sm font-semibold">You</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Posting to orbit.r</p>
                        </div>
                    </div>
                    <textarea
                        placeholder="What's on your mind? Share with your hubs..."
                        value={text}
                        onChange={e => setText(e.target.value.slice(0, maxChars))}
                        rows={4}
                        className="w-full bg-transparent outline-none text-sm resize-none leading-relaxed"
                        style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                    />
                    <div className="flex justify-end mb-4">
                        <span className="text-xs" style={{ color: text.length > maxChars * 0.8 ? "#f59e0b" : "var(--text-muted)" }}>
                            {text.length}/{maxChars}
                        </span>
                    </div>
                    <div className="mb-5">
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Post to hub</p>
                        <div className="flex flex-wrap gap-2">
                            {HUBS_LIST.map(hub => (
                                <button key={hub}
                                    onClick={() => setSelectedHub(selectedHub === hub ? "" : hub)}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                    style={{
                                        background: selectedHub === hub ? "var(--gradient-btn)" : "var(--surface2)",
                                        color: selectedHub === hub ? "#fff" : "var(--text-muted)",
                                        border: `1px solid ${selectedHub === hub ? "transparent" : "var(--border)"}`,
                                    }}>
                                    {hub}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-px mb-4" style={{ background: "var(--border)" }} />
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <button style={{ color: "var(--text-muted)" }} title="Add image">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </button>
                            <button style={{ color: "var(--text-muted)" }} title="Add emoji">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 13s1.5 2 4 2 4-2 4-2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => { if (text.trim() && selectedHub) { onPost(text.trim(), selectedHub); onClose(); } }}
                            disabled={!text.trim() || !selectedHub}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: "var(--gradient-btn)" }}>
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TimelinePageProps {
    joinedHubs: string[];
    onToggleJoin: (hubName: string) => void;
    userId: string | null;
    sessionId: string;
}

export default function TimelinePage({ joinedHubs, onToggleJoin, userId, sessionId }: TimelinePageProps) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [showCompose, setShowCompose] = useState(false);
    const [activeHub, setActiveHub] = useState<string | null>(null);
    const [posts, setPosts] = useState(POSTS);

    const handleNewPost = (text: string, hub: string) => {
        const newPost = {
            id: Date.now(),
            user: "You",
            handle: "@you",
            avatar: "✨",
            avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
            hub,
            hubColor: HUB_COLORS[hub] || "#8b5cf6",
            time: "Just now",
            text,
            image: null,
            likes: 0,
            comments: 0,
            reposts: 0,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const filtered = activeFilter === "All" ? posts : posts.filter(p => p.hub === activeFilter);

    useEffect(() => {
        logContentEvent({ userId, sessionId, eventType: "view", uiLocation: "timeline" });
    }, [userId, sessionId]);

    if (activeHub) {
        return (
            <HubPage
                hubName={activeHub}
                joined={joinedHubs.includes(activeHub)}
                onToggleJoin={() => onToggleJoin(activeHub)}
                onBack={() => setActiveHub(null)}
            />
        );
    }

    return (
        <div className="flex flex-1 min-h-screen" style={{ background: "var(--bg)" }}>
            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h1 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Timeline</h1>
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            {filtered.length} posts
                        </span>
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
                        {FILTERS.map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)}
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

                    {/* Masonry grid — 2 columns on md+, 1 on mobile */}
                    <div className="columns-1 md:columns-2 gap-4">
                        {filtered.map((post, i) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                userId={userId}
                                sessionId={sessionId}
                                heightClass={HEIGHT_CLASSES[i % HEIGHT_CLASSES.length]}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating compose button */}
                <button
                    onClick={() => setShowCompose(true)}
                    className="fixed bottom-8 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                    style={{
                        right: "calc(320px + 2rem)",
                        background: "var(--gradient-btn)",
                        boxShadow: "0 4px 24px rgba(139,92,246,0.4)",
                    }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Right sidebar — Trending Hubs & People You May Know */}
            <aside className="hidden lg:block w-80 shrink-0 p-5" style={{ borderLeft: "1px solid var(--border)" }}>

                {/* Trending Hubs */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>🔥 Trending Hubs</h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>Explore all</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: "Cars", members: "18.2k", color: "#3b82f6", emoji: "🚗", trend: "+12%", bg: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)" },
                            { name: "Fitness", members: "24.5k", color: "#10b981", emoji: "💪", trend: "+8%", bg: "linear-gradient(135deg, #064e3b 0%, #059669 100%)" },
                            { name: "Technology", members: "31.1k", color: "#f59e0b", emoji: "💻", trend: "+21%", bg: "linear-gradient(135deg, #78350f 0%, #d97706 100%)" },
                        ].map(hub => {
                            const isJoined = joinedHubs.includes(hub.name);
                            return (
                                <div key={hub.name}
                                    className="rounded-xl p-3 transition-all hover:scale-[1.02] h-14 flex items-center cursor-pointer"
                                    style={{ background: hub.bg, border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 4px 16px ${hub.color}20` }}
                                    onClick={() => setActiveHub(hub.name)}>
                                    <div className="flex items-center gap-3 w-full">
                                        <span className="text-2xl">{hub.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white">{hub.name}</p>
                                            <p className="text-[11px] text-white/50">{hub.members} members</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                                style={{ background: "rgba(255,255,255,0.15)", color: "#4ade80" }}>↑ {hub.trend}</span>
                                            <button
                                                onClick={e => { e.stopPropagation(); onToggleJoin(hub.name); }}
                                                className="text-[10px] px-2 py-1 rounded-lg font-semibold transition-all hover:opacity-80"
                                                style={isJoined
                                                    ? { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }
                                                    : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                                                {isJoined ? "Joined ✓" : "Join +"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-px mb-5" style={{ background: "var(--border)" }} />

                {/* People You May Know */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>👋 People You May Know</h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>See all</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: "Jordan Lee", handle: "@jordanlee", avatar: "💪", bg: "linear-gradient(135deg, #064e3b, #065f46)", mutualHubs: ["Fitness", "Cooking"], accent: "#10b981" },
                            { name: "Sam Chen", handle: "@samchen", avatar: "💻", bg: "linear-gradient(135deg, #1c1917, #44403c)", mutualHubs: ["Technology", "Gaming"], accent: "#f59e0b" },
                            { name: "Maya Patel", handle: "@mayapatel", avatar: "🎬", bg: "linear-gradient(135deg, #831843, #9d174d)", mutualHubs: ["Movies"], accent: "#ec4899" },
                        ].map(friend => (
                            <div key={friend.handle}
                                className="rounded-xl p-3 transition-all hover:scale-[1.01]"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                                        style={{ background: friend.bg }}>
                                        {friend.avatar}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold truncate">{friend.name}</p>
                                        <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{friend.handle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {friend.mutualHubs.map(hub => (
                                            <span key={hub} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                                style={{ background: `${friend.accent}15`, color: friend.accent, border: `1px solid ${friend.accent}25` }}>
                                                {hub}
                                            </span>
                                        ))}
                                        <span className="text-[9px] px-1 py-0.5" style={{ color: "var(--text-muted)" }}>mutual</span>
                                    </div>
                                    <button className="text-[10px] px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all hover:opacity-90"
                                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                                        Follow
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {showCompose && <CreatePostModal onClose={() => setShowCompose(false)} onPost={handleNewPost} />}
        </div>
    );
}