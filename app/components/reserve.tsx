"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BookingForm } from "./booking-form";
import { Reveal } from "./reveal";

export function Reserve() {
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
          <BookingForm />
          <p className="mt-4 text-center text-[12px] text-cream/50">
            Need a large table or the back room?{" "}
            <Link
              href="/reserve-table"
              className="underline underline-offset-2 hover:text-amber"
            >
              See all the details
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
