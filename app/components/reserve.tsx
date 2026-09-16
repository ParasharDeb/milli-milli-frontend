"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "./reveal";

const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const SOLD_OUT = new Set(["19:30", "20:00"]);

export function Reserve() {
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("19:00");

  return (
    <section
      id="reserve"
      className="grain relative overflow-hidden bg-ink text-cream"
    >
      <Image
        src="/img/table-night.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(21,18,16,0.96)_18%,rgba(21,18,16,0.72)_52%,rgba(21,18,16,0.35)_100%)]"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 right-[8%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.28),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] gap-14 px-6 py-24 md:px-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:py-32">
        <div>
          <Reveal as="p" className="eyebrow text-amber">
            <span className="h-px w-8 bg-amber" />
            Reservations
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mt-7 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] font-light tracking-[-0.03em] text-balance">
              Twelve tables.
              <br />
              <span className="text-amber italic">Take one.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-cream/70 text-pretty">
              Bookings open two weeks ahead, at nine on Monday mornings. Tables
              of five or more, and the back room, go through the phone.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-cream/15 pt-8">
              {[
                ["Call us", "+351 21 000 0000"],
                ["Write", "ola@milli.pt"],
                ["Find us", "Rua das Flores 14"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] tracking-[0.18em] text-cream/50 uppercase">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-[15px]">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* booking card */}
        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="rounded-[1.75rem] border border-cream/15 bg-cream/8 p-6 backdrop-blur-xl sm:p-8"
          >
            <p className="font-display text-2xl font-light">Book a table</p>
            <p className="mt-1.5 text-[13px] text-cream/60">
              Free to cancel up to 24 hours before.
            </p>

            <div className="mt-7 grid gap-5">
              <div>
                <label
                  htmlFor="date"
                  className="text-[11px] tracking-[0.18em] text-cream/55 uppercase"
                >
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  defaultValue="2026-09-18"
                  className="mt-2.5 w-full rounded-xl border border-cream/20 bg-ink/40 px-4 py-3 text-sm text-cream [color-scheme:dark] focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] tracking-[0.18em] text-cream/55 uppercase">
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
                        guests === n
                          ? "border-amber bg-amber font-medium text-ink"
                          : "border-cream/20 text-cream/75 hover:border-cream/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] tracking-[0.18em] text-cream/55 uppercase">
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
                          gone
                            ? "cursor-not-allowed border-cream/10 text-cream/25 line-through"
                            : time === t
                              ? "border-amber bg-amber font-medium text-ink"
                              : "border-cream/20 text-cream/75 hover:border-cream/50"
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

            <p className="mt-4 text-center text-[12px] text-cream/45">
              We confirm every booking by email within the hour.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
