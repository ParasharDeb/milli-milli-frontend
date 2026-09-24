"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { useCart } from "@/app/lib/cart-context";
import { DIET_LABEL, isVeg, priceLabel } from "@/app/lib/menu-api";
import { Stepper } from "@/app/components/stepper";

/**
 * The order, as a slide-over.
 *
 * Deliberately says out loud that the order is kept for this visit only. The
 * backend holds it in memory, so a restart empties it -- a guest discovering
 * that at the table is worse than a line of small print here.
 */

const DrawerContext = createContext<{ open: () => void; close: () => void } | null>(null);

export function useCartDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside <CartDrawerProvider>");
  return ctx;
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={() => setOpen(false)} />
    </DrawerContext.Provider>
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

                <Link
                  href="/reserve-table"
                  onClick={onClose}
                  className="mt-4 block rounded-full bg-ink py-3.5 text-center text-cream transition-opacity hover:opacity-90"
                >
                  Book a table
                </Link>

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

