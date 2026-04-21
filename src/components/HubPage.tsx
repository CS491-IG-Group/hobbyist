"use client";
import React, { useState, useEffect } from "react";
import { getHubById, getCategoryById, type HubDetail, type HubItem } from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { fetchHubBySlug, hubRowToDetail } from "../lib/hubDb";
import { joinHub, leaveHub, fetchUserHubSlugs } from "../lib/hubDb";

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

/* ------------------------------------------------------------------ */
/*  Placeholder post card                                              */
/* ------------------------------------------------------------------ */
function PostPlaceholder() {
    return (
        <div
            className="rounded-xl transition-all"
            style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                minHeight: "100px",
            }}
        />
    );
}

/* ================================================================== */
/*  HubPage                                                            */
/* ================================================================== */
interface HubPageProps {
    categoryId: string;
    hubId: string;
    onBack: () => void;
    onSelectItem?: (itemIndex: number) => void;
}

export default function HubPage({ categoryId, hubId, onBack, onSelectItem }: HubPageProps) {
    const { userId, sessionId } = useAnalytics();
    const [activeTab, setActiveTab] = useState<"recent" | "popular">("recent");
    const [dbHub, setDbHub] = useState<HubDetail | null>(null);
    const [hubLoading, setHubLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const mockHub = getHubById(categoryId, hubId);
    const category = getCategoryById(categoryId);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setHubLoading(true);
            const row = await fetchHubBySlug(hubId);
            const mock = getHubById(categoryId, hubId);
            if (cancelled) return;
            if (row) {
                const items: HubItem[] = mock?.items ?? [];
                setDbHub(hubRowToDetail(row, items));
            } else {
                setDbHub(null);
            }
            setHubLoading(false);
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [categoryId, hubId]);

    useEffect(() => {
        if (!userId) return;

        fetchUserHubSlugs(userId).then((slugs) => {
            setIsJoined(slugs.includes(hubId));
        });
    }, [userId, hubId]);

    const handleToggleJoin = async () => {
        if (isJoined) {
            const { error } = await leaveHub(userId, hubId);
            if (error) throw new Error(error);
        } else {
            const { error } = await joinHub(userId, hubId);
            if (error) throw new Error(error);
        }
    };


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
                        <PostPlaceholder />
                        <PostPlaceholder />
                        <PostPlaceholder />
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
                        {hub.items.length === 0 ? (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                No featured items yet.
                            </p>
                        ) : (
                            hub.items.map((item, i) => (
                                <ItemCard
                                    key={i}
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
                                                item_index: i,
                                                item_name: item.name,
                                            },
                                        });
                                        onSelectItem?.(i);
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
