"use client";
import React, { useState } from "react";

const HUBS = [
    { name: "Cars", color: "#3b82f6", emoji: "🚗" },
    { name: "Fitness", color: "#10b981", emoji: "💪" },
    { name: "Technology", color: "#f59e0b", emoji: "💻" },
    { name: "Movies", color: "#ec4899", emoji: "🎬" },
    { name: "Photography", color: "#6366f1", emoji: "📸" },
    { name: "Cooking", color: "#ef4444", emoji: "🍳" },
];

const BADGES = [
    { icon: "🏆", label: "Top Poster", desc: "100+ posts" },
    { icon: "🌟", label: "Hub Veteran", desc: "15 hubs joined" },
    { icon: "💬", label: "Conversationalist", desc: "500+ replies" },
    { icon: "🔥", label: "On a Streak", desc: "30 day streak" },
    { icon: "🎯", label: "Goal Crusher", desc: "10 goals completed" },
    { icon: "👾", label: "Early Adopter", desc: "Joined at launch" },
];

const POSTS = [
    {
        tag: "Cars",
        tagColor: "#3b82f6",
        text: "Just got back from a track day in my STI. Nothing beats a perfectly executed apex 🔧🏁",
        likes: 214,
        time: "2h ago",
    },
    {
        tag: "Fitness",
        tagColor: "#10b981",
        text: "Finally hit a 200kg deadlift after 2 years of training. Trust the process 💪",
        likes: 389,
        time: "1d ago",
    },
    {
        tag: "Photography",
        tagColor: "#6366f1",
        text: "Golden hour in the mountains hit different. Shot entirely on film with my Contax T2 🌄",
        likes: 428,
        time: "3d ago",
    },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"posts" | "hubs" | "badges">("posts");
    return (
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Floating Pill Header */}
                <div className="flex flex-col items-center mb-8">

                    {/* Pill card */}
                    <div className="flex items-center gap-5 px-6 py-4 rounded-2xl w-full"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>
                                🎮
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                                style={{ background: "#22c55e", borderColor: "var(--surface)" }} />
                        </div>

                        {/* Name + handle + bio */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                                    Mika Tanaka
                                </h1>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                                    Active
                                </span>
                            </div>
                            <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>@mikatanaka</p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                Into cars, fitness, photography and cooking ✨
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-10 shrink-0" style={{ background: "var(--border)" }} />

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-5 shrink-0">
                            {[
                                { label: "Hubs", value: "15" },
                                { label: "Posts", value: "284" },
                                { label: "Friends", value: "142" },
                            ].map(stat => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-base font-bold">{stat.value}</p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats row for mobile */}
                    <div className="flex sm:hidden items-center justify-around w-full mt-3 px-2">
                        {[
                            { label: "Hubs", value: "15" },
                            { label: "Posts", value: "284" },
                            { label: "Friends", value: "142" },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className="text-base font-bold">{stat.value}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 w-full mt-3">
                        <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                            Edit Profile
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                            Account Settings
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl"
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    {(["posts", "hubs", "badges"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                            style={{
                                background: activeTab === tab ? "var(--gradient-btn)" : "transparent",
                                color: activeTab === tab ? "#fff" : "var(--text-muted)",
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === "posts" && (
                    <div className="space-y-3">
                        {POSTS.map((post, i) => (
                            <div key={i} className="rounded-2xl p-4 flex gap-4"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg"
                                    style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}>
                                    🎮
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: `${post.tagColor}20`, color: post.tagColor, border: `1px solid ${post.tagColor}40` }}>
                                            {post.tag}
                                        </span>
                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.time}</span>
                                    </div>
                                    <p className="text-sm mb-2" style={{ color: "var(--text-dim)" }}>{post.text}</p>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>❤️ {post.likes}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "hubs" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {HUBS.map(hub => (
                            <div key={hub.name}
                                className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:opacity-80"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                    style={{ background: `${hub.color}20`, border: `1px solid ${hub.color}40` }}>
                                    {hub.emoji}
                                </div>
                                <span className="text-sm font-semibold truncate">{hub.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "badges" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {BADGES.map(badge => (
                            <div key={badge.label}
                                className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="text-3xl">{badge.icon}</div>
                                <p className="text-sm font-bold">{badge.label}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{badge.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}