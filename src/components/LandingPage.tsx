"use client";

import { useEffect, useRef, useState } from "react";
import OrbitLogo from "./OrbitLogo";
import LoginOrbitBackground from "./LoginOrbitBackground";

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

function FadeInSection({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 540ms ease ${delayMs}ms, transform 540ms ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  title,
  body,
  emoji,
}: {
  title: string;
  body: string;
  emoji: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "color-mix(in srgb, var(--surface) 62%, transparent)",
        border: "1px solid color-mix(in srgb, var(--border) 75%, #a78bfa 25%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="text-xl mb-2" aria-hidden>
        {emoji}
      </div>
      <h3
        className="text-base font-semibold mb-2"
        style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {body}
      </p>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onLogin }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <LoginOrbitBackground theme={theme} />

      <div className="relative z-10">
        <header className="px-4 sm:px-6 pt-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrbitLogo size={36} />
              <div>
                <p
                  className="text-lg font-bold leading-none"
                  style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}
                >
                  orbit.r
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme === "light" ? "rgba(30, 41, 59, 0.75)" : "var(--text-dim)" }}
                >
                  Explore niche hubs in your orbit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  background: "color-mix(in srgb, var(--surface2) 45%, transparent)",
                }}
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                onClick={onLogin}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ color: "var(--text)", border: "1px solid var(--border)" }}
              >
                Log in
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 pb-16">
          <section className="max-w-5xl mx-auto text-center pt-12 sm:pt-20">
            <FadeInSection>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{
                  color: theme === "light" ? "#4f46e5" : "#c4b5fd",
                  border: "1px solid color-mix(in srgb, var(--border) 70%, #a78bfa 30%)",
                  background: theme === "light"
                    ? "color-mix(in srgb, #ffffff 76%, #e0e7ff 24%)"
                    : "color-mix(in srgb, var(--surface2) 55%, transparent)",
                }}
              >
                Built for hobby-driven communities
              </div>
            </FadeInSection>

            <FadeInSection delayMs={70}>
              <h1
                className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]"
                style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}
              >
                Find your people.
                <br />
                <span
                  style={{
                    background: "var(--gradient-btn)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Build your orbit.
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection delayMs={130}>
              <p
              className="text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed font-medium"
              style={{
                color: "color-mix(in srgb, var(--text) 80%, var(--text-dim) 20%)",
                textShadow: theme === "light" ? "none" : "0 1px 1px rgba(0, 0, 0, 0.14)",
              }}
              >
                Orbit helps you discover niche hubs, share updates on your timeline, and connect with people
                around the hobbies you care about most.
              </p>
            </FadeInSection>

            <FadeInSection delayMs={180}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onGetStarted}
                  className="px-7 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "var(--gradient-btn)" }}
                >
                  Get started
                </button>
                <button
                  onClick={onLogin}
                  className="px-7 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    background: "color-mix(in srgb, var(--surface2) 55%, transparent)",
                  }}
                >
                  I already have an account
                </button>
              </div>
            </FadeInSection>
          </section>

          <FadeInSection
            delayMs={120}
            className="max-w-6xl mx-auto mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <FeatureCard
                emoji="🛰️"
                title="Discover niche hubs"
                body="Browse hobby hubs like fitness, movies, gaming, and more to find communities that match your interests."
              />
            </div>
            <div>
              <FeatureCard
                emoji="📝"
                title="Share your timeline"
                body="Post updates, join conversations, and keep up with what your communities are doing across the app."
              />
            </div>
            <div>
              <FeatureCard
                emoji="🎯"
                title="Track personal goals"
                body="Set progress goals tied to your interests so Orbit becomes a place to grow, not just scroll."
              />
            </div>
          </FadeInSection>

        </main>
      </div>
    </div>
  );
}
