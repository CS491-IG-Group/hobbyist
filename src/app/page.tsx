"use client";
import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/components/DashboardPage";
import OnboardingModal from "@/components/OnboardingModal";
import { supabase } from "@/lib/supabase";
import { withTimeout } from "@/lib/withTimeout";

type View = "loading" | "login" | "onboarding" | "dashboard";

interface OnboardingUser {
  id: string;
  email: string;
}

const SESSION_MS = 12_000;
const PROFILE_MS = 12_000;

export default function Home() {
  const [view, setView] = useState<View>("loading");
  const [onboardingUser, setOnboardingUser] = useState<OnboardingUser | null>(null);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setOnboardingUser(null);
      setView("login");
      return;
    }

    const user = session.user;
    let profile: { onboarding_completed: boolean | null } | null = null;

    try {
      const res = await withTimeout(
        supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle(),
        PROFILE_MS,
        "users profile"
      );
      profile = res.data ?? null;
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] users profile fetch failed or stalled — continuing as onboarding", e);
      }
      profile = null;
    }

    if (!profile || !profile.onboarding_completed) {
      setOnboardingUser({ id: user.id, email: user.email ?? "" });
      setView("onboarding");
    } else {
      setView("dashboard");
    }
  }, []);

  async function checkSession() {
    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        SESSION_MS,
        "getSession"
      );
      if (error) throw error;
      await applySession(session ?? null);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] getSession failed or stalled; showing login", e);
      }
      setOnboardingUser(null);
      setView("login");
    }
  }

  useEffect(() => {
    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "TOKEN_REFRESHED") return;

      try {
        await applySession(session);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth] onAuthStateChange", e);
        }
        setOnboardingUser(null);
        setView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setView((v) => {
        if (v !== "loading") return v;
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth] loading exceeded 20s — showing login (check Supabase URL, network, users table)");
        }
        return "login";
      });
    }, 20_000);
    return () => clearTimeout(id);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOnboardingUser(null);
    setView("login");
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      </div>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────
  if (view === "login") {
    return <LoginPage onLogin={() => checkSession()} />;
  }

  // ── Onboarding ───────────────────────────────────────────────────────
  // Show the dashboard behind the modal so the transition feels seamless
  if (view === "onboarding" && onboardingUser) {
    return (
      <>
        {/* Blurred dashboard shell so user sees they're almost in */}
        <div style={{ filter: "blur(2px)", pointerEvents: "none", userSelect: "none" }}>
          <DashboardPage onLogout={handleLogout} />
        </div>
        <OnboardingModal
          userId={onboardingUser.id}
          email={onboardingUser.email}
          onComplete={() => {
            setOnboardingUser(null);
            setView("dashboard");
          }}
        />
      </>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────
  return <DashboardPage onLogout={handleLogout} />;
}