"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  decideOrder,
  fetchStaffOrders,
  StaffAuthError,
  type StaffOrder,
  type StaffOrdersResponse,
} from "@/app/lib/menu-api";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const POLL_MS = 5000;

const STATUS_STYLES: Record<StaffOrder["status"], string> = {
  pending: "border-amber/40 bg-amber/12 text-[#8a6100]",
  accepted: "border-basil/30 bg-basil/10 text-basil",
  rejected: "border-ember/30 bg-ember/8 text-ember",
  cancelled: "border-line bg-sand text-muted",
};

const STATUS_LABEL: Record<StaffOrder["status"], string> = {
  pending: "Waiting for captain",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled by guest",
};

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function when(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Orders sent from guests' carts, waiting on a captain.
 *
 * KCPL is where captains normally accept them; this is the same switch for when
 * KCPL isn't connected or didn't receive the order (flagged on the row).
 */
export function OrdersPanel({ token, onSignedOut }: { token: string | null; onSignedOut: () => void }) {
  const [data, setData] = useState<StaffOrdersResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    let active = true;
    const load = () =>
      fetchStaffOrders(token)
        .then((d) => {
          if (!active) return;
          setData(d);
          setFailed(false);
        })
        .catch((err) => {
          if (!active) return;
          if (err instanceof StaffAuthError) onSignedOut();
          else setFailed(true);
        });
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token, onSignedOut]);

  async function decide(order: StaffOrder, status: "accepted" | "rejected") {
    if (!token) return;
    // Typed inline rather than in a dialog: a short reason the guest will read.
    const reason = status === "rejected" ? rejectReasons[order.id]?.trim() || undefined : undefined;
    setWorking(order.id);
    setError(null);
    try {
      const updated = await decideOrder(token, order.id, status, reason);
      // Shown at once; the next poll brings the counts up to date.
      setData((d) => d && { ...d, orders: d.orders.map((o) => (o.id === updated.id ? updated : o)) });
    } catch (err) {
      if (err instanceof StaffAuthError) onSignedOut();
      else setError(err instanceof Error ? err.message : "That didn't go through.");
    } finally {
      setWorking(null);
    }
  }

  const orders = data?.orders ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.22, ease: EASE_OUT }}
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-cream"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-light">Table orders</h2>
          <p className="mt-1 text-[13px] text-muted">
            Sent from guests&apos; phones. Placed only once a captain accepts — last 24 hours.
          </p>
        </div>
        {data && (
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className={`rounded-full border px-3 py-1 font-medium ${STATUS_STYLES.pending}`}>
              {data.counts.pending} waiting
            </span>
            <span className={`rounded-full border px-3 py-1 font-medium ${STATUS_STYLES.accepted}`}>
              {data.counts.accepted} accepted
            </span>
          </div>
        )}
      </div>

      {failed && (
        <p className="m-6 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-muted">
          Could not load orders. Start the backend and reload.
        </p>
      )}
      {error && (
        <p className="mx-6 mt-4 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-ember">{error}</p>
      )}
      {!data && !failed && <p className="px-6 py-8 text-[13px] text-muted">Loading…</p>}
      {data && orders.length === 0 && <p className="px-6 py-8 text-[13px] text-muted">No orders yet tonight.</p>}

      {orders.length > 0 && (
        <ul className="divide-y divide-line/70">
          {orders.map((o) => (
            <li
              key={o.id}
              className={`px-6 py-4 transition-colors hover:bg-parchment ${o.status === "pending" ? "bg-amber/[0.04]" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg leading-none">
                  {o.tableNumber ? `Table ${o.tableNumber}` : "No table"}
                </span>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium tabular-nums">
                  {o.code}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
                {o.kcplStatus === "failed" && (
                  <span
                    title={o.kcplError ?? undefined}
                    className="rounded-full border border-ember/30 bg-ember/8 px-2.5 py-0.5 text-[11px] font-medium text-ember"
                  >
                    Not delivered to KCPL
                  </span>
                )}
                <span className="ml-auto text-[12px] text-muted tabular-nums">{when(o.createdAt)}</span>
              </div>

              <p className="mt-1.5 text-[12.5px] text-muted">
                {[o.guestName, o.phone, `${o.itemCount} item${o.itemCount === 1 ? "" : "s"}`, o.subtotal != null && rupees(o.subtotal)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <p className="mt-2 text-[14px] leading-relaxed">
                {o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
              </p>
              {o.note && <p className="mt-1 text-[13px] text-ember">Note: {o.note}</p>}
              {o.status === "rejected" && o.rejectReason && (
                <p className="mt-1 text-[12.5px] text-muted">Reason: {o.rejectReason}</p>
              )}

              {o.status === "pending" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={working === o.id}
                    onClick={() => decide(o, "accepted")}
                    className="rounded-full bg-basil px-5 py-2 text-[13px] font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <input
                    value={rejectReasons[o.id] ?? ""}
                    onChange={(e) => setRejectReasons((r) => ({ ...r, [o.id]: e.target.value }))}
                    maxLength={200}
                    placeholder="Reason, if rejecting (guest sees this)"
                    className="h-9 min-w-[14rem] flex-1 rounded-full border border-line bg-parchment px-4 text-[13px] outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    disabled={working === o.id}
                    onClick={() => decide(o, "rejected")}
                    className="rounded-full border border-line px-5 py-2 text-[13px] font-medium transition-colors hover:border-ember hover:text-ember disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
