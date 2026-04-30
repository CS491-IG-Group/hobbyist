"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAnalytics, logContentEvent } from "../lib/AnalyticsContext";
import { supabase } from "../lib/supabase";

type Message = { id: number; from: "me" | "them"; text: string; time: string };

type Conversation = {
    id: number;
    user: string;
    handle: string;
    avatar: string;
    avatarBg: string;
    online: boolean;
    sharedHub: string;
    hubColor: string;
    lastMessage: string;
    time: string;
    unread: number;
    messages: Message[];
    followedUserId?: string;
};

type FollowedUser = {
    id: string;
    display_name: string;
    handle: string;
};

const CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        user: "Jordan Lee",
        handle: "@jordanlee",
        avatar: "💪",
        avatarBg: "linear-gradient(135deg, #064e3b, #065f46)",
        online: true,
        sharedHub: "Fitness",
        hubColor: "#10b981",
        lastMessage: "bro that PR was insane 🔥",
        time: "2m",
        unread: 3,
        messages: [
            { id: 1, from: "them", text: "did you hit the gym today?", time: "10:12 AM" },
            { id: 2, from: "me", text: "yeah just got back, hit a new deadlift PR!", time: "10:13 AM" },
            { id: 3, from: "them", text: "no way what was it", time: "10:13 AM" },
            { id: 4, from: "me", text: "200kg finally after 2 years of grinding", time: "10:15 AM" },
            { id: 5, from: "them", text: "that is absolutely insane dude congrats", time: "10:30 AM" },
            { id: 6, from: "them", text: "bro that PR was insane 🔥", time: "10:31 AM" },
        ],
    },
    {
        id: 2,
        user: "Sam Chen",
        handle: "@samchen",
        avatar: "💻",
        avatarBg: "linear-gradient(135deg, #1c1917, #44403c)",
        online: true,
        sharedHub: "Technology",
        hubColor: "#f59e0b",
        lastMessage: "M4 benchmarks are actually crazy 👀",
        time: "1h",
        unread: 1,
        messages: [
            { id: 1, from: "them", text: "have you seen the new MacBook benchmarks", time: "9:00 AM" },
            { id: 2, from: "me", text: "not yet what happened", time: "9:02 AM" },
            { id: 3, from: "them", text: "M4 is beating workstation chips from 2022", time: "9:03 AM" },
            { id: 4, from: "me", text: "no way that is insane", time: "9:45 AM" },
            { id: 5, from: "them", text: "M4 benchmarks are actually crazy 👀", time: "9:46 AM" },
        ],
    },
    {
        id: 3,
        user: "Alex Rivera",
        handle: "@alexrivera",
        avatar: "🚗",
        avatarBg: "linear-gradient(135deg, #1e1b4b, #1e40af)",
        online: false,
        sharedHub: "Cars",
        hubColor: "#3b82f6",
        lastMessage: "track day next weekend, you in?",
        time: "3h",
        unread: 0,
        messages: [
            { id: 1, from: "them", text: "just got my suspension tuned", time: "7:00 AM" },
            { id: 2, from: "me", text: "how does it feel now", time: "7:05 AM" },
            { id: 3, from: "them", text: "night and day difference honestly", time: "7:06 AM" },
            { id: 4, from: "them", text: "track day next weekend, you in?", time: "8:30 AM" },
        ],
    },
    {
        id: 4,
        user: "Maya Patel",
        handle: "@mayapatel",
        avatar: "🎬",
        avatarBg: "linear-gradient(135deg, #831843, #9d174d)",
        online: false,
        sharedHub: "Movies",
        hubColor: "#ec4899",
        lastMessage: "Dune 2 was a masterpiece no notes 🎥",
        time: "1d",
        unread: 0,
        messages: [
            { id: 1, from: "me", text: "have you seen Dune Part 2 yet", time: "Yesterday" },
            { id: 2, from: "them", text: "yes I saw it in IMAX it was incredible", time: "Yesterday" },
            { id: 3, from: "me", text: "Villeneuve is on another level", time: "Yesterday" },
            { id: 4, from: "them", text: "Dune 2 was a masterpiece no notes 🎥", time: "Yesterday" },
        ],
    },
    {
        id: 5,
        user: "Chris Booker",
        handle: "@chrisbooker",
        avatar: "📸",
        avatarBg: "linear-gradient(135deg, #1e3a5f, #1e40af)",
        online: true,
        sharedHub: "Photography",
        hubColor: "#6366f1",
        lastMessage: "film photography hits different 🎞️",
        time: "2d",
        unread: 0,
        messages: [
            { id: 1, from: "them", text: "shot a whole roll on my Contax this weekend", time: "2 days ago" },
            { id: 2, from: "me", text: "film or digital", time: "2 days ago" },
            { id: 3, from: "them", text: "film obviously lol", time: "2 days ago" },
            { id: 4, from: "them", text: "film photography hits different 🎞️", time: "2 days ago" },
        ],
    },
];

function colorFromSeed(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 45%)`;
}

function gradientFromSeed(seed: string): string {
    const primary = colorFromSeed(seed);
    const secondary = colorFromSeed(`${seed}-secondary`);
    return `linear-gradient(135deg, ${primary}, ${secondary})`;
}

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "👤";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SendIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

function BackIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function ChatWindow({
    convo,
    onBack,
    onAppendMessage,
}: {
    convo: Conversation;
    onBack: () => void;
    onAppendMessage: (convoId: number, msg: Message) => void;
}) {
    const { userId, sessionId } = useAnalytics();
    const messages = convo.messages;
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        const body = input.trim();
        void logContentEvent({
            userId,
            sessionId,
            eventType: "message",
            uiLocation: "orbit",
            metadata: {
                action: "dm_send",
                peer_handle: convo.handle,
                shared_hub: convo.sharedHub,
                char_len: body.length,
                conversation_id: convo.id,
            },
        });
        const nextId =
            messages.length === 0 ? 1 : Math.max(...messages.map((m) => m.id)) + 1;
        onAppendMessage(convo.id, {
            id: nextId,
            from: "me",
            text: body,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        setInput("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                    onClick={() => {
                        void logContentEvent({
                            userId,
                            sessionId,
                            eventType: "click",
                            uiLocation: "orbit",
                            metadata: { action: "conversation_back_mobile", peer_handle: convo.handle },
                        });
                        onBack();
                    }}
                    className="lg:hidden mr-1"
                    style={{ color: "var(--text-muted)" }}>
                    <BackIcon />
                </button>
                <div className="relative">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                        style={{ background: convo.avatarBg }}>
                        {convo.avatar}
                    </div>
                    {convo.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                            style={{ background: "#22c55e", borderColor: "var(--surface)" }} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{convo.user}</p>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: `${convo.hubColor}20`, color: convo.hubColor }}>
                            {convo.sharedHub}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {convo.online ? "Active now" : "Offline"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg, i) => {
                    const isMe = msg.from === "me";
                    const showTime = i === 0 || messages[i - 1].from !== msg.from;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {showTime && (
                                <span className="text-xs mb-1 px-2" style={{ color: "var(--text-muted)" }}>
                                    {msg.time}
                                </span>
                            )}
                            <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                                style={{
                                    background: isMe ? "var(--gradient-btn)" : "var(--surface2)",
                                    color: isMe ? "#fff" : "var(--text)",
                                    border: isMe ? "none" : "1px solid var(--border)",
                                }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <input
                        type="text"
                        placeholder={`Message ${convo.user.split(" ")[0]}...`}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                send();
                            }
                        }}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                    />
                    <button
                        onClick={send}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                        style={{
                            background: input.trim() ? "var(--gradient-btn)" : "var(--surface)",
                            color: input.trim() ? "#fff" : "var(--text-muted)",
                        }}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NicheFeed() {
    const { userId, sessionId } = useAnalytics();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [convos, setConvos] = useState(CONVERSATIONS);
    const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
    const [search, setSearch] = useState("");
    const selected =
        selectedId === null ? null : convos.find((c) => c.id === selectedId) ?? null;

    useEffect(() => {
        void logContentEvent({
            userId,
            sessionId,
            eventType: "view",
            uiLocation: "orbit",
            metadata: { screen: "messages" },
        });
    }, [userId, sessionId]);

    useEffect(() => {
        let cancelled = false;

        async function loadFollowedUsers() {
            let followerId = userId;

            if (!followerId) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                followerId = user?.id ?? null;
            }

            if (!followerId) return;

            const { data: followRows, error: followErr } = await supabase
                .from("user_follows")
                .select("followed_id")
                .eq("follower_id", followerId)
                .eq("status", "following");

            if (followErr || cancelled) return;

            const targetIds = (followRows ?? [])
                .map((row: any) => row.followed_id as string)
                .filter(Boolean);

            if (targetIds.length === 0) {
                if (!cancelled) setFollowedUsers([]);
                return;
            }

            const { data: usersData, error: usersErr } = await supabase
                .from("users")
                .select("id, display_name, handle")
                .in("id", targetIds);

            if (usersErr || cancelled) return;

            const usersById = new Map(
                (usersData ?? []).map((u: any) => [
                    u.id as string,
                    {
                        id: u.id as string,
                        display_name: String(u.display_name ?? ""),
                        handle: String(u.handle ?? ""),
                    },
                ]),
            );

            const ordered = targetIds
                .map((id) => usersById.get(id))
                .filter((u): u is FollowedUser => Boolean(u));

            if (!cancelled) {
                setFollowedUsers(ordered);
            }
        }

        void loadFollowedUsers();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const filtered = convos.filter(c =>
        c.user.toLowerCase().includes(search.toLowerCase()) ||
        c.sharedHub.toLowerCase().includes(search.toLowerCase())
    );

    const followedUserSuggestions = (() => {
        const query = search.trim().toLowerCase();
        const existingFollowedIds = new Set(
            convos.map((c) => c.followedUserId).filter(Boolean),
        );
        return followedUsers.filter((u) => {
            if (existingFollowedIds.has(u.id)) return false;
            if (!query) return true;
            return (
                u.display_name.toLowerCase().includes(query) ||
                u.handle.toLowerCase().includes(query)
            );
        });
    })();

    const selectConvo = (convo: Conversation) => {
        void logContentEvent({
            userId,
            sessionId,
            eventType: "click",
            uiLocation: "orbit",
            metadata: {
                action: "open_conversation",
                peer_handle: convo.handle,
                shared_hub: convo.sharedHub,
            },
        });
        setSelectedId(convo.id);
        setConvos((prev) => prev.map((c) => (c.id === convo.id ? { ...c, unread: 0 } : c)));
    };

    const appendMessage = (convoId: number, msg: Message) => {
        setConvos((prev) =>
            prev.map((c) => {
                if (c.id !== convoId) return c;
                return {
                    ...c,
                    messages: [...c.messages, msg],
                    lastMessage: msg.text,
                    time: "Just now",
                };
            }),
        );
    };

    const startConversationWithFollowedUser = (person: FollowedUser) => {
        const existing = convos.find((c) => c.followedUserId === person.id);
        if (existing) {
            selectConvo(existing);
            return;
        }

        const nextId =
            convos.length === 0 ? 1 : Math.max(...convos.map((c) => c.id)) + 1;
        const normalizedHandle = person.handle.startsWith("@")
            ? person.handle
            : `@${person.handle}`;
        const newConvo: Conversation = {
            id: nextId,
            user: person.display_name || normalizedHandle.replace(/^@/, ""),
            handle: normalizedHandle,
            avatar: initialsFromName(person.display_name || normalizedHandle),
            avatarBg: gradientFromSeed(person.id),
            online: false,
            sharedHub: "Following",
            hubColor: "#8b5cf6",
            lastMessage: "Start your first message",
            time: "Now",
            unread: 0,
            messages: [],
            followedUserId: person.id,
        };

        setConvos((prev) => [newConvo, ...prev]);
        setSelectedId(newConvo.id);
    };

    return (
        <div className="flex flex-1 h-screen overflow-hidden">
            {/* Conversation list */}
            <div className={`flex flex-col shrink-0 ${selected ? "hidden lg:flex" : "flex"}`}
                style={{ width: "320px", borderRight: "1px solid var(--border)", background: "var(--bg)" }}>

                {/* Header */}
                <div className="px-5 pt-6 pb-4 shrink-0">
                    <h1 className="text-xl font-black mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
                        Messages
                    </h1>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                        style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-xs"
                            style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-2">
                    {followedUserSuggestions.length > 0 && (
                        <div className="px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                                Start chat with people you follow
                            </p>
                            <div className="space-y-1">
                                {followedUserSuggestions.map((person) => (
                                    <button
                                        key={person.id}
                                        onClick={() => startConversationWithFollowedUser(person)}
                                        className="w-full text-left px-3 py-2 rounded-xl transition-all hover:opacity-90"
                                        style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                                    >
                                        <p className="text-sm font-semibold truncate">{person.display_name || "Unknown user"}</p>
                                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                            {person.handle.startsWith("@") ? person.handle : `@${person.handle}`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {filtered.map(convo => (
                        <button
                            key={convo.id}
                            onClick={() => selectConvo(convo)}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl transition-all hover:opacity-90 text-left"
                            style={{
                                background: selected?.id === convo.id ? "var(--surface2)" : "transparent",
                                border: selected?.id === convo.id ? "1px solid var(--border)" : "1px solid transparent",
                            }}>
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                                    style={{ background: convo.avatarBg }}>
                                    {convo.avatar}
                                </div>
                                {convo.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                                        style={{ background: "#22c55e", borderColor: "var(--bg)" }} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-sm font-semibold truncate">{convo.user}</span>
                                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{convo.time}</span>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                        {convo.lastMessage}
                                    </span>
                                    {convo.unread > 0 && (
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                            style={{ background: "var(--gradient-btn)" }}>
                                            {convo.unread}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs mt-0.5 inline-block px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${convo.hubColor}15`, color: convo.hubColor }}>
                                    {convo.sharedHub}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 ${selected ? "flex" : "hidden lg:flex"} flex-col`}
                style={{ background: "var(--surface)", height: "100%" }}>
                {selected ? (
                    <ChatWindow
                        convo={selected}
                        onBack={() => setSelectedId(null)}
                        onAppendMessage={appendMessage}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3"
                        style={{ color: "var(--text-muted)" }}>
                        <div className="text-5xl">💬</div>
                        <p className="text-sm font-semibold">Your Messages</p>
                        <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
                            Connect with friends from your hubs. Select a conversation to start chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}