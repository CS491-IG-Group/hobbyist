"use client";
import React, { useState, useEffect } from "react";
import { getHubById, type ItemReview } from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { supabase } from "../lib/supabase";
import { fetchHubBySlug } from "../lib/hubDb";

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

/* ------------------------------------------------------------------ */
/*  Star component                                                     */
/* ------------------------------------------------------------------ */
function Star({
    filled,
    half,
    size = 20,
    color = "#facc15",
    onClick,
    onMouseEnter,
    onMouseLeave,
    interactive = false,
}: {
    filled: boolean;
    half?: boolean;
    size?: number;
    color?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    interactive?: boolean;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? color : "none"}
            stroke={color}
            strokeWidth="1.5"
            style={{ cursor: interactive ? "pointer" : "default", transition: "transform 0.15s" }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={interactive ? "hover:scale-110" : ""}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Rating badge (purple pill with star)                               */
/* ------------------------------------------------------------------ */
function RatingBadge({ rating }: { rating: string }) {
    return (
        <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
        >
            <Star filled size={16} color="#facc15" />
            <span className="text-white font-bold text-sm">{rating}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Review card                                                        */
/* ------------------------------------------------------------------ */
function ReviewCard({ review }: { review: ItemReview }) {
    return (
        <div
            className="rounded-xl p-5 transition-all"
            style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                            color: "#fff",
                        }}
                    >
                        {review.avatar}
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                            {review.author}
                        </p>
                    </div>
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {review.date}
                </span>
            </div>

            {/* Star row */}
            <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: 10 }, (_, i) => (
                    <Star key={i} filled={i < review.rating} size={16} />
                ))}
                <span className="ml-2 text-xs font-bold" style={{ color: "var(--text)" }}>
                    {review.rating}/10
                </span>
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--text-dim)" }}>
                {review.text}
            </p>
        </div>
    );
}

/* ================================================================== */
/*  ItemDetailPage                                                     */
/* ================================================================== */
interface ItemDetailPageProps {
    categoryId: string;
    hubId: string;
    itemId: number;
    onBack: () => void;
}

export default function ItemDetailPage({
    categoryId,
    hubId,
    itemId,
    onBack,
}: ItemDetailPageProps) {
    const { userId, sessionId } = useAnalytics();
    const hub = getHubById(categoryId, hubId);
    const [dbItem, setDbItem] = useState<{ name: string; item_type: string | null; description: string | null; image_url: string | null } | null>(null);
    const item = dbItem
        ? {
            name: dbItem.name,
            year: dbItem.item_type ?? "item",
            rating: "N/A",
            genre: dbItem.item_type ?? undefined,
            description: dbItem.description ?? "",
            reviews: [],
        }
        : null;

    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState<ItemReview[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const [lists, setLists] = useState<Array<{ id: string; title: string }>>([]);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [savingToList, setSavingToList] = useState(false);
    const [listSaveMessage, setListSaveMessage] = useState<string | null>(null);
    const [listSaveError, setListSaveError] = useState<string | null>(null);

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

    function initialsFromName(name: string): string {
        const parts = name
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        if (parts.length === 0) return "US";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }

    const impressionRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "item_detail",
        enabled: Boolean(hub && item),
        metadata: {
            kind: "item_detail_dwell",
            category_id: categoryId,
            hub_id: hubId,
            item_id: itemId,
            item_name: item?.name,
        },
    });

    useEffect(() => {
        let cancelled = false;
        const loadItem = async () => {
            const hubRow = await fetchHubBySlug(hubId);
            if (!hubRow?.id) {
                if (!cancelled) setDbItem(null);
                return;
            }
            const { data, error } = await supabase
                .from("items")
                .select("name, item_type, description, image_url")
                .eq("id", itemId)
                .eq("hub_id", hubRow.id)
                .maybeSingle();
            if (cancelled) return;
            if (error || !data) {
                setDbItem(null);
                return;
            }
            setDbItem(data);
        };
        void loadItem();
        return () => {
            cancelled = true;
        };
    }, [hubId, itemId]);

    useEffect(() => {
        let cancelled = false;
        const loadReviews = async () => {
            const { data, error } = await supabase
                .from("item_reviews")
                .select("id, rating, review_text, created_at, updated_at, user_id, users!user_id(display_name, handle)")
                .eq("item_id", itemId)
                .order("updated_at", { ascending: false });

            if (cancelled) return;
            if (error) {
                setReviews([]);
                return;
            }

            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            const mapped: ItemReview[] = (data ?? []).map((row: any) => {
                const profile = Array.isArray(row.users) ? row.users[0] ?? null : row.users ?? null;
                const displayName =
                    profile?.display_name?.trim() ||
                    profile?.handle?.trim()?.replace(/^@/, "") ||
                    "Member";
                const dateSource = row.updated_at ?? row.created_at;
                return {
                    author: displayName,
                    avatar: initialsFromName(displayName),
                    rating: Number(row.rating) || 0,
                    text: row.review_text ?? "",
                    date: formatTimeAgo(dateSource),
                };
            });

            setReviews(mapped);

            // Pre-fill review UI for current user if they already reviewed this item.
            if (authUser?.id) {
                const mine = (data ?? []).find((row: any) => row.user_id === authUser.id);
                if (mine) {
                    setUserRating(Number(mine.rating) || 0);
                    setReviewText(mine.review_text ?? "");
                }
            }
        };

        void loadReviews();
        return () => {
            cancelled = true;
        };
    }, [itemId]);

    useEffect(() => {
        let cancelled = false;
        const loadUserLists = async () => {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (cancelled) return;
            setAuthUserId(authUser?.id ?? null);

            if (!authUser?.id) {
                setLists([]);
                setSelectedListId("");
                return;
            }

            const { data, error } = await supabase
                .from("lists")
                .select("id, title")
                .eq("user_id", authUser.id)
                .order("created_at", { ascending: true });
            if (cancelled) return;
            if (error) {
                setLists([]);
                setSelectedListId("");
                return;
            }

            const rows = (data ?? []) as Array<{ id: string; title: string }>;
            setLists(rows);
            setSelectedListId((prev) => prev || rows[0]?.id || "");
        };
        void loadUserLists();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const h = getHubById(categoryId, hubId);
        const it = item;
        if (!h || !it) return;
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "item_detail",
            metadata: {
                screen: "item_detail",
                category_id: categoryId,
                hub_id: hubId,
                item_id: itemId,
                item_name: it.name,
            },
        });
    }, [userId, sessionId, categoryId, hubId, itemId, item]);

    if (!hub || !item) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: "#a78bfa" }}
                >
                    <BackIcon />
                    <span>Back</span>
                </button>
                <p style={{ color: "var(--text-muted)" }}>Item not found.</p>
            </div>
        );
    }

    const allReviews = reviews;
    const reviewCount = allReviews.length;
    const displayRating = hoverRating || userRating;
    const averageRating =
        reviewCount > 0
            ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
            : item.rating;

    async function handleSubmitReview() {
        if (userRating === 0 || reviewText.trim().length === 0) return;
        setSubmitError(null);
        void logContentEvent({
            userId,
            sessionId,
            eventType: "click",
            uiLocation: "item_detail",
            metadata: {
                action: "submit_review",
                category_id: categoryId,
                hub_id: hubId,
                item_id: itemId,
                item_name: item.name,
                rating: userRating,
                review_char_len: reviewText.trim().length,
            },
        });

        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
            setSubmitError("You must be signed in to post a review.");
            return;
        }

        setSubmitting(true);
        const { error } = await supabase
            .from("item_reviews")
            .upsert(
                {
                    item_id: itemId,
                    user_id: authUser.id,
                    rating: userRating,
                    review_text: reviewText.trim(),
                },
                { onConflict: "item_id,user_id" }
            );

        if (error) {
            setSubmitError(error.message);
            setSubmitting(false);
            return;
        }

        const { data, error: refetchError } = await supabase
            .from("item_reviews")
            .select("id, rating, review_text, created_at, updated_at, users!user_id(display_name, handle)")
            .eq("item_id", itemId)
            .order("updated_at", { ascending: false });
        setSubmitting(false);
        if (refetchError) {
            setSubmitError(refetchError.message);
            return;
        }

        const mapped: ItemReview[] = (data ?? []).map((row: any) => {
            const profile = Array.isArray(row.users) ? row.users[0] ?? null : row.users ?? null;
            const displayName =
                profile?.display_name?.trim() ||
                profile?.handle?.trim()?.replace(/^@/, "") ||
                "Member";
            const dateSource = row.updated_at ?? row.created_at;
            return {
                author: displayName,
                avatar: initialsFromName(displayName),
                rating: Number(row.rating) || 0,
                text: row.review_text ?? "",
                date: formatTimeAgo(dateSource),
            };
        });

        setReviews(mapped);
        setSubmitted(true);
    }

    async function handleAddToList() {
        if (!authUserId) {
            setListSaveError("You must be signed in to add items to lists.");
            setListSaveMessage(null);
            return;
        }
        if (!selectedListId) {
            setListSaveError("Select a list first.");
            setListSaveMessage(null);
            return;
        }

        setSavingToList(true);
        setListSaveError(null);
        setListSaveMessage(null);

        const { data: existing, error: existsErr } = await supabase
            .from("list_items")
            .select("id")
            .eq("list_id", selectedListId)
            .eq("item_id", itemId)
            .maybeSingle();
        if (existsErr) {
            setSavingToList(false);
            setListSaveError(existsErr.message);
            return;
        }
        if (existing) {
            setSavingToList(false);
            setListSaveMessage("Item is already in that list.");
            return;
        }

        const { error } = await supabase
            .from("list_items")
            .insert({
                list_id: selectedListId,
                item_id: itemId,
                title: item.name,
                status: "planned",
            });

        setSavingToList(false);
        if (error) {
            setListSaveError(error.message);
            return;
        }
        setListSaveMessage("Added to list.");
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("lists-updated", { detail: { listId: selectedListId } }));
        }
    }

    return (
        <div ref={impressionRef} className="max-w-3xl mx-auto px-6 py-8">
            {/* Back button */}
            <button
                onClick={() => {
                    void logContentEvent({
                        userId,
                        sessionId,
                        eventType: "click",
                        uiLocation: "item_detail",
                        metadata: {
                            action: "back_to_hub",
                            category_id: categoryId,
                            hub_id: hubId,
                            item_id: itemId,
                            item_name: item.name,
                        },
                    });
                    onBack();
                }}
                className="flex items-center gap-1 mb-6 text-sm font-medium transition-all hover:opacity-80"
                style={{ color: "#a78bfa" }}
            >
                <BackIcon />
                <span>{hub.name}</span>
            </button>

            {/* ── Hero card ──────────────────────────────────────────── */}
            <div
                className="rounded-2xl p-6 mb-6"
                style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                }}
            >
                <div className="flex flex-col sm:flex-row gap-5">
                    {/* Image placeholder */}
                    <div
                        className="w-full sm:w-48 h-48 rounded-xl shrink-0 flex items-center justify-center text-5xl"
                        style={{
                            background: `linear-gradient(135deg, ${hub.gradientFrom}, ${hub.gradientTo})`,
                        }}
                    >
                        {dbItem?.image_url ? (
                            <img
                                src={dbItem.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            hub.emoji
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1
                            className="text-2xl font-bold mb-1"
                            style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
                        >
                            {item.name}
                        </h1>

                        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                            {item.year}
                            {item.genre && (
                                <>
                                    {" · "}
                                    <span style={{ color: "var(--text-dim)" }}>{item.genre}</span>
                                </>
                            )}
                        </p>

                        {item.description && (
                            <p
                                className="text-sm leading-relaxed mb-4"
                                style={{ color: "var(--text-dim)" }}
                            >
                                {item.description}
                            </p>
                        )}

                        {/* Rating badge + count */}
                        <div className="flex items-center gap-3">
                            <RatingBadge rating={averageRating} />
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                <strong style={{ color: "var(--text)" }}>{reviewCount}</strong>{" "}
                                {reviewCount === 1 ? "review" : "reviews"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Average Rating
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Rate This ──────────────────────────────────────────── */}
            <div
                className="rounded-2xl p-6 mb-6"
                style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                }}
            >
                <h2
                    className="text-lg font-bold mb-3"
                    style={{ fontFamily: "Syne, sans-serif", color: "#a78bfa" }}
                >
                    Add to List
                </h2>
                {lists.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        No lists yet. Create one from your profile sidebar.
                    </p>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <select
                            value={selectedListId}
                            onChange={(e) => setSelectedListId(e.target.value)}
                            className="rounded-xl px-3 py-2 text-sm outline-none flex-1"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                color: "var(--text)",
                            }}
                        >
                            {lists.map((list) => (
                                <option key={list.id} value={list.id}>
                                    {list.title}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddToList}
                            disabled={savingToList}
                            className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                                color: "#fff",
                            }}
                        >
                            {savingToList ? "Adding..." : "Add Item"}
                        </button>
                    </div>
                )}
                {listSaveMessage && (
                    <p className="text-xs mt-3" style={{ color: "#22c55e" }}>
                        {listSaveMessage}
                    </p>
                )}
                {listSaveError && (
                    <p className="text-xs mt-3" style={{ color: "#f87171" }}>
                        {listSaveError}
                    </p>
                )}
            </div>

            <div
                className="rounded-2xl p-6 mb-8"
                style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                }}
            >
                <h2
                    className="text-lg font-bold mb-3"
                    style={{ fontFamily: "Syne, sans-serif", color: "#a78bfa" }}
                >
                    Rate This
                </h2>

                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {Array.from({ length: 10 }, (_, i) => (
                        <Star
                            key={i}
                            filled={i < displayRating}
                            size={28}
                            interactive
                            onClick={() => { setUserRating(i + 1); setSubmitted(false); }}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            onMouseLeave={() => { }}
                        />
                    ))}
                    {displayRating > 0 && (
                        <span
                            className="ml-3 text-sm font-bold"
                            style={{ color: "var(--text)" }}
                        >
                            {displayRating}/10
                        </span>
                    )}
                </div>

                {/* Review textarea — appears after selecting a rating */}
                {userRating > 0 && !submitted && (
                    <div className="mt-4" style={{ animation: "fadeSlideIn 0.3s ease-out" }}>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review..."
                            rows={4}
                            className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all focus:ring-2"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                color: "var(--text)",
                            }}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Your rating: {userRating}/10
                            </p>
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewText.trim().length === 0 || submitting}
                                className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                                    color: "#fff",
                                }}
                            >
                                {submitting ? "Posting..." : "Post Review"}
                            </button>
                        </div>
                    </div>
                )}

                {submitted && (
                    <p className="text-xs mt-3" style={{ color: "#22c55e" }}>
                        ✓ Review posted! Thank you for sharing your thoughts.
                    </p>
                )}
                {submitError && (
                    <p className="text-xs mt-3" style={{ color: "#f87171" }}>
                        {submitError}
                    </p>
                )}
            </div>

            {/* ── Reviews ────────────────────────────────────────────── */}
            <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}
            >
                Reviews ({reviewCount})
            </h2>

            {reviewCount === 0 ? (
                <div
                    className="rounded-2xl p-8 text-center"
                    style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        No reviews yet. Be the first to share your thoughts!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {allReviews.map((review, i) => (
                        <ReviewCard key={i} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}
