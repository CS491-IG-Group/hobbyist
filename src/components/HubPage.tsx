"use client";
import React, { useState, useEffect } from "react";
import { getHubById, getCategoryById, type HubDetail, type HubItem } from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { fetchHubBySlug, HubRow, hubRowToDetail } from "../lib/hubDb";
import { joinHub, leaveHub, fetchUserHubSlugs } from "../lib/hubDb";
import { supabase } from "../lib/supabase";
import { PostCard } from "./TimelinePage";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function BackIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Item card (right side-bar)                                         */
/* ------------------------------------------------------------------ */
function ItemCard({ item, onClick }: { item: { name: string; year: string; rating: string }; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
            }}
        >
            <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                    {item.name}
                </h4>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.year} | {item.rating}
                </span>
            </div>
            <div style={{ color: "var(--text-dim)" }}>
                <ArrowRightIcon />
            </div>
        </div>
    );
}

type HubPost = {
    id: number;
    body: string;
    image_url: string | null;
    created_at: string;
    user_id: string;
    users?: { handle?: string | null; display_name?: string | null } | { handle?: string | null; display_name?: string | null }[] | null;
};

type DbItemRow = {
    id: number;
    name: string;
    item_type: string | null;
    description: string | null;
};

type HubSidebarItem = {
    id: number;
    name: string;
    year: string;
    rating: string;
};

function formatTimeAgo(dateString: string): string {
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
}

function postAuthorLabel(post: HubPost): { name: string; handle: string } {
    const profile = Array.isArray(post.users) ? post.users[0] ?? null : post.users ?? null;
    const rawHandle = profile?.handle?.trim() ?? "";
    const displayName = profile?.display_name?.trim() ?? "";
    const handle = rawHandle.length > 0 ? (rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`) : `@user_${post.user_id.replace(/-/g, "").slice(0, 8)}`;
    const name = displayName || (rawHandle ? rawHandle.replace(/^@/, "") : "") || "Member";
    return { name, handle };
}

/* ================================================================== */
/*  HubPage                                                            */
/* ================================================================== */
interface HubPageProps {
    categoryId: string;
    hubId: string;
    onBack: () => void;
    onSelectItem?: (itemId: number) => void;
}

export default function HubPage({ categoryId, hubId, onBack, onSelectItem }: HubPageProps) {
    const { userId, sessionId } = useAnalytics();
    const [activeTab, setActiveTab] = useState<"recent" | "popular">("recent");
    const [dbHub, setDbHub] = useState<HubDetail | null>(null);
    const [hubLoading, setHubLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [postsLoading, setPostsLoading] = useState(true);
    const [hubPosts, setHubPosts] = useState<HubPost[]>([]);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [hubItems, setHubItems] = useState<HubSidebarItem[]>([]);

    const mockHub = getHubById(categoryId, hubId);
    const category = getCategoryById(categoryId);

    const [hubRow, setHubRow] = useState<HubRow | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setHubLoading(true);
            const row = await fetchHubBySlug(hubId);
            setHubRow(row);
            const mock = getHubById(categoryId, hubId);

            if (!cancelled) {
                if (row) {
                    const [{ data: dbItems, error: dbItemsErr }, slugs] = await Promise.all([
                        supabase
                            .from("items")
                            .select("id, name, item_type, description")
                            .eq("hub_id", row.id)
                            .order("created_at", { ascending: false }),
                        userId ? fetchUserHubSlugs(userId) : Promise.resolve([]),
                    ]);

                    if (cancelled) return;

                    const items: HubItem[] = dbItemsErr
                        ? (mock?.items ?? [])
                        : ((dbItems ?? []) as DbItemRow[]).map((item) => ({
                            name: item.name,
                            year: item.item_type?.trim() || "item",
                            rating: "N/A",
                            description: item.description ?? "",
                        }));
                    const sidebarItems: HubSidebarItem[] = dbItemsErr
                        ? (mock?.items ?? []).map((item, idx) => ({
                            id: -(idx + 1),
                            name: item.name,
                            year: item.year,
                            rating: item.rating,
                        }))
                        : ((dbItems ?? []) as DbItemRow[]).map((item) => ({
                            id: item.id,
                            name: item.name,
                            year: item.item_type?.trim() || "item",
                            rating: "N/A",
                        }));

                    setHubItems(sidebarItems);
                    setDbHub(hubRowToDetail(row, items));
                    setIsJoined(slugs.includes(hubId));
                } else {
                    setHubItems([]);
                    setDbHub(null);
                    setIsJoined(false);
                }
                setHubLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [categoryId, hubId, userId]);

    const handleToggleJoin = async () => {
        if (!userId) return;
        if (isJoined) {
            const { error } = await leaveHub(userId, hubId);
            if (error) throw new Error(error);
            setIsJoined(false);
        } else {
            const { error } = await joinHub(userId, hubId);
            if (error) throw new Error(error);
            setIsJoined(true);
        }
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("hub-memberships-updated"));
        }
    };




    useEffect(() => {
        let cancelled = false;

        const loadPosts = async () => {
            setPostsLoading(true);
            setPostsError(null);
            if (!hubRow?.id) {
                if (!cancelled) {
                    setHubPosts([]);
                    setPostsLoading(false);
                }
                return;
            }

            const { data, error } = await supabase
                .from("posts")
                .select("id, body, image_url, created_at, user_id, users!user_id ( handle, display_name )")
                .eq("hub_slug", hubId)
                .order("created_at", { ascending: activeTab === "popular" });

            if (cancelled) return;
            if (error) {
                setHubPosts([]);
                setPostsError(error.message);
                setPostsLoading(false);
                return;
            }

            setHubPosts((data ?? []) as HubPost[]);
            setPostsLoading(false);
        };

        void loadPosts();

        return () => {
            cancelled = true;
        };
    }, [hubRow?.id, activeTab]);


    const hub = dbHub ?? mockHub;
    const categoryName = category?.name ?? categoryId;

    const dwellRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "hub",
        enabled: Boolean(hub),
        metadata: {
            kind: "hub_dwell",
            category_id: categoryId,
            hub_id: hubId,
            hub_name: hub?.name,
        },
    });

    useEffect(() => {
        const h = hub;
        if (!h) return;
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "hub",
            metadata: {
                screen: "hub",
                category_id: categoryId,
                hub_id: hubId,
                hub_name: h.name,
            },
        });
    }, [userId, sessionId, categoryId, hubId, hub]);

    if (!hubLoading && !hub) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-8">
                <p style={{ color: "var(--text-muted)" }}>Hub not found.</p>
            </div>
        );
    }

    if (hubLoading || !hub) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-8">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Loading hub…
                </p>
            </div>
        );
    }

    return (
        <div ref={dwellRef} className="max-w-5xl mx-auto px-6 py-8">
            {/* Back button */}
            <button
                onClick={() => {
                    void logContentEvent({
                        userId,
                        sessionId,
                        eventType: "click",
                        uiLocation: "hub",
                        metadata: {
                            action: "back_to_category",
                            category_id: categoryId,
                            hub_id: hubId,
                            hub_name: hub.name,
                        },
                    });
                    onBack();
                }}
                className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                style={{ color: "#a78bfa" }}
            >
                <BackIcon />
                <span>{categoryName}</span>
            </button>

            {/* ── Hub banner ────────────────────────────────────────────── */}
            <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8"
                style={{
                    background: `linear-gradient(135deg, ${hub.gradientFrom} 0%, ${hub.gradientTo} 100%)`,
                }}
            >
                {/* Emoji / image placeholder */}
                <div
                    className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    {hub.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h1
                        className="text-2xl font-bold mb-1"
                        style={{ fontFamily: "Syne, sans-serif", color: "#fff" }}
                    >
                        {hub.name}
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {hub.description}
                    </p>
                </div>

                {/* Stats & join */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.75)" }}>
                        <strong className="text-white">{hub.posts.toLocaleString()}</strong> posts
                        {" | "}
                        <strong className="text-white">{hub.members.toLocaleString()}</strong> members
                    </span>
                    <button
                        type="button"
                        onClick={handleToggleJoin}
                        className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(6px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.35)",
                        }}
                    >
                        {isJoined ? "✓ Joined" : "Join"}
                    </button>
                </div>
            </div>

            {/* ── Main content: Posts + Items ────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Posts (left) */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className="text-xl font-bold"
                            style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                        >
                            Posts
                        </h2>

                        {/* Tabs */}
                        <div
                            className="flex rounded-full overflow-hidden text-xs font-medium"
                            style={{ border: "1px solid var(--border)" }}
                        >
                            <button
                                onClick={() => {
                                    void logContentEvent({
                                        userId,
                                        sessionId,
                                        eventType: "click",
                                        uiLocation: "hub",
                                        metadata: {
                                            action: "hub_posts_tab",
                                            tab: "recent",
                                            category_id: categoryId,
                                            hub_id: hubId,
                                        },
                                    });
                                    setActiveTab("recent");
                                }}
                                className="px-4 py-1.5 transition-all"
                                style={{
                                    background: activeTab === "recent" ? "var(--surface2)" : "transparent",
                                    color: activeTab === "recent" ? "#a78bfa" : "var(--text-muted)",
                                }}
                            >
                                recent
                            </button>
                            <button
                                onClick={() => {
                                    void logContentEvent({
                                        userId,
                                        sessionId,
                                        eventType: "click",
                                        uiLocation: "hub",
                                        metadata: {
                                            action: "hub_posts_tab",
                                            tab: "popular",
                                            category_id: categoryId,
                                            hub_id: hubId,
                                        },
                                    });
                                    setActiveTab("popular");
                                }}
                                className="px-4 py-1.5 transition-all"
                                style={{
                                    background: activeTab === "popular" ? "var(--surface2)" : "transparent",
                                    color: activeTab === "popular" ? "#a78bfa" : "var(--text-muted)",
                                }}
                            >
                                popular
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {postsLoading ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Loading posts…
                            </p>
                        ) : postsError ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Could not load posts: {postsError}
                            </p>
                        ) : hubPosts.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                No posts in this hub yet.
                            </p>
                        ) : (
                            hubPosts.map((post) => {
                                const author = postAuthorLabel(post);
                                return (
                                    <PostCard
                                        key={post.id}
                                        heightClass="h-48"
                                        onDelete={() => { }}
                                        post={{
                                            id: post.id,
                                            authorId: post.user_id,
                                            ownerId: post.user_id,
                                            user: author.name,
                                            handle: author.handle,
                                            avatar: "✨",
                                            avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
                                            hub: hub.name,
                                            hubId: hubId,
                                            hobbySlug: null,
                                            tags: [],
                                            userTags: [],
                                            hubColor: hub.gradientFrom,
                                            time: formatTimeAgo(post.created_at),
                                            text: post.body,
                                            image: post.image_url ?? null,
                                            likes: 0,
                                            comments: 0,
                                            reposts: 0,
                                            likeCount: 0,
                                            isLiked: false,
                                            commentCount: 0,
                                            isFollowing: false,
                                        }}
                                        initialLikeCount={0}
                                        initialIsLiked={false}
                                        initialCommentCount={0}
                                        initialIsFollowing={false}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Items (right sidebar) */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <h2
                        className="text-xl font-bold mb-4"
                        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                    >
                        Items
                    </h2>
                    <div className="space-y-3">
                        {hubItems.length === 0 ? (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                No featured items yet.
                            </p>
                        ) : (
                            hubItems.map((item, i) => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => {
                                        void logContentEvent({
                                            userId,
                                            sessionId,
                                            eventType: "click",
                                            uiLocation: "hub",
                                            metadata: {
                                                action: "open_item",
                                                category_id: categoryId,
                                                hub_id: hubId,
                                                item_id: item.id,
                                                item_name: item.name,
                                            },
                                        });
                                        if (item.id > 0) onSelectItem?.(item.id);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
