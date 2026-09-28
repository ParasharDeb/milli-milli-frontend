"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { COURSES, DISHES, rupees, type Course } from "./dishes";
import { Reveal } from "./reveal";

const TABS: ("All" | Course)[] = ["All", ...COURSES];

function today() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function Menu() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [featuredId, setFeaturedId] = useState("seabass");

  const dishes = tab === "All" ? DISHES : DISHES.filter((d) => d.course === tab);
  // The photograph follows the pointer, and falls back to the first dish on
  // the tab when the one it was showing has been filtered away.
  const featured = dishes.find((d) => d.id === featuredId) ?? dishes[0];

  return (
    <section id="menu" className="scroll-mt-16 bg-sand">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-10 lg:py-28">
        <div className="rounded-lg bg-cream px-5 py-10 shadow-[0_30px_60px_-45px_rgba(28,20,15,0.5)] sm:px-8 md:px-12 md:py-14">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[1] font-light">
              Tonight&apos;s menu
            </h2>
            <p className="mt-3 text-[14.5px] text-muted">
              A menu built from what the morning market brought in,{" "}
              <span suppressHydrationWarning>{today()}</span>.
            </p>
          </Reveal>

          {/* course tabs */}
          <Reveal delay={0.08}>
            <div
              role="tablist"
              aria-label="Courses"
              className="no-scrollbar -mx-5 mt-8 flex gap-7 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0 md:gap-10"
            >
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`relative shrink-0 pb-3.5 text-[13px] whitespace-nowrap transition-colors ${
                    tab === t ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="menu-tab"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-ember"
                    />
                  )}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_0.95fr] md:gap-10 lg:gap-14">
            <AnimatePresence mode="wait">
              <motion.ul
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="self-start"
              >
                {dishes.map((dish) => (
                  <li key={dish.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setFeaturedId(dish.id)}
                      onFocus={() => setFeaturedId(dish.id)}
                      onClick={() => setFeaturedId(dish.id)}
                      className="group flex w-full items-baseline justify-between gap-6 py-3.5 text-left"
                    >
                      <span className="min-w-0">
                        <span
                          className={`block font-display text-[21px] leading-tight transition-colors ${
                            featured?.id === dish.id ? "text-ember" : "group-hover:text-ember"
                          }`}
                        >
                          {dish.name}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-muted">{dish.note}</span>
                      </span>
                      <span className="shrink-0 text-[14px] tabular-nums text-ink/80">
                        {rupees(dish.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>

            {featured && (
              <figure className="md:sticky md:top-28 md:self-start">
                <div className="relative aspect-[4/3.6] overflow-hidden rounded-sm bg-sand">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={featured.id}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={featured.img}
                        alt={featured.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <figcaption className="mt-3">
                  <p className="text-[12.5px] text-ink/85">{featured.name}</p>
                  <p className="text-[11.5px] text-muted">{featured.note}</p>
                </figcaption>
              </figure>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[12.5px] text-muted">
              Tell us about allergies when you book — we will work around almost anything.
            </p>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 text-[13px] text-ember hover:text-ink"
            >
              See the full menu
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
