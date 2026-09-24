"use client";

import { useState } from "react";
import { Stepper } from "@/app/components/stepper";
import { useCart } from "@/app/lib/cart-context";
import { DIET_LABEL, isVeg, priceLabel, type Combo } from "@/app/lib/menu-api";

/**
 * Three combos, side by side, each three dishes with a quantity stepper.
 *
 * The steppers are local: nothing reaches the order until "Add combo" is
 * pressed, and then it goes at exactly the quantities shown -- three kulchas and
 * no dessert is a perfectly good combo. Setting an item to 0 drops it.
 */
export function ComboBlock({ combos }: { combos: Combo[] }) {
  return (
    <div className="mt-3 grid gap-2.5 md:grid-cols-3">
      {combos.map((combo, i) => (
        <ComboCard key={combo.id} combo={combo} index={i} />
      ))}
    </div>
  );
}

function ComboCard({ combo, index }: { combo: Combo; index: number }) {
  const { addMany, busy } = useCart();
  const [qty, setQty] = useState<number[]>(() => combo.items.map((i) => i.qty));
  const [added, setAdded] = useState(false);

  const total = combo.items.reduce((sum, { item }, i) => sum + (item.price ?? 0) * qty[i]!, 0);
  const unpriced = combo.items.some(({ item }, i) => item.price == null && qty[i]! > 0);
  const empty = qty.every((q) => q === 0);

  async function handleAdd() {
    await addMany(combo.items.map(({ item }, i) => ({ itemId: item.id, qty: qty[i]! })));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <section
      aria-label={`Combo ${index + 1}: ${combo.title}`}
      className="flex flex-col rounded-xl border border-line bg-parchment px-3.5 py-3"
    >
      <p className="text-[10.5px] tracking-[0.12em] text-muted uppercase">Combo {index + 1}</p>
      <h3 className="mt-0.5 text-[14.5px] leading-snug font-medium">{combo.title}</h3>
      {combo.why && <p className="mt-1 text-[12.5px] leading-snug text-muted">{combo.why}</p>}

      <ul className="mt-2.5 flex-1 divide-y divide-line">
        {combo.items.map(({ item, role }, i) => {
          const price = priceLabel(item);
          const drink = item.course === "Alcohol" || item.course === "Beverage";
          return (
            <li key={item.id} className={`py-2 ${qty[i] === 0 ? "opacity-45" : ""}`}>
              {/* Stacked, because the chat column gives each card ~170px:
                  name, then role and diet, then price beside the stepper. */}
              <p className="text-[13.5px] leading-snug font-medium">{item.name}</p>
              <p className="mt-0.5 text-[10.5px] tracking-[0.1em] text-muted uppercase">
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
                <span className="text-[12.5px] tabular-nums text-muted">{price ?? ""}</span>
                <Stepper
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
        className="mt-2.5 w-full rounded-full bg-ink px-3 py-2 text-[12px] font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {added
          ? "Added ✓"
          : `Add combo${unpriced ? "" : ` · ₹${Math.round(total).toLocaleString("en-IN")}`}`}
      </button>
    </section>
  );
}
