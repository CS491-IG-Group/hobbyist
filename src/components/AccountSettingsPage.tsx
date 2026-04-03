"use client";
import React, { useState } from "react";

interface Props {
  onBack: () => void;
  displayName: string;
  handle: string;
  email: string;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center shrink-0 rounded-full transition-colors duration-200"
      style={{
        width: 48,
        height: 26,
        background: checked ? "var(--gradient-btn)" : "var(--surface2)",
        border: `1px solid ${checked ? "transparent" : "var(--border)"}`,
      }}
    >
      <span
        className="inline-block rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: 20,
          height: 20,
          background: "#fff",
          transform: checked ? "translateX(24px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
      >
        {icon}
      </div>
      <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
        {title}
      </h2>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
    >
      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Account Settings Page ────────────────────────────────────────────────────
export default function AccountSettingsPage({ onBack, displayName, handle, email }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  function handleUpdatePassword() {
    // Visual only — no backend call
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  }

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;
  const canSubmitPw =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Back button + Title */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--text)" }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Account Settings
          </h1>
        </div>

        {/* ───────── Change Password ───────── */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Change Password */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
              Change Password
            </h3>
          </div>

          <div className="space-y-3">
            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Current Password
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showCurrentPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                New Password
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${passwordTooShort ? "#f8717140" : "var(--border)"}`,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showNewPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordTooShort && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                Confirm New Password
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${passwordMismatch ? "#f8717140" : "var(--border)"}`,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text)", caretColor: "#a78bfa" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showConfirmPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Success message */}
            {passwordSuccess && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399",
                }}
              >
                Password updated successfully!
              </div>
            )}

            {/* Update Password button */}
            <button
              onClick={handleUpdatePassword}
              disabled={!canSubmitPw}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: "var(--gradient-btn)" }}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* ───────── User Privacy ───────── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <SectionHeader
            title="User Privacy"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />

          {/* Privacy toggle */}
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4 mb-4"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: isPrivate ? "rgba(236,72,153,0.1)" : "rgba(52,211,153,0.1)",
                  border: `1px solid ${isPrivate ? "rgba(236,72,153,0.2)" : "rgba(52,211,153,0.2)"}`,
                }}
              >
                {isPrivate ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {isPrivate ? "Private Account" : "Public Account"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {isPrivate
                    ? "Only approved followers can see your posts and profile"
                    : "Anyone can view your profile and posts"}
                </p>
              </div>
            </div>
            <ToggleSwitch checked={isPrivate} onChange={setIsPrivate} />
          </div>

          {/* Privacy info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: !isPrivate ? "rgba(52,211,153,0.06)" : "var(--surface2)",
                border: `1px solid ${!isPrivate ? "rgba(52,211,153,0.15)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={!isPrivate ? "#34d399" : "var(--text-muted)"} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="text-xs font-bold" style={{ color: !isPrivate ? "#34d399" : "var(--text-muted)" }}>
                  Public
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Your profile, posts, and hub activity are visible to everyone. Anyone can follow you without approval.
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: isPrivate ? "rgba(236,72,153,0.06)" : "var(--surface2)",
                border: `1px solid ${isPrivate ? "rgba(236,72,153,0.15)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isPrivate ? "#ec4899" : "var(--text-muted)"} strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-xs font-bold" style={{ color: isPrivate ? "#ec4899" : "var(--text-muted)" }}>
                  Private
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Only approved followers can see your posts and activity. New followers must send a follow request for your approval.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
