"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { signOut } from "@/app/lib/auth";
import { useAdmin } from "@/app/lib/use-auth";
import { fetchStats, type MenuStats } from "@/app/lib/menu-api";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { label: "Covers tonight", value: "46", delta: "+6 vs. last Wed", tone: "text-basil" },
  { label: "Tables booked", value: "11 / 12", delta: "1 left at 21:00", tone: "text-amber" },
  { label: "Walk-in counter", value: "4 / 6", delta: "2 stools free", tone: "text-basil" },
  { label: "No-shows this week", value: "2", delta: "−1 vs. last week", tone: "text-basil" },
];

type Booking = {
  time: string;
  name: string;
  guests: number;
  phone: string;
  note: string;
  status: "Confirmed" | "Pending" | "Seated";
};

const BOOKINGS: Booking[] = [
  { time: "18:30", name: "Marta Ribeiro", guests: 2, phone: "+351 912 004 118", note: "Counter, anniversary", status: "Seated" },
  { time: "19:00", name: "Tomás Lopes", guests: 4, phone: "+351 933 771 209", note: "One nut allergy", status: "Confirmed" },
  { time: "19:00", name: "A. Duarte", guests: 2, phone: "+351 926 330 447", note: "—", status: "Confirmed" },
  { time: "19:30", name: "Helena Cruz", guests: 6, phone: "+351 915 882 610", note: "Back room, set menu", status: "Confirmed" },
  { time: "20:00", name: "J. Fernandes", guests: 2, phone: "+44 7700 900 812", note: "Vegetarian ×1", status: "Pending" },
  { time: "20:30", name: "Sofia Matos", guests: 3, phone: "+351 968 112 540", note: "Window table if free", status: "Confirmed" },
  { time: "21:00", name: "R. Almeida", guests: 2, phone: "+351 917 640 025", note: "Late arrival, ~21:15", status: "Pending" },
];

const STATUS_STYLES: Record<Booking["status"], string> = {
  Confirmed: "border-basil/30 bg-basil/10 text-basil",
  Pending: "border-amber/40 bg-amber/12 text-[#8a6100]",
  Seated: "border-line bg-sand text-muted",
};


export function Dashboard() {
  const router = useRouter();
  const admin = useAdmin();
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [statsFailed, setStatsFailed] = useState(false);

  // Live menu composition, straight from Postgres via the backend.
  useEffect(() => {
    let active = true;
    fetchStats()
      .then((s) => active && setStats(s))
      .catch(() => active && setStatsFailed(true));
    return () => {
      active = false;
    };
  }, []);

  // The proxy already blocks this route; this keeps the client honest too.
  useEffect(() => {
    if (!admin) router.replace("/admin/login");
  }, [admin, router]);

  function handleSignOut() {
    signOut();
    router.push("/admin/login");
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-parchment">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-xl leading-none lowercase">
                milli
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            </Link>
            <span className="rounded-full border border-line bg-parchment px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
              Staff
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-muted sm:block">{admin}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-medium transition-colors hover:border-ink hover:bg-ink hover:text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <p className="eyebrow text-muted">
            <span className="h-px w-6 bg-ember" />
            Wednesday, 16 September
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-light tracking-[-0.03em]">
              Service at a glance
            </h1>
            <div className="flex gap-2">
              <button className="rounded-full border border-line bg-cream px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-ink">
                Print run sheet
              </button>
              <button className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember">
                Add booking
              </button>
            </div>
          </div>
        </motion.div>

        {/* stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 + i * 0.07, ease: EASE_OUT }}
              className="rounded-2xl border border-line bg-cream p-6"
            >
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                {stat.label}
              </p>
              <p className="mt-3 font-display text-4xl leading-none">{stat.value}</p>
              <p className={`mt-2.5 text-[13px] ${stat.tone}`}>{stat.delta}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* bookings */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT }}
            className="overflow-hidden rounded-2xl border border-line bg-cream"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl font-light">Tonight&apos;s book</h2>
              <span className="text-[13px] text-muted">{BOOKINGS.length} bookings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] tracking-[0.16em] text-muted uppercase">
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Pax</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {BOOKINGS.map((b) => (
                    <tr
                      key={`${b.time}-${b.name}`}
                      className="border-b border-line/70 transition-colors last:border-0 hover:bg-parchment"
                    >
                      <td className="px-6 py-4 font-display text-base tabular-nums">
                        {b.time}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{b.name}</p>
                        <p className="mt-0.5 text-[12px] text-muted">{b.phone}</p>
                      </td>
                      <td className="px-4 py-4 tabular-nums">{b.guests}</td>
                      <td className="px-4 py-4 text-muted">{b.note}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium ${STATUS_STYLES[b.status]}`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* menu composition, read from the database */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease: EASE_OUT }}
            className="rounded-2xl border border-line bg-cream p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-light">Menu tonight</h2>
              <span className="text-[13px] text-muted">
                {stats ? `${stats.total} items live` : statsFailed ? "unavailable" : "loading…"}
              </span>
            </div>

            {statsFailed && (
              <p className="mt-5 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] text-muted">
                Could not reach the kitchen service. Start the backend and reload.
              </p>
            )}

            {stats && (
              <>
                <dl className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["Food", stats.food],
                    ["Bar & lounge", stats.drink],
                    ["Vegetarian", stats.byDiet["Vegeterian"] ?? 0],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl border border-line bg-parchment px-3 py-3">
                      <dt className="text-[10.5px] tracking-[0.14em] text-muted uppercase">
                        {label}
                      </dt>
                      <dd className="mt-1.5 font-display text-2xl leading-none font-light tabular-nums">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-7 text-[10.5px] tracking-[0.16em] text-muted uppercase">
                  Heat spread · food dishes
                </p>
                <ul className="mt-3 space-y-2.5">
                  {[0, 1, 2, 3, 4, 5].map((level) => {
                    const count = stats.spiceSpread[String(level)] ?? 0;
                    const max = Math.max(1, ...Object.values(stats.spiceSpread));
                    return (
                      <li key={level} className="flex items-center gap-3">
                        <span className="w-10 shrink-0 text-[12px] text-muted tabular-nums">
                          {level} / 5
                        </span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / max) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT }}
                            className={`block h-full rounded-full ${level >= 3 ? "bg-ember" : "bg-basil"}`}
                          />
                        </span>
                        <span className="w-6 shrink-0 text-right text-[12px] tabular-nums">
                          {count}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {stats.lowConfidenceSpice > 0 && (
                  <p className="mt-6 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-[13px] leading-relaxed">
                    <span className="font-medium">{stats.lowConfidenceSpice} dishes</span>{" "}
                    have an unconfirmed heat level. The guest menu leaves the number
                    off rather than guessing — worth a chef review.
                  </p>
                )}
              </>
            )}

            <Link
              href="/menu"
              className="mt-7 block w-full rounded-full border border-line px-5 py-3 text-center text-[13px] font-medium transition-colors hover:border-ink"
            >
              View the guest menu
            </Link>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
