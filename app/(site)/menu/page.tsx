import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/app/components/reveal";
import { DishOrbit } from "./dish-orbit";
import { MenuWelcome } from "./menu-welcome";

export const metadata: Metadata = {
  title: "Tonight's menu — Milli",
  description:
    "Rice dishes, breads, gravies and desserts — cooked to order from whatever the morning market gave us.",
};

export default function MenuPage() {
  return (
    <>
      <MenuWelcome />

      {/* header */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_82%_10%,rgba(233,163,25,0.16),transparent_65%)]"
        />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-8 px-6 pt-14 pb-4 md:px-10 lg:grid-cols-[1fr_0.78fr] lg:items-end lg:pt-16">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-ember" />
              Wednesday, 16 September
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance">
                Tonight&apos;s menu,
                <br />
                <span className="text-ember italic">written at four.</span>
              </h1>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="text-[15px] leading-relaxed text-muted text-pretty">
              Pick a course and the kitchen will show you what it looks like. Order
              a la carte, or let us send the whole table for{" "}
              <span className="font-medium text-ink">&#8377;5,400 a head</span> — no
              choices, no substitutions beyond allergies.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/reserve-table"
                className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember"
              >
                Book a table
              </Link>
              <a
                href="#thali"
                className="rounded-full border border-line px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-ink"
              >
                The full thali
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* the orbit */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10 lg:py-14">
        <DishOrbit />
      </section>

      {/* closing note */}
      <section id="thali" className="grain scroll-mt-28 bg-sand">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-20 md:px-10 lg:grid-cols-[1fr_0.85fr] lg:py-24">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-basil" />
              The full thali
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] font-light tracking-[-0.03em] text-balance">
                One of everything,
                <br />
                <span className="text-basil italic">&#8377;5,400 a head.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted text-pretty">
                A rice dish, two gravies, breads as they come off the tandoor, and
                a sweet — for the whole table, sent in the order the kitchen thinks
                is right. Tell us about allergies when you book and we will work
                around almost anything.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Kitchen hours", "19:00 - 23:00, Wed - Sun"],
                ["Last order", "22:15, and we mean it"],
                ["Vegetarian", "Half the menu, always"],
                ["Heat", "Told honestly, adjusted on request"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-line bg-cream p-5">
                  <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
                    {k}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}
