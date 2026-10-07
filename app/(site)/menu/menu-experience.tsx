"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/app/lib/cart-context";
import { OrderNowButton, useCartDrawer } from "@/app/components/cart-drawer";
import { dishImage } from "@/app/lib/dish-images";
import type { MenuItem } from "@/app/lib/menu-api";
import { imageFor } from "./menu-adapter";
import { CATEGORIES, type Category, type Dish } from "./menu-data";
import { MenuWelcome } from "./menu-welcome";
import "../noir.css";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * `Dish.id` is the real item uuid when the page rendered from the API. The
 * bundled fallback menu uses slugs, which the backend would reject.
 */
const ORDERABLE = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

/** Where the floating nav ends once it has lifted (set in noir.css); the tab bar sticks below it. */
const NAV_OFFSET = "var(--noir-nav)";

type Diet = "jain" | "egg" | "seafood";
type VegMode = "veg" | "nonveg" | null;

const isVeg = (d: Dish) => d.tags.includes("Vegetarian");

const DIETS: { id: Diet; label: string; test: (d: Dish) => boolean }[] = [
  { id: "jain", label: "Jain Friendly", test: (d) => d.diet === "Jain" },
  { id: "egg", label: "Eggetarian", test: (d) => d.diet === "Eggetarian" },
  { id: "seafood", label: "Seafood", test: (d) => d.diet === "OnlyFish" || d.tags.includes("Seafood") },
];

function rupees(n?: number | null) {
  return n == null ? null : `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ icons */

function Icon({ d, size = 16, className = "" }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ARROW = "M5 12h14m-6-6 6 6-6 6";
const PLUS = "M12 5v14M5 12h14";
const MINUS = "M5 12h14";
const TRASH = "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3";
const CLOCK = "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";

/* ----------------------------------------------------------------- photos */

/**
 * The bundled fallback photographs are cut-outs on white, so they sit on a
 * plain ground rather than being cropped to fill. Dishes with no photograph
 * get their initial on a plate of colour.
 */
function DishPhoto({ name, img, sizes }: { name: string; img?: string; sizes: string }) {
  if (!img) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sand to-[#c4b8a7]">
        <span className="font-display text-[34px] text-ink/30 italic">
          {name.charAt(0)}
        </span>
      </div>
    );
  }
  const cutout = img.startsWith("/img/menu/");
  return (
    <Image
      src={img}
      alt={name}
      fill
      sizes={sizes}
      className={cutout ? "bg-[#ece6dd] object-contain p-[8%]" : "object-cover"}
    />
  );
}

/** A cart line carries the database row, so its photo is looked up the way the adapter does. */
function lineImage(item: MenuItem) {
  return item.imageUrl ?? dishImage(item.name) ?? imageFor(item.name);
}

/* --------------------------------------------------------------- controls */

function Stepper({
  qty,
  busy,
  onDec,
  onInc,
  label,
  size = "sm",
}: {
  qty: number;
  busy: boolean;
  onDec: () => void;
  onInc: () => void;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = size === "md" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className="inline-flex items-center gap-1 border border-ink/25 bg-cream/60 text-ink/80">
      <button type="button" disabled={busy} onClick={onDec} aria-label={`Remove one ${label}`} className={`${btn} flex items-center justify-center hover:text-ink disabled:opacity-40`}>
        <Icon d={MINUS} size={12} />
      </button>
      <span className="min-w-4 text-center text-[12px] tabular-nums">{qty}</span>
      <button type="button" disabled={busy} onClick={onInc} aria-label={`Add one more ${label}`} className={`${btn} flex items-center justify-center hover:text-ink disabled:opacity-40`}>
        <Icon d={PLUS} size={12} />
      </button>
    </div>
  );
}

/** The rust + square, which becomes a stepper once the dish is in the order. */
function AddControl({ dish }: { dish: Dish }) {
  const { cart, busy, add, setQty, remove } = useCart();
  const qty = cart?.lines.find((l) => l.item.id === dish.id)?.qty ?? 0;
  const orderable = ORDERABLE.test(dish.id);

  if (qty > 0) {
    return (
      <Stepper
        qty={qty}
        busy={busy}
        label={dish.name}
        size="md"
        onDec={() => (qty === 1 ? remove(dish.id) : setQty(dish.id, qty - 1))}
        onInc={() => add(dish.id)}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={busy || !orderable}
      onClick={() => add(dish.id)}
      aria-label={`Add ${dish.name}`}
      title={orderable ? undefined : "Ordering opens when the kitchen is online"}
      className="noir-btn h-8 w-8 shrink-0"
    >
      <Icon d={PLUS} size={16} />
    </button>
  );
}

/* ------------------------------------------------------------------ cards */

/**
 * A row with the photo on the left on phones; from `sm` up, a print: the photo
 * matted inside a square card, walnut brackets at two corners.
 */
function DishCard({ dish, onOpen }: { dish: Dish; onOpen: (d: Dish) => void }) {
  return (
    <article
      onClick={() => onOpen(dish)}
      className="noir-card noir-card--lift group flex cursor-pointer gap-4 max-sm:border-0 max-sm:border-b max-sm:border-ink/15 max-sm:bg-transparent max-sm:py-3.5 sm:flex-col sm:gap-0 sm:p-2"
    >
      <span aria-hidden className="noir-corners max-sm:hidden" />
      <div className="noir-print relative h-[84px] w-[96px] shrink-0 sm:aspect-[4/3] sm:h-auto sm:w-full">
        <DishPhoto name={dish.name} img={dish.img} sizes="(min-width: 640px) 320px, 96px" />
        {dish.bestseller && (
          <span className="noir-label absolute top-3 left-3 z-10 hidden bg-ink px-2 py-0.5 text-[9px] text-cream sm:block">
            House pick
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:items-end sm:px-1.5 sm:pt-3.5 sm:pb-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <DietMark veg={isVeg(dish)} className="mt-[5px]" />
            <h3 className="font-display text-[18px] leading-[1.15] text-ink sm:text-[20px]">
              {/* the name is the keyboard route to the description; the whole card takes clicks */}
              <button type="button" className="text-left focus:outline-none focus-visible:underline">
                {dish.name}
              </button>
            </h3>
          </div>
          {rupees(dish.price) && (
            <p className="noir-label mt-2 text-ember tabular-nums">{rupees(dish.price)}</p>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <AddControl dish={dish} />
        </div>
      </div>
    </article>
  );
}

function Section({
  id,
  index,
  title,
  note,
  dishes,
  onOpen,
}: {
  id: string;
  index: number;
  title: string;
  note: string;
  dishes: Dish[];
  onOpen: (d: Dish) => void;
}) {
  return (
    <section id={`course-${id}`} className="scroll-mt-[calc(var(--noir-nav)+60px)] pt-10 first:pt-7">
      <div className="flex items-end gap-4">
        <span className="noir-index pb-1 text-[16px] text-ember md:text-[18px]">{String(index).padStart(2, "0")}</span>
        <h2 className="font-display text-[28px] leading-none text-ink md:text-[40px]">{title}</h2>
        <span aria-hidden className="mb-2 h-px flex-1 bg-ink/20" />
        <span className="noir-label mb-0.5 hidden text-muted md:block">
          {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}
        </span>
      </div>
      <p className="mt-2 hidden font-display text-[16px] text-ink/60 italic md:block">{note}</p>
      <div className="mt-3 grid gap-x-4 sm:mt-5 sm:grid-cols-2 sm:gap-y-4 lg:grid-cols-3">
        {dishes.map((d) => (
          <DishCard key={d.id} dish={d} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/** The square-and-dot food mark: green circle for veg, red triangle otherwise. */
function DietMark({ veg, className = "" }: { veg: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-flex h-[13px] w-[13px] shrink-0 items-center justify-center border-[1.5px] ${
        veg ? "border-basil" : "border-[#b33a2b]"
      } ${className}`}
    >
      {veg ? (
        <span className="h-[5px] w-[5px] rounded-full bg-basil" />
      ) : (
        <span className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-[#b33a2b]" />
      )}
    </span>
  );
}

/** Veg and non-veg as two switches that exclude each other; pressing the lit one clears it. */
function VegToggle({ value, onChange }: { value: VegMode; onChange: (v: VegMode) => void }) {
  const options: { id: "veg" | "nonveg"; label: string }[] = [
    { id: "veg", label: "Veg" },
    { id: "nonveg", label: "Non-veg" },
  ];
  return (
    <div
      role="group"
      aria-label="Veg or non-veg"
      className="flex shrink-0 border border-ink/25 bg-parchment p-[3px]"
    >
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.id)}
            className={`noir-label inline-flex items-center gap-1.5 px-3 py-1.5 text-[9.5px] transition-colors ${
              on ? "bg-ink text-cream" : "text-ink/65 hover:text-ink"
            }`}
          >
            <span className={on ? "flex bg-cream p-[1px]" : "flex"}>
              <DietMark veg={o.id === "veg"} />
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** The dish, opened: large photo and the full description. A bottom sheet on phones. */
function DishSheet({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  useEffect(() => {
    if (!dish) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dish, onClose]);

  return (
    <AnimatePresence>
      {dish && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={dish.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="noir-paper relative max-h-[90vh] w-full overflow-y-auto bg-cream p-2.5 shadow-2xl sm:max-w-[480px]"
          >
            <span aria-hidden className="noir-corners" />
            <div className="noir-print relative aspect-[4/3] w-full">
              <DishPhoto name={dish.name} img={dish.img} sizes="480px" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center bg-ink text-cream transition-colors hover:bg-ink/80"
              >
                ✕
              </button>
            </div>
            <div className="px-3 pt-5 pb-3 sm:px-4 sm:pt-6">
              <div className="flex items-center gap-2">
                <DietMark veg={isVeg(dish)} />
                {dish.bestseller && <span className="noir-label text-ember">House pick</span>}
              </div>
              <h2 className="mt-2.5 font-display text-[32px] leading-[1.05] text-ink">{dish.name}</h2>
              <p className="mt-3 font-display text-[17px] leading-relaxed text-ink/75">{dish.desc}</p>
              {(dish.tags.length > 0 || dish.spice > 0) && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {dish.spice > 0 && (
                    <span className="noir-label border border-ember/40 px-2.5 py-1 text-[9.5px] text-ember">
                      {"🌶".repeat(dish.spice)} {dish.spice === 3 ? "Hot" : dish.spice === 2 ? "Medium" : "Mild"}
                    </span>
                  )}
                  {dish.tags.map((t) => (
                    <span key={t} className="noir-label border border-ink/20 px-2.5 py-1 text-[9.5px] text-ink/70">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 flex items-center justify-between border-t border-ink/20 pt-4">
                <span className="font-display text-[26px] text-ink tabular-nums">{rupees(dish.price) ?? ""}</span>
                <AddControl dish={dish} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------- order */

function OrderPanel() {
  const { cart, busy, error, setQty, remove, clear } = useCart();
  const lines = cart?.lines ?? [];

  return (
    <div className="rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[24px] leading-none text-ink">
          Your order <span className="noir-index text-[18px] text-ember">({cart?.totalItems ?? 0})</span>
        </h2>
        {lines.length > 0 && (
          <button type="button" disabled={busy} onClick={clear} className="noir-label text-ember hover:underline disabled:opacity-50">
            Clear all
          </button>
        )}
      </div>

      {error && <p className="mt-3 border-l-2 border-ember bg-ember/10 px-3 py-2 text-[12px] text-ember">{error}</p>}

      {lines.length === 0 ? (
        <div className="noir-card mt-5 px-4 py-9 text-center">
          <span aria-hidden className="noir-corners" />
          <p className="font-display text-[20px] text-ink/75 italic">Nothing here yet</p>
          <p className="noir-label mt-2 text-ink/50">Tap + on any dish</p>
        </div>
      ) : (
        <ul className="mt-4 max-h-[42vh] space-y-4 overflow-y-auto pr-1">
          {lines.map(({ item, qty, lineTotal }) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden bg-sand">
                <DishPhoto name={item.name} img={lineImage(item)} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[16px] leading-tight text-ink">{item.name}</p>
                <p className="noir-label mt-1 text-ink/60 tabular-nums">{rupees(lineTotal) ?? "—"}</p>
                <div className="mt-1.5">
                  <Stepper
                    qty={qty}
                    busy={busy}
                    label={item.name}
                    onDec={() => (qty === 1 ? remove(item.id) : setQty(item.id, qty - 1))}
                    onInc={() => setQty(item.id, qty + 1)}
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="self-center p-1 text-ink/35 transition-colors hover:text-rust disabled:opacity-40"
              >
                <Icon d={TRASH} size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <>
          <dl className="mt-5 space-y-2.5 border-t border-ink/20 pt-4 text-[12.5px] text-ink/65">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{rupees(cart?.subtotal) ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Taxes &amp; charges</dt>
              <dd>At the table</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-dashed border-ink/20 pt-3 text-ink">
              <dt className="font-display text-[20px]">Total</dt>
              <dd className="font-display text-[22px] tabular-nums">{rupees(cart?.subtotal) ?? "—"}</dd>
            </div>
          </dl>
          {cart && !cart.complete && (
            <p className="mt-1.5 text-[11px] text-ink/45">Some dishes have no price recorded, so this total is incomplete.</p>
          )}

          <OrderNowButton className="noir-btn mt-5 h-12 w-full !text-[11px]" />

          <p className="mt-4 flex items-start gap-3 text-[11.5px] text-ink/55">
            <Icon d={CLOCK} size={20} className="shrink-0 text-ink/60" />
            <span>
              Cooked to order
              <span className="block text-[12.5px] text-ink/75">Sent as each dish is ready</span>
            </span>
          </p>
        </>
      )}

      <Link
        href="/chat"
        className="noir-card noir-card--lift mt-5 flex items-center gap-3 px-4 py-4"
      >
        <span aria-hidden className="noir-corners" />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink font-display text-[20px] text-cream italic">M</span>
        <span className="flex-1">
          <span className="block font-display text-[19px] leading-tight text-ink">Ask Milli</span>
          <span className="block text-[11px] text-ink/55">Allergies, pairings, how much to order</span>
        </span>
        <Icon d="m9 6 6 6-6 6" size={14} className="text-ink/55" />
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------------- filters */

function PriceRange({
  max,
  value,
  onChange,
}: {
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const pct = (n: number) => (n / max) * 100;
  return (
    <div>
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/25" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={50}
          value={lo}
          aria-label="Lowest price"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 50), hi])}
          className="range-thumb absolute inset-0 w-full"
        />
        <input
          type="range"
          min={0}
          max={max}
          step={50}
          value={hi}
          aria-label="Highest price"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 50)])}
          className="range-thumb absolute inset-0 w-full"
        />
      </div>
      <div className="mt-2.5 flex justify-between text-[11.5px] text-ink/60 tabular-nums">
        <span>{rupees(lo)}</span>
        <span>
          {rupees(hi)}
          {hi === max ? "+" : ""}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export function MenuExperience({ categories = CATEGORIES }: { categories?: Category[] }) {
  const { cart } = useCart();
  const { open: openCart } = useCartDrawer();
  const [diets, setDiets] = useState<Set<Diet>>(new Set());
  const all = useMemo(() => categories.flatMap((c) => c.items), [categories]);

  // The slider tops out at the dearest dish, rounded up to the next hundred.
  const priceMax = useMemo(() => {
    const top = Math.max(0, ...all.map((d) => d.price ?? 0));
    return Math.max(100, Math.ceil(top / 100) * 100);
  }, [all]);
  const [price, setPrice] = useState<[number, number]>([0, priceMax]);
  const [vegMode, setVegMode] = useState<VegMode>(null);
  const [openDish, setOpenDish] = useState<Dish | null>(null);

  const availableDiets = DIETS.filter((f) => all.some(f.test));
  const priceNarrowed = price[0] > 0 || price[1] < priceMax;
  const narrowed = vegMode !== null || diets.size > 0 || priceNarrowed;

  const keep = useMemo(() => {
    const tests = DIETS.filter((f) => diets.has(f.id)).map((f) => f.test);
    return (d: Dish) =>
      (vegMode === null || (vegMode === "veg") === isVeg(d)) &&
      (tests.length === 0 || tests.some((t) => t(d))) &&
      // An unpriced dish is never hidden by the slider: there is nothing to compare.
      (d.price == null || (d.price >= price[0] && (price[1] >= priceMax || d.price <= price[1])));
  }, [vegMode, diets, price, priceMax]);

  const visible = useMemo(
    () => categories.map((c) => ({ ...c, items: c.items.filter(keep) })).filter((c) => c.items.length > 0),
    [categories, keep],
  );

  // Bestsellers lead; otherwise photographed dishes, a couple from each course.
  // Real photographs first, the cut-out library only when nothing else exists.
  const recommended = useMemo(() => {
    const flagged = all.filter((d) => d.bestseller);
    if (flagged.length >= 3) return flagged.slice(0, 9);
    const from = (ok: (d: Dish) => boolean) =>
      categories.flatMap((c) => c.items.filter(ok).slice(0, 2)).slice(0, 9);
    const shot = from((d) => Boolean(d.img && !d.img.startsWith("/img/menu/")));
    return shot.length >= 3 ? shot : from((d) => Boolean(d.img));
  }, [all, categories]);

  const tabs = [
    ...(narrowed ? [] : [{ id: "recommended", label: "Recommended" }]),
    ...visible.map((c) => ({ id: c.id, label: c.label })),
  ];
  const tabKey = tabs.map((t) => t.id).join();
  const [active, setActive] = useState(tabs[0]?.id);

  // The tab for whichever course is under the tab bar.
  useEffect(() => {
    const ids = tabKey.split(",");
    function onScroll() {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(`course-${id}`);
        if (el && el.getBoundingClientRect().top < 160) current = id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tabKey]);

  function jumpTo(id: string) {
    document.getElementById(`course-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleDiet(id: Diet) {
    setDiets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setVegMode(null);
    setDiets(new Set());
    setPrice([0, priceMax]);
  }

  const itemsInCart = cart?.totalItems ?? 0;

  return (
    <div className="noir noir-paper bg-cream">
      {/* ------------------------------------------------------------ hero */}
      <header className="relative overflow-hidden bg-espresso text-cream">
        <Image src="/img/table-night.webp" alt="" fill priority sizes="100vw" className="object-cover object-center grayscale-[30%]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/15" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/45" />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-[110px] pb-10 md:px-10 md:pt-[150px] md:pb-14">
        </div>
      </header>

      <MenuWelcome />

      {/* ------------------------------------- tab bar, veg toggle on the right */}
      <div className="sticky z-20 border-b border-ink/20 bg-cream/95 backdrop-blur" style={{ top: NAV_OFFSET }}>
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 md:px-10 lg:pl-[calc(2.5rem+232px)]">
          <nav aria-label="Courses" className="no-scrollbar flex min-w-0 flex-1 gap-6 overflow-x-auto md:gap-9">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => jumpTo(t.id)}
                aria-current={active === t.id ? "true" : undefined}
                className={`noir-label relative shrink-0 py-[18px] transition-colors ${
                  active === t.id ? "text-ink" : "text-ink/55 hover:text-ink"
                }`}
              >
                {t.label}
                {active === t.id && (
                  <motion.span layoutId="menu-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" />
                )}
              </button>
            ))}
          </nav>
          <VegToggle value={vegMode} onChange={setVegMode} />
        </div>
      </div>

      <div
        className={`mx-auto grid w-full max-w-[1400px] gap-8 px-5 md:px-10 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px] ${
          itemsInCart > 0 ? "pb-32 xl:pb-20" : "pb-20"
        }`}
      >
        {/* ------------------------------------------------------ sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky space-y-8 pt-8" style={{ top: `calc(${NAV_OFFSET} + 52px)` }}>
            <Link
              href="/reserve-table"
              className="group flex items-center gap-3 bg-ink px-3.5 py-3.5 text-cream transition-colors [clip-path:var(--noir-cut)] hover:bg-ink/80"
            >
              <span className="flex-1">
                <span className="block font-display text-[18px] leading-tight italic">Eating in?</span>
                <span className="noir-label mt-1 block text-[9px] text-cream/65">Book a table tonight</span>
              </span>
              <Icon d="m9 6 6 6-6 6" size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>

            {availableDiets.length > 0 && (
              <fieldset>
                <legend className="noir-label w-full border-b border-ink/20 pb-2 text-ink">Dietary preferences</legend>
                <div className="mt-3.5 space-y-3">
                  {availableDiets.map((f) => (
                    <label key={f.id} className="flex cursor-pointer items-center gap-2.5 font-display text-[16px] text-ink/80">
                      <input
                        type="checkbox"
                        checked={diets.has(f.id)}
                        onChange={() => toggleDiet(f.id)}
                        className="h-[14px] w-[14px] cursor-pointer accent-ink"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div>
              <h3 className="noir-label border-b border-ink/20 pb-2 text-ink">Price range</h3>
              <div className="mt-4">
                <PriceRange max={priceMax} value={price} onChange={setPrice} />
              </div>
            </div>

            {narrowed && (
              <button type="button" onClick={reset} className="noir-label text-ember hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* ----------------------------------------------------- the menu */}
        <div className="min-w-0">
          {/* phones and tablets get the diet filters as chips */}
          {availableDiets.length > 0 && (
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pt-5 lg:hidden">
              {availableDiets.map((f) => {
                const on = diets.has(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDiet(f.id)}
                    className={`noir-label shrink-0 border px-3.5 py-2 text-[9.5px] transition-colors ${
                      on ? "border-ink bg-ink text-cream" : "border-ink/25 text-ink/70"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-[28px] italic">No dishes match</p>
              <p className="mt-1 text-[13px] text-ink/50">Try a different preference or widen the price range.</p>
              <button
                type="button"
                onClick={reset}
                className="noir-btn mt-5 h-10 px-6"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {!narrowed && recommended.length > 0 && (
                <Section
                  id="recommended"
                  index={1}
                  title="Recommended"
                  note="Our chef's picks for the best experience."
                  dishes={recommended}
                  onOpen={setOpenDish}
                />
              )}
              {visible.map((c, i) => (
                <Section
                  key={c.id}
                  id={c.id}
                  index={i + (!narrowed && recommended.length > 0 ? 2 : 1)}
                  title={c.label.charAt(0).toUpperCase() + c.label.slice(1)}
                  note={c.note}
                  dishes={c.items}
                  onOpen={setOpenDish}
                />
              ))}
            </>
          )}
        </div>

        {/* ---------------------------------------------------- the order */}
        <aside className="hidden border-l border-ink/20 pl-7 xl:block">
          <div className="sticky pt-8" style={{ top: `calc(${NAV_OFFSET} + 52px)` }}>
            <OrderPanel />
          </div>
        </aside>
      </div>

      <DishSheet dish={openDish} onClose={() => setOpenDish(null)} />

      {/* --------------------------------- cart bar, below the order panel's breakpoint */}
      <AnimatePresence>
        {itemsInCart > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 xl:hidden"
          >
            <button
              type="button"
              onClick={openCart}
              className="noir-label mx-auto flex h-[56px] w-full max-w-[640px] items-center gap-3 bg-ink px-3 text-[11px] text-cream shadow-[0_14px_30px_rgba(13,8,9,0.45)] [clip-path:var(--noir-cut)]"
            >
              <span className="flex h-8 w-8 items-center justify-center bg-cream font-display text-[16px] tracking-normal text-ink tabular-nums">
                {itemsInCart}
              </span>
              <span className="flex-1 text-left">View cart</span>
              {cart?.subtotal != null && cart.subtotal > 0 && (
                <span className="tabular-nums">{rupees(cart.subtotal)}</span>
              )}
              <Icon d={ARROW} size={18} className="mr-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
