"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "./reveal";

type Course = {
  name: string;
  note: string;
  price: string;
  badge?: string;
  dot: string;
};

const SECTIONS: Record<string, Course[]> = {
  "To begin": [
    {
      name: "Charred leeks, hazelnut, aged sheep",
      note: "Vinaigrette made from last week's wine",
      price: "9",
      dot: "bg-basil",
      badge: "V",
    },
    {
      name: "Scarlet prawn, lemon, olive oil",
      note: "Landed at Cascais this morning, served raw",
      price: "16",
      dot: "bg-ember",
    },
    {
      name: "Bread, cultured butter, smoked salt",
      note: "Sourdough baked at seven, still warm at eight",
      price: "5",
      dot: "bg-amber",
      badge: "V",
    },
  ],
  Larger: [
    {
      name: "Salmon, saffron couscous, avocado",
      note: "The plate the room is named for",
      price: "24",
      dot: "bg-ember",
      badge: "Signature",
    },
    {
      name: "Grain bowl, market vegetables, herbs",
      note: "Whatever the growers had most of",
      price: "14",
      dot: "bg-basil",
      badge: "V",
    },
    {
      name: "Hearth bream, brown butter, capers",
      note: "Whole fish, for two, thirty minutes",
      price: "38",
      dot: "bg-terracotta",
      badge: "For 2",
    },
  ],
  "To finish": [
    {
      name: "Burnt honey tart, crème fraîche",
      note: "Honey from the hills behind Sintra",
      price: "8",
      dot: "bg-amber",
    },
    {
      name: "Sheep's milk ice cream, olive oil",
      note: "Three ingredients, one of them salt",
      price: "7",
      dot: "bg-basil",
      badge: "V",
    },
  ],
};

const TABS = Object.keys(SECTIONS);

export function Menu() {
  const [active, setActive] = useState(TABS[0]);

  return (
    <section id="menu" className="grain relative bg-sand">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-ember" />
              Tonight, 16 September
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1] font-light tracking-[-0.03em]">
                Written at four,
                <br />
                gone by eleven.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="max-w-sm">
            <p className="text-[15px] leading-relaxed text-muted text-pretty">
              Order à la carte, or let the kitchen send everything for{" "}
              <span className="font-medium text-ink">€58 a head</span>. Wine is
              poured by the glass from whatever bottles we opened first.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-16">
          <div>
            {/* course tabs */}
            <Reveal y={20}>
              <div className="flex flex-wrap gap-2 border-b border-line pb-5">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActive(tab)}
                    className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                      active === tab
                        ? "text-cream"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {active === tab && (
                      <motion.span
                        layoutId="menu-tab"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-ink"
                      />
                    )}
                    <span className="relative">{tab}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.ul
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {SECTIONS[active].map((course, i) => (
                  <motion.li
                    key={course.name}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group border-b border-line"
                  >
                    <div className="flex items-baseline gap-4 py-6 transition-transform duration-500 ease-out group-hover:translate-x-2">
                      <span
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${course.dot} transition-transform duration-500 group-hover:scale-150`}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="flex flex-wrap items-center gap-2.5 font-display text-xl leading-snug font-light sm:text-2xl">
                          {course.name}
                          {course.badge && (
                            <span className="rounded-full border border-line bg-cream px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                              {course.badge}
                            </span>
                          )}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted">{course.note}</p>
                      </div>
                      <span className="font-display text-xl tabular-nums">
                        €{course.price}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>

            <Reveal y={16} delay={0.1}>
              <p className="mt-7 text-[13px] text-muted">
                V = vegetarian. Tell us about allergies when you book — the menu
                changes daily and we will work around almost anything.
              </p>
            </Reveal>
          </div>

          {/* featured plate */}
          <Reveal delay={0.08}>
            <div className="lg:sticky lg:top-28">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-parchment">
                <Image
                  src="/img/dish-grainbowl.webp"
                  alt="Market vegetable grain bowl with roasted carrots, beets and whipped labneh"
                  fill
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-cream">
                  <span className="inline-block rounded-full bg-amber px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-ink uppercase">
                    Most ordered
                  </span>
                  <h3 className="mt-3 font-display text-2xl leading-tight font-light">
                    Grain bowl, market vegetables, herbs
                  </h3>
                  <p className="mt-2 text-sm text-cream/75">
                    Barley and freekeh, roasted roots, whipped labneh, pistachio.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-cream p-5">
                  <p className="font-display text-3xl leading-none">€58</p>
                  <p className="mt-2 text-[12px] leading-snug text-muted">
                    Full menu, per person
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-cream p-5">
                  <p className="font-display text-3xl leading-none">19:00</p>
                  <p className="mt-2 text-[12px] leading-snug text-muted">
                    One seating, Wed – Sun
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
