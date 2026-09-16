"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const DISHES = [
  {
    img: "/img/dish-prawn.webp",
    alt: "Raw scarlet prawns dressed with lemon zest, sea salt and olive oil",
    name: "Scarlet prawn, lemon, olive oil",
    tag: "Raw bar",
    price: "€16",
    tone: "text-ember",
  },
  {
    img: "/img/dish-leeks.webp",
    alt: "Charred spring leeks with hazelnuts and aged sheep cheese",
    name: "Charred leeks, hazelnut, aged sheep",
    tag: "From the hearth",
    price: "€9",
    tone: "text-amber",
  },
  {
    img: "/img/dish-bream.webp",
    alt: "Whole grilled sea bream with brown butter and capers",
    name: "Hearth bream, brown butter, capers",
    tag: "To share",
    price: "€38",
    tone: "text-ember",
  },
  {
    img: "/img/dish-tart.webp",
    alt: "A wedge of burnt honey tart with crème fraîche and honeycomb",
    name: "Burnt honey tart, crème fraîche",
    tag: "Sweet",
    price: "€8",
    tone: "text-amber",
  },
];

export function Signatures() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      id="signatures"
      ref={ref}
      className="grain relative overflow-hidden bg-forest text-cream"
    >
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: glowY }}
        className="pointer-events-none absolute -top-24 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.20),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-12%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(226,84,42,0.18),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="p" className="eyebrow text-amber">
              <span className="h-px w-8 bg-amber" />
              Signatures
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.1rem,4.8vw,3.6rem)] leading-[1.02] font-light tracking-[-0.03em] text-balance">
                The four that never quite leave the menu.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <a
              href="#menu"
              className="group inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-medium transition-colors hover:border-amber hover:text-amber"
            >
              See the full menu
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>

        <RevealGroup
          stagger={0.1}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {DISHES.map((dish) => (
            <RevealItem key={dish.name} as="article" className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-forest-deep">
                <Image
                  src={dish.img}
                  alt={dish.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-transparent to-transparent opacity-80" />
                <span className="absolute top-4 left-4 rounded-full bg-cream/90 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-ink uppercase">
                  {dish.tag}
                </span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h3 className="font-display text-lg leading-snug font-light">
                  {dish.name}
                </h3>
                <span className={`font-display text-lg ${dish.tone}`}>
                  {dish.price}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
