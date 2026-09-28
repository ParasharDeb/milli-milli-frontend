"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const SLIDES = [
  {
    img: "/img/milli/outdoor-terrace.webp",
    alt: "The terrace at dusk, olive trees and low sofas above the city",
    title: "Dinner at Milli",
    line: "A space for long conversations.",
  },
  {
    img: "/img/milli/room-indoor.webp",
    alt: "The indoor room under carved plaster and woven rattan",
    title: "The indoor room",
    line: "Textured walls and warm lamplight.",
  },
  {
    img: "/img/milli/bar-outdoor.webp",
    alt: "The round bar glowing from within under rings of copper light",
    title: "At the bar",
    line: "Lit stone under a ring of copper.",
  },
  {
    img: "/img/milli/outdoor-balcony.webp",
    alt: "A balcony table for two with the city skyline at dusk",
    title: "The balcony",
    line: "Dinner with the city below.",
  },
];

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/45 bg-espresso/30 text-cream backdrop-blur transition-colors hover:bg-cream hover:text-ink"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function SpaceCarousel() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const go = (d: number) => setI((v) => (v + d + SLIDES.length) % SLIDES.length);

  return (
    <figure className="overflow-hidden rounded-lg bg-espresso text-cream shadow-[0_30px_60px_-35px_rgba(28,20,15,0.7)]">
      <div className="relative aspect-[4/3.3]">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.img}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image src={slide.img} alt={slide.alt} fill sizes="(max-width: 1024px) 100vw, 44vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute right-4 bottom-4 flex gap-2">
          <Arrow dir="prev" onClick={() => go(-1)} />
          <Arrow dir="next" onClick={() => go(1)} />
        </div>
      </div>
      <figcaption className="flex items-end justify-between gap-4 px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.span
            key={slide.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="block"
          >
            <span className="block font-display text-[20px] leading-tight font-light">{slide.title}</span>
            <span className="mt-1 block text-[13.5px] text-cream/75">{slide.line}</span>
          </motion.span>
        </AnimatePresence>
        <span className="shrink-0 text-[13px] text-cream/60 tabular-nums">
          {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </figcaption>
    </figure>
  );
}
