"use client";
import React, { useState, useEffect } from "react";
import { getHubById, getItemByIndex, type ItemReview } from "./hubData";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";

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
    itemIndex: number;
    onBack: () => void;
}

export default function ItemDetailPage({
    categoryId,
    hubId,
    itemIndex,
    onBack,
}: ItemDetailPageProps) {
    const { userId, sessionId } = useAnalytics();
    const hub = getHubById(categoryId, hubId);
    const item = getItemByIndex(categoryId, hubId, itemIndex);

    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState("");
    const [userReviews, setUserReviews] = useState<ItemReview[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const impressionRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "discover",
        itemId: itemIndex,
        enabled: Boolean(hub && item),
        metadata: {
            kind: "item_detail_dwell",
            category_id: categoryId,
            hub_id: hubId,
            item_index: itemIndex,
            item_name: item?.name,
        },
    });

    useEffect(() => {
        const h = getHubById(categoryId, hubId);
        const it = getItemByIndex(categoryId, hubId, itemIndex);
        if (!h || !it) return;
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "discover",
            itemId: itemIndex,
            metadata: {
                screen: "item_detail",
                category_id: categoryId,
                hub_id: hubId,
                item_name: it.name,
            },
        });
    }, [userId, sessionId, categoryId, hubId, itemIndex]);

    if (!hub || !item) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8">
                <p style={{ color: "var(--text-muted)" }}>Item not found.</p>
            </div>
        );
    }

    const allReviews = [...userReviews, ...(item.reviews ?? [])];
    const reviewCount = allReviews.length;
    const displayRating = hoverRating || userRating;

    function handleSubmitReview() {
        if (userRating === 0 || reviewText.trim().length === 0) return;
        void logContentEvent({
            userId,
            sessionId,
            eventType: "click",
            uiLocation: "discover",
            itemId: itemIndex,
            metadata: {
                action: "submit_review",
                category_id: categoryId,
                hub_id: hubId,
                item_name: item.name,
                rating: userRating,
                review_char_len: reviewText.trim().length,
            },
        });
        const newReview: ItemReview = {
            author: "You",
            avatar: "YO",
            rating: userRating,
            text: reviewText.trim(),
            date: "Just now",
        };
        setUserReviews(prev => [newReview, ...prev]);
        setSubmitted(true);
        setReviewText("");
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
                        uiLocation: "discover",
                        itemId: itemIndex,
                        metadata: {
                            action: "back_to_hub",
                            category_id: categoryId,
                            hub_id: hubId,
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
                        {hub.emoji}
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
                            <RatingBadge rating={item.rating} />
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
                                disabled={reviewText.trim().length === 0}
                                className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                                    color: "#fff",
                                }}
                            >
                                Post Review
                            </button>
                        </div>
                    </div>
                )}

                {submitted && (
                    <p className="text-xs mt-3" style={{ color: "#22c55e" }}>
                        ✓ Review posted! Thank you for sharing your thoughts.
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
