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

const SESSION_MS = 5_000;
const PROFILE_MS = 5_000;
const PROFILE_FETCH_ATTEMPTS = 2;

interface UsersProfileRow {
  onboarding_completed: boolean | null;
  display_name: string | null;
  handle: string | null;
}

/** True if the wizard finished, or the user already filled a public profile elsewhere (e.g. Edit profile). */
function profileLooksComplete(row: UsersProfileRow): boolean {
  if (row.onboarding_completed === true) return true;
  const name = row.display_name?.trim() ?? "";
  const handle = row.handle?.trim() ?? "";
  return name.length > 0 && handle.length > 0;
}

/**
 * Loads `public.users` with retries. Timeouts and transient errors must not be treated as
 * “user has no profile” — that incorrectly forced returning users through onboarding.
 */
async function loadUsersProfile(userId: string): Promise<
  | { status: "ok"; row: UsersProfileRow | null }
  | { status: "failed" }
> {
  for (let attempt = 0; attempt < PROFILE_FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await withTimeout(
        supabase
          .from("users")
          .select("onboarding_completed, display_name, handle")
          .eq("id", userId)
          .maybeSingle(),
        PROFILE_MS,
        "users profile"
      );
      if (res.error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth] users profile query error", res.error);
        }
        if (attempt < PROFILE_FETCH_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
        continue;
      }
      return { status: "ok", row: res.data as UsersProfileRow | null };
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] users profile fetch failed or stalled", e);
      }
      if (attempt < PROFILE_FETCH_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  return { status: "failed" };
}

export default function Home() {
  const [view, setView] = useState<View>("login");
  const [onboardingUser, setOnboardingUser] = useState<OnboardingUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setCurrentUserId(null);
      setOnboardingUser(null);
      setView("login");
      return;
    }

    const user = session.user;
    setCurrentUserId(user.id);
    const result = await loadUsersProfile(user.id);

    if (result.status === "failed") {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] users profile unavailable after retries — opening app without onboarding gate");
      }
      setOnboardingUser(null);
      setView("dashboard");
      return;
    }

    const row = result.row;
    if (!row || !profileLooksComplete(row)) {
      setOnboardingUser({ id: user.id, email: user.email ?? "" });
      setView("onboarding");
    } else {
      setOnboardingUser(null);
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
          <DashboardPage onLogout={handleLogout} authUserId={currentUserId} />
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
  return <DashboardPage onLogout={handleLogout} authUserId={currentUserId} />;
}