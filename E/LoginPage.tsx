"use client";
import React, { useState } from "react";
import OrbitLogo from "./OrbitLogo";

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center mb-8">
        <OrbitLogo size={72} />
        <h1 className="text-2xl font-bold mt-3" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
          orbit.r
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Explore niche hubs in your orbit
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

        <div className="flex rounded-xl mb-6 p-1" style={{ background: "var(--surface2)" }}>
          <button
            onClick={() => setTab("login")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === "login" ? "var(--gradient-btn)" : "transparent",
              color: tab === "login" ? "#fff" : "var(--text-dim)",
            }}>
            Log In
          </button>
          <button
            onClick={() => setTab("signup")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === "signup" ? "var(--gradient-btn)" : "transparent",
              color: tab === "signup" ? "#fff" : "var(--text-dim)",
            }}>
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text)", caretColor: "#a78bfa" }}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text)", caretColor: "#a78bfa" }}
            />
          </div>
        </div>

        {tab === "login" && (
          <div className="flex justify-end mt-3">
            <button className="text-sm font-medium" style={{ color: "#a78bfa" }}>
              Forgot password?
            </button>
          </div>
        )}

        <button
          onClick={onLogin}
          className="w-full py-3.5 rounded-xl mt-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "var(--gradient-btn)" }}>
          {tab === "login" ? "Log In" : "Create Account"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Or continue with</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Google", "Discord"].map(provider => (
            <button key={provider}
              className="py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {provider}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}