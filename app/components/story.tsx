"use client";

import Image from "next/image";
import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "./reveal";

const STATEMENT =
  "We are not trying to be clever. We buy well, we cook with fire and salt, and we stop there — because the best thing a kitchen can do to a good tomato is very little.";

const PRINCIPLES = [
  {
    k: "01",
    t: "Bought at six",
    d: "Two of us walk the market before service. Whatever is best that morning becomes the menu that night.",
    accent: "bg-ember",
    tint: "border-ember/25 bg-ember/6",
  },
  {
    k: "02",
    t: "Cooked over wood",
    d: "One hearth, one flat-top, no microwaves. Heat you can see, adjusted by hand all evening long.",
    accent: "bg-basil",
    tint: "border-basil/25 bg-basil/6",
  },
  {
    k: "03",
    t: "Served at twelve",
    d: "Twelve tables, one seating. Nobody is rushed out and nothing ever sits waiting under a lamp.",
    accent: "bg-amber",
    tint: "border-amber/30 bg-amber/8",
  },
];

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

export function Story() {
  const reduced = useReducedMotion();
  const textRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.9", "end 0.55"],
  });

  const { scrollYProgress: imageProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(imageProgress, [0, 1], ["-8%", "8%"]);

  const words = STATEMENT.split(" ");

  return (
    <section
      id="kitchen"
      className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 lg:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <Reveal as="p" className="eyebrow text-muted">
            <span className="h-px w-8 bg-basil" />
            The kitchen
          </Reveal>

          <p
            ref={textRef}
            className="mt-8 font-display text-[clamp(1.6rem,3.4vw,2.7rem)] leading-[1.2] font-light tracking-[-0.02em] text-pretty"
          >
            {words.map((word, i) => {
              const start = i / words.length;
              const end = (i + 1.5) / words.length;
              return (
                <Word
                  key={`${word}-${i}`}
                  progress={scrollYProgress}
                  range={[start, end]}
                >
                  {word}
                </Word>
              );
            })}
          </p>

          <Reveal delay={0.1}>
            <div className="mt-10 flex items-center gap-4 border-l-2 border-terracotta pl-5">
              <div>
                <p className="font-display text-lg leading-tight">Inês Varela</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Chef &amp; co-owner, in the kitchen since day one
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* market photograph with a slow parallax crop */}
        <Reveal delay={0.05}>
          <div
            ref={imageRef}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand lg:aspect-[4/4.6]"
          >
            <motion.div
              style={reduced ? undefined : { y: imageY }}
              className="absolute inset-x-0 -top-[8%] h-[116%]"
            >
              <Image
                src="/img/market.webp"
                alt="Chefs choosing produce at an early morning market in Lisbon"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-cream/20 bg-ink/65 px-5 py-4 text-cream backdrop-blur-md">
              <p className="text-[10px] tracking-[0.22em] text-cream/60 uppercase">
                06:10 · Mercado da Ribeira
              </p>
              <p className="mt-1.5 font-display text-lg leading-snug font-light">
                Seven growers, one fishmonger, no wholesalers.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-5 sm:grid-cols-3">
        {PRINCIPLES.map((item, i) => (
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
              <h3 className="mt-5 font-display text-2xl font-light">{item.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
                {item.d}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
