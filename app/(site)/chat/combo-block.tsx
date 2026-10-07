"use client";

import { useState } from "react";
import { Stepper } from "@/app/components/stepper";
import { useCart } from "@/app/lib/cart-context";
import { DIET_LABEL, isVeg, priceLabel, type Combo } from "@/app/lib/menu-api";
import { useAfterAdd } from "./after-add";

/**
 * Three combos, side by side, each three dishes with a quantity stepper.
 *
 * The steppers are local: nothing reaches the order until "Add combo" is
 * pressed, and then it goes at exactly the quantities shown -- three kulchas and
 * no dessert is a perfectly good combo. Setting an item to 0 drops it.
 */
export function ComboBlock({ combos }: { combos: Combo[] }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {combos.map((combo, i) => (
        <ComboCard key={combo.id} combo={combo} index={i} />
      ))}
    </div>
  );
}

function ComboCard({ combo, index }: { combo: Combo; index: number }) {
  const { addMany, busy } = useCart();
  const afterAdd = useAfterAdd();
  const [qty, setQty] = useState<number[]>(() => combo.items.map((i) => i.qty));
  const [added, setAdded] = useState(false);

  const total = combo.items.reduce((sum, { item }, i) => sum + (item.price ?? 0) * qty[i]!, 0);
  const unpriced = combo.items.some(({ item }, i) => item.price == null && qty[i]! > 0);
  const empty = qty.every((q) => q === 0);

  async function handleAdd() {
    await addMany(combo.items.map(({ item }, i) => ({ itemId: item.id, qty: qty[i]! })));
    setAdded(true);
    afterAdd(combo.items.filter((_, i) => qty[i]! > 0).map(({ item }) => item.id));
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <section
      aria-label={`Combo ${index + 1}: ${combo.title}`}
      className="noir-card noir-card--lift flex flex-col px-4 pt-3.5 pb-4"
    >
      <span aria-hidden className="noir-corners" />
      <p className="flex items-baseline justify-between gap-2">
        <span className="noir-label text-muted">Combo</span>
        <span className="noir-index text-[16px] text-ember">No. {String(index + 1).padStart(2, "0")}</span>
      </p>
      <h3 className="mt-2.5 font-display text-[22px] leading-[1.1]">{combo.title}</h3>
      {combo.why && <p className="mt-1.5 text-[12px] leading-snug text-muted">{combo.why}</p>}

      <ul className="mt-3 flex-1 divide-y divide-line border-y border-line">
        {combo.items.map(({ item, role }, i) => {
          const price = priceLabel(item);
          const drink = item.course === "Alcohol" || item.course === "Beverage";
          return (
            <li key={item.id} className={`py-2 ${qty[i] === 0 ? "opacity-45" : ""}`}>
              {/* Stacked, because the chat column gives each card ~170px:
                  name, then role and diet, then price beside the stepper. */}
              <p className="font-display text-[16px] leading-snug">{item.name}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                {role}
                <span aria-hidden> · </span>
                {drink ? (
                  <span>{item.abv ? `~${item.abv}% ABV` : "Non-alcoholic"}</span>
                ) : (
                  <span className={isVeg(item) ? "text-basil" : "text-ember"}>
                    {DIET_LABEL[item.diet] ?? item.diet}
                  </span>
                )}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="noir-label tabular-nums text-muted">{price ?? ""}</span>
                <Stepper
                  className="bg-cream/60"
                  qty={qty[i]!}
                  label={item.name}
                  onChange={(next) =>
                    setQty((q) => q.map((v, j) => (j === i ? Math.max(0, Math.min(20, next)) : v)))
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleAdd}
        disabled={busy || added || empty}
        className={`noir-btn mt-3.5 h-10 w-full px-3 ${added ? "noir-btn--done" : ""}`}
      >
        {added
          ? "Added ✓"
          : `Add combo${unpriced ? "" : ` · ₹${Math.round(total).toLocaleString("en-IN")}`}`}
      </button>
    </section>
  );
}
