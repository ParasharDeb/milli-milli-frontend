/**
 * Client for the Express backend.
 *
 * In the browser these are relative URLs, rewritten onto the backend by
 * `next.config.ts`. On the server (React Server Components) there is no origin
 * to be relative to, so the backend is addressed directly.
 */

const SERVER_BASE = process.env.BACKEND_URL ?? "http://localhost:4000";

function url(path: string): string {
  return typeof window === "undefined" ? `${SERVER_BASE}${path}` : path;
}

export type MenuItem = {
  id: string;
  name: string;
  desc: string | null;
  cuisine: string;
  course: string;
  diet: string;
  protein: string;
  spice: number;
  /** Null, or below 0.5, means the heat level was never confidently assessed. */
  spiceConfidence: number | null;
  tasteTags: string[];
  serves: number[];
  allergens: string | null;
};

export type MenuSection = {
  course: string;
  label: string;
  items: MenuItem[];
};

export type ItemsResponse = {
  total: number;
  sections: MenuSection[];
  items: MenuItem[];
};

export type MenuStats = {
  total: number;
  food: number;
  drink: number;
  byCourse: Record<string, number>;
  byDiet: Record<string, number>;
  byCuisine: Record<string, number>;
  spiceSpread: Record<string, number>;
  lowConfidenceSpice: number;
};

export type Recommendation = {
  rank: number;
  score: number;
  why: string;
  item: MenuItem;
};

export type RecommendationGroup = {
  id: string;
  label: string;
  count: number;
  constraints: Record<string, string>;
  searchText: string;
  relaxations: string[];
  shortfall: number;
  recommendations: Recommendation[];
};

export type ChatResponse =
  | {
      kind: "recommendations";
      query: string;
      partySize: number;
      assignedGuests: number;
      unassignedGuests: number;
      perSlot: number;
      groups: RecommendationGroup[];
      warnings: { code: string; slotId?: string; message: string }[];
      meta: { parseMode: string; tookMs: number };
    }
  | {
      kind: "answer";
      query: string;
      answer: string;
      dishes: MenuItem[];
      chips: string[];
      meta: { parseMode: string; tookMs: number };
    };

type ApiError = { error: { code: string; message: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), init);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (body as ApiError | null)?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export function sendChat(message: string, signal?: AbortSignal) {
  return request<ChatResponse>("/api/menu/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });
}

export function fetchItems(params: { group?: "food" | "drink" | "all" } = {}) {
  const query = new URLSearchParams({ group: params.group ?? "food" });
  return request<ItemsResponse>(`/api/menu/items?${query}`, {
    // The menu changes when staff edit it, not on a build cadence.
    cache: "no-store",
  });
}

export function fetchStats() {
  return request<MenuStats>("/api/menu/stats", { cache: "no-store" });
}

/* --- presentation helpers, shared by the menu page and the chat cards --- */

export const DIET_LABEL: Record<string, string> = {
  Vegeterian: "Vegetarian",
  Non_vegeterian: "Non-veg",
  Eggeterian: "Egg",
  OnlyFish: "Seafood",
  Jain: "Jain",
};

const SPICE_LABEL = ["No heat", "Very mild", "Mild", "Medium", "Hot", "Very hot"];

/**
 * Returns null when the enrichment was not confident. Showing "no heat" for a
 * dish nobody assessed is worse than showing nothing.
 */
export function spiceLabel(item: MenuItem): string | null {
  if (item.spiceConfidence == null || item.spiceConfidence < 0.5) return null;
  return SPICE_LABEL[item.spice] ?? "Medium";
}

export function isVeg(item: MenuItem): boolean {
  return item.diet === "Vegeterian" || item.diet === "Jain";
}
