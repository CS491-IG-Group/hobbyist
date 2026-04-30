"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/components/DashboardPage";
import OnboardingModal from "@/components/OnboardingModal";
import OrbitBackground from "@/components/OrbitBackground";
import { supabase } from "@/lib/supabase";
import { withTimeout } from "@/lib/withTimeout";

type View = "landing" | "loading" | "login" | "onboarding" | "dashboard";

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

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <OrbitBackground />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
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
  const [view, setView] = useState<View>("landing");
  const [onboardingUser, setOnboardingUser] = useState<OnboardingUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [manualLoginMode, setManualLoginMode] = useState(false);
  const manualLoginModeRef = useRef(false);
  const viewRef = useRef<View>("landing");
  const manualAuthInProgressRef = useRef(false);
  const profileCacheRef = useRef<UsersProfileRow | null>(null);


  useEffect(() => {
    // Product default: always start in dark mode on fresh app load.
    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const applySession = useCallback(async (
    session: Session | null,
    source: "bootstrap" | "auth_change" | "manual_submit" = "bootstrap"
  ) => {
    // If user intentionally opened login, ignore background auth/session updates
    // until they explicitly submit credentials.
    if (manualLoginModeRef.current && source !== "manual_submit") {
      return;
    }

    if (!session) {
      if (source === "auth_change" && manualAuthInProgressRef.current) {
        return;
      }
      if (source === "auth_change" && (viewRef.current === "login" || viewRef.current === "loading")) {
        setView("login");
        return;
      }
      setCurrentUserId(null);
      setOnboardingUser(null);
      setView(source === "manual_submit" ? "login" : "landing");
      manualAuthInProgressRef.current = false;
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
      manualAuthInProgressRef.current = false;
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
    manualAuthInProgressRef.current = false;
  }, []);

  async function checkSession(source: "bootstrap" | "manual_submit" = "bootstrap") {
    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        SESSION_MS,
        "getSession"
      );
      if (error) throw error;
      await applySession(session ?? null, source);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] getSession failed or stalled; showing landing", e);
      }
      if (source === "bootstrap" && manualLoginModeRef.current) {
        return;
      }
      setOnboardingUser(null);
      setView(source === "manual_submit" ? "login" : "landing");
    }
  }

  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "TOKEN_REFRESHED") return;

      try {
        await applySession(session, "auth_change");
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth] onAuthStateChange", e);
        }
        setOnboardingUser(null);
        setView("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    manualLoginModeRef.current = manualLoginMode;
  }, [manualLoginMode]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  async function handleLogout() {
    // Optimistic logout for snappy UX: clear local app state immediately,
    // then invalidate Supabase session in the background.
    setCurrentUserId(null);
    setOnboardingUser(null);
    setManualLoginMode(false);
    manualAuthInProgressRef.current = false;
    setView("landing");
    try {
      await withTimeout(
        supabase.auth.signOut({ scope: "local" }),
        1500,
        "signOut"
      );
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] signOut timed out/failed after local logout", e);
      }
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      </div>
    );
  }

  // ── Landing ──────────────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <LandingPage
        onGetStarted={() => {
          setManualLoginMode(true);
          setView("login");
        }}
        onLogin={() => {
          setManualLoginMode(true);
          setView("login");
        }}
      />
    );
  }

  // ── Login ────────────────────────────────────────────────────────────
  if (view === "login") {
    return (
      <LoginPage
        onLogin={() => {
          manualAuthInProgressRef.current = true;
          setManualLoginMode(false);
          setView("loading");
          void checkSession("manual_submit");
        }}
        onBackToLanding={() => {
          setManualLoginMode(false);
          setView("landing");
        }}
      />
    );
  }

  // ── Onboarding ───────────────────────────────────────────────────────
  // Show the dashboard behind the modal so the transition feels seamless
  if (view === "onboarding" && onboardingUser) {
    return (
      <AuthenticatedShell>
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
      </AuthenticatedShell>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────
  return (
    <AuthenticatedShell>
      <DashboardPage onLogout={handleLogout} authUserId={currentUserId} />
    </AuthenticatedShell>
  );
}