"use client";

import React, { useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I am Orbit Assistant. I can help with hub discovery, post ideas, and personalized hobby recommendations. What do you want to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");

    const nextUserMessage: ChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, nextUserMessage];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextHistory }),
      });

      const data = (await res.json()) as { ok: boolean; reply?: string; error?: string };
      if (!res.ok || !data.ok || !data.reply) {
        throw new Error(data.error || "Chat request failed.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 h-full flex flex-col">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>
          Orbit Assistant
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Ask for post ideas, discover hubs, and get hobby recommendations.
        </p>
      </div>

      <div
        className="flex-1 rounded-2xl p-4 overflow-y-auto space-y-3"
        style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
      >
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "ml-auto" : ""
            }`}
            style={
              m.role === "user"
                ? { background: "var(--gradient-btn)", color: "#fff" }
                : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div
            className="max-w-[85%] rounded-xl px-4 py-3 text-sm"
            style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Orbit Assistant is thinking...
          </div>
        )}
      </div>

      <div className="mt-4">
        {error && (
          <p className="text-xs mb-2" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask Orbit Assistant..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!canSend}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--gradient-btn)" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
