"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import HubPage from "./HubsProfile";
import CommentsModel from './CommentsModel';
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { fetchRecommendationContext, rankTimelinePosts, type UserAffinity, type RankableTimelinePost } from "../lib/recommendations";
import { supabase } from "../lib/supabase";
import { fetchAllHubs, type HubRow } from "../lib/hubDb";
import { hubNameToHobbySlug } from "../lib/hubHobbyMap";
import { mergePostTags, normalizeTag } from "../lib/hubTags";

interface TimelinePost extends RankableTimelinePost {
    authorId: string;
    hubId: string | null;
    avatar: string;
    avatarBg: string;
    userTags: string[];
    hubColor: string;
    time: string;
    text: string;
    image: string | null;
    comments: number;
    reposts: number;
}

/** Selected hub name → `public.hubs.id` (primary key), same list as the compose UI. */
function resolveHubRowForName(hubName: string, rows: HubRow[]): HubRow | null {
    return rows.find((h) => h.name === hubName) ?? null;
}

/** `posts.user_id` FK requires a row in public.users; signup trigger may be missing in some DBs. */
async function ensurePublicUserRow(user: { id: string; email?: string | null }): Promise<{ ok: boolean; message?: string }> {
    const { data, error: selErr } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
    if (selErr && process.env.NODE_ENV === "development") {
        console.warn("[ensurePublicUserRow] select failed", selErr.message);
    }
    if (data) return { ok: true };

    const { error: insErr } = await supabase.from("users").insert({ id: user.id, email: user.email ?? null });
    if (!insErr) return { ok: true };
    if (insErr.code === "23505") return { ok: true };

    console.error("[ensurePublicUserRow] insert failed", insErr.message);
    return { ok: false, message: insErr.message };
}

/** Map `posts` + joined `public.users` to timeline `user` / `handle` */
function authorFromPostRow(
    userId: string,
    usersEmbed: any,
    currentUserId: string | null
): { user: string; handle: string } {
    const profile = Array.isArray(usersEmbed) ? usersEmbed[0] ?? null : usersEmbed ?? null;
    const trimmedHandle = profile?.handle?.trim() ?? "";
    const displayName = profile?.display_name?.trim() ?? "";
    const atHandle =
        trimmedHandle.length > 0
            ? trimmedHandle.startsWith("@")
                ? trimmedHandle
                : `@${trimmedHandle}`
            : `@user_${userId.replace(/-/g, "").slice(0, 8)}`;

    const isSelf = currentUserId != null && userId === currentUserId;
    if (isSelf) return { user: "You", handle: atHandle };

    const label = displayName || (trimmedHandle ? trimmedHandle.replace(/^@/, "") : "") || "Member";
    return { user: label, handle: atHandle };
}

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

const MAX_EXTRA_TAGS = 8;
const MAX_TAG_LEN = 32;

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

const HEIGHT_CLASSES = ["h-48", "h-56", "h-64", "h-72", "h-52", "h-60"];

export function PostCard({ post, heightClass }: { post: any; heightClass: string }) {
    const { userId, sessionId } = useAnalytics();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [hovered, setHovered] = useState(false);
    const hasImage = Boolean(post.image);

    // ... (Your existing useEffect for stats remains the same)
    useEffect(() => {
        const fetchStats = async () => {
            if (!userId) return;
            const { count: likes, data: likesData } = await supabase.from('post_likes').select('*', { count: 'exact' }).eq('post_id', post.id);
            const { count: comments } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
            setLikeCount(likes || 0);
            setCommentCount(comments || 0);
            setIsLiked(likesData?.some(l => l.user_id === userId) ?? false);
        };
        fetchStats();
    }, [post.id, userId]);

    useEffect(() => {
        const fetchFollowState = async () => {
            if (!userId || !post.authorId || post.authorId === userId) {
                setIsFollowingAuthor(false);
                return;
            }

            const { data, error } = await supabase
                .from("user_follows")
                .select("follower_id")
                .eq("follower_id", userId)
                .eq("followed_id", post.authorId)
                .eq("status", "following")
                .maybeSingle();

            if (error) {
                if (process.env.NODE_ENV === "development") {
                    console.warn("[timeline] follow state lookup failed", error.message);
                }
                return;
            }

            setIsFollowingAuthor(Boolean(data));
        };

        void fetchFollowState();
    }, [post.authorId, userId]);

    // ... (Your existing handleLike remains the same)
    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const previousLiked = isLiked;
        setIsLiked(!previousLiked);
        setLikeCount(previousLiked ? likeCount - 1 : likeCount + 1);
        if (previousLiked) {
            await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId);
        } else {
            await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId });
        }
    };

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId || !post.authorId || post.authorId === userId || followBusy) return;

        const nextFollowing = !isFollowingAuthor;
        setFollowBusy(true);
        setIsFollowingAuthor(nextFollowing);

        if (nextFollowing) {
            const { error } = await supabase
                .from("user_follows")
                .upsert(
                    { follower_id: userId, followed_id: post.authorId, status: "following" },
                    { onConflict: "follower_id,followed_id" }
                );
            if (error) {
                setIsFollowingAuthor(false);
                setFollowBusy(false);
                return;
            }

            void logContentEvent({
                userId,
                sessionId,
                eventType: "follow",
                uiLocation: "timeline",
                metadata: postAnalyticsMeta(post, {
                    action: "follow_from_post_card",
                    target_author_id: post.authorId,
                    target_handle: post.handle,
                }),
            });
        } else {
            const { error } = await supabase
                .from("user_follows")
                .delete()
                .eq("follower_id", userId)
                .eq("followed_id", post.authorId);
            if (error) {
                setIsFollowingAuthor(true);
                setFollowBusy(false);
                return;
            }
        }

        setFollowBusy(false);
    };

    return (
        <div className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer group relative"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* IMAGE / HEADER BLOCK */}
            <div className={`relative ${hasImage ? `${heightClass} overflow-hidden` : "min-h-[120px] px-6 pt-12 pb-5 flex items-center justify-center"}`}
                style={{ background: !hasImage ? `linear-gradient(135deg, ${post.hubColor}30, ${post.hubColor}10)` : "transparent" }}>
                {hasImage ? (
                    <img src={post.image} alt="Post attachment" className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }} />
                ) : (
                    <p
                        className="text-xs leading-relaxed text-center"
                        style={{
                            color: "#fff",
                            textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                            maxWidth: "90%",
                        }}
                    >
                        {post.text}
                    </p>
                )}

                <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md" style={{ background: `${post.hubColor}cc`, color: "#fff" }}>{post.hub}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={handleLike} className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md" style={{ background: isLiked ? "#ec489980" : "rgba(0,0,0,0.45)" }}>
                        <HeartIcon filled={isLiked} />
                    </button>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className="px-3 pt-3 pb-3">
                {hasImage && (
                    <p className="text-xs leading-relaxed mb-2.5 text-[var(--text)]">{post.text}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: post.avatarBg }}>{post.avatar}</div>
                        <div><p className="text-xs font-semibold">{post.user}</p></div>
                    </div>

                    <div className="flex items-center gap-3">
                        {userId && post.authorId && post.authorId !== userId && (
                            <button
                                type="button"
                                onClick={handleFollowToggle}
                                disabled={followBusy}
                                className="text-[10px] px-2 py-1 rounded-md font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                style={{
                                    background: isFollowingAuthor ? "rgba(16,185,129,0.12)" : "rgba(139,92,246,0.15)",
                                    color: isFollowingAuthor ? "#10b981" : "#a78bfa",
                                    border: isFollowingAuthor ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(139,92,246,0.2)",
                                }}
                            >
                                {followBusy ? "..." : isFollowingAuthor ? "Following" : "Follow"}
                            </button>
                        )}
                        <button onClick={handleLike} className="flex items-center gap-1 text-[10px]" style={{ color: isLiked ? "#ec4899" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <HeartIcon filled={isLiked} /> {likeCount}
                        </button>
                        <button onClick={e => { e.stopPropagation(); setShowComments(true); }} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <CommentIcon /> {commentCount}
                        </button>
                    </div>
                </div>
            </div>

            {showComments && (
                <CommentsModel
                    postId={post.id}
                    onClose={() => setShowComments(false)}
                    onCommentPosted={() => setCommentCount(c => c + 1)}
                />
            )}
        </div>
    );
}

function CreatePostModal({ onClose, onPost, hubs }: {
    onClose: () => void;
    onPost: (text: string, hub: string, extraTags: string[], imageFile: File | null) => void;
    hubs: HubRow[];
}) {
    const { userId, sessionId } = useAnalytics();
    const [text, setText] = React.useState("");
    const [selectedHub, setSelectedHub] = React.useState("");
    const [extraTags, setExtraTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const maxChars = 280;

    React.useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);

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
                    {imagePreviewUrl && (
                        <div className="mb-4">
                            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                                <img src={imagePreviewUrl} alt="Selected upload preview" className="w-full h-40 object-cover" />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                                    setImagePreviewUrl(null);
                                    setImageFile(null);
                                }}
                                className="mt-2 text-xs font-medium hover:opacity-80"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Remove image
                            </button>
                        </div>
                    )}
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
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (!file) return;
                                    setImageFile(file);
                                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                                    setImagePreviewUrl(URL.createObjectURL(file));
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ color: "var(--text-muted)" }}
                                title="Add image"
                            >
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
                                    const picked = hubs.find((h) => h.name === selectedHub);
                                    const slugForMeta = picked?.hobby_slug ?? hubNameToHobbySlug(selectedHub);
                                    void logContentEvent({
                                        userId,
                                        sessionId,
                                        eventType: "create_post",
                                        uiLocation: "timeline",
                                        metadata: {
                                            action: "compose_submit",
                                            hub: selectedHub,
                                            char_len: text.trim().length,
                                            tags: mergePostTags(selectedHub, extraTags, picked?.hobby_slug ?? null),
                                            extra_tags: extraTags,
                                            ...(slugForMeta ? { hobby_slug: slugForMeta } : {}),
                                        },
                                    });
                                    onPost(text.trim(), selectedHub, extraTags, imageFile);
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

    const [postsFetchError, setPostsFetchError] = useState<string | null>(null);

    const loadPosts = useCallback(async (hubRowsForColor: HubRow[]) => {
        try {
            setLoadingPosts(true);
            setPostsFetchError(null);

            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            const currentUserId = authUser?.id ?? null;

            /* `users!user_id` — required when PostgREST sees multiple posts↔users paths (e.g. posts.user_id + post_likes). */
            const { data, error } = await supabase
                .from("posts")
                .select("id, body, image_url, created_at, hub_id, extra_tags, user_id, users!user_id ( handle, display_name )")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error loading posts:", error.message);
                setPostsFetchError(error.message);
                return;
            }

            const mapped = (data || []).map((post: any) => {
                const hubRow = hubRowsForColor.find(
                    (h) => h.id === post.hub_id || String(h.id) === String(post.hub_id)
                );
                const displayHub = hubRow?.name ?? "Unknown";
                const hobbySlugFromDb =
                    hubRow?.hobby_slug && hubRow.hobby_slug.trim()
                        ? hubRow.hobby_slug.trim().toLowerCase()
                        : null;
                const hubColor =
                    hubRow?.gradient_from ?? HUB_COLORS[displayHub] ?? "#8b5cf6";
                const storedExtras = Array.isArray(post.extra_tags)
                    ? (post.extra_tags as string[]).map((t) => normalizeTag(String(t))).filter(Boolean)
                    : [];

                const resolvedHobbySlug = hobbySlugFromDb ?? hubNameToHobbySlug(displayHub);

                const uid = typeof post.user_id === "string" ? post.user_id : String(post.user_id ?? "");
                const { user: displayUser, handle: authorHandle } = authorFromPostRow(
                    uid,
                    post.users,
                    currentUserId
                );

                return {
                    id: post.id,
                    authorId: uid,
                    user: displayUser,
                    handle: authorHandle,
                    avatar: "✨",
                    avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
                    hub: displayHub,
                    hubId:
                        typeof post.hub_id === "string"
                            ? post.hub_id
                            : post.hub_id != null
                                ? String(post.hub_id)
                                : null,
                    hobbySlug: resolvedHobbySlug,
                    tags: mergePostTags(displayHub, storedExtras, hobbySlugFromDb),
                    userTags: storedExtras,
                    hubColor,
                    time: formatTimeAgo(post.created_at),
                    text: post.body,
                    image: post.image_url ?? null,
                    likes: 0,
                    comments: 0,
                    reposts: 0,
                };
            });

            setPosts(mapped);
        } catch (err) {
            console.error("Load posts error:", err);
            setPostsFetchError(err instanceof Error ? err.message : "Could not load posts.");
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

    const [postSaveError, setPostSaveError] = useState<string | null>(null);

    // ── Saves post to Supabase (with optional extra_tags) then reloads feed from DB ──
    const handleNewPost = async (text: string, hub: string, extraTags: string[] = [], imageFile: File | null = null) => {
        const normalizedExtras = [...new Set(extraTags.map(t => normalizeTag(t)).filter(Boolean))].slice(0, MAX_EXTRA_TAGS);
        setPostSaveError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn("[handleNewPost] No authenticated user found — post not saved to Supabase.");
                setPostSaveError("You must be signed in to post.");
                return;
            }

            if (hubRows.length === 0) {
                setPostSaveError("Hubs are still loading. Please wait a moment and try again.");
                return;
            }

            const ensured = await ensurePublicUserRow(user);
            if (!ensured.ok) {
                setPostSaveError(ensured.message ?? "Could not prepare your profile to post.");
                return;
            }

            const hubRow = resolveHubRowForName(hub, hubRows);
            if (!hubRow?.id) {
                const msg = `Could not resolve a hub for “${hub}”.`;
                console.error("[handleNewPost]", msg);
                setPostSaveError(msg);
                return;
            }

            let uploadedImageUrl: string | null = null;
            if (imageFile) {
                const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
                const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
                const objectPath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("post-images")
                    .upload(objectPath, imageFile, { upsert: false });
                if (uploadError) {
                    setPostSaveError(`Image upload failed: ${uploadError.message}`);
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(objectPath);
                uploadedImageUrl = publicUrlData.publicUrl;
            }

            const { data: inserted, error } = await supabase
                .from("posts")
                .insert({
                    user_id: user.id,
                    body: text,
                    hub_id: hubRow.id,
                    post_type: "text",
                    extra_tags: normalizedExtras.length ? normalizedExtras : [],
                    image_url: uploadedImageUrl,
                })
                .select("id")
                .single();

            if (error) {
                console.error("[handleNewPost] Supabase insert failed:", error.message);
                setPostSaveError(error.message);
                return;
            }

            if (inserted?.id != null) {
                await loadPosts(hubRows);
            }
        } catch (err) {
            console.error("[handleNewPost] Unexpected error:", err);
            setPostSaveError(err instanceof Error ? err.message : "Could not save post.");
        }
    };

    const filterHubPills = useMemo(() => ["All", ...hubRows.map(h => h.name)], [hubRows]);

    const filtered = useMemo(() => {
        if (activeFilter === "All") return posts;
        const row = hubRows.find(h => h.name === activeFilter);
        if (row?.id != null) {
            return posts.filter((p) => p.hubId === row.id);
        }
        return posts.filter(p => p.hub === activeFilter);
    }, [posts, activeFilter, hubRows]);

    const feedPosts = useMemo(() => {
        if (!affinityReady) return filtered;
        return rankTimelinePosts(filtered, affinity, joinedHubs, profileHobbySlugs);
    }, [filtered, affinity, affinityReady, joinedHubs, profileHobbySlugs]);

    /* Hubs + posts + affinity follow Supabase session — not Analytics `userId` (often null if profile fetch failed). */
    useEffect(() => {
        let cancelled = false;

        async function refreshForAuthUser(uid: string | null) {
            if (!uid) {
                setHubRows([]);
                setPosts([]);
                setAffinity(null);
                setProfileHobbySlugs([]);
                setAffinityReady(false);
                setLoadingPosts(false);
                setPostsFetchError(null);
                return;
            }

            const rows = await fetchAllHubs();
            if (cancelled) return;
            setHubRows(rows);
            await loadPosts(rows);

            setAffinityReady(false);
            const res = await fetchRecommendationContext(uid);
            if (cancelled) return;
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

        void (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            await refreshForAuthUser(user?.id ?? null);
        })();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            void refreshForAuthUser(session?.user?.id ?? null);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [loadPosts]);

    useEffect(() => {
        const valid = new Set(filterHubPills);
        if (!valid.has(activeFilter)) setActiveFilter("All");
    }, [filterHubPills, activeFilter]);

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

                    {(postSaveError || postsFetchError) && (
                        <div
                            className="mb-4 rounded-xl px-4 py-3 text-sm"
                            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.35)", color: "#fecaca" }}
                            role="alert">
                            {postSaveError ?? postsFetchError}
                        </div>
                    )}

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
                        setPostSaveError(null);
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
                {/* TODO: Add trending hubs */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>🔥 Trending Hubs</h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>Explore all</span>
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
                    onPost={(text, hub, tags, imageFile) => void handleNewPost(text, hub, tags, imageFile)}
                    hubs={hubRows}
                />
            )}
        </div>
    );
}