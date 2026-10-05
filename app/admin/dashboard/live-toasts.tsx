"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AdminStream } from "@/app/lib/use-admin-stream";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SHOW_MS = 8000;
const MAX_TOASTS = 4;

type Toast = { id: string; kind: "order" | "reservation"; title: string; detail: string };

/**
 * A card in the corner for every new order or reservation, so staff notice one
 * without watching the lists. Decisions are not announced -- whoever made them
 * already knows. Clicking a card scrolls to its panel.
 */
export function LiveToasts({ subscribe }: { subscribe: AdminStream["subscribe"] }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      subscribe({
        onEvent: (event) => {
          let toast: Toast;
          if (event.type === "order.created") {
            const o = event.data;
            toast = {
              id: o.id,
              kind: "order",
              title: `New order · ${o.tableNumber ? `Table ${o.tableNumber}` : o.code}`,
              detail: o.lines.map((l) => `${l.qty}× ${l.name}`).join(", "),
            };
          } else if (event.type === "reservation.created") {
            const r = event.data;
            toast = {
              id: r.id,
              kind: "reservation",
              title: `New reservation · ${r.partySize} ${r.partySize === 1 ? "guest" : "guests"}`,
              detail: [r.dateText, r.timeText, r.guestName].filter(Boolean).join(" · "),
            };
          } else return;

          setToasts((ts) => [toast, ...ts.filter((t) => t.id !== toast.id)].slice(0, MAX_TOASTS));
          window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== toast.id)), SHOW_MS);
        },
      }),
    [subscribe],
  );

  const dismiss = (id: string) => setToasts((ts) => ts.filter((t) => t.id !== id));

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-cream p-4 shadow-lg"
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.kind === "order" ? "bg-amber" : "bg-basil"}`}
            />
            <button
              type="button"
              onClick={() => {
                document.getElementById(`${t.kind}s`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                dismiss(t.id);
              }}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block text-[14px] font-medium">{t.title}</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-muted">{t.detail}</span>
            </button>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="-mt-1 -mr-1 rounded-full px-2 text-[16px] leading-none text-muted hover:text-ink"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
