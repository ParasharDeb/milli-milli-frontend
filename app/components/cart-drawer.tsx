"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useCart } from "@/app/lib/cart-context";
import {
  cancelOrder,
  DIET_LABEL,
  fetchCart,
  fetchOrder,
  isVeg,
  priceLabel,
  type CartView,
  type Order,
} from "@/app/lib/menu-api";
import { setTable, tableFromLocation } from "@/app/lib/table";
import { Stepper } from "@/app/components/stepper";
import { CheckoutSheet, OrderStatusView } from "@/app/components/order-flow";

/**
 * The order, as a slide-over.
 *
 * Deliberately says out loud that the order is kept for this visit only. The
 * backend holds it in memory, so a restart empties it -- a guest discovering
 * that at the table is worse than a line of small print here.
 */

export type PlaceResult =
  | { status: "empty" }
  /** The guest closed the checkout without sending. */
  | { status: "cancelled" }
  /** Sent to the floor; a captain will confirm it. Not yet placed. */
  | { status: "sent"; order: Order };

type DrawerState = {
  open: () => void;
  close: () => void;
  /**
   * Starts sending the order: opens the checkout, which asks where the guest is
   * sitting, and resolves once they send it or back out. Sending is not
   * placing -- a captain confirms it at the table first. See order-flow.tsx.
   */
  placeOrder: () => Promise<PlaceResult>;
};

const DrawerContext = createContext<DrawerState | null>(null);

export function useCartDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside <CartDrawerProvider>");
  return ctx;
}

/** The order waiting on a captain survives a reload, so the guest isn't left wondering. */
const ACTIVE_ORDER_KEY = "milli_active_order";
const POLL_MS = 4000;

function rememberOrder(id: string | null) {
  try {
    if (id) window.localStorage.setItem(ACTIVE_ORDER_KEY, id);
    else window.localStorage.removeItem(ACTIVE_ORDER_KEY);
  } catch {
    /* storage disabled: the status just won't survive a reload */
  }
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [checkout, setCheckout] = useState<CartView | null>(null);
  const [active, setActive] = useState<Order | null>(null);
  const [expanded, setExpanded] = useState(false);
  const resolveCheckout = useRef<((r: PlaceResult) => void) | null>(null);
  const { apply, addMany } = useCart();

  // Arriving by the table's QR code (…/menu?table=12) tells us the table.
  useEffect(() => {
    const table = tableFromLocation();
    if (table) setTable(table);
  }, []);

  // Pick up an order still waiting from before a reload.
  useEffect(() => {
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(ACTIVE_ORDER_KEY);
    } catch {
      /* no storage */
    }
    if (!id) return;
    fetchOrder(id)
      .then(({ order }) => setActive(order))
      .catch(() => rememberOrder(null));
  }, []);

  // Wait for the captain. Polling, not a socket: one small GET every few
  // seconds while an order is pending, and nothing at all otherwise.
  const activeId = active?.id;
  const activePending = active?.status === "pending";
  useEffect(() => {
    if (!activeId || !activePending) return;
    const timer = window.setInterval(async () => {
      try {
        const { order } = await fetchOrder(activeId);
        if (order.status !== "pending") {
          setActive(order);
          setExpanded(true);
          rememberOrder(null);
        }
      } catch {
        /* a blip; the next tick tries again */
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeId, activePending]);

  const placeOrder = useCallback(async (): Promise<PlaceResult> => {
    // Asked fresh rather than read from context: the chat can add a dish and
    // order it in the same breath, before the context has caught up.
    const cart = await fetchCart();
    if (cart.totalItems === 0) return { status: "empty" };
    resolveCheckout.current?.({ status: "cancelled" });
    setOpen(false);
    setCheckout(cart);
    return new Promise<PlaceResult>((resolve) => {
      resolveCheckout.current = resolve;
    });
  }, []);

  function finishCheckout(result: PlaceResult) {
    setCheckout(null);
    resolveCheckout.current?.(result);
    resolveCheckout.current = null;
  }

  function sent(order: Order) {
    // The backend emptied the cart as it took the order.
    apply({ lines: [], count: 0, totalItems: 0, subtotal: 0, complete: true });
    setActive(order);
    setExpanded(true);
    rememberOrder(order.id);
    finishCheckout({ status: "sent", order });
  }

  async function cancelActive() {
    if (!active) return;
    const { order } = await cancelOrder(active.id);
    setActive(order);
    rememberOrder(null);
  }

  async function putBack() {
    if (!active) return;
    await addMany(active.lines.map((l) => ({ itemId: l.itemId, qty: l.qty })));
    setActive(null);
    setOpen(true);
  }

  return (
    <DrawerContext.Provider value={{ open: () => setOpen(true), close: () => setOpen(false), placeOrder }}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={() => setOpen(false)} />
      <CheckoutSheet cart={checkout} onSent={sent} onCancel={() => finishCheckout({ status: "cancelled" })} />
      <OrderStatusView
        order={active}
        expanded={expanded}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
        onDismiss={() => {
          if (active?.status === "pending") return setExpanded(false);
          setActive(null);
          setExpanded(false);
        }}
        onCancel={cancelActive}
        onPutBack={putBack}
      />
    </DrawerContext.Provider>
  );
}

/** "Order now", shared by the drawer and the menu page's order panel. Opens the checkout. */
export function OrderNowButton({ className = "" }: { className?: string }) {
  const { placeOrder } = useCartDrawer();
  const { busy } = useCart();

  return (
    <button
      type="button"
      onClick={() => void placeOrder()}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-2 text-[14px] transition-[opacity,background-color] disabled:opacity-60 ${className}`}
    >
      Order now
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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

