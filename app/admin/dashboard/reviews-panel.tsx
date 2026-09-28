"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  fetchReviews,
  StaffAuthError,
  type ReviewEntry,
  type ReviewsResponse,
} from "@/app/lib/menu-api";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Filter = "all" | ReviewEntry["sentiment"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "negative", label: "Negative" },
  { key: "mixed", label: "Mixed" },
  { key: "positive", label: "Positive" },
];

const SENTIMENT_STYLES: Record<ReviewEntry["sentiment"], string> = {
  positive: "border-basil/30 bg-basil/10 text-basil",
  mixed: "border-amber/40 bg-amber/12 text-[#8a6100]",
  negative: "border-ember/30 bg-ember/8 text-ember",
};

const RATING_LABELS = ["overall", "food", "service", "ambience", "cleanliness"] as const;

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Every review in one place: what guests said to the chat in passing, and the
 * rated form. Reads a staff-only endpoint, so it needs the admin token.
 */
export function ReviewsPanel({
  token,
  onSignedOut,
}: {
  token: string | null;
  onSignedOut: () => void;
}) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetchReviews(token)
      .then((r) => active && setData(r))
      .catch((err) => {
        if (!active) return;
        if (err instanceof StaffAuthError) onSignedOut();
        else setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [token, onSignedOut]);

  const shown = data?.reviews.filter((r) => filter === "all" || r.sentiment === filter) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.46, ease: EASE_OUT }}
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-cream"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-light">Guest reviews</h2>
          <p className="mt-1 text-[13px] text-muted">
            From the chat and the feedback form, newest first.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? data?.counts.total : data?.counts[f.key];
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors ${
                  on ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"
                }`}
              >
                {f.label}
                {count != null && <span className="ml-1.5 tabular-nums opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {failed && (
        <p className="m-6 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-muted">
          Could not load reviews. Start the backend and reload.
        </p>
      )}

      {!data && !failed && <p className="px-6 py-8 text-[13px] text-muted">Loading…</p>}

      {data && shown.length === 0 && (
        <p className="px-6 py-8 text-[13px] text-muted">
          {data.counts.total === 0 ? "No reviews yet." : "Nothing in this filter."}
        </p>
      )}

      {shown.length > 0 && (
        <ul className="divide-y divide-line/70">
          {shown.map((r) => (
            <li key={`${r.source}-${r.id}`} className="px-6 py-4 transition-colors hover:bg-parchment">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${SENTIMENT_STYLES[r.sentiment]}`}
                >
                  {r.sentiment}
                </span>
                <span className="rounded-full border border-line bg-parchment px-2.5 py-0.5 text-[11px] text-muted">
                  {r.source === "chat" ? "Chat" : r.quick ? "Form · one tap" : "Form"}
                </span>
                {r.dish && (
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium">
                    {r.dish}
                  </span>
                )}
                <span className="ml-auto text-[12px] text-muted tabular-nums">{when(r.createdAt)}</span>
              </div>

              {r.message ? (
                <p className="mt-2.5 text-[15px] leading-relaxed">&ldquo;{r.message}&rdquo;</p>
              ) : (
                <p className="mt-2.5 text-[13px] text-muted italic">No comment left.</p>
              )}

              {r.ratings && (
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                  {RATING_LABELS.map((k) => (
                    <span key={k} className={r.ratings![k] <= 2 ? "text-ember" : undefined}>
                      <span className="capitalize">{k}</span>{" "}
                      <span className="tabular-nums">{r.ratings![k]}/5</span>
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
