"use client";
import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/components/DashboardPage";
import OnboardingModal from "@/components/OnboardingModal";
import { supabase } from "@/lib/supabase";

type View = "loading" | "login" | "onboarding" | "dashboard";

interface OnboardingUser {
  id: string;
  email: string;
}

export default function Home() {
  const [view, setView] = useState<View>("loading");
  const [onboardingUser, setOnboardingUser] = useState<OnboardingUser | null>(null);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setView("login"); return; }

    const user = session.user;

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.onboarding_completed) {
      setOnboardingUser({ id: user.id, email: user.email ?? "" });
      setView("onboarding");
    } else {
      setView("dashboard");
    }
  }

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setOnboardingUser(null);
        setView("login");
        return;
      }

      // Only re-run the full check on sign-in events, not on token refresh etc.
      if (event === "SIGNED_IN") {
        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!profile || !profile.onboarding_completed) {
          setOnboardingUser({ id: session.user.id, email: session.user.email ?? "" });
          setView("onboarding");
        } else {
          setView("dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
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