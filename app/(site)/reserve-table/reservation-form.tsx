"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DatePicker } from "@/app/components/date-picker";

const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
const GUESTS = [1, 2, 3, 4, 5, 6, 7, 8];
const SEATING = ["Any", "Indoor", "Outdoor", "Bar", "Lounge"];

export type ReservationDefaults = { date?: string; time?: string; guests?: number };

function isoToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

const field =
  "w-full appearance-none rounded-lg border border-line bg-[#fbf8f3] py-3.5 pr-10 pl-11 text-[13.5px] text-ink transition-colors hover:border-ink/30 focus:border-ember focus:outline-none";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink/70">
      {children}
    </svg>
  );
}

const ICONS = {
  date: (
    <Glyph>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Glyph>
  ),
  time: (
    <Glyph>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Glyph>
  ),
  guests: (
    <Glyph>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Glyph>
  ),
  seating: (
    <Glyph>
      <path
        d="M7 4v8h10V4M5.5 12h13v3h-13zM7 15v5m10-5v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glyph>
  ),
};

function Chevron() {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink/60"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  children,
}: {
  label: string;
  icon: ReactNode;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/85">{label}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">{icon}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
          {children}
        </select>
        <Chevron />
      </span>
    </label>
  );
}

/**
 * There is no reservations service behind this yet, so a request is only
 * acknowledged on the page. Wire `onSubmit` to the booking API once it exists.
 */
export function ReservationForm({ defaults }: { defaults: ReservationDefaults }) {
  const min = isoToday();
  const [date, setDate] = useState(() => (defaults.date && defaults.date >= min ? defaults.date : min));
  const [time, setTime] = useState(defaults.time && TIMES.includes(defaults.time) ? defaults.time : "20:30");
  const [guests, setGuests] = useState(defaults.guests && GUESTS.includes(defaults.guests) ? defaults.guests : 2);
  const [seating, setSeating] = useState("Any");
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="mt-9"
    >
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <span className="text-[13px] text-ink/85">Date</span>
          <DatePicker
            value={date}
            min={min}
            onChange={(v) => {
              setDate(v);
              setSent(false);
            }}
            tone="light"
            icon={ICONS.date}
            className="w-full rounded-lg border border-line bg-[#fbf8f3] px-4 py-3.5 text-[13.5px] text-ink transition-colors hover:border-ink/30 focus:border-ember focus:outline-none"
          />
        </div>
        <SelectField label="Time" icon={ICONS.time} value={time} onChange={(v) => (setTime(v), setSent(false))}>
          {TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Guests"
          icon={ICONS.guests}
          value={guests}
          onChange={(v) => (setGuests(Number(v)), setSent(false))}
        >
          {GUESTS.map((g) => (
            <option key={g} value={g}>
              {g} {g === 1 ? "guest" : "guests"}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Seating preference (optional)"
          icon={ICONS.seating}
          value={seating}
          onChange={(v) => (setSeating(v), setSent(false))}
        >
          {SEATING.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
      </div>

      <button
        type="submit"
        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-[14px] font-medium text-cream transition-colors hover:bg-ember"
      >
        Check availability
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.p
            key="sent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="mt-5 rounded-lg border border-basil/25 bg-basil/8 px-4 py-3 text-[13px] text-basil"
          >
            Request noted: {longDate(date)} at {time}, {guests} {guests === 1 ? "guest" : "guests"}
            {seating !== "Any" ? `, ${seating.toLowerCase()} seating` : ""}.
          </motion.p>
        ) : (
          <motion.p
            key="avail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-center gap-2.5 text-[12.5px] text-ink/80"
          >
            <span className="h-2 w-2 rounded-full bg-[#3fb27f]" />3 tables available tonight
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
