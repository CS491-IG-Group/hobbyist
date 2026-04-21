import { supabase } from "./supabase";
import type { HubDetail, HubItem } from "@/components/hubData";

export type HubRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  member_count: number | null;
  post_count: number | null;
  hobby_id: number | null;
  /** From `hobbies.slug` when joined; used for tag defaults when `name` is not a canonical hub label. */
  hobby_slug?: string | null;
};

export function hubRowToDetail(row: HubRow, items: HubItem[] = []): HubDetail {
  return {
    id: row.slug,
    name: row.name,
    description: row.description ?? "",
    emoji: row.icon ?? "✨",
    gradientFrom: row.gradient_from ?? "#312e81",
    gradientTo: row.gradient_to ?? "#6366f1",
    posts: row.post_count ?? 0,
    members: row.member_count ?? 0,
    items,
  };
}

function stripHubRows(rows: Record<string, unknown>[]): HubRow[] {
  return rows.map((row) => {
    const { hobbies: h, ...rest } = row;
    const nested = h as { slug?: string } | null | undefined;
    const hobby_slug =
      nested && typeof nested.slug === "string" && nested.slug.trim() ? nested.slug.trim().toLowerCase() : null;
    return { ...rest, hobby_slug } as HubRow;
  });
}

export async function fetchHubsForHobbySlug(hobbySlug: string): Promise<HubRow[]> {
  /* Prefer join (one round trip); falls back if PostgREST relationship name differs */
  const joined = await supabase
    .from("hubs")
    .select("*, hobbies!inner(slug)")
    .eq("hobbies.slug", hobbySlug);

  if (!joined.error && joined.data?.length !== undefined) {
    return stripHubRows(joined.data as Record<string, unknown>[]);
  }

  if (process.env.NODE_ENV === "development" && joined.error) {
    console.warn("[hubDb] join fetch hubs, using hobby_id fallback", joined.error.message);
  }

  const { data: hobby, error: hErr } = await supabase
    .from("hobbies")
    .select("id")
    .eq("slug", hobbySlug)
    .maybeSingle();
  if (hErr) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] hobby lookup failed", hErr.message);
    }
    return [];
  }
  if (!hobby) return [];

  const { data, error } = await supabase.from("hubs").select("*").eq("hobby_id", hobby.id);
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] fetch hubs for hobby", error.message);
    }
    return [];
  }
  return (data ?? []) as HubRow[];
}

export async function fetchHubBySlug(slug: string): Promise<HubRow | null> {
  const { data, error } = await supabase.from("hubs").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] fetch hub by slug", error);
    }
    return null;
  }
  return data as HubRow | null;
}

export async function fetchAllHubs(): Promise<HubRow[]> {
  const { data, error } = await supabase
    .from("hubs")
    .select("*, hobbies(slug)")
    .order("name", { ascending: true });
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] fetch all hubs", error);
    }
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const { hobbies: h, ...rest } = row;
    const nested = h as { slug?: string } | null | undefined;
    const hobby_slug =
      nested && typeof nested.slug === "string" && nested.slug.trim() ? nested.slug.trim().toLowerCase() : null;
    return { ...rest, hobby_slug } as HubRow;
  });
}

// allow user to join a hub
export async function joinHub(userId: string, hubSlug: string): Promise<{ error: string | null }> {
  // Resolve slug → id since your app works in slugs
  const hub = await fetchHubBySlug(hubSlug);
  if (!hub) return { error: "Hub not found" };

  const { error } = await supabase
    .from("user_hubs")
    .insert({ user_id: userId, hub_id: hub.id, role: "member" });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] joinHub", error.message);
    }
    // Unique constraint violation = already a member
    if (error.code === "23505") return { error: "Already a member" };
    return { error: error.message };
  }

  return { error: null };
}

// allow user to leave a hub
export async function leaveHub(userId: string, hubSlug: string): Promise<{ error: string | null }> {
  const hub = await fetchHubBySlug(hubSlug);
  if (!hub) return { error: "Hub not found" };

  const { error } = await supabase
    .from("user_hubs")
    .delete()
    .match({ user_id: userId, hub_id: hub.id });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] leaveHub", error.message);
    }
    return { error: error.message };
  }

  return { error: null };
}


// fetch user's hubs
export async function fetchUserHubSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_hubs")
    .select("hub_id, hubs(slug)")
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[hubDb] fetchUserHubSlugs", error.message);
    }
    return [];
  }

  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const h = row.hubs as { slug?: string } | null;
      return h?.slug ?? null;
    })
    .filter(Boolean) as string[];
}