"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import OrbitLogo from "./OrbitLogo";

interface Props {
  userId: string;
  email: string;
  onComplete: () => void;
}

const STEP_COUNT = 2;

export default function OnboardingModal({ userId, email, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const handleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 1) nameRef.current?.focus();
  }, [step]);

  function onHandleChange(val: string) {
    setHandle(val);
    setError(null);
    if (handleTimer.current) clearTimeout(handleTimer.current);

    const cleaned = val.trim();
    if (!cleaned) { setHandleStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(cleaned)) { setHandleStatus("idle"); return; }

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

  async function handleFinish() {
    if (!displayName.trim()) { setError("Please enter a display name."); return; }
    if (handle && !/^[a-zA-Z0-9_]{3,50}$/.test(handle)) {
      setError("Handle must be 3–50 characters: letters, numbers, or underscores.");
      return;
    }
    if (handleStatus === "taken") { setError("That handle is already taken."); return; }
    if (handleStatus === "checking") { setError("Still checking handle availability…"); return; }

    setSaving(true);
    try {
      const { error: dbErr } = await supabase
        .from("users")
        .update({
          display_name: displayName.trim(),
          handle: handle.trim() || null,
          bio: bio.trim() || null,
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (dbErr) { setError(dbErr.message); return; }
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);
    try {
      await supabase
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", userId);
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  const handleBorderColor =
    handleStatus === "taken" ? "#f87171"
      : handleStatus === "available" ? "#34d399"
        : "var(--border)";

  const handleHint =
    handleStatus === "checking" ? "Checking…"
      : handleStatus === "taken" ? "Already taken"
        : handleStatus === "available" ? "Available ✓"
          : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          animation: "fadeSlideIn 0.35s ease",
        }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: "var(--surface2)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(step / STEP_COUNT) * 100}%`,
              background: "var(--gradient-btn)",
            }}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-5 px-8">
          <OrbitLogo size={48} />
          <h1
            className="text-xl font-bold mt-3 mb-1"
            style={{ fontFamily: "Syne, sans-serif", color: "#a78bfa" }}
          >
            {step === 1 ? "Welcome to orbit.r" : "Tell your orbit about you"}
          </h1>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            {step === 1
              ? `Signed in as ${email} · Step ${step} of ${STEP_COUNT}`
              : `Step ${step} of ${STEP_COUNT} · You can always edit this later`}
          </p>
        </div>

        {/* Step 1 — Display name + handle */}
        {step === 1 && (
          <div className="px-8 pb-8 space-y-4">
            {/* Display name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Display Name <span style={{ color: "#f87171" }}>*</span>
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setError(null); }}
                  onKeyDown={e => { if (e.key === "Enter" && displayName.trim()) setStep(2); }}
                  maxLength={100}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
              </div>
            </div>

            {/* Handle */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Handle <span style={{ color: "#f87171" }}>*</span>
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{ background: "var(--surface2)", border: `1px solid ${handleBorderColor}`, transition: "border-color 0.2s" }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: 14, flexShrink: 0 }}>@</span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  value={handle}
                  onChange={e => onHandleChange(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && displayName.trim()) setStep(2); }}
                  maxLength={50}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
                {handleHint && (
                  <span className="text-xs shrink-0" style={{
                    color: handleStatus === "taken" ? "#f87171" : handleStatus === "available" ? "#34d399" : "var(--text-muted)"
                  }}>
                    {handleHint}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Letters, numbers and underscores only
              </p>
            </div>

            {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSkip}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                Skip for now
              </button>
              <button
                onClick={() => {
                  if (!displayName.trim()) { setError("Please enter a display name."); return; }
                  if (!handle.trim()) { setError("Please enter a handle."); return; }
                  if (handleStatus === "taken") { setError("That handle is already taken."); return; }
                  setError(null);
                  setStep(2);
                }}
                disabled={saving || handleStatus === "taken" || handleStatus === "checking"}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-btn)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Bio */}
        {step === 2 && (
          <div className="px-8 pb-8 space-y-4">
            {/* Preview card */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}
              >
                ✨
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ fontFamily: "Syne, sans-serif" }}>
                  {displayName}
                </p>
                {handle && (
                  <p className="text-xs" style={{ color: "#a78bfa" }}>@{handle}</p>
                )}
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {bio.trim() || "No bio yet…"}
                </p>
              </div>
            </div>

            {/* Bio textarea */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Bio <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <textarea
                  placeholder="Tell your orbit a bit about yourself…"
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 300))}
                  rows={4}
                  className="w-full bg-transparent outline-none text-sm resize-none leading-relaxed"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                  autoFocus
                />
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                {bio.length}/300
              </p>
            </div>

            {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep(1); setError(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-btn)" }}
              >
                {saving ? "Saving…" : "Enter your orbit ✦"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
