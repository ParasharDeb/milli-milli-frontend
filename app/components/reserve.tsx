"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "./date-picker";
import { Reveal } from "./reveal";

const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const GUESTS = [1, 2, 3, 4, 5, 6];

function isoToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

const field =
  "w-full appearance-none rounded-md border border-cream/25 bg-espresso/40 px-4 py-3 text-[13px] text-cream [color-scheme:dark] backdrop-blur transition-colors focus:border-ember focus:outline-none";

function Chevron() {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-cream/70"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Reserve() {
  const router = useRouter();
  const [date, setDate] = useState(isoToday);
  const [time, setTime] = useState("20:30");
  const [guests, setGuests] = useState(2);

  return (
    <section id="reserve" className="relative isolate scroll-mt-16 overflow-hidden bg-espresso text-cream">
      <Image
        src="/img/milli/outdoor-garden.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[70%_50%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.94)_0%,rgba(20,14,10,0.78)_45%,rgba(20,14,10,0.35)_100%)] max-md:bg-[rgba(20,14,10,0.8)]"
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-10 lg:py-28">
        <Reveal>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1] font-light">
            Book your table
          </h2>
          <p className="mt-3 text-[14px] text-cream/75">Good food, better company.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // The reservation page picks these up and fills its own form in.
              router.push(`/reserve-table?${new URLSearchParams({ date, time, guests: String(guests) })}`);
            }}
            className="mt-10 max-w-[40rem]"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.35fr_1fr_1fr] sm:gap-4">
              <div className="col-span-2 block sm:col-span-1">
                <span className="text-[11.5px] text-cream/75">Date</span>
                <DatePicker value={date} min={isoToday()} onChange={setDate} className={field} />
              </div>
              <label className="block">
                <span className="text-[11.5px] text-cream/75">Time</span>
                <span className="relative mt-2 block">
                  <select value={time} onChange={(e) => setTime(e.target.value)} className={field}>
                    {TIMES.map((t) => (
                      <option key={t} value={t} className="bg-espresso">
                        {t}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </span>
              </label>
              <label className="block">
                <span className="text-[11.5px] text-cream/75">Guests</span>
                <span className="relative mt-2 block">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className={field}
                  >
                    {GUESTS.map((g) => (
                      <option key={g} value={g} className="bg-espresso">
                        {g}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ember px-10 py-3.5 text-[13px] font-medium text-cream transition-colors hover:bg-[#e8703f] sm:w-auto sm:min-w-[20rem]"
            >
              Check availability
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>

            <p className="mt-5 flex items-center gap-2.5 text-[12.5px] text-cream/80">
              <span className="h-2 w-2 rounded-full bg-[#3fb27f]" />
              3 tables available tonight
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
