"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TableScanner } from "@/app/components/table-scanner";
import { sendOrder, type CartView, type Order } from "@/app/lib/menu-api";
import { getTable, normaliseTable, setTable } from "@/app/lib/table";

/**
 * Sending an order, and waiting for the captain.
 *
 * "Order now" opens the checkout: the floor needs to know where the guest is,
 * so it asks for the table -- read off the table's QR code with the camera,
 * which opens by itself when the table isn't already known -- or a table
 * number or phone number typed in. Sending it hands the order to KCPL, and the
 * guest is told a captain will come to the table to confirm it. The order is
 * only placed once the captain accepts.
 */

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Sheet({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  label: string;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm"
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40, transition: { duration: 0.18 } }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex max-h-[92dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:inset-y-0 sm:my-auto sm:h-fit sm:rounded-3xl"
      >
        {children}
      </motion.div>
    </>
  );
}

function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* --------------------------------------------------------------- checkout -- */

export function CheckoutSheet({
  cart,
  onSent,
  onCancel,
}: {
  cart: CartView | null;
  onSent: (order: Order) => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {cart && <CheckoutBody key="checkout" cart={cart} onSent={onSent} onCancel={onCancel} />}
    </AnimatePresence>
  );
}

function CheckoutBody({
  cart,
  onSent,
  onCancel,
}: {
  cart: CartView;
  onSent: (order: Order) => void;
  onCancel: () => void;
}) {
  // Known already when the guest arrived by scanning the table's code.
  const [table, setTableState] = useState<string | null>(() => getTable());
  const [scanning, setScanning] = useState(() => getTable() == null);
  const [typedTable, setTypedTable] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function detected(t: string) {
    setTable(t);
    setTableState(t);
    setScanning(false);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const typed = typedTable.trim() ? normaliseTable(typedTable) : null;
    if (typedTable.trim() && !typed) {
      setError("That doesn't look like a table number.");
      return;
    }
    const tableNumber = table ?? typed ?? undefined;
    if (!tableNumber && !phone.trim()) {
      setError("Scan the QR code on your table, or tell us your table number or phone number.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const { order } = await sendOrder({
        tableNumber,
        phone: phone.trim() || undefined,
        note: note.trim() || undefined,
      });
      if (typed) setTable(typed);
      onSent(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your order. Try again?");
      setSending(false);
    }
  }

  return (
    <Sheet label="Send your order" onClose={sending ? undefined : onCancel}>
      <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 pt-5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-ink">Where are you sitting?</h2>
          <p className="mt-1 text-[13px] leading-snug text-ink/55">
            So our captain can come to your table and confirm your order.
          </p>
        </div>
        <CloseButton onClick={onCancel} />
      </header>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {table ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-basil/30 bg-basil/8 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-basil text-cream">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-[12px] text-ink/55">Your table</p>
                  <p className="font-display text-xl leading-none text-ink">Table {table}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTableState(null);
                  setScanning(true);
                }}
                className="text-[12.5px] text-ink/50 underline underline-offset-2 hover:text-ember"
              >
                Not my table
              </button>
            </div>
          ) : scanning ? (
            <div>
              <TableScanner onDetect={detected} />
              <button
                type="button"
                onClick={() => setScanning(false)}
                className="mt-2 text-[12.5px] text-ink/50 underline underline-offset-2 hover:text-ember"
              >
                No QR code? Type it instead
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/25 px-4 py-4 text-[14px] text-ink transition-colors hover:border-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Scan the QR code on your table
            </button>
          )}

          {!table && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] text-ink/55">Table number</span>
                <input
                  value={typedTable}
                  onChange={(e) => setTypedTable(e.target.value)}
                  inputMode="text"
                  autoComplete="off"
                  maxLength={16}
                  placeholder="e.g. 12"
                  className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-white/60 px-3 text-[15px] outline-none focus:border-ink"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-ink/55">or phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
                  placeholder="10-digit mobile"
                  className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-white/60 px-3 text-[15px] outline-none focus:border-ink"
                />
              </label>
            </div>
          )}

          {table && (
            <label className="block">
              <span className="text-[12px] text-ink/55">Phone (optional)</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
                placeholder="In case we need to reach you"
                className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-white/60 px-3 text-[15px] outline-none focus:border-ink"
              />
            </label>
          )}

          <label className="block">
            <span className="text-[12px] text-ink/55">Anything the kitchen should know? (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Less spicy, no onion…"
              className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-white/60 px-3 text-[15px] outline-none focus:border-ink"
            />
          </label>

          <div className="rounded-2xl bg-sand/70 px-4 py-3">
            <ul className="space-y-1 text-[13px] text-ink/70">
              {cart.lines.map((l) => (
                <li key={l.item.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {l.qty > 1 && <span className="tabular-nums">{l.qty}× </span>}
                    {l.item.name}
                  </span>
                  {l.lineTotal != null && <span className="shrink-0 tabular-nums">{rupees(l.lineTotal)}</span>}
                </li>
              ))}
            </ul>
            {cart.subtotal != null && (
              <p className="mt-2 flex justify-between border-t border-ink/10 pt-2 text-[14px] font-medium text-ink">
                <span>Total</span>
                <span className="tabular-nums">{rupees(cart.subtotal)}</span>
              </p>
            )}
          </div>

          {error && <p className="rounded-lg bg-ember/10 px-3 py-2 text-[13px] text-ember">{error}</p>}
        </div>

        <footer className="border-t border-ink/10 px-6 py-4">
          <button
            type="submit"
            disabled={sending}
            className="h-[50px] w-full rounded-full bg-ink text-[14px] text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Sending to your captain…" : "Send order"}
          </button>
          <p className="mt-2 text-center text-[11.5px] text-ink/45">
            Nothing is charged now. A captain confirms it with you at the table.
          </p>
        </footer>
      </form>
    </Sheet>
  );
}

/* ----------------------------------------------------------------- status -- */

/**
 * The order after it's sent: "a captain is on the way", then confirmed or not.
 * Collapses to a pill so the guest can keep browsing while they wait.
 */
export function OrderStatusView({
  order,
  expanded,
  onExpand,
  onCollapse,
  onDismiss,
  onCancel,
  onPutBack,
}: {
  order: Order | null;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onDismiss: () => void;
  onCancel: () => Promise<void>;
  onPutBack: () => Promise<void>;
}) {
  return (
    <>
      <AnimatePresence>
        {order && expanded && (
          <StatusSheet
            key="status"
            order={order}
            onCollapse={onCollapse}
            onDismiss={onDismiss}
            onCancel={onCancel}
            onPutBack={onPutBack}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[65] flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {order && !expanded && (
            <motion.button
              key="pill"
              type="button"
              onClick={onExpand}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-ink/10 bg-cream py-2.5 pr-4 pl-3 text-[13px] text-ink shadow-[0_12px_32px_rgba(28,20,15,0.2)]"
            >
              <StatusDot status={order.status} />
              {order.status === "pending" && "Captain on the way"}
              {order.status === "accepted" && "Order confirmed"}
              {order.status === "rejected" && "Order not confirmed"}
              {order.status === "cancelled" && "Order cancelled"}
              <span className="text-ink/40 tabular-nums">{order.code}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function StatusDot({ status }: { status: Order["status"] }) {
  if (status === "pending") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber" />
      </span>
    );
  }
  const tone = status === "accepted" ? "bg-basil" : status === "rejected" ? "bg-ember" : "bg-ink/30";
  return <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />;
}

function StatusSheet({
  order,
  onCollapse,
  onDismiss,
  onCancel,
  onPutBack,
}: {
  order: Order;
  onCollapse: () => void;
  onDismiss: () => void;
  onCancel: () => Promise<void>;
  onPutBack: () => Promise<void>;
}) {
  const [working, setWorking] = useState(false);
  // Tagged with the status it happened under, so a fresh outcome doesn't show
  // an error left over from the step before it.
  const [failure, setFailure] = useState<{ status: Order["status"]; message: string } | null>(null);
  const error = failure?.status === order.status ? failure.message : null;
  const pending = order.status === "pending";

  async function act(fn: () => Promise<void>) {
    setWorking(true);
    setFailure(null);
    try {
      await fn();
    } catch (err) {
      setFailure({
        status: order.status,
        message: err instanceof Error ? err.message : "That didn't work. Try again?",
      });
    } finally {
      setWorking(false);
    }
  }

  const where = order.tableNumber ? `Table ${order.tableNumber}` : order.phone ? `Phone ${order.phone}` : null;

  return (
    <Sheet label="Your order" onClose={pending ? onCollapse : onDismiss}>
      <div className="flex justify-end px-4 pt-4">
        <CloseButton onClick={pending ? onCollapse : onDismiss} label={pending ? "Hide" : "Close"} />
      </div>

      <div className="overflow-y-auto px-7 pb-6 text-center">
        <motion.div
          key={order.status}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            pending
              ? "bg-amber/15 text-[#8a6100]"
              : order.status === "accepted"
                ? "bg-basil text-cream shadow-[0_8px_20px_rgba(26,122,86,0.35)]"
                : "bg-ember/12 text-ember"
          }`}
        >
          {pending ? (
            <motion.svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
            >
              <path
                d="M6 17V11a6 6 0 1 1 12 0v6m-14 0h16M10 20h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ) : order.status === "accepted" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </motion.div>

        <div role="status" aria-live="polite">
          {pending && (
            <>
              <h2 className="mt-5 font-serif text-[26px] leading-tight text-ink">Your order is with us</h2>
              <p className="mx-auto mt-2 max-w-[320px] text-[14.5px] leading-relaxed text-ink/65">
                Our captain will be at your table shortly to confirm your order. The kitchen starts as soon as
                they do.
              </p>
            </>
          )}
          {order.status === "accepted" && (
            <>
              <h2 className="mt-5 font-serif text-[26px] leading-tight text-ink">Order confirmed</h2>
              <p className="mx-auto mt-2 max-w-[320px] text-[14.5px] leading-relaxed text-ink/65">
                Your captain has confirmed it — the kitchen is on it now.
              </p>
            </>
          )}
          {order.status === "rejected" && (
            <>
              <h2 className="mt-5 font-serif text-[26px] leading-tight text-ink">We couldn&apos;t confirm this one</h2>
              <p className="mx-auto mt-2 max-w-[320px] text-[14.5px] leading-relaxed text-ink/65">
                {order.rejectReason
                  ? order.rejectReason
                  : "Your captain couldn't confirm this order. Put the dishes back in your order to change it and send again."}
              </p>
            </>
          )}
          {order.status === "cancelled" && (
            <h2 className="mt-5 font-serif text-[26px] leading-tight text-ink">Order cancelled</h2>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px]">
          <span className="rounded-full border border-ink/15 px-3 py-1 font-medium tabular-nums">{order.code}</span>
          {where && <span className="rounded-full border border-ink/15 px-3 py-1 text-ink/65">{where}</span>}
        </div>

        <ul className="mt-5 space-y-1 rounded-2xl bg-sand/70 px-4 py-3 text-left text-[13px] text-ink/70">
          {order.lines.map((l) => (
            <li key={l.itemId} className="flex justify-between gap-3">
              <span className="truncate">
                {l.qty > 1 && <span className="tabular-nums">{l.qty}× </span>}
                {l.name}
              </span>
              {l.lineTotal != null && <span className="shrink-0 tabular-nums">{rupees(l.lineTotal)}</span>}
            </li>
          ))}
          {order.subtotal != null && (
            <li className="flex justify-between border-t border-ink/10 pt-2 text-[14px] font-medium text-ink">
              <span>Total</span>
              <span className="tabular-nums">{rupees(order.subtotal)}</span>
            </li>
          )}
        </ul>

        {error && <p className="mt-4 rounded-lg bg-ember/10 px-3 py-2 text-[13px] text-ember">{error}</p>}

        <div className="mt-6 space-y-2">
          {pending ? (
            <>
              <button
                type="button"
                onClick={onCollapse}
                className="h-[48px] w-full rounded-full bg-ink text-[14px] text-cream hover:opacity-90"
              >
                Keep browsing
              </button>
              <button
                type="button"
                disabled={working}
                onClick={() => act(onCancel)}
                className="text-[12.5px] text-ink/45 underline underline-offset-2 hover:text-ember disabled:opacity-50"
              >
                {working ? "Cancelling…" : "Cancel this order"}
              </button>
            </>
          ) : order.status === "rejected" || order.status === "cancelled" ? (
            <>
              <button
                type="button"
                disabled={working}
                onClick={() => act(onPutBack)}
                className="h-[48px] w-full rounded-full bg-ink text-[14px] text-cream hover:opacity-90 disabled:opacity-60"
              >
                {working ? "Adding…" : "Put these back in my order"}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="text-[12.5px] text-ink/45 underline underline-offset-2 hover:text-ink"
              >
                Close
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="h-[48px] w-full rounded-full bg-ink text-[14px] text-cream hover:opacity-90"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
