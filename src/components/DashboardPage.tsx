"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import { supabase } from "../lib/supabase";
import { AnalyticsProvider, logContentEvent } from "../lib/AnalyticsContext";
import { joinHub, leaveHub, fetchUserHubSlugs, HubRow } from "../lib/hubDb";


const MainPaneLoading = () => (
  <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
    Loading...
  </div>
);

const DiscoverPage = dynamic(() => import("./DiscoverPage"), { loading: () => <MainPaneLoading /> });
const CategoryPage = dynamic(() => import("./CategoryPage"), { loading: () => <MainPaneLoading /> });
const HubPage = dynamic(() => import("./HubPage"), { loading: () => <MainPaneLoading /> });
const ItemDetailPage = dynamic(() => import("./ItemDetailPage"), { loading: () => <MainPaneLoading /> });
const TimelinePage = dynamic(() => import("./TimelinePage"), { loading: () => <MainPaneLoading /> });
const NicheFeed = dynamic(() => import("./NicheFeed"), { loading: () => <MainPaneLoading /> });
const ProfilePage = dynamic(() => import("./ProfilePage"), { loading: () => <MainPaneLoading /> });
const AccountSettingsPage = dynamic(() => import("./AccountSettingsPage"), { loading: () => <MainPaneLoading /> });
const NotificationsPage = dynamic(() => import("./NotificationsPage"), { loading: () => <MainPaneLoading /> });
const ChatbotPage = dynamic(() => import("./ChatbotPage"), { loading: () => <MainPaneLoading /> });

type SubPage =
  | null
  | { type: "category"; categoryId: string }
  | { type: "hub"; categoryId: string; hubId: string }
  | { type: "item"; categoryId: string; hubId: string; itemId: number };

interface Props {
  onLogout: () => void;
  authUserId: string | null;
}

/** One row in the profile sidebar: `user_goals` joined to `goals`. */
interface GoalRow {
  userGoalId: string;
  goalId: string;
  label: string;
  current: number;
  total: number;
}

interface UserListRow {
  id: string;
  label: string;
  count: number;
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ label, current, total, onIncrement, onDecrement, onDelete, onRename }: {
  label: string; current: number; total: number;
  onIncrement: () => void; onDecrement: () => void;
  onDelete: () => void; onRename: (newLabel: string) => void;
}) {
  const pct = Math.round((current / total) * 100);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    if (draft.trim()) onRename(draft.trim());
    else setDraft(label);
    setEditing(false);
  };

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        {editing ? (
          <input ref={inputRef} value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(label); setEditing(false); } }}
            className="flex-1 text-xs font-medium bg-transparent outline-none border-b"
            style={{ color: "var(--text)", borderColor: "#a78bfa" }} />
        ) : (
          <span className="flex-1 text-xs font-medium leading-snug cursor-pointer hover:opacity-70"
            style={{ color: "var(--text)" }} onClick={() => setEditing(true)} title="Click to rename">
            {label}
          </span>
        )}
        <button onClick={onDelete} className="shrink-0 hover:opacity-80" style={{ color: "var(--text-muted)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onDecrement}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>−</button>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-btn)" }} />
        </div>
        <button onClick={onIncrement}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "#a78bfa" }}>+</button>
      </div>
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{current} / {total}</span>
        <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── New Goal Form ─────────────────────────────────────────────────────────────
function NewGoalForm({ onAdd, onCancel }: {
  onAdd: (label: string, current: number, total: number) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [current, setCurrent] = useState("0");
  const [total, setTotal] = useState("10");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAdd = () => {
    if (!label.trim()) return;
    const c = Math.max(0, parseInt(current) || 0);
    const t = Math.max(1, parseInt(total) || 1);
    onAdd(label.trim(), Math.min(c, t), t);
  };

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface2)", border: "1px solid #a78bfa40" }}>
      <input ref={inputRef} value={label} onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onCancel(); }}
        placeholder="Goal name..."
        className="w-full text-xs bg-transparent outline-none border-b pb-1"
        style={{ color: "var(--text)", borderColor: "var(--border)" }} />
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Current</p>
          <input type="number" min="0" value={current} onChange={e => setCurrent(e.target.value)}
            className="w-full text-xs bg-transparent outline-none border rounded-lg px-2 py-1 text-center"
            style={{ color: "var(--text)", borderColor: "var(--border)" }} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Target</p>
          <input type="number" min="1" value={total} onChange={e => setTotal(e.target.value)}
            className="w-full text-xs bg-transparent outline-none border rounded-lg px-2 py-1 text-center"
            style={{ color: "var(--text)", borderColor: "var(--border)" }} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Cancel</button>
        <button onClick={handleAdd} disabled={!label.trim()}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--gradient-btn)" }}>Add</button>
      </div>
    </div>
  );
}

// ─── New List Form ─────────────────────────────────────────────────────────────
function NewListForm({ onAdd, onCancel }: {
  onAdd: (label: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface2)", border: "1px solid #a78bfa40" }}>
      <input ref={inputRef} value={label} onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && label.trim()) onAdd(label.trim()); if (e.key === "Escape") onCancel(); }}
        placeholder="List name..."
        className="w-full text-xs bg-transparent outline-none border-b pb-1"
        style={{ color: "var(--text)", borderColor: "var(--border)" }} />
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Cancel</button>
        <button onClick={() => label.trim() && onAdd(label.trim())} disabled={!label.trim()}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--gradient-btn)" }}>Add</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onLogout, authUserId }: Props) {
  const [activeNav, setActiveNav] = useState("timeline");
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const userId = authUserId;
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
  );

  function handleNav(id: string) {
    void logContentEvent({
      userId,
      sessionId,
      eventType: "click",
      uiLocation: "shell",
      metadata: { action: "main_nav", target: id, previous: activeNav },
    });
    setActiveNav(id);
    setSubPage(null);
    setShowAccountSettings(false);
  }

  // Joined hubs — shared with TimelinePage
  const [joinedHubs, setJoinedHubs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const loadJoinedHubs = async () => {
      try {
        const hubs = await fetchUserHubSlugs(userId);
        setJoinedHubs(hubs);
      } catch (error) {
        console.error("Error loading joined hubs:", error);
      }
    };
    loadJoinedHubs();
  }, [userId]);


  const toggleJoinHub = async (hubSlug: string) => {
    if (!userId) return;
    const isJoined = joinedHubs.includes(hubSlug);
    try {
      if (isJoined) {
        await leaveHub(userId, hubSlug);
      } else {
        await joinHub(userId, hubSlug);
      }
      // Refresh the list
      const updatedHubs = await fetchUserHubSlugs(userId);
      setJoinedHubs(updatedHubs);
    } catch (error) {
      console.error("Error toggling hub join:", error);
    }
  };

  // Goals (Supabase: `goals` + `user_goals`)
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [showNewGoal, setShowNewGoal] = useState(false);

  const loadGoals = useCallback(async () => {
    if (!userId) {
      setGoals([]);
      return;
    }
    setGoalsLoading(true);
    setGoalsError(null);
    const { data, error } = await supabase
      .from("user_goals")
      .select(`
        id,
        current_value,
        goals (
          id,
          title,
          target_value
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[goals] load failed", error);
      }
      setGoalsError(error.message);
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    const mapped: GoalRow[] = [];
    for (const row of data ?? []) {
      const g = row.goals;
      if (!g || typeof g !== "object" || Array.isArray(g)) continue;
      const goal = g as { id: string; title: string; target_value: number | null };
      const total = Math.max(1, Number(goal.target_value) || 1);
      const raw = Number(row.current_value) || 0;
      const current = Math.min(Math.max(0, raw), total);
      mapped.push({
        userGoalId: row.id,
        goalId: goal.id,
        label: goal.title,
        current,
        total,
      });
    }
    setGoals(mapped);
    setGoalsLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const incrementGoal = async (g: GoalRow) => {
    if (!userId || g.current >= g.total) return;
    const next = g.current + 1;
    const { error } = await supabase
      .from("user_goals")
      .update({ current_value: next, updated_at: new Date().toISOString() })
      .eq("id", g.userGoalId)
      .eq("user_id", userId);
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] increment", error);
      setGoalsError(error.message);
      return;
    }
    setGoalsError(null);
    setGoals((prev) =>
      prev.map((row) => (row.userGoalId === g.userGoalId ? { ...row, current: next } : row))
    );
  };

  const decrementGoal = async (g: GoalRow) => {
    if (!userId || g.current <= 0) return;
    const next = g.current - 1;
    const { error } = await supabase
      .from("user_goals")
      .update({ current_value: next, updated_at: new Date().toISOString() })
      .eq("id", g.userGoalId)
      .eq("user_id", userId);
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] decrement", error);
      setGoalsError(error.message);
      return;
    }
    setGoalsError(null);
    setGoals((prev) =>
      prev.map((row) => (row.userGoalId === g.userGoalId ? { ...row, current: next } : row))
    );
  };

  const deleteGoal = async (g: GoalRow) => {
    if (!userId) return;
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", g.goalId)
      .eq("owner_user_id", userId);
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] delete", error);
      setGoalsError(error.message);
      return;
    }
    setGoalsError(null);
    setGoals((prev) => prev.filter((row) => row.goalId !== g.goalId));
  };

  const renameGoal = async (g: GoalRow, newLabel: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("goals")
      .update({ title: newLabel })
      .eq("id", g.goalId)
      .eq("owner_user_id", userId);
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] rename", error);
      setGoalsError(error.message);
      return;
    }
    setGoalsError(null);
    setGoals((prev) =>
      prev.map((row) => (row.goalId === g.goalId ? { ...row, label: newLabel } : row))
    );
  };

  const addGoal = async (label: string, current: number, total: number) => {
    if (!userId) return;
    setGoalsError(null);
    const { data: inserted, error: gErr } = await supabase
      .from("goals")
      .insert({ owner_user_id: userId, title: label, target_value: total })
      .select("id")
      .single();
    if (gErr || !inserted) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] insert goal", gErr);
      setGoalsError(gErr?.message ?? "Failed to create goal");
      return;
    }
    const start = Math.min(Math.max(0, current), total);
    const { error: ugErr } = await supabase.from("user_goals").insert({
      user_id: userId,
      goal_id: inserted.id,
      current_value: start,
    });
    if (ugErr) {
      if (process.env.NODE_ENV === "development") console.warn("[goals] insert user_goals", ugErr);
      setGoalsError(ugErr.message);
      await supabase.from("goals").delete().eq("id", inserted.id).eq("owner_user_id", userId);
      return;
    }
    setShowNewGoal(false);
    await loadGoals();
  };

  // Lists
  const [lists, setLists] = useState<UserListRow[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [expandedListIds, setExpandedListIds] = useState<Record<string, boolean>>({});
  const [listItemsByListId, setListItemsByListId] = useState<Record<string, Array<{
    listItemId: string | null;
    title: string;
    itemId: number | null;
    hubSlug: string | null;
    hobbySlug: string | null;
  }>>>({});

  const loadLists = useCallback(async () => {
    if (!userId) {
      setLists([]);
      setListsError(null);
      return;
    }

    setListsLoading(true);
    setListsError(null);

    const { data: listsData, error: listsErr } = await supabase
      .from("lists")
      .select("id, title")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (listsErr) {
      setListsError(listsErr.message);
      setLists([]);
      setListsLoading(false);
      return;
    }

    const rawLists = (listsData ?? []) as Array<{ id: string; title: string }>;
    const withCounts: UserListRow[] = await Promise.all(
      rawLists.map(async (list) => {
        const { count } = await supabase
          .from("list_items")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id);
        return {
          id: list.id,
          label: list.title,
          count: count ?? 0,
        };
      })
    );

    setLists(withCounts);
    setListsLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  const addList = async (label: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("lists")
      .insert({ user_id: userId, title: label.trim(), type: "generic" });
    if (error) {
      setListsError(error.message);
      return;
    }
    setListsError(null);
    setShowNewList(false);
    await loadLists();
  };

  const toggleListExpanded = async (listId: string) => {
    setExpandedListIds(prev => ({ ...prev, [listId]: !prev[listId] }));
    if (listItemsByListId[listId]) return;

    const { data, error } = await supabase
      .from("list_items")
      .select("id, title, item_id")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });
    let rawItems: Array<{ id: string | null; title: string; item_id: number | null }> = [];

    if (error) {
      // Backward-compatible fallback for DBs that don't yet have list_items.item_id.
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from("list_items")
        .select("id, title")
        .eq("list_id", listId)
        .order("created_at", { ascending: true });
      if (fallbackErr) {
        setListsError(fallbackErr.message);
        return;
      }
      rawItems = ((fallbackData ?? []) as Array<{ id: string; title: string }>).map((r) => ({
        id: r.id,
        title: r.title,
        item_id: null,
      }));
    } else {
      rawItems = (data ?? []) as Array<{ id: string; title: string; item_id: number | null }>;
    }

    const itemIds = rawItems
      .map((r) => r.item_id)
      .filter((v): v is number => typeof v === "number");

    const contextByItemId = new Map<number, { hubSlug: string | null; hobbySlug: string | null }>();
    if (itemIds.length > 0) {
      const { data: itemContextRows, error: itemContextErr } = await supabase
        .from("items")
        .select("id, hubs!inner(slug, hobbies(slug))")
        .in("id", itemIds);

      if (itemContextErr) {
        setListsError(itemContextErr.message);
      } else {
        for (const row of (itemContextRows ?? []) as Array<{
          id: number;
          hubs?: { slug?: string | null; hobbies?: { slug?: string | null } | null } | null;
        }>) {
          contextByItemId.set(row.id, {
            hubSlug: row.hubs?.slug ?? null,
            hobbySlug: row.hubs?.hobbies?.slug ?? null,
          });
        }
      }
    }

    const entries = rawItems.map((r) => {
      const ctx = r.item_id != null ? contextByItemId.get(r.item_id) : undefined;
      return {
        listItemId: r.id,
        title: r.title,
        itemId: r.item_id ?? null,
        hubSlug: ctx?.hubSlug ?? null,
        hobbySlug: ctx?.hobbySlug ?? null,
      };
    });
    setListItemsByListId(prev => ({ ...prev, [listId]: entries }));
  };

  const removeListItem = async (listId: string, listItemId: string | null) => {
    if (!listItemId) return;
    const { error } = await supabase
      .from("list_items")
      .delete()
      .eq("id", listItemId);
    if (error) {
      setListsError(error.message);
      return;
    }
    setListsError(null);
    setListItemsByListId(prev => {
      const next = { ...prev };
      next[listId] = (next[listId] ?? []).filter((item) => item.listItemId !== listItemId);
      return next;
    });
    setLists(prev => prev.map((l) => (l.id === listId ? { ...l, count: Math.max(0, l.count - 1) } : l)));
  };

  const deleteList = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("lists")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      setListsError(error.message);
      return;
    }
    setListsError(null);
    setLists(prev => prev.filter(l => l.id !== id));
    setExpandedListIds(prev => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    setListItemsByListId(prev => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    // Re-sync from backend so UI always reflects persisted state.
    await loadLists();
  };



  return (
    <AnalyticsProvider userId={userId} sessionId={sessionId}>
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar
          activeNav={activeNav}
          setActiveNav={handleNav}
          onLogout={onLogout}
          unreadCount={unreadCount}
          onSelectHub={(categoryId, hubId) => {
            setActiveNav("discover");
            setSubPage({ type: "hub", categoryId, hubId });
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {activeNav === "timeline" ? (
            <TimelinePage
              joinedHubs={joinedHubs}
              onToggleJoin={toggleJoinHub}
            />
          ) : activeNav === "discover" ? (
            subPage?.type === "item" ? (
              <ItemDetailPage
                categoryId={subPage.categoryId}
                hubId={subPage.hubId}
                itemId={subPage.itemId}
                onBack={() => setSubPage({ type: "hub", categoryId: subPage.categoryId, hubId: subPage.hubId })}
              />
            ) : subPage?.type === "hub" ? (
              <HubPage
                categoryId={subPage.categoryId}
                hubId={subPage.hubId}
                onBack={() => setSubPage({ type: "category", categoryId: subPage.categoryId })}
                onSelectItem={(itemId) =>
                  setSubPage({ type: "item", categoryId: subPage.categoryId, hubId: subPage.hubId, itemId })
                }
              />
            ) : subPage?.type === "category" ? (
              <CategoryPage
                categoryId={subPage.categoryId}
                onBack={() => setSubPage(null)}
                onSelectHub={(hubId) =>
                  setSubPage({ type: "hub", categoryId: subPage.categoryId, hubId })
                }
              />
            ) : (
              <DiscoverPage
                onSelectCategory={(categoryId) => setSubPage({ type: "category", categoryId })}
              />
            )
          ) : activeNav === "orbit" ? (
            <NicheFeed />
          ) : activeNav === "profile" ? (
            showAccountSettings ? (
              <AccountSettingsPage
                onBack={() => setShowAccountSettings(false)}
                displayName=""
                handle=""
                email=""
              />
            ) : (
              <ProfilePage onOpenSettings={() => setShowAccountSettings(true)} />
            )
          ) : activeNav === "notifications" ? (
            <NotificationsPage />
          ) : null}
        </main>

        {activeNav === "profile" && <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen overflow-y-auto p-4 gap-5"
          style={{ borderLeft: "1px solid var(--border)" }}>

          {/* ── Goals ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Goals</h3>
              {!showNewGoal && (
                <button onClick={() => setShowNewGoal(true)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base hover:opacity-80 transition-all"
                  style={{ background: "var(--gradient-btn)" }}>+</button>
              )}
            </div>
            {goalsError && (
              <p className="text-[10px] mb-2 leading-snug" style={{ color: "#f87171" }}>{goalsError}</p>
            )}
            <div className="space-y-2">
              {showNewGoal && <NewGoalForm onAdd={addGoal} onCancel={() => setShowNewGoal(false)} />}
              {goalsLoading && !showNewGoal && (
                <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>Loading goals…</p>
              )}
              {!goalsLoading && goals.map((g) => (
                <GoalCard key={g.userGoalId} label={g.label} current={g.current} total={g.total}
                  onIncrement={() => void incrementGoal(g)}
                  onDecrement={() => void decrementGoal(g)}
                  onDelete={() => void deleteGoal(g)}
                  onRename={(newLabel) => void renameGoal(g, newLabel)} />
              ))}
              {!goalsLoading && goals.length === 0 && !showNewGoal && (
                <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No goals yet. Hit + to add one!
                </p>
              )}
            </div>
          </div>

          <div className="h-px" style={{ background: "var(--border)" }} />

          {/* ── Lists ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Lists</h3>
              {!showNewList && (
                <button onClick={() => setShowNewList(true)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base hover:opacity-80 transition-all"
                  style={{ background: "var(--gradient-btn)" }}>+</button>
              )}
            </div>
            {listsError && (
              <p className="text-[10px] mb-2 leading-snug" style={{ color: "#f87171" }}>{listsError}</p>
            )}
            <div className="space-y-2">
              {showNewList && <NewListForm onAdd={addList} onCancel={() => setShowNewList(false)} />}
              {listsLoading && !showNewList && (
                <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>Loading lists…</p>
              )}
              {lists.map(list => (
                <div key={list.id} className="rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between w-full px-3 py-2.5">
                    <span
                      className="flex-1 text-sm font-medium cursor-pointer hover:opacity-70 truncate"
                      onClick={() => void toggleListExpanded(list.id)}
                      title="Click to expand list"
                    >
                      {list.label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                        {list.count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteList(list.id);
                        }}
                        className="hover:opacity-80"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {expandedListIds[list.id] && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5">
                      {(listItemsByListId[list.id] ?? []).length === 0 ? (
                        <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                          No items in this list yet.
                        </p>
                      ) : (listItemsByListId[list.id] ?? []).map((entry, idx) => (
                        <div key={`${list.id}-${idx}`} className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className="block text-xs leading-snug text-left hover:opacity-80 truncate"
                            style={{ color: "#a78bfa" }}
                            onClick={() => {
                              if (!entry.itemId || !entry.hubSlug || !entry.hobbySlug) return;
                              setActiveNav("discover");
                              setSubPage({
                                type: "item",
                                categoryId: entry.hobbySlug,
                                hubId: entry.hubSlug,
                                itemId: entry.itemId,
                              });
                            }}
                          >
                            {entry.title}
                          </button>
                          <button
                            type="button"
                            className="shrink-0 hover:opacity-80"
                            style={{ color: "var(--text-muted)" }}
                            onClick={() => void removeListItem(list.id, entry.listItemId)}
                            title="Remove from list"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!listsLoading && lists.length === 0 && !showNewList && (
                <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No lists yet. Hit + to add one!
                </p>
              )}
            </div>
          </div>

          <div className="h-px" style={{ background: "var(--border)" }} />

          {/* ── My Hubs ── */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "Syne, sans-serif" }}>My Hubs</h3>
            <div className="flex flex-wrap gap-2">
              {joinedHubs.map(hub => (
                <div key={hub}
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-70 transition-all"
                // TODO: Add onClick to go to Hub Page
                >
                  <span>{hub}</span>
                </div>
              ))}
              {joinedHubs.length === 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No hubs joined yet.</p>
              )}
            </div>
          </div>

        </aside>}
      </div>
    </AnalyticsProvider>
  );
}