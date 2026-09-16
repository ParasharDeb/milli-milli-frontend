"use client";

import { useState } from "react";

const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const SOLD_OUT = new Set(["19:30", "20:00"]);

/**
 * Shared between the landing-page closer and /reserve-table.
 * `tone` switches it between the dark sections and a light page.
 */
export function BookingForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("19:00");

  const dark = tone === "dark";

  const shell = dark
    ? "border-cream/15 bg-cream/8 backdrop-blur-xl"
    : "border-line bg-cream";
  const label = dark ? "text-cream/55" : "text-muted";
  const sub = dark ? "text-cream/60" : "text-muted";
  const field = dark
    ? "border-cream/20 bg-ink/40 text-cream [color-scheme:dark] focus:border-amber"
    : "border-line bg-parchment focus:border-ember";
  const chip = dark
    ? "border-cream/20 text-cream/75 hover:border-cream/50"
    : "border-line text-muted hover:border-ink hover:text-ink";
  const chipOn = dark
    ? "border-amber bg-amber font-medium text-ink"
    : "border-ink bg-ink font-medium text-cream";
  const chipOff = dark
    ? "cursor-not-allowed border-cream/10 text-cream/25 line-through"
    : "cursor-not-allowed border-line/60 text-muted/40 line-through";

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`rounded-[1.75rem] border p-6 sm:p-8 ${shell}`}
    >
      <p className="font-display text-2xl font-light">Book a table</p>
      <p className={`mt-1.5 text-[13px] ${sub}`}>
        Free to cancel up to 24 hours before.
      </p>

      <div className="mt-7 grid gap-5">
        <div>
          <label
            htmlFor="date"
            className={`text-[11px] tracking-[0.18em] uppercase ${label}`}
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            defaultValue="2026-09-18"
            className={`mt-2.5 w-full rounded-xl border px-4 py-3.5 text-sm focus:outline-none ${field}`}
          />
        </div>

        <div>
          <span className={`text-[11px] tracking-[0.18em] uppercase ${label}`}>
            Guests
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setGuests(n)}
                aria-pressed={guests === n}
                className={`h-10 w-10 rounded-full border text-sm transition-colors ${
                  guests === n ? chipOn : chip
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={`text-[11px] tracking-[0.18em] uppercase ${label}`}>
            Time
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TIMES.map((t) => {
              const gone = SOLD_OUT.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={gone}
                  onClick={() => setTime(t)}
                  aria-pressed={time === t}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    gone ? chipOff : time === t ? chipOn : chip
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-ember px-7 py-4 text-sm font-medium text-cream transition-colors hover:bg-amber hover:text-ink"
      >
        Request {guests === 1 ? "a table" : `a table for ${guests}`} at {time}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>

      <p className={`mt-4 text-center text-[12px] ${dark ? "text-cream/45" : "text-muted"}`}>
        We confirm every booking by email within the hour.
      </p>
    </form>
  );
}
