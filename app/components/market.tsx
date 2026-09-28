import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";

export function Market() {
  return (
    <section
      id="about"
      className="relative isolate flex min-h-[520px] scroll-mt-16 items-end overflow-hidden bg-espresso text-cream md:min-h-[600px] md:items-center"
    >
      <Image
        src="/img/milli/market.webp"
        alt="Baskets of tomatoes, aubergines, peppers and greens at the morning market"
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[60%_50%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.88)_0%,rgba(20,14,10,0.6)_36%,rgba(20,14,10,0.08)_70%)] max-md:bg-[linear-gradient(180deg,rgba(20,14,10,0.1)_20%,rgba(20,14,10,0.9)_85%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        <div className="max-w-sm">
          <Reveal>
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.1rem)] leading-[1] font-light tracking-[0.01em] uppercase">
              From the
              <br />
              market
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 text-[15px] leading-relaxed text-cream/80">
              We work with local growers and the morning market. The menu follows
              the season, the land, and the people who bring it to us.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <Link
              href="/#journal"
              className="group mt-8 inline-flex items-center gap-2 text-[13px] text-ember transition-colors hover:text-[#ef8457]"
            >
              Learn our story
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <Link
          href="/#journal"
          aria-label="Read about our growers"
          className="absolute right-5 bottom-10 flex h-12 w-12 items-center justify-center rounded-full border border-cream/60 text-xl font-light transition-colors hover:bg-cream hover:text-ink md:right-10 md:bottom-14"
        >
          +
        </Link>
      </div>
    </section>
  );
}
