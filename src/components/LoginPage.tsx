"use client";
import React, { useState } from "react";
import OrbitLogo from "./OrbitLogo";
import { supabase } from "@/lib/supabase";

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const switchTab = (t: "login" | "signup") => {
    setTab(t);
    setError(null);
    setConfirmPassword("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (userHandle && !/^[a-zA-Z0-9_]{3,50}$/.test(userHandle)) {
        setError("Handle must be 3–50 characters: letters, numbers, or underscores.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError(err.message); return; }
        onLogin();
      } else {
        const { data: existing } = await supabase
          .from("users")
          .select("handle")
          .eq("handle", userHandle)
          .maybeSingle();

        if (existing) {
          setError("That handle is already taken.");
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              handle: userHandle || null,
            },
          },
        });
        if (err) { setError(err.message); return; }
        if (data.user && !data.session) {
          setError("Check your email to confirm your account.");
          return;
        }
        onLogin();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex flex-col items-center mb-8">
        <OrbitLogo size={72} />
        <h1
          className="text-2xl font-bold mt-3"
          style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}
        >
          orbit.r
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Explore niche hubs in your orbit
        </p>
      </div>

      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <form onSubmit={handleSubmit}>
          {/* Tab switcher */}
          <div
            className="flex rounded-xl mb-6 p-1"
            style={{ background: "var(--surface2)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: tab === t ? "var(--gradient-btn)" : "transparent",
                  color: tab === t ? "#fff" : "var(--text-dim)",
                }}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Handle — signup only */}
            {tab === "signup" && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <input
                  type="text"
                  placeholder="Username (e.g. cosmicray)"
                  value={userHandle}
                  onChange={(e) => { setUserHandle(e.target.value); clearError(); }}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                  autoComplete="username"
                />
              </div>
            )}

            {/* Email */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                required
              />
            </div>

            {/* Confirm Password — signup only */}
            {tab === "signup" && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${confirmPassword && confirmPassword !== password
                    ? "#f87171"
                    : confirmPassword && confirmPassword === password
                      ? "#34d399"
                      : "var(--border)"
                    }`,
                  transition: "border-color 0.2s",
                }}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    color:
                      confirmPassword && confirmPassword !== password
                        ? "#f87171"
                        : confirmPassword && confirmPassword === password
                          ? "#34d399"
                          : "var(--text-muted)",
                    transition: "color 0.2s",
                  }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                  autoComplete="new-password"
                  required
                />
                {confirmPassword && (
                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                    {confirmPassword === password ? "✓" : "✗"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Forgot password */}
          {tab === "login" && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className="text-sm font-medium"
                style={{ color: "#a78bfa" }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm mt-3" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl mt-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-btn)" }}
          >
            {loading
              ? tab === "login" ? "Logging in…" : "Creating account…"
              : tab === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {/* OAuth */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Or continue with
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Google", "Discord"].map((provider) => (
            <button
              key={provider}
              className="py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}