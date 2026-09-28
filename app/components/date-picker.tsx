"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatLong(iso: string) {
  return parseIso(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DatePicker({
  value,
  min,
  onChange,
  className,
  tone = "dark",
  icon,
}: {
  value: string;
  min: string;
  onChange: (iso: string) => void;
  className: string;
  /** The field's own background; the calendar itself is always dark. */
  tone?: "dark" | "light";
  /** Drawn before the date, e.g. a calendar glyph. */
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [view, setView] = useState(() => {
    const d = parseIso(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open && rootRef.current) {
      // The section clips overflow, so open upwards when there isn't room below.
      const rect = rootRef.current.getBoundingClientRect();
      const bound = rootRef.current.closest("section")?.getBoundingClientRect().bottom ?? window.innerHeight;
      setDropUp(bound - rect.bottom < 340);
      const d = parseIso(value);
      setView(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setOpen((o) => !o);
  }

  const minMonth = parseIso(min);
  const canGoBack =
    view.getFullYear() > minMonth.getFullYear() ||
    (view.getFullYear() === minMonth.getFullYear() && view.getMonth() > minMonth.getMonth());

  // Monday-first offset for the first day of the month.
  const lead = (view.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span className="flex items-center gap-3">
          {icon}
          <span suppressHydrationWarning>{formatLong(value)}</span>
        </span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`${tone === "light" ? "text-ink/60" : "text-cream/70"} transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className={`absolute left-0 z-30 w-[18.5rem] rounded-lg border border-cream/15 bg-espresso/95 p-4 text-cream shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoBack}
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-cream/80 transition-colors hover:bg-cream/10 disabled:pointer-events-none disabled:opacity-25"
            >
              <Arrow dir="left" />
            </button>
            <p className="font-display text-[17px]">
              {view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-cream/80 transition-colors hover:bg-cream/10"
            >
              <Arrow dir="right" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[11.5px] text-cream/50">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`pad-${i}`} />;
              const iso = toIso(d);
              const selected = iso === value;
              const isToday = iso === min;
              const past = iso < min;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={past}
                  aria-pressed={selected}
                  aria-label={formatLong(iso)}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-[13px] transition-colors ${
                    selected
                      ? "bg-ember font-medium text-cream"
                      : past
                        ? "text-cream/20"
                        : "text-cream/90 hover:bg-cream/10"
                  } ${isToday && !selected ? "ring-1 ring-ember/70" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
