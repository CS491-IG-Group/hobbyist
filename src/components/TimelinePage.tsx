"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import HubPage from "./HubsProfile";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { fetchRecommendationContext, rankTimelinePosts, type UserAffinity } from "../lib/recommendations";
import { supabase } from "../lib/supabase";
import { fetchAllHubs, type HubRow } from "../lib/hubDb";
import { hubNameToHobbySlug } from "../lib/hubHobbyMap";
import { mergePostTags, normalizeTag } from "../lib/hubTags";

function postAnalyticsMeta(
  post: { hub: string; handle: string; id: number; tags?: string[] },
  extra: Record<string, unknown> = {}
) {
  const hobby_slug = hubNameToHobbySlug(post.hub);
  return {
    ...extra,
    hub: post.hub,
    author_handle: post.handle,
    client_post_id: post.id,
    tags: post.tags ?? [],
    ...(hobby_slug ? { hobby_slug } : {}),
  };
}

const POSTS_RAW = [
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
        postTags: ["subaru", "track-day", "suspension"],
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
        postTags: ["deadlift", "powerlifting"],
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
        postTags: ["macbook", "benchmarks"],
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
        postTags: ["dune", "villeneuve"],
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
        postTags: ["contax", "mountains"],
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
        postTags: ["ramen", "tonkotsu"],
    },
];

const POSTS = POSTS_RAW.map((p) => {
    const { postTags, ...rest } = p;
    return {
        ...rest,
        hobbySlug: hubNameToHobbySlug(rest.hub),
        tags: mergePostTags(rest.hub, [...postTags]),
    };
});

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

type TimelinePost = typeof POSTS[0] & { hobbyId?: number | null };

interface PostCardProps {
    post: TimelinePost;
    heightClass: string;
}

function PostCard({ post, heightClass }: PostCardProps) {
    const { userId, sessionId } = useAnalytics();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [saved, setSaved] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const impressionRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "timeline",
        postId: post.id,
        metadata: postAnalyticsMeta(post, { kind: "post_impression" }),
    });

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [menuOpen]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        await logContentEvent({
            userId,
            sessionId,
            eventType: "like",
            postId: post.id,
            uiLocation: "timeline",
            metadata: postAnalyticsMeta(post),
        });
    };

    const toggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = !saved;
        setSaved(next);
        await logContentEvent({
            userId,
            sessionId,
            eventType: next ? "save" : "unsave",
            postId: post.id,
            uiLocation: "timeline",
            metadata: postAnalyticsMeta(post),
        });
    };

    const logHideOrReport = async (kind: "hide" | "report") => {
        setMenuOpen(false);
        await logContentEvent({
            userId,
            sessionId,
            eventType: kind,
            postId: post.id,
            uiLocation: "timeline",
            metadata: postAnalyticsMeta(post),
        });
    };

    // Text-only posts get a colored gradient background
    const isTextOnly = !post.image;

    return (
        <div
            ref={impressionRef}
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer group relative"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={() => {
                void logContentEvent({
                    userId,
                    sessionId,
                    eventType: "click",
                    uiLocation: "timeline",
                    postId: post.id,
                    metadata: postAnalyticsMeta(post, { action: "post_card_tap" }),
                });
            }}
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

                {/* Actions — top right */}
                <div
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 transition-all"
                    style={{
                        opacity: hovered || menuOpen || saved ? 1 : 0,
                        transform: hovered || menuOpen ? "scale(1)" : "scale(0.85)",
                    }}
                    onClick={e => e.stopPropagation()}>
                    <button
                        onClick={toggleSave}
                        className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-xs"
                        style={{
                            background: saved ? "rgba(167,139,250,0.85)" : "rgba(0,0,0,0.45)",
                            color: "#fff",
                        }}
                        title={saved ? "Saved" : "Save"}>
                        {saved ? "✓" : "🔖"}
                    </button>
                    <button
                        onClick={handleLike}
                        className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"
                        style={{
                            background: liked ? "#ec489980" : "rgba(0,0,0,0.45)",
                            color: liked ? "#fff" : "rgba(255,255,255,0.8)",
                        }}>
                        <HeartIcon filled={liked} />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-white text-sm font-bold"
                            style={{ background: "rgba(0,0,0,0.45)" }}>
                            ···
                        </button>
                        {menuOpen && (
                            <div
                                className="absolute right-0 mt-1 py-1 rounded-lg text-left min-w-[132px] z-20 shadow-lg"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <button
                                    type="button"
                                    className="block w-full text-left text-xs px-3 py-2 hover:opacity-80"
                                    style={{ color: "var(--text)" }}
                                    onClick={e => { e.stopPropagation(); void logHideOrReport("hide"); }}>
                                    Hide / not interested
                                </button>
                                <button
                                    type="button"
                                    className="block w-full text-left text-xs px-3 py-2 hover:opacity-80"
                                    style={{ color: "#f87171" }}
                                    onClick={e => { e.stopPropagation(); void logHideOrReport("report"); }}>
                                    Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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

                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 5).map((t) => (
                            <span
                                key={t}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{
                                    color: "var(--text-muted)",
                                    background: "var(--surface2)",
                                    border: "1px solid var(--border)",
                                }}>
                                {t}
                            </span>
                        ))}
                    </div>
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
                        <button
                            type="button"
                            onClick={e => {
                                e.stopPropagation();
                                void logContentEvent({
                                    userId,
                                    sessionId,
                                    eventType: "click",
                                    uiLocation: "timeline",
                                    postId: post.id,
                                    metadata: postAnalyticsMeta(post, { action: "comment_button_tap" }),
                                });
                            }}
                            className="flex items-center gap-1 text-[10px]"
                            style={{ color: "var(--text-muted)" }}>
                            <CommentIcon />
                            {post.comments}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MAX_EXTRA_TAGS = 8;
const MAX_TAG_LEN = 32;

function CreatePostModal({ onClose, onPost, hubs }: {
    onClose: () => void;
    onPost: (text: string, hub: string, extraTags: string[]) => void;
    hubs: HubRow[];
}) {
    const { userId, sessionId } = useAnalytics();
    const [text, setText] = React.useState("");
    const [selectedHub, setSelectedHub] = React.useState("");
    const [extraTags, setExtraTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const maxChars = 280;

    const addTagsFromInput = () => {
        const raw = tagInput.trim().replace(/^#+/, "");
        if (!raw) return;
        const parts = raw
            .split(/[\s,]+/)
            .map(s => normalizeTag(s.replace(/^#+/, "")))
            .filter(t => t.length > 0 && t.length <= MAX_TAG_LEN);
        if (parts.length === 0) return;
        setExtraTags(prev => {
            const next = [...prev];
            for (const p of parts) {
                if (next.length >= MAX_EXTRA_TAGS) break;
                if (!next.includes(p)) next.push(p);
            }
            return next;
        });
        setTagInput("");
    };

    const removeTag = (t: string) => {
        setExtraTags(prev => prev.filter(x => x !== t));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => {
                void logContentEvent({
                    userId,
                    sessionId,
                    eventType: "click",
                    uiLocation: "timeline",
                    metadata: { action: "compose_overlay_dismiss", had_text: text.trim().length > 0 },
                });
                onClose();
            }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Create Post</h2>
                    <button
                        onClick={() => {
                            void logContentEvent({
                                userId,
                                sessionId,
                                eventType: "click",
                                uiLocation: "timeline",
                                metadata: { action: "compose_dismiss", had_text: text.trim().length > 0 },
                            });
                            onClose();
                        }}
                        style={{ color: "var(--text-muted)" }}>
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
                            {hubs.map(hub => (
                                <button key={hub.slug}
                                    onClick={() => setSelectedHub(selectedHub === hub.name ? "" : hub.name)}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                    style={{
                                        background: selectedHub === hub.name ? "var(--gradient-btn)" : "var(--surface2)",
                                        color: selectedHub === hub.name ? "#fff" : "var(--text-muted)",
                                        border: `1px solid ${selectedHub === hub.name ? "transparent" : "var(--border)"}`,
                                    }}>
                                    {hub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-5">
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                            Tags <span className="font-normal opacity-80">(optional, max {MAX_EXTRA_TAGS})</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[26px]">
                            {extraTags.map(t => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md"
                                    style={{
                                        background: "var(--surface2)",
                                        color: "var(--text-muted)",
                                        border: "1px solid var(--border)",
                                    }}>
                                    {t}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(t)}
                                        className="opacity-60 hover:opacity-100 leading-none"
                                        aria-label={`Remove tag ${t}`}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value.slice(0, MAX_TAG_LEN + 8))}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTagsFromInput();
                                    }
                                }}
                                placeholder="e.g. subaru, track-day — Enter to add"
                                disabled={extraTags.length >= MAX_EXTRA_TAGS}
                                className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs outline-none"
                                style={{
                                    background: "var(--surface2)",
                                    color: "var(--text)",
                                    border: "1px solid var(--border)",
                                }}
                            />
                            <button
                                type="button"
                                onClick={addTagsFromInput}
                                disabled={!tagInput.trim() || extraTags.length >= MAX_EXTRA_TAGS}
                                className="px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-opacity disabled:opacity-40"
                                style={{ background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                                Add
                            </button>
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
                            onClick={() => {
                                if (text.trim() && selectedHub) {
                                    void logContentEvent({
                                        userId,
                                        sessionId,
                                        eventType: "create_post",
                                        uiLocation: "timeline",
                                        metadata: {
                                            action: "compose_submit",
                                            hub: selectedHub,
                                            char_len: text.trim().length,
                                            tags: mergePostTags(selectedHub, extraTags),
                                            extra_tags: extraTags,
                                            ...(hubNameToHobbySlug(selectedHub)
                                                ? { hobby_slug: hubNameToHobbySlug(selectedHub)! }
                                                : {}),
                                        },
                                    });
                                    onPost(text.trim(), selectedHub, extraTags);
                                    onClose();
                                }
                            }}
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
}

export default function TimelinePage({ joinedHubs, onToggleJoin }: TimelinePageProps) {
    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const loadPosts = useCallback(async (hubRowsForColor: HubRow[]) => {
        try {
            setLoadingPosts(true);

            const { data, error } = await supabase
                .from("posts")
                .select(`
                    id,
                    body,
                    created_at,
                    hobby_id,
                    extra_tags,
                    hobbies (name)
                `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error loading posts:", error.message);
                return;
            }

            const mapped = (data || []).map((post: any) => {
                const hubName = post.hobbies?.name || "Unknown";
                const hobbyId = post.hobby_id as number | null | undefined;
                const hubRow = hubRowsForColor.find(h => h.hobby_id === hobbyId);
                const hubColor = hubRow?.gradient_from ?? HUB_COLORS[hubName] ?? "#8b5cf6";
                const storedExtras = Array.isArray(post.extra_tags)
                    ? (post.extra_tags as string[]).map(t => normalizeTag(String(t))).filter(Boolean)
                    : [];

                return {
                    id: post.id,
                    user: "You",
                    handle: "@you",
                    avatar: "✨",
                    avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
                    hub: hubName,
                    hobbyId: hobbyId ?? null,
                    hobbySlug: hubNameToHobbySlug(hubName),
                    tags: mergePostTags(hubName, storedExtras),
                    hubColor,
                    time: formatTimeAgo(post.created_at),
                    text: post.body,
                    image: null,
                    likes: 0,
                    comments: 0,
                    reposts: 0,
                };
            });

            setPosts(mapped);
        } catch (err) {
            console.error("Load posts error:", err);
        } finally {
            setLoadingPosts(false);
        }
    }, []);



    const { userId, sessionId } = useAnalytics();
    const timelineDwellRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "timeline",
        metadata: { kind: "timeline_feed_screen_dwell" },
    });
    const [activeFilter, setActiveFilter] = useState("All");
    const [showCompose, setShowCompose] = useState(false);
    const [activeHub, setActiveHub] = useState<string | null>(null);
    const [posts, setPosts] = useState<TimelinePost[]>([]);
    const [hubRows, setHubRows] = useState<HubRow[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [affinity, setAffinity] = useState<UserAffinity | null>(null);
    const [profileHobbySlugs, setProfileHobbySlugs] = useState<string[]>([]);
    const [affinityReady, setAffinityReady] = useState(false);

    // ── Saves post to Supabase (with optional extra_tags) then updates local feed ──
    const handleNewPost = async (text: string, hub: string, extraTags: string[] = []) => {
        const normalizedExtras = [...new Set(extraTags.map(t => normalizeTag(t)).filter(Boolean))].slice(0, MAX_EXTRA_TAGS);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: hubRow } = await supabase
                    .from("hubs")
                    .select("hobby_id")
                    .eq("name", hub)
                    .maybeSingle();

                let hobbyId: number | null = hubRow?.hobby_id ?? null;
                if (hobbyId == null) {
                    const { data: hobby } = await supabase
                        .from("hobbies")
                        .select("id")
                        .eq("name", hub)
                        .maybeSingle();
                    hobbyId = hobby?.id ?? null;
                }

                if (hobbyId == null) {
                    console.error("[handleNewPost] Could not resolve hobby_id for hub:", hub);
                } else {
                    const { error } = await supabase.from("posts").insert({
                        user_id: user.id,
                        body: text,
                        hobby_id: hobbyId,
                        post_type: "text",
                        extra_tags: normalizedExtras.length ? normalizedExtras : [],
                    });

                    if (error) {
                        console.error("[handleNewPost] Supabase insert failed:", error.message);
                    }
                }
            } else {
                console.warn("[handleNewPost] No authenticated user found — post not saved to Supabase.");
            }
        } catch (err) {
            console.error("[handleNewPost] Unexpected error:", err);
        }

        const row = hubRows.find(h => h.name === hub);
        const hobbyId = row?.hobby_id ?? null;

        const newPost: TimelinePost = {
            id: Date.now(),
            user: "You",
            handle: "@you",
            avatar: "✨",
            avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
            hub,
            hobbyId,
            hobbySlug: hubNameToHobbySlug(hub),
            tags: mergePostTags(hub, normalizedExtras),
            hubColor: row?.gradient_from ?? HUB_COLORS[hub] ?? "#8b5cf6",
            time: "Just now",
            text,
            image: null,
            likes: 0,
            comments: 0,
            reposts: 0,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const filterHubPills = useMemo(() => ["All", ...hubRows.map(h => h.name)], [hubRows]);

    const filtered = useMemo(() => {
        if (activeFilter === "All") return posts;
        const row = hubRows.find(h => h.name === activeFilter);
        if (row?.hobby_id != null) {
            return posts.filter(p => p.hobbyId === row.hobby_id);
        }
        return posts.filter(p => p.hub === activeFilter);
    }, [posts, activeFilter, hubRows]);

    const feedPosts = useMemo(() => {
        if (!affinityReady) return filtered;
        return rankTimelinePosts(filtered, affinity, joinedHubs, profileHobbySlugs);
    }, [filtered, affinity, affinityReady, joinedHubs, profileHobbySlugs]);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;
        void (async () => {
            const rows = await fetchAllHubs();
            if (!cancelled) setHubRows(rows);
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        void loadPosts(hubRows);
    }, [userId, hubRows, loadPosts]);

    useEffect(() => {
        const valid = new Set(filterHubPills);
        if (!valid.has(activeFilter)) setActiveFilter("All");
    }, [filterHubPills, activeFilter]);

    useEffect(() => {
        if (!userId) {
            setAffinity(null);
            setProfileHobbySlugs([]);
            setAffinityReady(false);
            return;
        }

        let cancelled = false;
        setAffinityReady(false);
        void (async () => {
            const res = await fetchRecommendationContext(userId);
            if (!cancelled) {
                if (res.ok) {
                    setAffinity(res.affinity);
                    setProfileHobbySlugs(res.profileHobbySlugs);
                    setAffinityReady(true);
                } else {
                    setAffinity(null);
                    setProfileHobbySlugs([]);
                    setAffinityReady(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "timeline",
            metadata: { screen: "timeline_feed" },
        });
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
            <div ref={timelineDwellRef} className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 min-w-0">
                            <h1 className="text-xl font-bold shrink-0" style={{ fontFamily: "Syne, sans-serif" }}>Timeline</h1>
                            {affinityReady && activeFilter === "All" && (
                                <span
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                    style={{
                                        background: "rgba(139,92,246,0.15)",
                                        color: "#a78bfa",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                    }}
                                    title="Order uses your activity, hub + tag affinity, joined hubs, saved hobbies (Account → Feed interests), and popularity">
                                    For you
                                </span>
                            )}
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            {feedPosts.length} posts
                        </span>
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
                        {filterHubPills.map(f => (
                            <button key={f} onClick={() => {
                                void logContentEvent({
                                    userId,
                                    sessionId,
                                    eventType: "click",
                                    uiLocation: "timeline",
                                    metadata: { action: "filter_hub_pill", filter: f, previous: activeFilter },
                                });
                                setActiveFilter(f);
                            }}
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
                        {feedPosts.map((post, i) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                heightClass={HEIGHT_CLASSES[i % HEIGHT_CLASSES.length]}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating compose button */}
                <button
                    onClick={() => {
                        void logContentEvent({
                            userId,
                            sessionId,
                            eventType: "click",
                            uiLocation: "timeline",
                            metadata: { action: "compose_open_fab" },
                        });
                        setShowCompose(true);
                    }}
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
                                    onClick={() => {
                                        const hobby_slug = hubNameToHobbySlug(hub.name);
                                        void logContentEvent({
                                            userId,
                                            sessionId,
                                            eventType: "click",
                                            uiLocation: "timeline",
                                            metadata: {
                                                action: "open_hub_from_trending",
                                                hub: hub.name,
                                                ...(hobby_slug ? { hobby_slug } : {}),
                                            },
                                        });
                                        setActiveHub(hub.name);
                                    }}>
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
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const hobby_slug = hubNameToHobbySlug(hub.name);
                                                    void logContentEvent({
                                                        userId,
                                                        sessionId,
                                                        eventType: isJoined ? "leave" : "join",
                                                        uiLocation: "timeline",
                                                        metadata: {
                                                            action: isJoined ? "leave_hub" : "join_hub",
                                                            hub: hub.name,
                                                            source: "timeline_trending_card",
                                                            ...(hobby_slug ? { hobby_slug } : {}),
                                                        },
                                                    });
                                                    onToggleJoin(hub.name);
                                                }}
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
                                    <button
                                        type="button"
                                        onClick={() => void logContentEvent({
                                            userId,
                                            sessionId,
                                            eventType: "follow",
                                            uiLocation: "timeline",
                                            metadata: {
                                                action: "follow_suggestion",
                                                target_handle: friend.handle,
                                                target_name: friend.name,
                                                mutual_hubs: friend.mutualHubs,
                                            },
                                        })}
                                        className="text-[10px] px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all hover:opacity-90"
                                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                                        Follow
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {showCompose && (
                <CreatePostModal
                    onClose={() => setShowCompose(false)}
                    onPost={(text, hub, tags) => void handleNewPost(text, hub, tags)}
                    hubs={hubRows}
                />
            )}
        </div>
    );
}