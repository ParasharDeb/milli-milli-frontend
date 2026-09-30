"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/app/lib/cart-context";
import { useCartDrawer } from "@/app/components/cart-drawer";
import { CATEGORIES, type Category, type Dish } from "./menu-data";
import { MenuWelcome } from "./menu-welcome";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * `Dish.id` is the real item uuid when the page rendered from the API. The
 * bundled fallback menu uses slugs, which the backend would reject.
 */
const ORDERABLE = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

type Filter = "veg" | "nonveg" | "bestseller";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "veg", label: "Veg" },
  { id: "nonveg", label: "Non-veg" },
  { id: "bestseller", label: "Bestseller" },
];

function rupees(n?: number | null) {
  return n == null ? null : `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

const isVeg = (d: Dish) => d.tags.includes("Vegetarian");

/**
 * The bundled fallback photographs are cut-outs on white, so they sit on a
 * plain ground rather than being cropped to fill.
 */
function DishPhoto({ dish, sizes }: { dish: Dish; sizes: string }) {
  if (!dish.img) return null;
  const cutout = dish.img.startsWith("/img/menu/");
  return (
    <Image
      src={dish.img}
      alt={dish.name}
      fill
      sizes={sizes}
      className={cutout ? "bg-[#f4efe7] object-contain p-[8%]" : "object-cover"}
    />
  );
}

/** The square-and-dot food mark: green circle for veg, red triangle otherwise. */
function DietMark({ veg }: { veg: boolean }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
        veg ? "border-basil" : "border-[#b33a2b]"
      }`}
    >
      {veg ? (
        <span className="h-[7px] w-[7px] rounded-full bg-basil" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-[#b33a2b]" />
      )}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Scroll back" : "Scroll on"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.07] text-ink/70 transition-colors hover:bg-ink/[0.12] hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** ADD, which becomes a − n + stepper once the dish is in the order. */
function AddControl({ dish, className = "" }: { dish: Dish; className?: string }) {
  const { cart, busy, add, setQty, remove } = useCart();
  const qty = cart?.lines.find((l) => l.item.id === dish.id)?.qty ?? 0;
  const orderable = ORDERABLE.test(dish.id);

  const base =
    "flex h-10 w-[118px] items-center justify-center rounded-lg border border-ink/10 bg-white text-[15px] font-extrabold text-basil shadow-[0_3px_8px_rgba(28,20,15,0.08)]";

  if (qty > 0) {
    return (
      <div className={`${base} justify-between px-1 ${className}`}>
        <button
          type="button"
          disabled={busy}
          onClick={() => (qty === 1 ? remove(dish.id) : setQty(dish.id, qty - 1))}
          aria-label={`Remove one ${dish.name}`}
          className="flex h-full w-9 items-center justify-center text-lg disabled:opacity-50"
        >
          −
        </button>
        <span className="tabular-nums">{qty}</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => add(dish.id)}
          aria-label={`Add one more ${dish.name}`}
          className="flex h-full w-9 items-center justify-center text-lg disabled:opacity-50"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy || !orderable}
      onClick={() => add(dish.id)}
      title={orderable ? undefined : "Ordering opens when the kitchen is online"}
      className={`${base} uppercase transition-colors hover:bg-[#f2f2f2] disabled:cursor-not-allowed disabled:text-ink/30 ${className}`}
    >
      Add
    </button>
  );
}

function DishRow({ dish }: { dish: Dish }) {
  const [expanded, setExpanded] = useState(false);
  const [long, setLong] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  // "more" only when the two-line clamp is actually hiding something.
  useLayoutEffect(() => {
    const el = descRef.current;
    if (el && !expanded) setLong(el.scrollHeight > el.clientHeight + 1);
  }, [dish.desc, expanded]);

  return (
    <article className="flex gap-4 py-7 md:gap-10">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <DietMark veg={isVeg(dish)} />
          {dish.bestseller && (
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ember">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
              </svg>
              Bestseller
            </span>
          )}
        </div>
        <h3 className="mt-1.5 text-[17px] leading-snug font-bold text-ink/85">{dish.name}</h3>
        {rupees(dish.price) && (
          <p className="mt-1 text-[15px] font-semibold text-ink/85 tabular-nums">{rupees(dish.price)}</p>
        )}
        {dish.spice > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-ember">
            {"🌶".repeat(dish.spice)}
            <span className="font-medium text-ink/50">
              {dish.spice === 3 ? "Hot" : dish.spice === 2 ? "Medium" : "Mild"}
            </span>
          </p>
        )}
        <p ref={descRef} className={`mt-2.5 text-[15px] leading-[1.45] text-ink/55 ${expanded ? "" : "line-clamp-2"}`}>
          {dish.desc}
        </p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-0.5 text-[14px] font-bold text-ink/60 hover:text-ink"
          >
            {expanded ? "less" : "more"}
          </button>
        )}
      </div>

      <div className="relative shrink-0 self-start">
        {dish.img ? (
          <>
            <div className="relative h-[130px] w-[140px] overflow-hidden rounded-xl bg-sand md:h-[144px] md:w-[156px]">
              <DishPhoto dish={dish} sizes="156px" />
            </div>
            <AddControl dish={dish} className="absolute -bottom-4 left-1/2 -translate-x-1/2" />
          </>
        ) : (
          <div className="flex w-[140px] justify-center pt-8 md:w-[156px]">
            <AddControl dish={dish} />
          </div>
        )}
      </div>
    </article>
  );
}

function TopPicks({ dishes }: { dishes: Dish[] }) {
  const rail = useRef<HTMLDivElement>(null);
  if (dishes.length === 0) return null;
  const scroll = (dx: number) => rail.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-extrabold tracking-tight">Top picks</h2>
        <div className="flex gap-2">
          <ArrowButton dir="left" onClick={() => scroll(-300)} />
          <ArrowButton dir="right" onClick={() => scroll(300)} />
        </div>
      </div>
      <div ref={rail} className="no-scrollbar -mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {dishes.map((d) => (
          <article
            key={d.id}
            className="relative flex h-[280px] w-[250px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-espresso p-4 text-white"
          >
            <DishPhoto dish={d} sizes="250px" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-40% to-black/70" />
            <div className="relative flex items-start gap-2">
              <span className="mt-0.5 rounded-[3px] bg-white p-[1px]">
                <DietMark veg={isVeg(d)} />
              </span>
              <h3 className="line-clamp-2 text-[16px] leading-snug font-bold">{d.name}</h3>
            </div>
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-[16px] font-bold tabular-nums">{rupees(d.price)}</span>
              <AddControl dish={d} className="!w-[100px]" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MenuExperience({ categories = CATEGORIES }: { categories?: Category[] }) {
  const { cart } = useCart();
  const { open: openCart } = useCartDrawer();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Set<Filter>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [browsing, setBrowsing] = useState(false);

  const totalDishes = categories.reduce((n, c) => n + c.items.length, 0);
  const vegCount = categories.reduce((n, c) => n + c.items.filter(isVeg).length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keep = (d: Dish) =>
      (!q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)) &&
      (!filters.has("veg") || isVeg(d)) &&
      (!filters.has("nonveg") || !isVeg(d)) &&
      (!filters.has("bestseller") || d.bestseller);
    return categories
      .map((c) => ({ ...c, items: c.items.filter(keep) }))
      .filter((c) => c.items.length > 0);
  }, [categories, query, filters]);

  const narrowed = query.trim() !== "" || filters.size > 0;

  // Photographed dishes, a few from each course, for the rail up top. Real
  // photographs first; the cut-out library only when nothing else exists.
  const picks = useMemo(() => {
    const from = (ok: (d: Dish) => boolean) =>
      categories.flatMap((c) => c.items.filter(ok).slice(0, 3)).slice(0, 10);
    const shot = from((d) => Boolean(d.img && !d.img.startsWith("/img/menu/")));
    return shot.length >= 3 ? shot : from((d) => Boolean(d.img));
  }, [categories]);
  const hasBestsellers = categories.some((c) => c.items.some((d) => d.bestseller));

  function toggleFilter(f: Filter) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else {
        next.add(f);
        // Veg and non-veg exclude each other.
        if (f === "veg") next.delete("nonveg");
        if (f === "nonveg") next.delete("veg");
      }
      return next;
    });
  }

  function toggleCategory(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpTo(id: string) {
    setBrowsing(false);
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    document.getElementById(`course-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const itemsInCart = cart?.totalItems ?? 0;

  return (
    <div className="bg-white">
      {/* the nav floats in light type until scrolled, so it needs a dark ground */}
      <div aria-hidden className="h-[68px] bg-espresso md:h-[88px]" />
      <MenuWelcome />

      <div className={`mx-auto w-full max-w-[800px] px-4 pt-6 ${itemsInCart > 0 ? "pb-32" : "pb-24"}`}>
        {/* ------------------------------------------------ breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[12px] text-ink/45">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink/70">Menu</span>
        </nav>

        {/* --------------------------------------------- restaurant card */}
        <h1 className="mt-6 px-1 text-[26px] font-extrabold tracking-tight">Milli Milli</h1>

        <div className="mt-4 rounded-[28px] bg-gradient-to-b from-white to-[#e9e9ee] px-4 pb-4">
          <div className="rounded-[20px] border border-ink/[0.08] bg-white p-4 shadow-[0_8px_16px_rgba(28,20,15,0.06)]">
            <p className="flex flex-wrap items-center gap-x-2 text-[16px] font-bold">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-basil text-[10px] text-white">
                  ★
                </span>
                Tonight&apos;s market menu
              </span>
              <span className="text-ink/30">•</span>
              <span suppressHydrationWarning>{today()}</span>
            </p>
            <p className="mt-1.5 text-[14px] font-semibold text-ember underline underline-offset-2">
              {categories.map((c) => c.label).join(", ")}
            </p>

            <div className="mt-4 flex gap-3">
              <div className="flex flex-col items-center pt-1.5">
                <span className="h-[7px] w-[7px] rounded-full bg-ink/25" />
                <span className="h-6 w-px bg-ink/20" />
                <span className="h-[7px] w-[7px] rounded-full bg-ink/25" />
              </div>
              <div className="space-y-2.5 text-[14px]">
                <p>
                  <span className="font-bold">Kitchen</span>{" "}
                  <span className="text-ink/55">— {totalDishes} dishes, cooked to order</span>
                </p>
                <p>
                  <span className="font-bold">Your table</span>{" "}
                  <span className="text-ink/55">— sent as they are ready</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------- search + filters */}
        <p className="mt-10 text-center text-[13px] font-semibold tracking-[0.35em] text-ink/55">
          <span className="text-ink/25">~</span> MENU <span className="text-ink/25">~</span>
        </p>

        <label className="mt-5 flex h-12 items-center gap-3 rounded-xl bg-[#f0f0f5] px-4 text-ink/50 focus-within:ring-2 focus-within:ring-ink/10">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dishes"
            className="h-full flex-1 bg-transparent text-center text-[15px] font-semibold text-ink placeholder:text-ink/45 focus:outline-none"
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </label>

        <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto border-b border-ink/10 pb-5">
          {FILTERS.map((f) => {
            const on = filters.has(f.id);
            if (f.id === "veg" && vegCount === 0) return null;
            if (f.id === "nonveg" && vegCount === totalDishes) return null;
            if (f.id === "bestseller" && !hasBestsellers) return null;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFilter(f.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] font-semibold shadow-[0_2px_6px_rgba(28,20,15,0.05)] transition-colors ${
                  on ? "border-ink/40 bg-[#f0f0f5] text-ink" : "border-ink/12 text-ink/70 hover:border-ink/25"
                }`}
              >
                {f.id === "veg" && <DietMark veg />}
                {f.id === "nonveg" && <DietMark veg={false} />}
                {f.label}
                {on && <span className="text-[12px] text-ink/50">✕</span>}
              </button>
            );
          })}
        </div>

        {!narrowed && <TopPicks dishes={picks} />}

        {/* ------------------------------------------------- the courses */}
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[17px] font-bold">No dishes match</p>
            <p className="mt-1 text-[14px] text-ink/50">Try a different search or clear the filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilters(new Set());
              }}
              className="mt-5 rounded-lg border border-ink/15 px-5 py-2.5 text-[14px] font-bold text-ember"
            >
              Clear all
            </button>
          </div>
        ) : (
          visible.map((c) => {
            const open = narrowed || !collapsed.has(c.id);
            return (
              <section key={c.id} id={`course-${c.id}`} className="scroll-mt-20">
                <div className="-mx-4 mt-6 h-4 bg-[#f2f2f7] md:mx-0" aria-hidden />
                <button
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between py-6 text-left"
                >
                  <h2 className="text-[18px] font-extrabold tracking-tight">
                    {c.label} ({c.items.length})
                  </h2>
                  <Chevron open={open} />
                </button>
                {open && (
                  <div className="divide-y divide-ink/10">
                    {c.items.map((d) => (
                      <DishRow key={d.id} dish={d} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* --------------------------------------------- browse menu button */}
      <div
        className={`pointer-events-none fixed inset-x-0 z-30 transition-[bottom] duration-300 ${
          itemsInCart > 0 ? "bottom-[84px]" : "bottom-6"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[800px] justify-end px-4">
          <div className="pointer-events-auto relative">
            <AnimatePresence>
              {browsing && (
                <>
                  <div className="fixed inset-0" onClick={() => setBrowsing(false)} aria-hidden />
                  <motion.ul
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="absolute right-0 bottom-[calc(100%+12px)] max-h-[60vh] w-[280px] origin-bottom-right overflow-y-auto rounded-2xl bg-espresso py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                  >
                    {categories.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => jumpTo(c.id)}
                          className="flex w-full items-center justify-between px-5 py-2.5 text-left text-[15px] font-semibold hover:bg-white/10"
                        >
                          {c.label}
                          <span className="text-white/70 tabular-nums">{c.items.length}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setBrowsing((v) => !v)}
              aria-expanded={browsing}
              className="relative flex h-[68px] w-[68px] flex-col items-center justify-center gap-0.5 rounded-full bg-espresso text-[11px] font-bold tracking-wide text-white shadow-[0_6px_18px_rgba(0,0,0,0.3)]"
            >
              {browsing ? (
                <span className="text-lg leading-none">✕</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  MENU
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- cart bar */}
      <AnimatePresence>
        {itemsInCart > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
          >
            <button
              type="button"
              onClick={openCart}
              className="mx-auto flex h-[52px] w-full max-w-[768px] items-center justify-between rounded-xl bg-basil px-5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(26,122,86,0.35)]"
            >
              <span className="tabular-nums">
                {itemsInCart} item{itemsInCart === 1 ? "" : "s"} added
                {cart?.subtotal != null && cart.subtotal > 0 && (
                  <span className="font-semibold text-white/80"> · {rupees(cart.subtotal)}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-2 uppercase">
                View cart
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
