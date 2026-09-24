/**
 * Client for the Express backend.
 *
 * In the browser these are relative URLs, rewritten onto the backend by
 * `next.config.ts`. On the server (React Server Components) there is no origin
 * to be relative to, so the backend is addressed directly.
 */

import { getSessionId } from "./session";

const SERVER_BASE = process.env.BACKEND_URL ?? "https://mili-mili-backend.onrender.com";

function url(path: string): string {
  return typeof window === "undefined" ? `${SERVER_BASE}${path}` : path;
}

export type MenuItem = {
  id: string;
  name: string;
  desc: string | null;
  /** Rupees. */
  price: number | null;
  cuisine: string;
  course: string;
  diet: string;
  protein: string;
  spice: number;
  /** Null, or below 0.5, means the heat level was never confidently assessed. */
  spiceConfidence: number | null;
  tasteTags: string[];
  /** POS merchandising labels: bestseller, trending, chefs-special... */
  tags: string[];
  servesMin: number;
  servesMax: number;
  /**
   * Verified allergens only, and usually empty. The POS column of this name was
   * merchandising copy and now lives in `tags`, where it cannot be mistaken for
   * a safety claim.
   */
  allergens: string[];
  allergensVerified: boolean;
  imageUrl: string | null;
  /** Estimated % ABV for bar items, 0 for soft drinks, null for food. */
  abv?: number | null;
  drinkStyle?: string | null;
};

export type ComboItem = {
  item: MenuItem;
  /** The suggested starting quantity, scaled to the party. The guest adjusts it. */
  qty: number;
  role: "Main" | "Bread" | "Rice" | "Side" | "Starter" | "Dessert" | "Drink";
  why: string;
};

export type Combo = { id: string; title: string; why: string; items: ComboItem[] };

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

export type ChatMeta = {
  route: string;
  /** Which classifier ran: "jev", or "heuristic" when it was unavailable. */
  routeMode: "jev" | "heuristic";
  slotMode?: "jev" | "heuristic";
  intentConfidence: number;
  tookMs: number;
  sessionId: string;
};

export type Warning = { code: string; slotId?: string; message: string };

export type CartLine = { item: MenuItem; qty: number; lineTotal: number | null };

export type CartView = {
  lines: CartLine[];
  count: number;
  totalItems: number;
  /** Null when any line has no price, so a partial total is never shown as whole. */
  subtotal: number | null;
  complete: boolean;
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
      warnings: Warning[];
      meta: ChatMeta;
    }
  /** A composed suggestion. Reuses RecommendationGroup so it renders identically. */
  | {
      kind: "advice";
      query: string;
      answer: string;
      groups: RecommendationGroup[];
      warnings: Warning[];
      chips: string[];
      meta: ChatMeta;
    }
  /** Three combos of three items each, every item with a suggested quantity. */
  | {
      kind: "combos";
      query: string;
      answer: string;
      combos: Combo[];
      warnings: Warning[];
      chips: string[];
      meta: ChatMeta;
    }
  | {
      kind: "answer";
      query: string;
      answer: string;
      dishes: MenuItem[];
      chips: string[];
      meta: ChatMeta;
    }
  | {
      kind: "cart";
      query: string;
      action: "added" | "removed" | "updated" | "cleared" | "viewed";
      answer: string;
      changed: MenuItem[];
      cart: CartView;
      chips: string[];
      meta: ChatMeta;
    }
  /** The backend refused to guess between dishes. Each option is a ready reply. */
  | {
      kind: "clarify";
      query: string;
      answer: string;
      options: { label: string; message: string; item: MenuItem }[];
      chips: string[];
      meta: ChatMeta;
    };

type ApiError = { error: { code: string; message: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const sessionId = getSessionId();
  const res = await fetch(url(path), {
    ...init,
    headers: {
      ...init?.headers,
      // Ties this browser to its cart and its conversation. Absent during
      // server rendering, where the backend mints a throwaway one.
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    },
  });
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
  Vegetarian: "Vegetarian",
  NonVegetarian: "Non-veg",
  Eggetarian: "Egg",
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
  return item.diet === "Vegetarian" || item.diet === "Jain";
}

/** Indian formatting, and never a bare "0" for a dish nobody priced. */
export function priceLabel(item: Pick<MenuItem, "price">): string | null {
  if (item.price == null) return null;
  return `₹${Math.round(item.price).toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ cart -- */

export function fetchCart() {
  return request<CartView>("/api/cart", { cache: "no-store" });
}

export function addToCart(itemId: string, qty = 1) {
  return request<CartView & { added: MenuItem }>("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, qty }),
  });
}

/** A whole combo in one request. All or nothing; qty 0 lines are skipped. */
export function addManyToCart(lines: { itemId: string; qty: number }[]) {
  return request<CartView & { added: MenuItem[] }>("/api/cart/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
}

export function setCartQuantity(itemId: string, qty: number) {
  return request<CartView>(`/api/cart/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty }),
  });
}

export function removeFromCart(itemId: string) {
  return request<CartView>(`/api/cart/${itemId}`, { method: "DELETE" });
}

export function clearCart() {
  return request<CartView>("/api/cart", { method: "DELETE" });
}
