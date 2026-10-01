"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useCart } from "@/app/lib/cart-context";
import { DIET_LABEL, fetchCart, isVeg, priceLabel, type CartView } from "@/app/lib/menu-api";
import { Stepper } from "@/app/components/stepper";

/**
 * The order, as a slide-over.
 *
 * Deliberately says out loud that the order is kept for this visit only. The
 * backend holds it in memory, so a restart empties it -- a guest discovering
 * that at the table is worse than a line of small print here.
 */

type DrawerState = {
  open: () => void;
  close: () => void;
  /**
   * Places the order. A dummy for now: nothing reaches a kitchen; the cart is
   * emptied and a toast confirms it. Resolves to the order that was placed, or
   * null when there was nothing in it.
   */
  placeOrder: () => Promise<CartView | null>;
};

const DrawerContext = createContext<DrawerState | null>(null);

export function useCartDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside <CartDrawerProvider>");
  return ctx;
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [placed, setPlaced] = useState<{ id: number; order: CartView } | null>(null);
  const { clear } = useCart();

  const placeOrder = useCallback(async () => {
    // Asked fresh rather than read from context: the chat can add a dish and
    // order it in the same breath, before the context has caught up.
    const order = await fetchCart();
    if (order.totalItems === 0) return null;
    await clear();
    setOpen(false);
    setPlaced({ id: Date.now(), order });
    return order;
  }, [clear]);

  return (
    <DrawerContext.Provider value={{ open: () => setOpen(true), close: () => setOpen(false), placeOrder }}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={() => setOpen(false)} />
      <OrderToast placed={placed} onDismiss={() => setPlaced(null)} />
    </DrawerContext.Provider>
  );
}

const TOAST_MS = 5000;

/** Bottom-right confirmation once an order is placed; dismisses itself. */
function OrderToast({
  placed,
  onDismiss,
}: {
  placed: { id: number; order: CartView } | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!placed) return;
    const timer = window.setTimeout(onDismiss, TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [placed, onDismiss]);

  const order = placed?.order;
  const names = order?.lines.map((l) => (l.qty > 1 ? `${l.qty}× ${l.item.name}` : l.item.name)) ?? [];

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {placed && order && (
          <motion.div
            key={placed.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-ink/[0.08] bg-cream shadow-[0_18px_48px_rgba(28,20,15,0.22)] sm:w-[360px]"
          >
            <div className="flex gap-3.5 p-4 pr-10">
              <motion.span
                initial={{ scale: 0.4, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.08 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-basil text-cream shadow-[0_6px_14px_rgba(26,122,86,0.35)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[17px] leading-tight text-ink">Order placed</p>
                <p className="mt-1 text-[12.5px] text-ink/60 tabular-nums">
                  {order.totalItems} item{order.totalItems === 1 ? "" : "s"}
                  {order.subtotal != null && ` · ₹${Math.round(order.subtotal).toLocaleString("en-IN")}`}
                  {" — the kitchen has it."}
                </p>
                <p className="mt-1.5 truncate text-[12px] text-ink/45">{names.join(", ")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="absolute top-3 right-3 rounded-full p-1 text-ink/35 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {/* time left before it goes */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: TOAST_MS / 1000, ease: "linear" }}
              className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-basil/70"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "Order now", shared by the drawer and the menu page's order panel. */
export function OrderNowButton({ className = "" }: { className?: string }) {
  const { placeOrder } = useCartDrawer();
  const { busy } = useCart();
  const [placing, setPlacing] = useState(false);

  async function handleClick() {
    setPlacing(true);
    try {
      await placeOrder();
    } finally {
      setPlacing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || placing}
      className={`inline-flex items-center justify-center gap-2 text-[14px] transition-[opacity,background-color] disabled:opacity-60 ${className}`}
    >
      {placing ? "Placing order…" : "Order now"}
      {!placing && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, busy, error, setQty, remove, clear } = useCart();
  const lines = cart?.lines ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-label="Your order"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col bg-cream shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl text-ink">Your order</h2>
                <p className="mt-0.5 text-[12px] text-ink/50">
                  {cart?.totalItems ?? 0} item{(cart?.totalItems ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close your order"
                className="rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error && (
                <p className="mb-4 rounded-lg bg-ember/10 px-3 py-2 text-[13px] text-ember">{error}</p>
              )}

              {lines.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-ink/50">Nothing here yet.</p>
                  <Link
                    href="/chat"
                    onClick={onClose}
                    className="mt-3 inline-block text-[14px] text-ember underline underline-offset-4"
                  >
                    Ask what to order
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {lines.map(({ item, qty, lineTotal }) => (
                    <li key={item.id} className="flex gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug text-ink">{item.name}</p>
                        <p className="mt-1 text-[12px] text-ink/50">
                          <span className={isVeg(item) ? "text-basil" : "text-ember"}>
                            {DIET_LABEL[item.diet] ?? item.diet}
                          </span>
                          {priceLabel(item) && ` · ${priceLabel(item)} each`}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <Stepper
                            qty={qty}
                            busy={busy}
                            onChange={(next) => setQty(item.id, next)}
                          />
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            disabled={busy}
                            className="text-[12px] text-ink/40 underline underline-offset-2 transition-colors hover:text-ember disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {lineTotal != null && (
                        <p className="shrink-0 text-[14px] tabular-nums text-ink/70">
                          ₹{Math.round(lineTotal).toLocaleString("en-IN")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-ink/10 px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="font-serif text-2xl text-ink">
                    {cart?.subtotal != null
                      ? `₹${Math.round(cart.subtotal).toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>

                {cart && !cart.complete && (
                  <p className="mt-1 text-[12px] text-ink/45">
                    Some dishes have no price recorded, so this total is incomplete.
                  </p>
                )}

                <OrderNowButton className="mt-4 h-[50px] w-full rounded-full bg-ink text-cream hover:opacity-90" />


                <div className="mt-3 flex items-center justify-between text-[12px]">
                  <button
                    type="button"
                    onClick={clear}
                    disabled={busy}
                    className="text-ink/40 underline underline-offset-2 hover:text-ember disabled:opacity-50"
                  >
                    Clear order
                  </button>
                  {/* Said plainly rather than discovered later: this is in memory. */}
                  <span className="text-ink/35">Kept for this visit only</span>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

