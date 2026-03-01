"use client";
import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/components/DashboardPage";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [view, setView] = useState<"login" | "dashboard" | "loading">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setView(session ? "dashboard" : "login");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setView(session ? "dashboard" : "login");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setView("login");
  }

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      </div>
    );
  }

  if (view === "login") {
    return <LoginPage onLogin={() => setView("dashboard")} />;
  }

  return <DashboardPage onLogout={handleLogout} />;
}
