"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/app/lib/cart-context";
import { useCartDrawer } from "@/app/components/cart-drawer";
import { dishImage } from "@/app/lib/dish-images";
import type { MenuItem } from "@/app/lib/menu-api";
import { imageFor } from "./menu-adapter";
import { CATEGORIES, type Category, type Dish } from "./menu-data";
import { MenuWelcome } from "./menu-welcome";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * `Dish.id` is the real item uuid when the page rendered from the API. The
 * bundled fallback menu uses slugs, which the backend would reject.
 */
const ORDERABLE = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

/** Where the floating nav ends once it has lifted; the tab bar sticks below it. */
const NAV_OFFSET = 64;

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
const LEAF = "M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Zm0 0 7-7";

/* ----------------------------------------------------------------- photos */

/**
 * The bundled fallback photographs are cut-outs on white, so they sit on a
 * plain ground rather than being cropped to fill. Dishes with no photograph
 * get their initial on a plate of colour.
 */
function DishPhoto({ name, img, sizes }: { name: string; img?: string; sizes: string }) {
  if (!img) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sand to-[#e2cfb6]">
        <span className="font-display text-[28px] text-ink/25">
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
      className={cutout ? "bg-[#f4efe7] object-contain p-[8%]" : "object-cover"}
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
    <div className="inline-flex items-center gap-1 rounded-md border border-ink/15 bg-cream text-ink/70">
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
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rust text-cream shadow-[0_3px_8px_rgba(176,69,31,0.3)] transition-colors hover:bg-[#953a19] disabled:cursor-not-allowed disabled:bg-ink/20 disabled:shadow-none"
    >
      <Icon d={PLUS} size={16} />
    </button>
  );
}

/* ------------------------------------------------------------------ cards */

/** A row with the photo on the left on phones, a photo-topped card from `sm` up. */
function DishCard({ dish, onOpen }: { dish: Dish; onOpen: (d: Dish) => void }) {
  return (
    <article
      onClick={() => onOpen(dish)}
      className="flex cursor-pointer gap-4 border-b border-ink/10 py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-ink/[0.06] sm:bg-[#fbf7f1] sm:py-0 sm:shadow-[0_6px_18px_rgba(28,20,15,0.06)] sm:transition-shadow sm:hover:shadow-[0_10px_24px_rgba(28,20,15,0.12)]"
    >
      <div className="relative h-[84px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-sand sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-none">
        <DishPhoto name={dish.name} img={dish.img} sizes="(min-width: 640px) 320px, 96px" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:items-end sm:px-3 sm:pt-3 sm:pb-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <DietMark veg={isVeg(dish)} className="mt-[3px]" />
            <h3 className="font-display text-[15px] leading-snug text-ink sm:text-[15.5px]">
              {/* the name is the keyboard route to the description; the whole card takes clicks */}
              <button type="button" className="text-left focus:outline-none focus-visible:underline">
                {dish.name}
              </button>
            </h3>
          </div>
          {rupees(dish.price) && (
            <p className="mt-1.5 text-[13px] text-rust tabular-nums sm:text-ink/60">{rupees(dish.price)}</p>
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
  title,
  note,
  dishes,
  preview,
  showAll,
  onOpen,
}: {
  id: string;
  title: string;
  note: string;
  dishes: Dish[];
  preview: number;
  showAll: boolean;
  onOpen: (d: Dish) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const open = showAll || expanded;
  const shown = open ? dishes : dishes.slice(0, preview);

  return (
    <section id={`course-${id}`} className="scroll-mt-[136px] pt-8 first:pt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] leading-tight text-ink md:text-[30px]">{title}</h2>
          <p className="mt-1 hidden text-[13px] text-ink/55 md:block">{note}</p>
        </div>
        {!showAll && dishes.length > preview && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 pb-1 text-[12.5px] text-rust hover:underline"
          >
            {expanded ? "Show less" : `View all ${dishes.length}`}
            <Icon d={ARROW} size={13} className={`transition-transform ${expanded ? "-rotate-90" : ""}`} />
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-x-3 sm:mt-4 sm:grid-cols-2 sm:gap-y-3 lg:grid-cols-3">
        {shown.map((d) => (
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
      className={`inline-flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px] ${
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
      className="flex shrink-0 rounded-full border border-ink/15 bg-[#fbf7f1] p-[3px]"
    >
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
              on ? (o.id === "veg" ? "bg-basil text-cream" : "bg-[#b33a2b] text-cream") : "text-ink/65 hover:text-ink"
            }`}
          >
            <span className={on ? "flex rounded-[3px] bg-cream p-[1px]" : "flex"}>
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
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
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
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-[480px] sm:rounded-2xl"
          >
            <div className="relative aspect-[4/3] w-full bg-sand">
              <DishPhoto name={dish.name} img={dish.img} sizes="480px" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink/70 shadow hover:text-ink"
              >
                ✕
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <DietMark veg={isVeg(dish)} />
                {dish.bestseller && <span className="text-[12px] text-rust">★ Bestseller</span>}
              </div>
              <h2 className="mt-2 font-display text-[24px] leading-tight text-ink">{dish.name}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{dish.desc}</p>
              {(dish.tags.length > 0 || dish.spice > 0) && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {dish.spice > 0 && (
                    <span className="rounded-full bg-ember/10 px-2.5 py-1 text-[11.5px] text-ember">
                      {"🌶".repeat(dish.spice)} {dish.spice === 3 ? "Hot" : dish.spice === 2 ? "Medium" : "Mild"}
                    </span>
                  )}
                  {dish.tags.map((t) => (
                    <span key={t} className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11.5px] text-ink/65">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="font-display text-[20px] text-ink tabular-nums">{rupees(dish.price) ?? ""}</span>
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
        <h2 className="font-display text-[17px] text-ink">
          Your Order <span className="text-ink/60">({cart?.totalItems ?? 0})</span>
        </h2>
        {lines.length > 0 && (
          <button type="button" disabled={busy} onClick={clear} className="text-[12.5px] text-rust hover:underline disabled:opacity-50">
            Clear all
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-md bg-ember/10 px-3 py-2 text-[12px] text-ember">{error}</p>}

      {lines.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-ink/15 px-4 py-8 text-center">
          <p className="font-display text-[15px] text-ink/70">Nothing here yet</p>
          <p className="mt-1 text-[12px] text-ink/45">Tap + on any dish to start your order.</p>
        </div>
      ) : (
        <ul className="mt-4 max-h-[42vh] space-y-4 overflow-y-auto pr-1">
          {lines.map(({ item, qty, lineTotal }) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-md bg-sand">
                <DishPhoto name={item.name} img={lineImage(item)} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink">{item.name}</p>
                <p className="mt-0.5 text-[13px] text-ink/70 tabular-nums">{rupees(lineTotal) ?? "—"}</p>
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
          <dl className="mt-5 space-y-2.5 border-t border-ink/10 pt-4 text-[12.5px] text-ink/65">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{rupees(cart?.subtotal) ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Taxes &amp; charges</dt>
              <dd>At the table</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1.5 text-ink">
              <dt className="font-display text-[16px]">Total</dt>
              <dd className="font-display text-[17px] tabular-nums">{rupees(cart?.subtotal) ?? "—"}</dd>
            </div>
          </dl>
          {cart && !cart.complete && (
            <p className="mt-1.5 text-[11px] text-ink/45">Some dishes have no price recorded, so this total is incomplete.</p>
          )}

          <Link
            href="/reserve-table"
            className="mt-5 flex h-11 items-center justify-center gap-2 rounded-md bg-rust text-[13px] text-cream shadow-[0_6px_16px_rgba(176,69,31,0.28)] transition-colors hover:bg-[#953a19]"
          >
            Book a table with this order <Icon d={ARROW} size={14} />
          </Link>

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
        className="mt-5 flex items-center gap-3 rounded-lg border border-ink/10 bg-[#f3ece1] px-4 py-3.5 transition-colors hover:border-ink/20"
      >
        <Icon d={LEAF} size={20} className="shrink-0 text-ink/55" />
        <span className="flex-1">
          <span className="block text-[13px] text-ink">Ask Milli</span>
          <span className="block text-[11px] text-ink/50">Allergies, pairings, how much to order</span>
        </span>
        <Icon d="m9 6 6 6-6 6" size={14} className="text-ink/45" />
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
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-rust"
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
    <div className="bg-cream">
      {/* ------------------------------------------------------------ hero */}
      <header className="relative overflow-hidden bg-espresso text-cream">
        <Image src="/img/table-night.webp" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-[110px] pb-10 md:px-10 md:pt-[150px] md:pb-14">
        </div>
      </header>

      <MenuWelcome />

      {/* ------------------------------------- tab bar, veg toggle on the right */}
      <div className="sticky z-20 border-b border-ink/10 bg-cream/95 backdrop-blur" style={{ top: NAV_OFFSET }}>
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 md:px-10 lg:pl-[calc(2.5rem+232px)]">
          <nav aria-label="Courses" className="no-scrollbar flex min-w-0 flex-1 gap-6 overflow-x-auto md:gap-9">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => jumpTo(t.id)}
                aria-current={active === t.id ? "true" : undefined}
                className={`relative shrink-0 py-4 text-[13px] transition-colors ${
                  active === t.id ? "text-rust" : "text-ink/65 hover:text-ink"
                }`}
              >
                {t.label}
                {active === t.id && (
                  <motion.span layoutId="menu-tab" className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-rust" />
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
          <div className="sticky space-y-8 pt-8" style={{ top: NAV_OFFSET + 52 }}>
            <Link
              href="/reserve-table"
              className="flex items-center gap-3 rounded-lg border border-rust/20 bg-rust/[0.06] px-3.5 py-3 transition-colors hover:bg-rust/10"
            >
              <Icon d={LEAF} size={18} className="shrink-0 text-rust" />
              <span className="flex-1">
                <span className="block text-[12.5px] text-rust">Eating in?</span>
                <span className="block text-[10.5px] text-ink/55">Book a table for tonight</span>
              </span>
              <Icon d="m9 6 6 6-6 6" size={13} className="text-rust" />
            </Link>

            {availableDiets.length > 0 && (
              <fieldset>
                <legend className="font-display text-[15px] text-ink">Dietary Preferences</legend>
                <div className="mt-3.5 space-y-3">
                  {availableDiets.map((f) => (
                    <label key={f.id} className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-ink/70">
                      <input
                        type="checkbox"
                        checked={diets.has(f.id)}
                        onChange={() => toggleDiet(f.id)}
                        className="h-[15px] w-[15px] cursor-pointer rounded-[3px] accent-rust"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div>
              <h3 className="font-display text-[15px] text-ink">Price Range</h3>
              <div className="mt-4">
                <PriceRange max={priceMax} value={price} onChange={setPrice} />
              </div>
            </div>

            {narrowed && (
              <button type="button" onClick={reset} className="text-[12px] text-rust hover:underline">
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
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                      on ? "border-rust bg-rust text-cream" : "border-ink/15 text-ink/70"
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
              <p className="font-display text-[20px]">No dishes match</p>
              <p className="mt-1 text-[13px] text-ink/50">Try a different preference or widen the price range.</p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-md border border-rust/30 px-5 py-2.5 text-[13px] text-rust"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {!narrowed && recommended.length > 0 && (
                <Section
                  id="recommended"
                  title="Recommended"
                  note="Our chef's picks for the best experience."
                  dishes={recommended}
                  preview={3}
                  showAll={false}
                  onOpen={setOpenDish}
                />
              )}
              {visible.map((c) => (
                <Section
                  key={c.id}
                  id={c.id}
                  title={c.label.charAt(0).toUpperCase() + c.label.slice(1)}
                  note={c.note}
                  dishes={c.items}
                  preview={6}
                  showAll={narrowed}
                  onOpen={setOpenDish}
                />
              ))}
            </>
          )}
        </div>

        {/* ---------------------------------------------------- the order */}
        <aside className="hidden border-l border-ink/10 pl-7 xl:block">
          <div className="sticky pt-8" style={{ top: NAV_OFFSET + 52 }}>
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
              className="mx-auto flex h-[54px] w-full max-w-[640px] items-center gap-3 rounded-xl bg-rust px-3 text-[15px] text-cream shadow-[0_10px_28px_rgba(176,69,31,0.4)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-[13px] text-rust tabular-nums">
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
