"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addManyToCart,
  addToCart,
  clearCart,
  fetchCart,
  removeFromCart,
  setCartQuantity,
  type CartView,
} from "@/app/lib/menu-api";

/**
 * The guest's order, shared by the nav badge, the drawer, the menu page and the
 * chat.
 *
 * `apply` is the reason this is a context rather than a hook per component: a
 * chat reply that changes the order already carries the whole new cart, so the
 * badge can update from it without a second round trip.
 */

type CartState = {
  cart: CartView | null;
  busy: boolean;
  error: string | null;
  add: (itemId: string, qty?: number) => Promise<void>;
  /** Several dishes at once -- a combo at the quantities the guest chose. */
  addMany: (lines: { itemId: string; qty: number }[]) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  /** Adopt a cart the backend already sent us, with no extra request. */
  apply: (cart: CartView) => void;
};

const EMPTY: CartView = { lines: [], count: 0, totalItems: 0, subtotal: 0, complete: true };

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The cart lives in the API process and is lost when it restarts, so the
  // browser asks rather than assuming. A failure here is not worth an error
  // banner on page load: an empty order is the truthful fallback.
  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((c) => !cancelled && setCart(c))
      .catch(() => !cancelled && setCart(EMPTY));
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async (fn: () => Promise<CartView>) => {
    setBusy(true);
    setError(null);
    try {
      setCart(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your order");
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<CartState>(
    () => ({
      cart,
      busy,
      error,
      add: (itemId, qty = 1) => run(() => addToCart(itemId, qty)),
      addMany: (lines) => run(() => addManyToCart(lines)),
      setQty: (itemId, qty) => run(() => setCartQuantity(itemId, qty)),
      remove: (itemId) => run(() => removeFromCart(itemId)),
      clear: () => run(() => clearCart()),
      apply: (next) => setCart(next),
    }),
    [cart, busy, error, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
