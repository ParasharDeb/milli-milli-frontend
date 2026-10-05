"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  decideReservation,
  fetchStaffReservations,
  StaffAuthError,
  type StaffReservation,
  type StaffReservationsResponse,
} from "@/app/lib/menu-api";
import { upsertById, type AdminStream } from "@/app/lib/use-admin-stream";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
// The stream is what keeps this current; the poll only catches what it missed.
const POLL_MS = 30000;

const STATUS_STYLES: Record<StaffReservation["status"], string> = {
  pending: "border-amber/40 bg-amber/12 text-[#8a6100]",
  accepted: "border-basil/30 bg-basil/10 text-basil",
  rejected: "border-ember/30 bg-ember/8 text-ember",
  cancelled: "border-line bg-sand text-muted",
};

const STATUS_LABEL: Record<StaffReservation["status"], string> = {
  pending: "Awaiting confirmation",
  accepted: "Confirmed",
  rejected: "Declined",
  cancelled: "Cancelled",
};

function upsert(d: StaffReservationsResponse, row: StaffReservation): StaffReservationsResponse {
  const { rows, counts } = upsertById(d.reservations, d.counts, row);
  return { counts: counts as StaffReservationsResponse["counts"], reservations: rows };
}

function when(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Reservations from chat concierge and the public booking form.
 * Admin can accept or reject pending reservations.
 */
export function ReservationsPanel({
  token,
  subscribe,
  onSignedOut,
}: {
  token: string | null;
  subscribe: AdminStream["subscribe"];
  onSignedOut: () => void;
}) {
  const [data, setData] = useState<StaffReservationsResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    let active = true;

    const load = () =>
      fetchStaffReservations(token)
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
    const unsubscribe = subscribe({
      onReconnect: load,
      onEvent: (event) => {
        if (event.type !== "reservation.created" && event.type !== "reservation.updated") return;
        setData((d) => d && upsert(d, event.data));
      },
    });

    const timer = window.setInterval(load, POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [token, onSignedOut, subscribe]);

  async function decide(reservation: StaffReservation, status: "accepted" | "rejected") {
    if (!token) return;
    const reason = status === "rejected" ? rejectReasons[reservation.id]?.trim() || undefined : undefined;
    setWorking(reservation.id);
    setError(null);
    try {
      const updated = await decideReservation(token, reservation.id, status, reason);
      // Shown at once, counts included; the stream event that follows is a no-op.
      setData((d) => d && upsert(d, updated));
    } catch (err) {
      if (err instanceof StaffAuthError) onSignedOut();
      else setError(err instanceof Error ? err.message : "That didn't go through.");
    } finally {
      setWorking(null);
    }
  }

  const reservations = data?.reservations ?? [];

  return (
    <motion.section
      id="reservations"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.34, ease: EASE_OUT }}
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-cream"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-light">Reservations</h2>
          <p className="mt-1 text-[13px] text-muted">
            From the chat and booking form. Confirm or decline — last 24 hours.
          </p>
        </div>
        {data && (
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className={`rounded-full border px-3 py-1 font-medium ${STATUS_STYLES.pending}`}>
              {data.counts.pending} pending
            </span>
            <span className={`rounded-full border px-3 py-1 font-medium ${STATUS_STYLES.accepted}`}>
              {data.counts.accepted} confirmed
            </span>
          </div>
        )}
      </div>

      {failed && (
        <p className="m-6 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-muted">
          Could not load reservations. Start the backend and reload.
        </p>
      )}
      {error && (
        <p className="mx-6 mt-4 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-ember">{error}</p>
      )}
      {!data && !failed && <p className="px-6 py-8 text-[13px] text-muted">Loading…</p>}
      {data && reservations.length === 0 && <p className="px-6 py-8 text-[13px] text-muted">No reservations yet.</p>}

      {reservations.length > 0 && (
        <ul className="divide-y divide-line/70">
          {reservations.map((r) => (
            <li
              key={r.id}
              className={`px-6 py-4 transition-colors hover:bg-parchment ${r.status === "pending" ? "bg-amber/[0.04]" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg leading-none">
                  {r.partySize} {r.partySize === 1 ? "guest" : "guests"}
                </span>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium tabular-nums">
                  {r.code}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="ml-auto text-[12px] text-muted tabular-nums">{when(r.createdAt)}</span>
              </div>

              <p className="mt-1.5 text-[12.5px] text-muted">
                {[r.dateText, r.timeText, r.guestName, r.phone, r.source === "chat" ? "Chat" : "Form"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {r.seating && r.seating !== "Any" && <p className="mt-1 text-[13px] text-muted">Seating: {r.seating}</p>}
              {r.note && <p className="mt-1 text-[13px] text-ember">Note: {r.note}</p>}
              {r.status === "rejected" && r.rejectReason && (
                <p className="mt-1 text-[12.5px] text-muted">Reason: {r.rejectReason}</p>
              )}

              {r.status === "pending" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={working === r.id}
                    onClick={() => decide(r, "accepted")}
                    className="rounded-full bg-basil px-5 py-2 text-[13px] font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <input
                    value={rejectReasons[r.id] ?? ""}
                    onChange={(e) => setRejectReasons((rs) => ({ ...rs, [r.id]: e.target.value }))}
                    maxLength={200}
                    placeholder="Reason, if declining (guest sees this)"
                    className="h-9 min-w-[14rem] flex-1 rounded-full border border-line bg-parchment px-4 text-[13px] outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    disabled={working === r.id}
                    onClick={() => decide(r, "rejected")}
                    className="rounded-full border border-line px-5 py-2 text-[13px] font-medium transition-colors hover:border-ember hover:text-ember disabled:opacity-50"
                  >
                    Decline
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
