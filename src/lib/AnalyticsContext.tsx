"use client";

import React, { createContext, useContext } from "react";

export interface AnalyticsIdentity {
  userId: string | null;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsIdentity | null>(null);

export function AnalyticsProvider({
  userId,
  sessionId,
  children,
}: AnalyticsIdentity & { children: React.ReactNode }) {
  return (
    <AnalyticsContext.Provider value={{ userId, sessionId }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsIdentity {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    return { userId: null, sessionId: "" };
  }
  return ctx;
}

export { logContentEvent } from "./analytics";
