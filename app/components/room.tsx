"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "./reveal";

const SPACES = [
  {
    id: "indoor",
    label: "Indoor",
    img: "/img/milli/room-indoor.webp",
    alt: "The indoor room: carved plaster ceilings, woven rattan and lamplit high tables",
    tagline: "A space for long conversations.",
    desc: "Textured walls, warm light, and a room that feels like a getaway in the city.",
  },
  {
    id: "outdoor",
    label: "Outdoor",
    img: "/img/milli/outdoor-terrace.webp",
    alt: "The terrace at dusk with olive trees, low sofas and the city beyond the glass",
    tagline: "An open-air escape with city views.",
    desc: "Olive trees, low sofas and a copper canopy, open to the sky as the city lights up.",
  },
  {
    id: "lobby",
    label: "Lobby",
    img: "/img/milli/lobby-hall.webp",
    alt: "The lobby with a cloud of glass spheres over a marble chequerboard floor",
    tagline: "Where the evening begins.",
    desc: "Hand-laid marble underfoot and a cloud of glass overhead — the way in sets the tone.",
  },
  {
    id: "bar",
    label: "Bar",
    img: "/img/milli/bar-outdoor.webp",
    alt: "The round bar glowing from within, under rings of copper light",
    tagline: "Lit stone, a ring of copper.",
    desc: "A bar of lit quartz under a ring of copper light. Pull up a stool and stay a while.",
  },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Arrow({ dir, onClick, tone }: { dir: "prev" | "next"; onClick: () => void; tone: "dark" | "light" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous space" : "Next space"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        tone === "dark"
          ? "border-cream/50 text-cream hover:bg-cream hover:text-ink"
          : "border-ink/30 text-ink hover:bg-ink hover:text-cream"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Room() {
  const [i, setI] = useState(0);
  const space = SPACES[i];
  const go = (d: number) => setI((v) => (v + d + SPACES.length) % SPACES.length);

  const tabs = (tone: "dark" | "light") => (
    <div role="tablist" aria-label="Spaces" className={`flex gap-7 border-b ${tone === "dark" ? "border-cream/20" : "border-line"}`}>
      {SPACES.map((s, n) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          aria-selected={n === i}
          onClick={() => setI(n)}
          className={`relative pb-3 text-[12.5px] transition-colors ${
            tone === "dark"
              ? n === i ? "text-cream" : "text-cream/60 hover:text-cream"
              : n === i ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {s.label}
          {n === i && (
            <motion.span
              layoutId={`room-tab-${tone}`}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className={`absolute inset-x-0 -bottom-px h-px ${tone === "dark" ? "bg-cream" : "bg-ember"}`}
            />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <section id="room" className="scroll-mt-16">
      {/* ---------------------------------------------------------- desktop */}
      <div className="relative isolate hidden min-h-[760px] overflow-hidden bg-espresso text-cream md:block lg:min-h-[820px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={space.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
            className="absolute inset-0 -z-10"
          >
            <Image src={space.img} alt={space.alt} fill sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.9)_0%,rgba(20,14,10,0.62)_40%,rgba(20,14,10,0.15)_75%),linear-gradient(0deg,rgba(20,14,10,0.85)_0%,transparent_40%)]"
        />

        <div className="mx-auto flex min-h-[inherit] w-full max-w-[1400px] flex-col px-10 pt-24 pb-10">
          <div className="max-w-md">
            <Reveal>
              <h2 className="font-display text-[clamp(3rem,5.4vw,4.6rem)] leading-[0.95] font-light">
                The Room
              </h2>
              <p className="mt-3 text-[14px] text-cream/75">Different corners, same warmth.</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              {tabs("dark")}
            </Reveal>
            <AnimatePresence mode="wait">
              <motion.p
                key={space.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mt-7 max-w-[19rem] text-[14px] leading-relaxed text-cream/80"
              >
                {space.desc}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-auto">
            <div className="mb-6 flex items-center justify-end gap-3">
              <span className="text-[13px] text-cream/70 tabular-nums">
                <span className="text-cream">{String(i + 1).padStart(2, "0")}</span> / {String(SPACES.length).padStart(2, "0")}
              </span>
              <Arrow dir="prev" onClick={() => go(-1)} tone="dark" />
              <Arrow dir="next" onClick={() => go(1)} tone="dark" />
            </div>
            <ul className="grid grid-cols-4 gap-4 lg:gap-5">
              {SPACES.map((s, n) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setI(n)}
                    aria-label={`Show the ${s.label.toLowerCase()} space`}
                    className="group block w-full text-left"
                  >
                    <span
                      className={`relative block aspect-[4/3] overflow-hidden border transition-colors ${
                        n === i ? "border-cream" : "border-cream/15 group-hover:border-cream/60"
                      }`}
                    >
                      <Image
                        src={s.img}
                        alt=""
                        fill
                        sizes="22vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </span>
                    <span className={`mt-2.5 block text-[12.5px] ${n === i ? "text-cream" : "text-cream/65"}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- phone */}
      <div className="bg-cream md:hidden">
        <div className="relative aspect-[4/3.4] overflow-hidden bg-espresso">
          <Image
            src="/img/milli/bar-outdoor.webp"
            alt="The round bar under rings of copper light"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="px-5 pt-9 pb-14">
          <h2 className="font-display text-[2.8rem] leading-none font-light">The Room</h2>
          <p className="mt-2 text-[13.5px] text-muted">{space.tagline}</p>

          <div className="mt-6">{tabs("light")}</div>

          <AnimatePresence mode="wait">
            <motion.figure
              key={space.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="mt-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand">
                <Image src={space.img} alt={space.alt} fill sizes="92vw" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <p className="font-display text-xl">{space.label}</p>
                <p className="mt-1 text-[13px] text-muted">{space.desc}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Arrow dir="prev" onClick={() => go(-1)} tone="light" />
            <span className="text-[13px] text-muted tabular-nums">
              <span className="text-ink">{String(i + 1).padStart(2, "0")}</span> / {String(SPACES.length).padStart(2, "0")}
            </span>
            <Arrow dir="next" onClick={() => go(1)} tone="light" />
          </div>
        </div>
      </div>
    </section>
  );
}
