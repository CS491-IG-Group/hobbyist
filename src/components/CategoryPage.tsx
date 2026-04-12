"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getCategoryById, type HubDetail } from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { supabase } from "../lib/supabase";
import { fetchHubsForHobbySlug, hubRowToDetail, type HubRow } from "../lib/hubDb";

/* ------------------------------------------------------------------ */
/*  Arrow icon (reused from DiscoverPage)                              */
/* ------------------------------------------------------------------ */
function ArrowIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

function BackIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Hub card (same visual style as DiscoverPage)                       */
/* ------------------------------------------------------------------ */
function HubCard({
    hub,
    onClick,
}: {
    hub: HubDetail;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="flex rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
            }}
        >
            {/* Banner gradient */}
            <div
                className="w-[140px] shrink-0 flex items-center justify-center text-3xl"
                style={{
                    background: `linear-gradient(135deg, ${hub.gradientFrom} 0%, ${hub.gradientTo} 100%)`,
                    minHeight: "140px",
                }}
            >
                <span className="text-4xl drop-shadow-lg">{hub.emoji}</span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
                <div>
                    <h3
                        className="text-base font-bold mb-1"
                        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                    >
                        {hub.name}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        {hub.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {hub.members.toLocaleString()} members
                    </span>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                        style={{
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "#a78bfa",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                        }}
                    >
                        <ArrowIcon />
                    </div>
                </div>
            </div>
        </div>
    );
}

function mergeHubList(
    mockCategory: ReturnType<typeof getCategoryById>,
    dbRows: HubRow[]
): HubDetail[] {
    const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]));

    if (mockCategory) {
        const merged: HubDetail[] = mockCategory.hubs.map((h) => {
            const row = dbBySlug.get(h.id);
            if (row) return hubRowToDetail(row, h.items);
            return h;
        });
        for (const row of dbRows) {
            if (!mockCategory.hubs.some((h) => h.id === row.slug)) {
                merged.push(hubRowToDetail(row, []));
            }
        }
        return merged;
    }

    return dbRows.map((r) => hubRowToDetail(r, []));
}

/* ================================================================== */
/*  CategoryPage                                                       */
/* ================================================================== */
interface CategoryPageProps {
    categoryId: string;
    onBack: () => void;
    onSelectHub: (hubId: string) => void;
}

type HobbyMeta = { name: string; desc: string | null };

export default function CategoryPage({
    categoryId,
    onBack,
    onSelectHub,
}: CategoryPageProps) {
    const { userId, sessionId } = useAnalytics();
    const mockCategory = getCategoryById(categoryId);
    const [dbHubRows, setDbHubRows] = useState<HubRow[]>([]);
    const [hobbyMeta, setHobbyMeta] = useState<HobbyMeta | null>(null);
    const [loading, setLoading] = useState(true);

    const hubs = useMemo(() => mergeHubList(mockCategory, dbHubRows), [mockCategory, dbHubRows]);

    const dwellRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "category",
        enabled: Boolean(mockCategory || hubs.length > 0 || hobbyMeta),
        metadata: { kind: "category_dwell", category_id: categoryId },
    });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setDbHubRows([]);
            const rows = await fetchHubsForHobbySlug(categoryId);
            const { data: hobby } = await supabase.from("hobbies").select("name, desc").eq("slug", categoryId).maybeSingle();
            if (!cancelled) {
                setDbHubRows(rows);
                if (hobby && typeof hobby === "object" && "name" in hobby) {
                    const h = hobby as { name: string; desc?: string | null };
                    setHobbyMeta({
                        name: h.name,
                        desc: h.desc ?? null,
                    });
                } else {
                    setHobbyMeta(null);
                }
                setLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [categoryId]);

    useEffect(() => {
        const name =
            mockCategory?.name ?? hobbyMeta?.name ?? categoryId;
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "category",
            metadata: { screen: "category", category_id: categoryId, category_name: name },
        });
    }, [userId, sessionId, categoryId, mockCategory?.name, hobbyMeta?.name]);

    const title = mockCategory?.name ?? hobbyMeta?.name ?? categoryId;
    const subtitle =
        mockCategory?.description ?? hobbyMeta?.desc ?? "Browse hubs in this category.";
    const emoji = mockCategory?.emoji ?? "✨";
    const gradFrom = mockCategory?.gradientFrom ?? "#312e81";
    const gradTo = mockCategory?.gradientTo ?? "#6366f1";

    const showEmpty = !loading && hubs.length === 0;

    if (showEmpty && !mockCategory && !hobbyMeta) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-8">
                <button
                    onClick={() => {
                        void logContentEvent({
                            userId,
                            sessionId,
                            eventType: "click",
                            uiLocation: "category",
                            metadata: { action: "back_to_discover", from: "category", category_id: categoryId },
                        });
                        onBack();
                    }}
                    className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: "#a78bfa" }}
                >
                    <BackIcon />
                    <span>Discover</span>
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                            background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
                        }}
                    >
                        ✨
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                        >
                            {categoryId}
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                            No hubs found for this hobby yet.
                        </p>
                    </div>
                </div>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Add hubs in Supabase for this hobby slug, or add this category to the local hub catalog.
                </p>
            </div>
        );
    }

    if (showEmpty && (mockCategory || hobbyMeta)) {
        return (
            <div ref={dwellRef} className="max-w-4xl mx-auto px-6 py-8">
                <button
                    onClick={() => {
                        void logContentEvent({
                            userId,
                            sessionId,
                            eventType: "click",
                            uiLocation: "category",
                            metadata: { action: "back_to_discover", from: "category", category_id: categoryId },
                        });
                        onBack();
                    }}
                    className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: "#a78bfa" }}
                >
                    <BackIcon />
                    <span>Discover</span>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
                        }}
                    >
                        {emoji}
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                        >
                            {title}
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No hubs in the database for this category yet.
                </p>
            </div>
        );
    }

    return (
        <div ref={dwellRef} className="max-w-4xl mx-auto px-6 py-8">
            {/* Back button */}
            <button
                onClick={() => {
                    void logContentEvent({
                        userId,
                        sessionId,
                        eventType: "click",
                        uiLocation: "category",
                        metadata: { action: "back_to_discover", from: "category", category_id: categoryId },
                    });
                    onBack();
                }}
                className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                style={{ color: "#a78bfa" }}
            >
                <BackIcon />
                <span>Discover</span>
            </button>

            {/* Category header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                        background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
                    }}
                >
                    {emoji}
                </div>
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                    >
                        {title}
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                        {subtitle}
                    </p>
                </div>
            </div>

            {loading && (
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                    Loading hubs…
                </p>
            )}

            {/* Hub cards grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                {hubs.map((hub) => (
                    <HubCard
                        key={hub.id}
                        hub={hub}
                        onClick={() => {
                            void logContentEvent({
                                userId,
                                sessionId,
                                eventType: "click",
                                uiLocation: "category",
                                metadata: {
                                    action: "open_hub",
                                    category_id: categoryId,
                                    hub_id: hub.id,
                                    hub_name: hub.name,
                                },
                            });
                            onSelectHub(hub.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
