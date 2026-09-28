"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/app/components/reveal";
import { useCart } from "@/app/lib/cart-context";
import { CATEGORIES, type Category, type Dish } from "./menu-data";
import { MenuWelcome } from "./menu-welcome";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** How many dishes a course lists before "Show all". */
const LIST_PREVIEW = 8;

type CourseCopy = {
  title: [string, string];
  body: string;
  card: string;
  img: string;
};

/**
 * Copy and photography for each course. Keyed by the adapter's group ids, with
 * the bundled fallback menu's ids mapped onto the nearest one.
 */
const COURSE: Record<string, CourseCopy> = {
  small: {
    title: ["Bold beginnings", "for a long evening."],
    body: "Light, seasonal plates to start the conversation. Flavours that are fresh, vibrant and meant to be shared.",
    card: "Fresh, vibrant and meant to be shared.",
    img: "/img/milli/course-small.webp",
  },
  mains: {
    title: ["The heart", "of the table."],
    body: "Cooked to order and sent as they are ready: slow curries, wood-fired plates and pasta rolled that morning.",
    card: "Heartier dishes from land and sea.",
    img: "/img/milli/course-mains.webp",
  },
  breads: {
    title: ["Straight off", "the fire."],
    body: "Kulchas, flatbreads and sourdough from the oven, brought over in batches while you eat.",
    card: "Freshly baked, to go with everything.",
    img: "/img/milli/course-breads.webp",
  },
  sweets: {
    title: ["A sweet", "ending."],
    body: "Made in-house every afternoon. One each, or one between two if the table is honest about it.",
    card: "A sweet ending, seasonal and delicate.",
    img: "/img/milli/course-desserts.webp",
  },
};
const ALIAS: Record<string, keyof typeof COURSE> = {
  rice: "mains",
  gravies: "mains",
  desserts: "sweets",
};

function courseCopy(category: Category): CourseCopy {
  return COURSE[category.id] ?? COURSE[ALIAS[category.id] ?? "mains"];
}

function rupees(n?: number) {
  return n == null ? null : `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * The bundled fallback photographs are cut-outs on white, so they sit on a
 * plain ground rather than being cropped to fill.
 */
function DishPhoto({ dish, sizes, priority }: { dish: Dish; sizes: string; priority?: boolean }) {
  if (!dish.img) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-sand font-display text-6xl text-muted/50">
        {dish.name.trim().charAt(0)}
      </span>
    );
  }
  const cutout = dish.img.startsWith("/img/menu/");
  return (
    <Image
      src={dish.img}
      alt={dish.name}
      fill
      sizes={sizes}
      priority={priority}
      className={cutout ? "bg-[#f4efe7] object-contain p-[8%]" : "object-cover"}
    />
  );
}

function ArrowIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RoundButton({
  onClick,
  label,
  dir,
  tone = "light",
}: {
  onClick: () => void;
  label: string;
  dir: "left" | "right";
  tone?: "light" | "dark";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
        tone === "dark"
          ? "border-cream/40 text-cream hover:bg-cream hover:text-ink"
          : "border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream"
      }`}
    >
      <ArrowIcon dir={dir} />
    </button>
  );
}


export function MenuExperience({ categories = CATEGORIES }: { categories?: Category[] }) {
  const { add, busy } = useCart();
  const [categoryId, setCategoryId] = useState(categories[0]!.id);
  const [dishId, setDishId] = useState(categories[0]!.items[0]!.id);
  const [showAll, setShowAll] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const featuredRef = useRef<HTMLElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  const category = categories.find((c) => c.id === categoryId) ?? categories[0]!;
  const index = Math.max(0, category.items.findIndex((d) => d.id === dishId));
  const dish = category.items[index]!;
  const copy = courseCopy(category);
  const listed = showAll ? category.items : category.items.slice(0, LIST_PREVIEW);

  /**
   * `Dish.id` is the real item uuid when the page rendered from the API. The
   * bundled fallback menu uses slugs, which the backend would reject.
   */
  const canOrder = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(dish.id);

  function pickCategory(id: string, scroll = false) {
    const next = categories.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(id);
    setDishId(next.items[0]!.id);
    setShowAll(false);
    if (scroll) featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function step(direction: 1 | -1) {
    const n = category.items.length;
    setDishId(category.items[(index + direction + n) % n]!.id);
  }

  async function handleAdd() {
    if (!canOrder) return;
    await add(dish.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        <Image
          src="/img/milli/menu-hero.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[80%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.92)_0%,rgba(20,14,10,0.6)_38%,rgba(20,14,10,0.05)_70%)] max-md:bg-[linear-gradient(180deg,rgba(20,14,10,0.55)_0%,rgba(20,14,10,0.85)_100%)]"
        />
        {/* keeps the nav legible where it crosses the plate */}
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-espresso/75 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-32 pb-14 md:px-10 md:pt-40 md:pb-20">
          <h1 className="font-display text-[clamp(3.4rem,8vw,6.6rem)] leading-[0.95] font-light">
            Tonight&apos;s
            <br />
            menu
          </h1>
          <p className="mt-6 max-w-xs text-[15.5px] leading-relaxed text-cream/80">
            A menu built from what the morning market brought in,{" "}
            <span suppressHydrationWarning>{today()}</span>.
          </p>

          <div role="tablist" aria-label="Courses" className="no-scrollbar -mx-5 mt-9 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {categories.map((c) => {
              const on = c.id === category.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => pickCategory(c.id)}
                  className={`relative shrink-0 rounded-full px-5 py-2.5 text-[13px] whitespace-nowrap transition-colors ${
                    on ? "text-ink" : "text-cream/85 hover:text-cream"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="menu-hero-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-cream"
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      <MenuWelcome />

      {/* ------------------------------------------------------- featured */}
      <section
        ref={featuredRef}
        id="featured"
        className="relative scroll-mt-16 overflow-hidden bg-[#efe7db]"
      >
        {/* the dish, bleeding off the right edge */}
        <div className="relative aspect-square w-full md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[56%]">
          <AnimatePresence initial={false}>
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="absolute inset-0"
            >
              <DishPhoto dish={dish} sizes="(max-width: 768px) 100vw, 56vw" priority />
            </motion.div>
          </AnimatePresence>
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-r from-[#efe7db] via-[#efe7db]/40 via-15% to-transparent to-45% md:block"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1400px] px-5 py-12 md:flex md:min-h-[600px] md:items-center md:px-10 md:py-20">
          <div className="md:w-[42%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                {rupees(dish.price) && (
                  <p className="font-display text-[34px] leading-none text-ember">{rupees(dish.price)}</p>
                )}
                <h2 className="mt-3 font-display text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[1.02] font-light text-balance">
                  {dish.name}
                </h2>
                <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-muted">{dish.desc}</p>

                {(dish.tags.length > 0 || dish.spice > 0) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {dish.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-ink/15 px-3.5 py-1.5 text-[12.5px] text-ink/75"
                      >
                        {tag}
                      </span>
                    ))}
                    {dish.spice > 0 && (
                      <span
                        className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 text-[12.5px] text-ink/75"
                        aria-label={`Heat ${dish.spice} of 3`}
                      >
                        Heat
                        <span className="flex gap-1">
                          {[1, 2, 3].map((n) => (
                            <span
                              key={n}
                              className={`h-1.5 w-1.5 rounded-full ${n <= dish.spice ? "bg-ember" : "bg-ink/15"}`}
                            />
                          ))}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={handleAdd}
              disabled={busy || justAdded || !canOrder}
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember disabled:opacity-70"
            >
              {justAdded ? "Added to your order" : "Add to order"}
              <span className="transition-transform group-hover:translate-x-1">{justAdded ? "✓" : "→"}</span>
            </button>

            <div className="mt-8 flex items-center gap-3">
              <RoundButton dir="left" label="Previous dish" onClick={() => step(-1)} />
              <RoundButton dir="right" label="Next dish" onClick={() => step(1)} />
              <span className="ml-3 text-[13px] text-muted tabular-nums">
                {pad(index + 1)} <span className="text-ink/30">/</span> {pad(category.items.length)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- course intro */}
      <section className="grid bg-espresso text-cream md:grid-cols-2">
        <div className="relative flex flex-col justify-center px-5 py-14 md:px-10 md:py-20 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]">
          <AnimatePresence mode="wait">
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <h2 className="font-display text-[clamp(2.3rem,4vw,3.4rem)] leading-[1.02] font-light">
                {copy.title[0]}
                <br />
                {copy.title[1]}
              </h2>
              <p className="mt-6 max-w-sm text-[14.5px] leading-relaxed text-cream/75">{copy.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={copy.img}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image src={copy.img} alt="" aria-hidden fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ---------------------------------------------------- the course */}
      <section className="bg-cream">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:gap-14 md:px-10 lg:py-20">
          <div>
            <ul className="divide-y divide-line border-b border-line">
              {listed.map((d) => {
                const on = d.id === dish.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setDishId(d.id)}
                      aria-pressed={on}
                      className="group flex w-full items-baseline justify-between gap-6 py-4 text-left"
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-[15px] leading-snug font-medium transition-colors ${
                            on ? "text-ember" : "group-hover:text-ember"
                          }`}
                        >
                          {d.name}
                        </span>
                        <span className="mt-1 block text-[12.5px] leading-snug text-muted">{d.desc}</span>
                      </span>
                      {rupees(d.price) && (
                        <span className="shrink-0 text-[13.5px] tabular-nums text-ink/80">{rupees(d.price)}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {category.items.length > LIST_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="group mt-6 inline-flex items-center gap-2 text-[13px] text-ember hover:text-ink"
              >
                {showAll
                  ? "Show fewer"
                  : `Show all ${category.items.length} ${category.label.toLowerCase()}`}
                <span className={`transition-transform ${showAll ? "-rotate-90" : "rotate-90"}`}>→</span>
              </button>
            )}
          </div>

          <figure className="md:sticky md:top-24 md:self-start">
            <div className="relative aspect-square overflow-hidden rounded-sm bg-sand shadow-[0_24px_50px_-30px_rgba(28,20,15,0.6)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <DishPhoto dish={dish} sizes="(max-width: 768px) 100vw, 36vw" />
                </motion.div>
              </AnimatePresence>
            </div>
            <figcaption className="mt-4 flex items-start justify-between gap-4">
              <span>
                <span className="block text-[14px] font-medium">{dish.name}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{dish.desc}</span>
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next dish"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                <ArrowIcon />
              </button>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------ market */}
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        <Image
          src="/img/milli/market.webp"
          alt="Baskets of tomatoes, greens and gourds at the morning market"
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[70%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.94)_0%,rgba(20,14,10,0.7)_38%,rgba(20,14,10,0.1)_75%)] max-md:bg-[rgba(20,14,10,0.78)]"
        />
        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
          <Reveal>
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.3rem)] leading-[1.02] font-light">
              From the morning market
              <br className="max-sm:hidden" /> to your plate.
            </h2>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-cream/75">
              We work with local growers and the morning market. The menu follows the season, the
              land, and the people who bring it to us.
            </p>
            <Link href="/#about" className="group mt-7 inline-flex items-center gap-2 text-[13px] text-ember">
              Our story
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- discover */}
      <section className="bg-cream">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 lg:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-none font-light">
                More to discover.
              </h2>
            </div>
            <div className="flex gap-2.5 lg:hidden">
              <RoundButton dir="left" label="Scroll back" onClick={() => discoverRef.current?.scrollBy({ left: -280, behavior: "smooth" })} />
              <RoundButton dir="right" label="Scroll on" onClick={() => discoverRef.current?.scrollBy({ left: 280, behavior: "smooth" })} />
            </div>
          </div>

          <div
            ref={discoverRef}
            className="no-scrollbar -mx-5 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
          >
            {categories.map((c) => {
              const cover = c.items.find((d) => d.img && !d.img.startsWith("/img/menu/")) ?? c.items[0]!;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCategory(c.id, true)}
                  className="group w-[70%] shrink-0 snap-start overflow-hidden rounded-md border border-line bg-[#fbf7f0] text-left shadow-[0_18px_40px_-32px_rgba(28,20,15,0.6)] sm:w-[44%] lg:w-auto"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-sand">
                    <span className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <DishPhoto dish={cover} sizes="(max-width: 1024px) 70vw, 24vw" />
                    </span>
                  </span>
                  <span className="flex items-end justify-between gap-3 px-4 pt-4 pb-5">
                    <span>
                      <span className="block text-[15px] font-medium">{c.label}</span>
                      <span className="mt-1 block text-[12px] leading-snug text-muted">{courseCopy(c).card}</span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
                      <ArrowIcon />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
