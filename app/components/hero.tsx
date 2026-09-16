"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const line = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

const ACCOLADES = [
  ["Michelin Guide", "Recommended, 2024–26"],
  ["World's 50 Best", "Discovery series"],
  ["Time Out Lisboa", "Restaurant of the year"],
];

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.1]);
  const driftRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* warm light wash behind the whole hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_60%_at_78%_38%,rgba(233,163,25,0.22),transparent_62%),radial-gradient(50%_50%_at_8%_92%,rgba(26,122,86,0.10),transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 pt-12 pb-20 md:px-10 lg:min-h-[84vh] lg:grid-cols-[1.02fr_1fr] lg:gap-8 lg:pt-6 lg:pb-24">
        {/* left — copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-xl"
        >
          <motion.div variants={line} className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-basil/30 bg-basil/10 px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-basil uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-basil" />
              Tonight · 3 tables left
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-muted uppercase">
              <span className="tracking-tight text-amber">★★★★★</span>
              4.9 · 1,204 reviews
            </span>
          </motion.div>

          <motion.p variants={line} className="eyebrow mt-7 text-muted">
            <span className="h-px w-8 bg-ember" />
            Est. 2019 · Rua das Flores, Lisboa
          </motion.p>

          <motion.h1
            variants={line}
            className="mt-5 font-display text-[clamp(2.75rem,6.4vw,4.9rem)] leading-[0.95] font-light tracking-[-0.035em] text-balance"
          >
            A small kitchen that cooks the{" "}
            <span className="relative inline-block text-ember italic">
              morning market
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full text-amber/70"
              >
                <path
                  d="M2 8C60 3 120 2 180 5c40 2 80 4 118 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            variants={line}
            className="mt-8 max-w-md text-[17px] leading-relaxed text-muted text-pretty"
          >
            Twelve tables. One menu, rewritten every day at four. We buy what the
            boats and the growers brought in that morning, cook it over wood, and
            serve it before it has time to become anything else.
          </motion.p>

          <motion.div variants={line} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream shadow-lg shadow-ink/10 transition-all hover:bg-ember hover:shadow-xl hover:shadow-ember/25"
            >
              See tonight&apos;s menu
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/reserve-table"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/60 px-7 py-4 text-sm font-medium backdrop-blur transition-colors hover:border-ink hover:bg-cream"
            >
              Reserve a table
            </Link>
          </motion.div>

          <motion.dl
            variants={line}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-7"
          >
            {ACCOLADES.map(([title, sub]) => (
              <div key={title}>
                <dt className="font-display text-[15px] leading-tight">{title}</dt>
                <dd className="mt-1 text-[11px] leading-snug tracking-wide text-muted">
                  {sub}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* right — the plate, arriving from off-page */}
        <motion.div
          style={reduced ? undefined : { y: parallaxY, opacity: parallaxOpacity }}
          className="relative flex items-center justify-center lg:justify-end"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.6, ease: EASE_OUT }}
            aria-hidden
            className="absolute aspect-square w-[86%] rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.38),rgba(226,84,42,0.14)_55%,transparent_72%)] blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 1, delay: 0.9 },
              rotate: { duration: 120, repeat: Infinity, ease: "linear" },
            }}
            aria-hidden
            className="absolute aspect-square w-[97%] rounded-full border border-dashed border-terracotta/25"
          />

          {/* 1. entry: travels in from the far right of the page */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { x: "135%", opacity: 0, scale: 0.5 }}
            animate={{ x: "0%", opacity: 1, scale: 1 }}
            transition={{
              duration: reduced ? 0.4 : 1.8,
              ease: EASE_OUT,
              opacity: { duration: 0.6 },
            }}
            className="relative w-[min(80vw,30rem)] lg:w-[min(40vw,34rem)]"
          >
            {/* 2. idle float once it has settled */}
            <motion.div
              animate={reduced ? undefined : { y: [0, -16, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.8,
              }}
            >
              {/* 3. the full turn on the way in, then a slow drift as you scroll */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: reduced ? 0 : 360 }}
                transition={{ duration: 1.8, ease: EASE_OUT }}
              >
                <motion.div style={reduced ? undefined : { rotate: driftRotate }}>
                  <Image
                    src="/img/hero-plate.webp"
                    alt="Seared salmon with saffron couscous, avocado and market tomatoes, seen from above"
                    width={1600}
                    height={1600}
                    priority
                    sizes="(max-width: 1024px) 80vw, 40vw"
                    className="h-auto w-full drop-shadow-[0_50px_60px_rgba(21,18,16,0.28)]"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* dish card pinned to the plate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.1, ease: EASE_OUT }}
              className="absolute bottom-0 -left-1 rounded-2xl border border-line bg-cream/95 px-4 py-3 shadow-xl shadow-ink/10 backdrop-blur sm:left-4"
            >
              <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
                On the pass
              </p>
              <p className="mt-1.5 font-display text-[15px] leading-tight">
                Salmon, saffron couscous,
                <br />
                avocado &amp; market tomato
              </p>
              <p className="mt-1.5 font-display text-lg text-ember">₹2,200</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
