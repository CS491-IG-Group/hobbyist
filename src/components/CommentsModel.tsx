"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

interface Props {
    postId: number;
    onClose: () => void;
    onCommentPosted?: () => void; // lets PostCard bump its count
}

export default function CommentsModal({ postId, onClose, onCommentPosted }: Props) {
    const [comments, setComments] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from("comments")
                .select("id, content, created_at, users!user_id(handle, display_name)")
                .eq("post_id", postId)
                .order("created_at", { ascending: true });

            if (!error && data) setComments(data);
            setLoading(false);

            // Auto-focus input after load
            setTimeout(() => inputRef.current?.focus(), 50);
        };
        fetchComments();
    }, [postId]);

    // Scroll to bottom when new comments arrive
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [comments]);

    const postComment = async () => {
        if (!text.trim() || submitting) return;
        setError(null);
        setSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be signed in to comment.");
            setSubmitting(false);
            return;
        }

        const { data, error: insertErr } = await supabase
            .from("comments")
            .insert({ post_id: postId, user_id: user.id, content: text.trim() })
            .select("id, content, created_at, users!user_id(handle, display_name)")
            .single();

        if (insertErr) {
            setError(insertErr.message);
        } else if (data) {
            setComments(prev => [...prev, data]);
            setText("");
            onCommentPosted?.();
        }

        setSubmitting(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    };

    const formatTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return "just now";
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    maxHeight: "80vh",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                        Comments {comments.length > 0 && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({comments.length})</span>}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Comment list */}
                <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-3" style={{ minHeight: 0 }}>
                    {loading ? (
                        <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>Loading comments…</p>
                    ) : comments.length === 0 ? (
                        <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No comments yet. Be the first!</p>
                    ) : (
                        comments.map(c => {
                            const profile = Array.isArray(c.users) ? c.users[0] : c.users;
                            const handle = profile?.handle?.trim() || null;
                            const name = profile?.display_name?.trim() || (handle ? handle.replace(/^@/, "") : "Member");
                            return (
                                <div key={c.id} className="mb-4">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold">{name}</span>
                                        {handle && (
                                            <span className="text-[10px]" style={{ color: "#a78bfa" }}>
                                                {handle.startsWith("@") ? handle : `@${handle}`}
                                            </span>
                                        )}
                                        <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
                                            {formatTime(c.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{c.content}</p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs px-5 pb-1" style={{ color: "#f87171" }}>{error}</p>
                )}

                {/* Input */}
                <div className="px-5 py-4 shrink-0 flex gap-2 items-center" style={{ borderTop: "1px solid var(--border)" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a reply… (Enter to post)"
                        className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                        style={{
                            background: "var(--surface2)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            caretColor: "#a78bfa",
                        }}
                    />
                    <button
                        onClick={postComment}
                        disabled={!text.trim() || submitting}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-opacity disabled:opacity-40"
                        style={{ background: "var(--gradient-btn)", color: "white", border: "none", cursor: "pointer" }}
                    >
                        {submitting ? "…" : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}