"use client";
import React, { useState, useEffect } from "react";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { useContentImpression } from "../lib/useContentImpression";

const HUB_POSTS: Record<string, Array<{
    id: number; user: string; handle: string; avatar: string;
    avatarBg: string; time: string; text: string; image: string | null;
    likes: number; comments: number; reposts: number;
}>> = {
    Cars: [
        { id: 1, user: "Alex Rivera", handle: "@alexrivera", avatar: "🚗", avatarBg: "linear-gradient(135deg, #1e1b4b, #1e40af)", time: "2m ago", text: "Just got back from a track day in my STI. Nothing beats a perfectly executed apex 🔧🏁", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop", likes: 214, comments: 53, reposts: 28 },
        { id: 2, user: "Marco Diaz", handle: "@marcodiaz", avatar: "🏎️", avatarBg: "linear-gradient(135deg, #7c2d12, #991b1b)", time: "1h ago", text: "Finally finished the engine swap on my E30. 6 months of weekends but she purrs like a dream now 🔩❤️", image: null, likes: 178, comments: 44, reposts: 19 },
        { id: 3, user: "Nina Park", handle: "@ninapark", avatar: "⚡", avatarBg: "linear-gradient(135deg, #1e3a5f, #1e40af)", time: "3h ago", text: "Model S Plaid on a track is genuinely insane. The instant torque never gets old, even after 50 runs 🤯", image: null, likes: 302, comments: 89, reposts: 61 },
    ],
    Fitness: [
        { id: 1, user: "Jordan Lee", handle: "@jordanlee", avatar: "💪", avatarBg: "linear-gradient(135deg, #064e3b, #065f46)", time: "15m ago", text: "Finally hit a 200kg deadlift after 2 years of grinding. Trust the process 💚", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop", likes: 389, comments: 74, reposts: 45 },
        { id: 2, user: "Priya Nair", handle: "@priyanair", avatar: "🧘", avatarBg: "linear-gradient(135deg, #4a044e, #701a75)", time: "2h ago", text: "Morning yoga + cold plunge combo is my secret weapon. Energy levels are unreal all day ☀️🧊", image: null, likes: 241, comments: 38, reposts: 27 },
        { id: 3, user: "Devon Walsh", handle: "@devonwalsh", avatar: "🏃", avatarBg: "linear-gradient(135deg, #14532d, #166534)", time: "5h ago", text: "Ran my first marathon today! 4h 12m — not a world record but I am absolutely over the moon 🏅", image: null, likes: 612, comments: 143, reposts: 98 },
    ],
    Technology: [
        { id: 1, user: "Sam Chen", handle: "@samchen", avatar: "💻", avatarBg: "linear-gradient(135deg, #1c1917, #44403c)", time: "1h ago", text: "M4 MacBook Pro benchmarks are wild. Single core beating workstation chips from 2 years ago 🚀", image: null, likes: 512, comments: 118, reposts: 89 },
        { id: 2, user: "Lena Voss", handle: "@lenavoss", avatar: "🤖", avatarBg: "linear-gradient(135deg, #1e1b4b, #312e81)", time: "3h ago", text: "The pace of AI tooling in 2024 is genuinely hard to keep up with. Something new every single week 🤯", image: null, likes: 334, comments: 92, reposts: 55 },
        { id: 3, user: "Amir Hassan", handle: "@amirhassan", avatar: "🛠️", avatarBg: "linear-gradient(135deg, #431407, #7c2d12)", time: "6h ago", text: "Finally switched from Vim to Neovim with lazy.nvim and I genuinely cannot go back. Config is a work of art ✨", image: null, likes: 198, comments: 67, reposts: 31 },
    ],
    Movies: [
        { id: 1, user: "Maya Patel", handle: "@mayapatel", avatar: "🎬", avatarBg: "linear-gradient(135deg, #831843, #9d174d)", time: "2h ago", text: "Dune Part 2 is a cinematic masterpiece. Villeneuve on a completely different level 🎥✨", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop", likes: 631, comments: 142, reposts: 97 },
        { id: 2, user: "Felix Grant", handle: "@felixgrant", avatar: "🍿", avatarBg: "linear-gradient(135deg, #1c1917, #292524)", time: "4h ago", text: "Rewatched Blade Runner 2049 for the 5th time. Deakins' cinematography makes my brain melt every single time 😍", image: null, likes: 445, comments: 88, reposts: 72 },
        { id: 3, user: "Aria Moon", handle: "@ariamoon", avatar: "🌙", avatarBg: "linear-gradient(135deg, #1e1b4b, #4c1d95)", time: "1d ago", text: "The new A24 lineup for next year looks absolutely stacked. They just cannot miss 🎭", image: null, likes: 287, comments: 54, reposts: 39 },
    ],
    Photography: [
        { id: 1, user: "Chris Booker", handle: "@chrisbooker", avatar: "📸", avatarBg: "linear-gradient(135deg, #1e3a5f, #1e40af)", time: "3h ago", text: "Golden hour in the mountains. Shot on film with my Contax T2 — analog just hits different 🌄", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop", likes: 428, comments: 63, reposts: 51 },
        { id: 2, user: "Yuki Sato", handle: "@yukisato", avatar: "🌸", avatarBg: "linear-gradient(135deg, #831843, #9d174d)", time: "6h ago", text: "Street photography in Tokyo at 2am is a completely different world. The neon reflections on wet pavement 🗼", image: null, likes: 519, comments: 97, reposts: 63 },
        { id: 3, user: "Omar Bey", handle: "@omarbey", avatar: "🎞️", avatarBg: "linear-gradient(135deg, #1c1917, #44403c)", time: "1d ago", text: "Finally developed my first roll of black and white film. The grain and contrast on Ilford HP5 is unbeatable 🖤", image: null, likes: 312, comments: 48, reposts: 34 },
    ],
    Cooking: [
        { id: 1, user: "Taylor Kim", handle: "@taylorkim", avatar: "🍳", avatarBg: "linear-gradient(135deg, #14532d, #166534)", time: "5h ago", text: "Homemade ramen from scratch — 12 hours for the tonkotsu broth and worth every minute 🍜🔥", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop", likes: 295, comments: 67, reposts: 38 },
        { id: 2, user: "Sofia Reyes", handle: "@sofiareyes", avatar: "🌮", avatarBg: "linear-gradient(135deg, #7c2d12, #92400e)", time: "1d ago", text: "Homemade birria tacos for the third weekend in a row. The consommé for dipping is the real star 🤤", image: null, likes: 481, comments: 102, reposts: 74 },
        { id: 3, user: "Ben Marsh", handle: "@benmarsh", avatar: "🍞", avatarBg: "linear-gradient(135deg, #1c1917, #292524)", time: "2d ago", text: "72 hour cold fermented sourdough. The open crumb finally clicked after months of failed attempts 🥖✨", image: null, likes: 367, comments: 81, reposts: 49 },
    ],
    Gaming: [
        { id: 1, user: "Kai Nomura", handle: "@kainomura", avatar: "🎮", avatarBg: "linear-gradient(135deg, #2e1065, #5b21b6)", time: "30m ago", text: "Elden Ring Shadow of the Erdtree DLC just destroyed me for the 4th time. I love and hate this game equally 😭⚔️", image: null, likes: 543, comments: 128, reposts: 87 },
        { id: 2, user: "Zara Fox", handle: "@zarafox", avatar: "🕹️", avatarBg: "linear-gradient(135deg, #1e1b4b, #312e81)", time: "2h ago", text: "Baldur's Gate 3 is genuinely one of the greatest games ever made. 300 hours in and still discovering new things 🎲", image: null, likes: 712, comments: 189, reposts: 143 },
        { id: 3, user: "Leo Tran", handle: "@leotran", avatar: "👾", avatarBg: "linear-gradient(135deg, #064e3b, #065f46)", time: "4h ago", text: "Hit Diamond in Valorant after 2 seasons of grinding. The ranked system is brutal but the climb is so satisfying 💎", image: null, likes: 334, comments: 76, reposts: 42 },
    ],
};

const HUB_INFO: Record<string, { emoji: string; color: string; members: number; description: string; banner: string }> = {
    Cars: { emoji: "🚗", color: "#3b82f6", members: 18200, description: "Everything cars — builds, track days, mods, and the culture around them.", banner: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 50%, #1e40af 100%)" },
    Fitness: { emoji: "💪", color: "#10b981", members: 24500, description: "Workouts, nutrition, PRs, and the mindset behind building a stronger you.", banner: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" },
    Technology: { emoji: "💻", color: "#f59e0b", members: 31100, description: "Dev tools, hardware, AI, and everything shaping the future of tech.", banner: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)" },
    Movies: { emoji: "🎬", color: "#ec4899", members: 15800, description: "Cinema lovers unite — reviews, recommendations, and deep dives.", banner: "linear-gradient(135deg, #4a044e 0%, #701a75 50%, #831843 100%)" },
    Photography: { emoji: "📸", color: "#6366f1", members: 9300, description: "Film, digital, street, landscape — all things photography.", banner: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" },
    Cooking: { emoji: "🍳", color: "#ef4444", members: 12700, description: "Recipes, techniques, and the joy of making something delicious from scratch.", banner: "linear-gradient(135deg, #7c2d12 0%, #92400e 50%, #b45309 100%)" },
    Gaming: { emoji: "🎮", color: "#8b5cf6", members: 22400, description: "Games, reviews, clips, and the community behind the controller.", banner: "linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #5b21b6 100%)" },
};

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function HubPostCard({
    post,
    hubColor,
    hubName,
}: {
    post: typeof HUB_POSTS["Cars"][0];
    hubColor: string;
    hubName: string;
}) {
    const { userId, sessionId } = useAnalytics();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const impressionRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "hub_profile",
        postId: post.id,
        metadata: {
            kind: "hub_feed_post_impression",
            hub: hubName,
            hub_color: hubColor,
            client_post_key: `${hubName}:${post.id}`,
        },
    });

    const onLike = () => {
        const next = !liked;
        setLiked(next);
        setLikeCount(next ? likeCount + 1 : likeCount - 1);
        void logContentEvent({
            userId,
            sessionId,
            eventType: "like",
            postId: post.id,
            uiLocation: "hub_profile",
            metadata: { hub: hubName, author_handle: post.handle, client_post_key: `${hubName}:${post.id}` },
        });
    };

    return (
        <div
            ref={impressionRef}
            className="rounded-2xl p-5 transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: post.avatarBg }}>{post.avatar}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{post.user}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.handle}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>· {post.time}</span>
                    </div>
                </div>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>{post.text}</p>
            {post.image && (
                <div className="rounded-xl overflow-hidden mb-3" style={{ maxHeight: "280px" }}>
                    <img src={post.image} alt="post" className="w-full object-cover" style={{ maxHeight: "280px" }} />
                </div>
            )}
            <div className="h-px mb-3" style={{ background: "var(--border)" }} />
            <div className="flex items-center gap-5">
                <button onClick={onLike}
                    className="flex items-center gap-1.5 text-xs transition-all hover:scale-105"
                    style={{ color: liked ? "#ec4899" : "var(--text-muted)" }}>
                    <HeartIcon filled={liked} /><span>{likeCount}</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void logContentEvent({
                            userId,
                            sessionId,
                            eventType: "click",
                            uiLocation: "hub_profile",
                            postId: post.id,
                            metadata: {
                                action: "comment_button_tap",
                                hub: hubName,
                                client_post_key: `${hubName}:${post.id}`,
                            },
                        });
                    }}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <span>{post.comments}</span>
                </button>
            </div>
        </div>
    );
}

interface HubPageProps {
    hubName: string;
    joined: boolean;
    onToggleJoin: () => void;
    onBack: () => void;
}

export default function HubsProfile({ hubName, joined, onToggleJoin, onBack }: HubPageProps) {
    const { userId, sessionId } = useAnalytics();
    const info = HUB_INFO[hubName];
    const posts = HUB_POSTS[hubName] ?? [];
    const [memberCount, setMemberCount] = useState(info.members);
    const [isJoined, setIsJoined] = useState(joined);
    const screenDwellRef = useContentImpression({
        userId,
        sessionId,
        uiLocation: "hub_profile",
        enabled: Boolean(info),
        metadata: { kind: "hub_profile_screen_dwell", hub: hubName },
    });

    useEffect(() => {
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "hub_profile",
            metadata: { hub: hubName, source: "timeline" },
        });
    }, [userId, sessionId, hubName]);

    const handleToggle = () => {
        const joining = !isJoined;
        setIsJoined(joining);
        setMemberCount(prev => joining ? prev + 1 : prev - 1);
        void logContentEvent({
            userId,
            sessionId,
            eventType: joining ? "join" : "leave",
            uiLocation: "hub_profile",
            metadata: { action: joining ? "join_hub" : "leave_hub", hub: hubName, source: "hub_profile_header" },
        });
        onToggleJoin();
    };

    const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

    return (
        <div ref={screenDwellRef} className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>

            {/* Banner */}
            <div className="relative h-36" style={{ background: info.banner }}>
                <button onClick={() => {
                    void logContentEvent({
                        userId,
                        sessionId,
                        eventType: "click",
                        uiLocation: "hub_profile",
                        metadata: { action: "back", hub: hubName },
                    });
                    onBack();
                }}
                    className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="px-6 pt-4">
                {/* Hub identity row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                            style={{ background: "var(--surface2)", border: `3px solid var(--bg)`, boxShadow: `0 0 0 1px ${info.color}40` }}>
                            {info.emoji}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{hubName}</h1>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatCount(memberCount)} members</p>
                        </div>
                    </div>

                    {/* Join / Leave button */}
                    <button
                        onClick={handleToggle}
                        className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                        style={isJoined
                            ? { background: "var(--surface2)", border: `1px solid ${info.color}60`, color: info.color }
                            : { background: "var(--gradient-btn)", color: "#fff" }}>
                        {isJoined ? "✓ Joined" : "Join Hub"}
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>{info.description}</p>

                {/* Divider */}
                <div className="h-px mb-6" style={{ background: "var(--border)" }} />

                {/* Posts */}
                <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Posts</h2>
                <div className="space-y-3 pb-8">
                    {posts.map(post => (
                        <HubPostCard key={`${hubName}-${post.id}`} post={post} hubColor={info.color} hubName={hubName} />
                    ))}
                </div>
            </div>
        </div>
    );
}