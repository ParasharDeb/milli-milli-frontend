"use client";

import { Reveal } from "./reveal";

const QUOTES = [
  ["Monocle", "“The most honest cooking in Lisbon right now.”"],
  ["Condé Nast Traveller", "“Worth rearranging a trip for.”"],
  ["The Guardian", "“Twelve tables, zero pretence.”"],
  ["Eater", "“A daily menu that actually means it.”"],
];

export function Press() {
  return (
    <section className="border-y border-line bg-parchment">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
        <Reveal y={16}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {QUOTES.map(([source, quote], i) => (
              <figure
                key={source}
                className={`${i < QUOTES.length - 1 ? "lg:border-r lg:border-line" : ""} lg:pr-8`}
              >
                <blockquote className="font-display text-[15px] leading-snug font-light text-ink/85 text-pretty">
                  {quote}
                </blockquote>
                <figcaption className="mt-3 text-[10px] tracking-[0.22em] text-muted uppercase">
                  {source}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
