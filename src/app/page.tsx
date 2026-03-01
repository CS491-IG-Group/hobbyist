"use client";
import { useState } from "react";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/components/DashboardPage";

export default function Home() {
  const [view, setView] = useState<"login" | "dashboard">("login");

  return view === "login" ? (
    <LoginPage onLogin={() => setView("dashboard")} />
  ) : (
    <DashboardPage onLogout={() => setView("login")} />
  );
}