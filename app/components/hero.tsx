"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const line = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
};

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-espresso text-cream"
    >
      {/* the indoor room, lit only by its table lamps */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/img/milli/hero-indoor.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_50%]"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.9)_0%,rgba(20,14,10,0.7)_38%,rgba(20,14,10,0.2)_75%,rgba(20,14,10,0.1)_100%)] max-md:bg-[linear-gradient(180deg,rgba(20,14,10,0.2)_0%,rgba(20,14,10,0.45)_35%,rgba(20,14,10,0.92)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-espresso/70 to-transparent"
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-end px-5 pt-32 pb-10 md:justify-center md:px-10 md:pt-36 md:pb-28">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-[36rem]">
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
            className="mt-6 max-w-[27rem] text-[15px] leading-relaxed text-cream/80 md:mt-8 md:text-base"
          >
            Twelve tables. One menu, rewritten every day. We buy what the markets
            bring, cook it over wood, and serve it before it has time to become
            anything else.
          </motion.p>

          <motion.div
            variants={line}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10"
          >
            <Link
              href="/menu"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-7 py-3.5 text-[13px] font-medium text-cream transition-colors hover:bg-[#e8703f]"
            >
              See tonight&apos;s menu
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/#reserve"
              className="inline-flex items-center justify-center rounded-full border border-cream/60 px-7 py-3.5 text-[13px] font-medium text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
            >
              Reserve a table
            </Link>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.a
          href="#tonight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 flex items-center gap-4 self-start text-[12px] text-cream/70 md:absolute md:bottom-10 md:mt-0"
        >
          <span className="relative block h-14 w-px overflow-hidden bg-cream/25">
            <motion.span
              animate={reduced ? undefined : { y: ["-100%", "100%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 top-0 h-1/2 bg-cream"
            />
          </span>
          Scroll
        </motion.a>
      </div>
    </section>
  );
}
