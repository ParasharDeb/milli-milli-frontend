"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/app/lib/cart-context";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ACCENT_CLASS, CATEGORIES, type Category } from "./menu-data";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Satellites fan across the top of the ring, left to right. */
const ARC_START = -162;
const ARC_END = -18;
const RADIUS = 43; // % of the square stage
const SATELLITE = 21; // % of the square stage
const FEATURED = 62;

function satelliteAngle(index: number, count: number) {
  if (count <= 1) return -90;
  return ARC_START + (index * (ARC_END - ARC_START)) / (count - 1);
}

/**
 * Every dish sits in an identical tile parked at the centre of the stage and
 * is moved into place with transforms only. Nothing mounts or unmounts as the
 * selection changes, so the plates genuinely travel along the ring instead of
 * cross-fading between two copies of themselves.
 *
 * Offsets are percentages of the TILE, so `RADIUS` (a percentage of the stage)
 * has to be rescaled by the tile's own size.
 */
const ORBIT_SCALE = (RADIUS / SATELLITE) * 100;

function orbitOffset(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: `${ORBIT_SCALE * Math.cos(rad)}%`,
    y: `${ORBIT_SCALE * Math.sin(rad)}%`,
  };
}

function Chillies({ level, className }: { level: number; className: string }) {
  if (level === 0) return null;
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Spice ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${n <= level ? className : "bg-line"}`}
        />
      ))}
    </span>
  );
}

/**
 * `categories` comes from the database via the menu page. The bundled
 * CATEGORIES stay as the fallback so the page still renders if the backend
 * is unreachable.
 */
export function DishOrbit({ categories = CATEGORIES }: { categories?: Category[] }) {
  const reduced = useReducedMotion();
  const [categoryId, setCategoryId] = useState(categories[0]!.id);
  const [activeId, setActiveId] = useState(categories[0]!.items[0]!.id);

  const { add, busy } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const category = categories.find((c) => c.id === categoryId) ?? categories[0]!;
  const accent = ACCENT_CLASS[category.accent];
  const active =
    category.items.find((d) => d.id === activeId) ?? category.items[0];
  const satellites = category.items.filter((d) => d.id !== active.id);

  /**
   * `Dish.id` is the real item uuid when the page rendered from the API. The
   * bundled fallback menu uses slugs like "rice-biryani", which the backend
   * would reject -- so the button only acts when the id looks like a uuid.
   */
  const canOrder = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(active.id);

  async function handleAdd() {
    if (!canOrder) return;
    await add(active.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  function pickCategory(id: string) {
    const next = categories.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(id);
    setActiveId(next.items[0].id);
  }

  function step(direction: 1 | -1) {
    const i = category.items.findIndex((d) => d.id === active.id);
    const next =
      category.items[(i + direction + category.items.length) % category.items.length];
    setActiveId(next.id);
  }

  return (
    <div>
      {/* category tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-6">
        {categories.map((cat) => {
          const on = cat.id === category.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => pickCategory(cat.id)}
              aria-pressed={on}
              className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                on ? "text-cream" : "text-muted hover:text-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="category-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-ink"
                />
              )}
              <span className="relative">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.82fr_1fr] lg:gap-8">
        {/* left — the details */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <p className="eyebrow text-muted">
                <span className={`h-px w-8 ${accent.bg}`} />
                {category.label}
              </p>

              {active.price != null && (
                <p className={`mt-5 font-display text-4xl leading-none ${accent.text}`}>
                  ₹{active.price}
                </p>
              )}

              <h3 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] font-light tracking-[-0.03em] text-balance">
                {active.name}
              </h3>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted text-pretty">
                {active.desc}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {active.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border ${accent.border} bg-cream px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-muted uppercase`}
                  >
                    {tag}
                  </span>
                ))}
                {active.spice > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-[11px] tracking-[0.12em] text-muted uppercase">
                    Heat
                    <Chillies level={active.spice} className={accent.bg} />
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy || justAdded || !canOrder}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-ember disabled:opacity-70"
            >
              {justAdded ? "Added to your order" : "Add to order"}
              <span className="transition-transform group-hover:translate-x-1">
                {justAdded ? "✓" : "→"}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous dish"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next dish"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
              >
                →
              </button>
            </div>

            <span className="ml-1 font-display text-sm text-muted tabular-nums">
              {String(category.items.findIndex((d) => d.id === active.id) + 1).padStart(2, "0")}
              <span className="mx-1 text-line">/</span>
              {String(category.items.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* right — the orbit */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
            {/* wash */}
            <div
              aria-hidden
              className="absolute inset-[8%] rounded-full blur-2xl transition-colors duration-700"
              style={{
                background: `radial-gradient(circle, ${accent.glow}, transparent 68%)`,
              }}
            />

            {/* the dashed track the dishes sit on */}
            <motion.div
              aria-hidden
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
              className={`absolute rounded-full border border-dashed ${accent.ring}`}
              style={{
                width: `${RADIUS * 2}%`,
                height: `${RADIUS * 2}%`,
                left: `${50 - RADIUS}%`,
                top: `${50 - RADIUS}%`,
              }}
            />

            {/* every dish, parked centre-stage and moved by transform alone */}
            {category.items.map((dish) => {
              const isActive = dish.id === active.id;
              const slot = satellites.findIndex((d) => d.id === dish.id);
              const offset = isActive
                ? { x: "0%", y: "0%" }
                : orbitOffset(satelliteAngle(slot, satellites.length));

              return (
                <motion.button
                  key={dish.id}
                  type="button"
                  onClick={() => setActiveId(dish.id)}
                  disabled={isActive}
                  title={dish.name}
                  aria-label={
                    isActive ? `${dish.name}, showing` : `Show ${dish.name}`
                  }
                  aria-pressed={isActive}
                  animate={{
                    x: offset.x,
                    y: offset.y,
                    scale: isActive ? FEATURED / SATELLITE : 1,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 110, damping: 18, mass: 0.9 }
                  }
                  className={`absolute aspect-square ${
                    isActive ? "z-20 cursor-default" : "z-10 cursor-pointer"
                  }`}
                  style={{
                    width: `${SATELLITE}%`,
                    left: `${(100 - SATELLITE) / 2}%`,
                    top: `${(100 - SATELLITE) / 2}%`,
                  }}
                >
                  <motion.span
                    animate={
                      reduced
                        ? undefined
                        : isActive
                          ? { y: [0, -4, 0] }
                          : { y: 0, scale: 1 }
                    }
                    whileHover={reduced || isActive ? undefined : { scale: 1.12 }}
                    whileTap={isActive ? undefined : { scale: 0.94 }}
                    transition={
                      isActive
                        ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                        : { type: "spring", stiffness: 300, damping: 20 }
                    }
                    className="absolute inset-0 block"
                  >
                    {dish.img ? (
                    <Image
                      src={dish.img}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 1024px) 40vw, 20vw"
                      priority={isActive}
                      className={`object-contain transition-[filter] duration-500 ${
                        isActive
                          ? "drop-shadow-[0_12px_16px_rgba(21,18,16,0.22)]"
                          : "drop-shadow-[0_14px_20px_rgba(21,18,16,0.2)]"
                      }`}
                    />
                    ) : (
                      <span
                        aria-hidden
                        className={`flex h-full w-full items-center justify-center rounded-full border ${accent.ring} bg-cream/70 font-display text-[2.4rem] font-light ${accent.text} shadow-[0_12px_20px_rgba(21,18,16,0.12)]`}
                      >
                        {dish.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          <p className="mt-2 text-center text-[12px] text-muted lg:mt-0">
            Tap a dish to bring it forward
          </p>
        </div>
      </div>

      {/* the whole category, in plain text, for anyone who just wants to read it */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-light">
            All {category.label.toLowerCase()}
          </h3>
          <p className="max-w-md text-[13px] text-muted">{category.note}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={category.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="mt-6"
          >
            {category.items.map((dish, i) => {
              const on = dish.id === active.id;
              return (
                <motion.li
                  key={dish.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                  className="border-b border-line last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(dish.id)}
                    className="group flex w-full items-baseline gap-4 py-5 text-left"
                  >
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-transform duration-500 ${
                        on ? `${accent.bg} scale-150` : "bg-line group-hover:scale-125"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-display text-lg leading-snug font-light transition-colors sm:text-xl ${
                          on ? accent.text : "group-hover:text-muted"
                        }`}
                      >
                        {dish.name}
                      </span>
                      <span className="mt-1 block truncate text-sm text-muted">
                        {dish.desc}
                      </span>
                    </span>
                    {dish.price != null && (
                      <span className="shrink-0 font-display text-lg tabular-nums">
                        ₹{dish.price}
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
