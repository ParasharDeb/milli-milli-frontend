"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const WORDS = [
  "market-led",
  "twelve tables",
  "one seating",
  "wood fire",
  "no freezer",
  "seven growers",
];

export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // The strip slides as you pass it, so the band moves with the page.
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-24%"]);

  return (
    <div
      ref={ref}
      className="grain relative overflow-hidden bg-ember py-5 text-cream"
      aria-hidden
    >
      <motion.div style={{ x }} className="flex w-max items-center gap-8 px-6">
        {[...WORDS, ...WORDS, ...WORDS].map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-8 font-display text-xl font-light whitespace-nowrap sm:text-2xl"
          >
            {word}
            <span className="text-amber">&#10033;</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
