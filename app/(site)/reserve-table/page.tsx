import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/app/components/booking-form";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/reveal";

export const metadata: Metadata = {
  title: "Reserve a table — Milli",
  description:
    "Twelve tables, one seating a night. Book two weeks ahead, or take a counter stool from 18:30.",
};

const HOURS = [
  ["Wednesday – Thursday", "19:00 – 23:00", false],
  ["Friday – Saturday", "18:30 – 00:00", false],
  ["Sunday", "13:00 – 17:00", false],
  ["Monday – Tuesday", "Closed", true],
] as const;

const POLICIES = [
  {
    k: "01",
    t: "One seating a night",
    d: "The table is yours for the evening. We never turn it twice, so we hold bookings for twenty minutes and then release them.",
    accent: "bg-ember",
    tint: "border-ember/25 bg-ember/6",
  },
  {
    k: "02",
    t: "Cancel by the day before",
    d: "Free up to 24 hours ahead. Inside that we ask for ₹1,000 a head, because the food was already bought that morning.",
    accent: "bg-amber",
    tint: "border-amber/30 bg-amber/8",
  },
  {
    k: "03",
    t: "Six or more, call us",
    d: "Large tables and the back room go through the phone so we can talk through the menu before you arrive.",
    accent: "bg-basil",
    tint: "border-basil/25 bg-basil/6",
  },
];

const FAQS = [
  [
    "When do bookings open?",
    "Two weeks ahead, at nine on Monday mornings. Cancellations go back online through the day, so it is worth checking again in the afternoon.",
  ],
  [
    "Can we just walk in?",
    "Six counter stools are kept for walk-ins from 18:30. They go quickly on Fridays and Saturdays, less so midweek.",
  ],
  [
    "What about allergies?",
    "Tell us when you book. The menu changes daily, so we can work around almost anything with a day's notice.",
  ],
  [
    "Do you do private dining?",
    "The back room seats ten, with a set menu at ₹6,500 a head. Email ola@milli.pt and we will send the details.",
  ],
];

export default function ReserveTablePage() {
  return (
    <>
      {/* header + form */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_60%_at_15%_15%,rgba(233,163,25,0.18),transparent_65%),radial-gradient(50%_50%_at_95%_80%,rgba(26,122,86,0.10),transparent_70%)]"
        />

        <div className="relative mx-auto grid w-full max-w-[1400px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1fr_0.82fr] lg:items-start lg:gap-16 lg:py-20">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-ember" />
              Reservations
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance">
                Twelve tables.
                <br />
                <span className="text-ember italic">Take one.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-md text-[17px] leading-relaxed text-muted text-pretty">
                One seating a night, Wednesday to Sunday. Bookings open two weeks
                ahead at nine on Monday mornings — and six stools at the counter
                are always kept back for whoever walks in.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-10 divide-y divide-line border-y border-line">
                {HOURS.map(([day, time, closed]) => (
                  <div
                    key={day}
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="text-[15px]">{day}</dt>
                    <dd
                      className={`font-display text-lg tabular-nums ${closed ? "text-muted/50" : ""}`}
                    >
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                {[
                  ["Call us", "+351 21 000 0000"],
                  ["Write", "ola@milli.pt"],
                  ["Find us", "Rua das Flores 14, Lisboa"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                      {k}
                    </p>
                    <p className="mt-1.5 text-[15px]">{v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <BookingForm tone="light" />
              <p className="mt-4 text-center text-[13px] text-muted">
                Rather see what you would be eating first?{" "}
                <Link
                  href="/menu"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Tonight&apos;s menu
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* policies */}
      <section className="grain bg-sand">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 md:px-10 lg:py-24">
          <Reveal as="p" className="eyebrow text-muted">
            <span className="h-px w-8 bg-terracotta" />
            Before you come
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {POLICIES.map((item, i) => (
              <Reveal key={item.k} delay={i * 0.1}>
                <article
                  className={`h-full rounded-[1.5rem] border ${item.tint} p-7 transition-transform duration-500 hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.accent}`} />
                    <span className="text-[11px] tracking-[0.22em] text-muted">
                      {item.k}
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-light">{item.t}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
                    {item.d}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* private dining + faq */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-20 md:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <Reveal>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/img/room-dining.webp"
                alt="The dining room at dusk, candlelit tables and a tall window"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 text-cream">
                <span className="inline-block rounded-full bg-amber px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-ink uppercase">
                  Private dining
                </span>
                <p className="mt-3 font-display text-xl leading-tight font-light">
                  The back room seats ten
                </p>
                <p className="mt-1.5 text-[13px] text-cream/75">
                  Set menu at ₹6,500 a head, wine paired or bring your own.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-basil" />
              Questions
            </Reveal>

            <RevealGroup as="ul" stagger={0.08} className="mt-8 border-t border-line">
              {FAQS.map(([q, a]) => (
                <RevealItem as="li" key={q} className="border-b border-line py-6">
                  <h3 className="font-display text-xl leading-snug font-light">{q}</h3>
                  <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted text-pretty">
                    {a}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>
    </>
  );
}
