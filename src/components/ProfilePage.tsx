"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";
import { PostCard } from "./TimelinePage";


const BADGES = [
    { icon: "🏆", label: "Top Poster", desc: "100+ posts" },
    { icon: "🌟", label: "Hub Veteran", desc: "15 hubs joined" },
    { icon: "💬", label: "Conversationalist", desc: "500+ replies" },
    { icon: "🔥", label: "On a Streak", desc: "30 day streak" },
    { icon: "🎯", label: "Goal Crusher", desc: "10 goals completed" },
    { icon: "👾", label: "Early Adopter", desc: "Joined at launch" },
];

type ProfilePost = {
    id: number;
    body: string;
    image_url: string | null;
    created_at: string;
    hub_name: string;
    hub_color: string;
};

type FollowPerson = {
    id: string;
    display_name: string;
    handle: string;
    isFollowing: boolean;
};

function FollowListModal({
    title,
    mode,
    people,
    loading,
    error,
    emptyLabel,
    onToggleFollow,
    onClose,
}: {
    title: string;
    mode: "followers" | "following";
    people: FollowPerson[];
    loading: boolean;
    error: string | null;
    emptyLabel: string;
    onToggleFollow: (person: FollowPerson) => Promise<void>;
    onClose: () => void;
}) {
    const overlayRef = useRef<HTMLDivElement>(null);

    function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) onClose();
    }

    return (
        <div
            ref={overlayRef}
            onClick={onOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    animation: "fadeSlideIn 0.2s ease",
                    maxHeight: "80vh",
                }}
            >
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                        style={{ background: "var(--surface2)", color: "var(--text-muted)" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                    {loading ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
                    ) : error ? (
                        <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
                    ) : people.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{emptyLabel}</p>
                    ) : people.map((person) => (
                        <div
                            key={person.id}
                            className="rounded-xl px-3 py-2 flex items-center justify-between gap-3"
                            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{person.display_name || "Unnamed user"}</p>
                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                    @{person.handle || "nohandle"}
                                </p>
                            </div>
                            {mode === "following" ? (
                                <button
                                    type="button"
                                    onClick={() => void onToggleFollow(person)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90 shrink-0"
                                    style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                                >
                                    Unfollow
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => void onToggleFollow(person)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90 shrink-0"
                                    style={{
                                        background: person.isFollowing ? "rgba(16,185,129,0.12)" : "rgba(139,92,246,0.15)",
                                        color: person.isFollowing ? "#10b981" : "#a78bfa",
                                        border: person.isFollowing ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(139,92,246,0.2)",
                                    }}
                                >
                                    {person.isFollowing ? "Following" : "Follow back"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
    label, icon, children, hint,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                {label}
            </label>
            <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
                <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>{icon}</span>
                {children}
            </div>
            {hint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
        </div>
    );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
interface ProfileData {
    display_name: string;
    handle: string;
    email: string;
    bio: string;
}

function EditProfileModal({
    userId,
    initial,
    onClose,
    onSaved,
}: {
    userId: string;
    initial: ProfileData;
    onClose: () => void;
    onSaved: (updated: ProfileData) => void;
}) {
    const [form, setForm] = useState<ProfileData>(initial);
    const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const handleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on backdrop click
    function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) onClose();
    }

    // Debounced handle availability check
    function onHandleChange(val: string) {
        setForm(f => ({ ...f, handle: val }));
        setError(null);
        if (handleTimer.current) clearTimeout(handleTimer.current);

        const cleaned = val.trim();
        if (!cleaned || cleaned === initial.handle) {
            setHandleStatus("idle");
            return;
        }
        if (!/^[a-zA-Z0-9_]{3,50}$/.test(cleaned)) {
            setHandleStatus("idle");
            return;
        }

        setHandleStatus("checking");
        handleTimer.current = setTimeout(async () => {
            const { data } = await supabase
                .from("users")
                .select("handle")
                .eq("handle", cleaned)
                .neq("id", userId)
                .maybeSingle();
            setHandleStatus(data ? "taken" : "available");
        }, 500);
    }

    async function handleSave() {
        setError(null);

        const handle = form.handle.trim();
        const display_name = form.display_name.trim();
        const bio = form.bio.trim();
        const email = form.email.trim();

        if (!display_name) { setError("Display name can't be empty."); return; }
        if (handle && !/^[a-zA-Z0-9_]{3,50}$/.test(handle)) {
            setError("Handle must be 3–50 characters: letters, numbers, or underscores.");
            return;
        }
        if (handleStatus === "taken") { setError("That handle is already taken."); return; }
        if (handleStatus === "checking") { setError("Still checking handle availability…"); return; }

        setSaving(true);
        try {
            // 1. Update public.users (display_name, handle, bio)
            const { error: dbErr } = await supabase
                .from("users")
                .update({
                    display_name,
                    handle: handle || null,
                    bio: bio || null,
                    onboarding_completed: true,
                })
                .eq("id", userId);
            if (dbErr) { setError(dbErr.message); return; }

            // 2. Update email via Auth if changed
            if (email !== initial.email) {
                const { error: authErr } = await supabase.auth.updateUser({ email });
                if (authErr) { setError(authErr.message); return; }
                setEmailSent(true);
            }

            onSaved({ display_name, handle, email, bio });
            if (email === initial.email) onClose();
        } finally {
            setSaving(false);
        }
    }

    const handleBorderColor =
        handleStatus === "taken" ? "#f87171"
            : handleStatus === "available" ? "#34d399"
                : "var(--border)";

    const handleHint =
        handleStatus === "checking" ? "Checking availability…"
            : handleStatus === "taken" ? "Handle already taken"
                : handleStatus === "available" ? "Handle is available ✓"
                    : "Letters, numbers and underscores only";

    return (
        <div
            ref={overlayRef}
            onClick={onOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    animation: "fadeSlideIn 0.2s ease",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
                    style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
                >
                    <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                        style={{ background: "var(--surface2)", color: "var(--text-muted)" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 py-5 space-y-4">
                    {/* Display name */}
                    <Field
                        label="Display Name"
                        icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        }
                    >
                        <input
                            type="text"
                            value={form.display_name}
                            onChange={e => { setForm(f => ({ ...f, display_name: e.target.value })); setError(null); }}
                            placeholder="Your name"
                            maxLength={100}
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                        />
                    </Field>

                    {/* Handle */}
                    <Field
                        label="Handle"
                        icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                            </svg>
                        }
                        hint={handleHint}
                    >
                        <div
                            className="flex-1 flex items-center gap-1 rounded-lg"
                            style={{ borderColor: handleBorderColor }}
                        >
                            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>@</span>
                            <input
                                type="text"
                                value={form.handle}
                                onChange={e => onHandleChange(e.target.value)}
                                placeholder="yourhandle"
                                maxLength={50}
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{
                                    color: "var(--text)",
                                    caretColor: "#a78bfa",
                                    borderBottom: `1px solid ${handleBorderColor}`,
                                    transition: "border-color 0.2s",
                                }}
                            />
                        </div>
                    </Field>

                    {/* Email */}
                    <Field
                        label="Email"
                        icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        }
                        hint={emailSent ? "Confirmation sent — check your inbox to verify the new address." : "A confirmation email will be sent if you change this."}
                    >
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(null); }}
                            placeholder="you@example.com"
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                        />
                    </Field>

                    {/* Bio */}
                    <Field
                        label="Bio"
                        icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        }
                        hint={`${form.bio.length}/300`}
                    >
                        <textarea
                            value={form.bio}
                            onChange={e => { setForm(f => ({ ...f, bio: e.target.value })); setError(null); }}
                            placeholder="Tell people a bit about yourself…"
                            maxLength={300}
                            rows={3}
                            className="flex-1 bg-transparent outline-none text-sm resize-none"
                            style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                        />
                    </Field>

                    {/* Error */}
                    {error && (
                        <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
                    )}

                    {/* Email confirmed notice */}
                    {emailSent && (
                        <div
                            className="rounded-xl px-4 py-3 text-sm"
                            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
                        >
                            Profile saved! Check your inbox to confirm your new email address.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex gap-3 px-6 py-4 sticky bottom-0"
                    style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
                >
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || handleStatus === "taken" || handleStatus === "checking"}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "var(--gradient-btn)" }}
                    >
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const { userId: analyticsUserId, sessionId } = useAnalytics();
    const [activeTab, setActiveTab] = useState<"posts" | "hubs" | "badges">("posts");
    const [showEditModal, setShowEditModal] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<ProfileData>({ display_name: "", handle: "", email: "", bio: "" });
    const [userHubs, setUserHubs] = useState<string[]>([]);
    const [authoredPosts, setAuthoredPosts] = useState<ProfilePost[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [openFollowModal, setOpenFollowModal] = useState<null | "followers" | "following">(null);
    const [followModalLoading, setFollowModalLoading] = useState(false);
    const [followModalError, setFollowModalError] = useState<string | null>(null);
    const [followModalPeople, setFollowModalPeople] = useState<FollowPerson[]>([]);
    const profileDwellRef = useContentImpression({
        userId: analyticsUserId,
        sessionId,
        uiLocation: "profile",
        metadata: { kind: "profile_screen_dwell" },
    });

    // log profile screen dwell
    useEffect(() => {
        void logContentEvent({
            userId: analyticsUserId,
            sessionId,
            eventType: "view",
            uiLocation: "profile",
            metadata: { screen: "profile_main" },
        });
    }, [analyticsUserId, sessionId]);

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

    // Load current user on mount
    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data } = await supabase
                .from("users")
                .select("display_name, handle, email, bio")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile({
                    display_name: data.display_name ?? "",
                    handle: data.handle ?? "",
                    email: data.email ?? user.email ?? "",
                    bio: data.bio ?? "",
                });
            }

            setPostsLoading(true);
            setPostsError(null);
            const { data: postsData, error: postsErr } = await supabase
                .from("posts")
                .select("id, body, image_url, created_at, hubs(name, gradient_from)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (postsErr) {
                setPostsError(postsErr.message);
                setAuthoredPosts([]);
                setPostsLoading(false);
                return;
            }

            const mappedPosts: ProfilePost[] = (postsData ?? []).map((post: any) => {
                const hub = Array.isArray(post.hubs) ? post.hubs[0] ?? null : post.hubs ?? null;
                return {
                    id: post.id,
                    body: post.body ?? "",
                    image_url: post.image_url ?? null,
                    created_at: post.created_at,
                    hub_name: hub?.name ?? "Unknown",
                    hub_color: hub?.gradient_from ?? "#8b5cf6",
                };
            });

            setAuthoredPosts(mappedPosts);
            setPostsLoading(false);

            const [{ count: followerRowsCount }, { count: followingRowsCount }] = await Promise.all([
                supabase
                    .from("user_follows")
                    .select("*", { count: "exact", head: true })
                    .eq("followed_id", user.id)
                    .eq("status", "following"),
                supabase
                    .from("user_follows")
                    .select("*", { count: "exact", head: true })
                    .eq("follower_id", user.id)
                    .eq("status", "following"),
            ]);

            setFollowersCount(followerRowsCount ?? 0);
            setFollowingCount(followingRowsCount ?? 0);
        }
        load();
    }, []);

    //fetch user hubs
    useEffect(() => {
        async function loadUserHubs() {
            if (!userId) return;
            const { data, error } = await supabase
                .from("user_hubs")
                .select("hub_id, hubs(slug)")
                .eq("user_id", userId);
            if (error) {
                if (process.env.NODE_ENV === "development") {
                    console.warn("[hubDb] fetchUserHubs", error.message);
                }
                return;
            }
            const hubs = data.map((row: any) => row.hubs?.slug).filter(Boolean);
            setUserHubs(hubs);
        }
        loadUserHubs();
    }, [userId]);

    function onProfileSaved(updated: ProfileData) {
        setProfile(updated);
    }

    async function openFollowList(type: "followers" | "following") {
        if (!userId) return;
        setOpenFollowModal(type);
        setFollowModalLoading(true);
        setFollowModalError(null);
        setFollowModalPeople([]);

        const sourceColumn = type === "followers" ? "followed_id" : "follower_id";
        const targetColumn = type === "followers" ? "follower_id" : "followed_id";

        const { data: followRows, error: followErr } = await supabase
            .from("user_follows")
            .select(targetColumn)
            .eq(sourceColumn, userId)
            .eq("status", "following");

        if (followErr) {
            setFollowModalError(followErr.message);
            setFollowModalLoading(false);
            return;
        }

        const targetIds = (followRows ?? [])
            .map((row: any) => row[targetColumn] as string)
            .filter(Boolean);

        if (targetIds.length === 0) {
            setFollowModalPeople([]);
            setFollowModalLoading(false);
            return;
        }

        const { data: usersData, error: usersErr } = await supabase
            .from("users")
            .select("id, display_name, handle")
            .in("id", targetIds);

        if (usersErr) {
            setFollowModalError(usersErr.message);
            setFollowModalLoading(false);
            return;
        }

        const { data: myFollowingRows, error: myFollowingErr } = await supabase
            .from("user_follows")
            .select("followed_id")
            .eq("follower_id", userId)
            .eq("status", "following")
            .in("followed_id", targetIds);

        if (myFollowingErr) {
            setFollowModalError(myFollowingErr.message);
            setFollowModalLoading(false);
            return;
        }

        const myFollowingSet = new Set(
            (myFollowingRows ?? []).map((row: any) => row.followed_id as string).filter(Boolean)
        );

        const peopleById = new Map(
            (usersData ?? []).map((user: any) => [
                user.id,
                {
                    id: user.id as string,
                    display_name: (user.display_name ?? "") as string,
                    handle: (user.handle ?? "") as string,
                    isFollowing: myFollowingSet.has(user.id as string),
                },
            ])
        );

        const orderedPeople = targetIds
            .map((id) => peopleById.get(id))
            .filter((person): person is FollowPerson => Boolean(person));

        setFollowModalPeople(orderedPeople);
        setFollowModalLoading(false);
    }

    async function toggleFollowFromModal(person: FollowPerson) {
        if (!userId || person.id === userId) return;

        if (person.isFollowing) {
            const { error } = await supabase
                .from("user_follows")
                .delete()
                .eq("follower_id", userId)
                .eq("followed_id", person.id);
            if (error) {
                setFollowModalError(error.message);
                return;
            }
        } else {
            const { error } = await supabase
                .from("user_follows")
                .upsert(
                    { follower_id: userId, followed_id: person.id, status: "following" },
                    { onConflict: "follower_id,followed_id" }
                );
            if (error) {
                setFollowModalError(error.message);
                return;
            }
        }

        setFollowModalError(null);
        await openFollowList(openFollowModal ?? "followers");

        const [{ count: followerRowsCount }, { count: followingRowsCount }] = await Promise.all([
            supabase
                .from("user_follows")
                .select("*", { count: "exact", head: true })
                .eq("followed_id", userId)
                .eq("status", "following"),
            supabase
                .from("user_follows")
                .select("*", { count: "exact", head: true })
                .eq("follower_id", userId)
                .eq("status", "following"),
        ]);
        setFollowersCount(followerRowsCount ?? 0);
        setFollowingCount(followingRowsCount ?? 0);
    }

    return (
        <div ref={profileDwellRef} className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Header card */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="flex items-center gap-5 px-6 py-4 rounded-2xl w-full"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}
                            >
                                🎮
                            </div>
                            <div
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                                style={{ background: "#22c55e", borderColor: "var(--surface)" }}
                            />
                        </div>

                        {/* Name + handle + bio */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                                    {profile.display_name || "—"}
                                </h1>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}
                                >
                                    Active
                                </span>
                            </div>
                            {profile.handle && (
                                <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>@{profile.handle}</p>
                            )}
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                {profile.bio || "No bio yet."}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-10 shrink-0" style={{ background: "var(--border)" }} />

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-5 shrink-0">
                            <div className="text-center">
                                <p className="text-base font-bold">{userHubs.length}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hubs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold">{authoredPosts.length}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Posts</p>
                            </div>
                            <button className="text-center hover:opacity-80" onClick={() => void openFollowList("followers")}>
                                <p className="text-base font-bold">{followersCount}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Followers</p>
                            </button>
                            <button className="text-center hover:opacity-80" onClick={() => void openFollowList("following")}>
                                <p className="text-base font-bold">{followingCount}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Following</p>
                            </button>
                        </div>
                    </div>

                    {/* Mobile stats */}
                    <div className="flex sm:hidden items-center justify-around w-full mt-3 px-2">
                        <div className="text-center">
                            <p className="text-base font-bold">{userHubs.length}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hubs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold">{authoredPosts.length}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Posts</p>
                        </div>
                        <button className="text-center hover:opacity-80" onClick={() => void openFollowList("followers")}>
                            <p className="text-base font-bold">{followersCount}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Followers</p>
                        </button>
                        <button className="text-center hover:opacity-80" onClick={() => void openFollowList("following")}>
                            <p className="text-base font-bold">{followingCount}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Following</p>
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 w-full mt-3">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => {
                                void logContentEvent({
                                    userId: analyticsUserId,
                                    sessionId,
                                    eventType: "click",
                                    uiLocation: "profile",
                                    metadata: { action: "open_account_settings" },
                                });
                                onOpenSettings?.();
                            }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                        >
                            Account Settings
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 mb-6 p-1 rounded-xl"
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                >
                    {(["posts", "hubs", "badges"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                void logContentEvent({
                                    userId: analyticsUserId,
                                    sessionId,
                                    eventType: "click",
                                    uiLocation: "profile",
                                    metadata: { action: "profile_tab", tab, previous_tab: activeTab },
                                });
                                setActiveTab(tab);
                            }}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                            style={{
                                background: activeTab === tab ? "var(--gradient-btn)" : "transparent",
                                color: activeTab === tab ? "#fff" : "var(--text-muted)",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === "posts" && (
                    <div className="space-y-3">
                        {postsLoading ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Loading posts...
                            </p>
                        ) : postsError ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Could not load posts: {postsError}
                            </p>
                        ) : authoredPosts.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                No posts yet.
                            </p>
                        ) : authoredPosts.map((post, i) => (
                            <PostCard
                                key={post.id}
                                heightClass="h-48"
                                post={{
                                    id: post.id,
                                    authorId: userId ?? "",
                                    ownerId: userId ?? "",
                                    user: profile.display_name || "You",
                                    handle: profile.handle ? `@${profile.handle.replace(/^@/, "")}` : "@you",
                                    avatar: "🎮",
                                    avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
                                    hub: post.hub_name,
                                    hubId: null,
                                    hobbySlug: null,
                                    tags: [],
                                    userTags: [],
                                    hubColor: post.hub_color,
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
                                onDelete={() => { }}
                                initialLikeCount={0}
                                initialIsLiked={false}
                                initialCommentCount={0}
                                initialIsFollowing={false}

                            />
                        ))}
                    </div>
                )}

                {activeTab === "hubs" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Todo: Update UI for hubs, add Hub name and icon(?) */}
                        {userHubs.map(hub => (
                            <div
                                key={hub}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    void logContentEvent({
                                        userId: analyticsUserId,
                                        sessionId,
                                        eventType: "click",
                                        uiLocation: "profile",
                                        metadata: { action: "profile_hub_tile_tap", hub: hub },
                                    });
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        void logContentEvent({
                                            userId: analyticsUserId,
                                            sessionId,
                                            eventType: "click",
                                            uiLocation: "profile",
                                            metadata: { action: "profile_hub_tile_tap", hub: hub },
                                        });
                                    }
                                }}
                                className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:opacity-80 cursor-pointer"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <span className="text-sm font-semibold truncate"> HUB: {hub} </span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "badges" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {BADGES.map(badge => (
                            <div
                                key={badge.label}
                                className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div className="text-3xl">{badge.icon}</div>
                                <p className="text-sm font-bold">{badge.label}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{badge.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && userId && (
                <EditProfileModal
                    userId={userId}
                    initial={profile}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updated) => { onProfileSaved(updated); setShowEditModal(false); }}
                />
            )}
            {openFollowModal && (
                <FollowListModal
                    title={openFollowModal === "followers" ? "Followers" : "Following"}
                    mode={openFollowModal}
                    people={followModalPeople}
                    loading={followModalLoading}
                    error={followModalError}
                    emptyLabel={openFollowModal === "followers" ? "No followers yet." : "Not following anyone yet."}
                    onToggleFollow={toggleFollowFromModal}
                    onClose={() => setOpenFollowModal(null)}
                />
            )}
        </div>
    );
}