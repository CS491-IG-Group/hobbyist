"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { joinHub } from "@/lib/hubDb";
import OrbitLogo from "./OrbitLogo";

interface Props {
  userId: string;
  email: string;
  onComplete: () => void;
}

const STEP_COUNT = 3;

interface HobbyRow {
  id: number;
  name: string;
  slug: string;
}

interface HubSuggestionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  member_count: number | null;
  hobby_id: number | null;
}

export default function OnboardingModal({ userId, email, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hobbiesLoading, setHobbiesLoading] = useState(false);
  const [hobbies, setHobbies] = useState<HobbyRow[]>([]);
  const [hobbySearch, setHobbySearch] = useState("");
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);
  const [hubSuggestionsLoading, setHubSuggestionsLoading] = useState(false);
  const [hubSuggestions, setHubSuggestions] = useState<HubSuggestionRow[]>([]);
  const [selectedHubSlugs, setSelectedHubSlugs] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const handleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 1) nameRef.current?.focus();
  }, [step]);

  useEffect(() => {
    return () => {
      if (handleTimer.current) clearTimeout(handleTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHobbies() {
      setHobbiesLoading(true);
      try {
        const { data, error: loadError } = await supabase
          .from("hobbies")
          .select("id,name,slug")
          .order("name", { ascending: true });

        if (cancelled) return;
        if (loadError) {
          setError(loadError.message);
          setHobbies([]);
          return;
        }
        setHobbies((data ?? []) as HobbyRow[]);
      } finally {
        if (!cancelled) setHobbiesLoading(false);
      }
    }

    void loadHobbies();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHubSuggestions() {
      if (selectedHobbyIds.length === 0) {
        setHubSuggestions([]);
        return;
      }

      setHubSuggestionsLoading(true);
      const { data, error: loadError } = await supabase
        .from("hubs")
        .select("id,slug,name,description,icon,member_count,hobby_id")
        .in("hobby_id", selectedHobbyIds)
        .order("member_count", { ascending: false })
        .limit(12);

      if (cancelled) return;
      if (loadError) {
        setError(loadError.message);
        setHubSuggestions([]);
      } else {
        setHubSuggestions((data ?? []) as HubSuggestionRow[]);
      }
      setHubSuggestionsLoading(false);
    }

    void loadHubSuggestions();
    return () => {
      cancelled = true;
    };
  }, [selectedHobbyIds]);

  const filteredHobbies = hobbies.filter((h) => {
    const q = hobbySearch.trim().toLowerCase();
    if (!q) return true;
    return h.name.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q);
  });

  function toggleHobby(id: number) {
    setError(null);
    setSelectedHobbyIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function toggleHub(slug: string) {
    setError(null);
    setSelectedHubSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((x) => x !== slug);
      return [...prev, slug];
    });
  }

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
    if (selectedHobbyIds.length === 0) { setError("Pick at least one interest."); return; }
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

      const { error: clearHobbiesErr } = await supabase
        .from("user_hobbies")
        .delete()
        .eq("user_id", userId);

      if (clearHobbiesErr) { setError(clearHobbiesErr.message); return; }

      const rows = selectedHobbyIds.map((hobbyId) => ({ user_id: userId, hobby_id: hobbyId }));
      const { error: insertHobbiesErr } = await supabase
        .from("user_hobbies")
        .insert(rows);
      if (insertHobbiesErr) { setError(insertHobbiesErr.message); return; }

      if (selectedHubSlugs.length > 0) {
        const joinResults = await Promise.all(selectedHubSlugs.map((slug) => joinHub(userId, slug)));
        const firstJoinError = joinResults.find((r) => r.error && r.error !== "Already a member");
        if (firstJoinError?.error) {
          setError(firstJoinError.error);
          return;
        }
      }

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
            {step === 1
              ? "Welcome to orbit.r"
              : step === 2
                ? "What are you into?"
                : "Pick starter hubs"}
          </h1>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            {step === 1
              ? `Signed in as ${email} · Step ${step} of ${STEP_COUNT}`
              : step === 2
                ? `Step ${step} of ${STEP_COUNT} · This powers your feed recommendations`
                : `Step ${step} of ${STEP_COUNT} · Join a few hubs to jump-start your orbit`}
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

        {/* Step 2 — Interests */}
        {step === 2 && (
          <div className="px-8 pb-8 space-y-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-dim)" }}>
                Choose your interests ({selectedHobbyIds.length} selected)
              </p>
              <input
                type="text"
                placeholder="Search interests..."
                value={hobbySearch}
                onChange={(e) => setHobbySearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm rounded-xl px-3 py-2 mb-3"
                style={{ color: "var(--text)", border: "1px solid var(--border)" }}
              />
              <div className="max-h-56 overflow-y-auto flex flex-wrap gap-2">
                {hobbiesLoading && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Loading interests...
                  </p>
                )}
                {!hobbiesLoading && filteredHobbies.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No matching interests.
                  </p>
                )}
                {filteredHobbies.map((hobby) => {
                  const selected = selectedHobbyIds.includes(hobby.id);
                  return (
                    <button
                      key={hobby.id}
                      type="button"
                      onClick={() => toggleHobby(hobby.id)}
                      className="text-xs px-3 py-1.5 rounded-full border transition-all"
                      style={{
                        borderColor: selected ? "#a78bfa" : "var(--border)",
                        background: selected ? "rgba(167,139,250,0.15)" : "var(--surface)",
                        color: selected ? "#c4b5fd" : "var(--text-dim)",
                      }}
                    >
                      {hobby.name}
                    </button>
                  );
                })}
              </div>
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
                onClick={() => {
                  if (selectedHobbyIds.length === 0) {
                    setError("Pick at least one interest.");
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                disabled={saving || selectedHobbyIds.length === 0}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-btn)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Bio + Suggested hubs */}
        {step === 3 && (
          <div className="px-8 pb-8 space-y-4">
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
                  Add a quick bio and choose starter hubs.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Bio <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <textarea
                  placeholder="Tell your orbit a bit about yourself..."
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 300))}
                  rows={3}
                  className="w-full bg-transparent outline-none text-sm resize-none leading-relaxed"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                {bio.length}/300
              </p>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-dim)" }}>
                Suggested starter hubs ({selectedHubSlugs.length} selected)
              </p>
              <div className="max-h-44 overflow-y-auto space-y-2">
                {hubSuggestionsLoading && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Loading suggested hubs...
                  </p>
                )}
                {!hubSuggestionsLoading && hubSuggestions.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No hub suggestions yet for selected interests.
                  </p>
                )}
                {hubSuggestions.map((hub) => {
                  const selected = selectedHubSlugs.includes(hub.slug);
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => toggleHub(hub.slug)}
                      className="w-full text-left rounded-xl px-3 py-2 border transition-all"
                      style={{
                        borderColor: selected ? "#a78bfa" : "var(--border)",
                        background: selected ? "rgba(167,139,250,0.12)" : "var(--surface)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                            {hub.icon ? `${hub.icon} ` : ""}{hub.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {hub.description?.trim() || "Join this niche hub"}
                          </p>
                        </div>
                        <span className="text-xs shrink-0" style={{ color: selected ? "#c4b5fd" : "var(--text-muted)" }}>
                          {selected ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep(2); setError(null); }}
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
                {saving ? "Saving..." : "Enter your orbit ✦"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
