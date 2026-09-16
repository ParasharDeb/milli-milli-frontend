"use client";

import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal } from "./reveal";

const STATEMENT =
  "We are not trying to be clever. We buy well, we cook with fire and salt, and we stop there — because the best thing a kitchen can do to a good tomato is very little.";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

export function Philosophy() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.55"],
  });

  const words = STATEMENT.split(" ");

  return (
    <section
      id="kitchen"
      className="mx-auto w-full max-w-7xl px-6 py-28 md:px-10 lg:py-40"
    >
      <Reveal
        as="p"
        className="flex items-center gap-3 text-xs tracking-[0.28em] text-muted uppercase"
      >
        <span className="h-px w-8 bg-basil" />
        The kitchen
      </Reveal>

      <p
        ref={ref}
        className="mt-10 max-w-4xl font-display text-[clamp(1.75rem,4.2vw,3.25rem)] leading-[1.18] font-light tracking-[-0.02em] text-pretty"
      >
        {words.map((word, i) => {
          const start = i / words.length;
          const end = (i + 1.5) / words.length;
          return (
            <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          );
        })}
      </p>

      <div className="mt-20 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
        {[
          {
            k: "01",
            t: "Bought at six",
            d: "Two of us walk the market before service. What is best that morning becomes the menu that night.",
            c: "bg-ember",
          },
          {
            k: "02",
            t: "Cooked over wood",
            d: "One hearth, one flat-top, no microwaves. Heat you can see, adjusted by hand all evening.",
            c: "bg-basil",
          },
          {
            k: "03",
            t: "Served at twelve",
            d: "Twelve tables, one seating. Nobody is rushed out and nothing sits under a lamp.",
            c: "bg-saffron",
          },
        ].map((item, i) => (
          <Reveal key={item.k} delay={i * 0.12}>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${item.c}`}
            />
            <p className="mt-5 text-xs tracking-[0.2em] text-muted">{item.k}</p>
            <h3 className="mt-2 font-display text-2xl font-light">{item.t}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
              {item.d}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
