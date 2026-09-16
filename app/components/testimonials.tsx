"use client";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const REVIEWS = [
  {
    quote:
      "We came for one course and stayed for all of them. The bream came off the fire and the whole room turned to look at it.",
    name: "Marta R.",
    meta: "Dined in September",
    tint: "bg-cream",
  },
  {
    quote:
      "I ate alone at the counter on a Wednesday and left feeling like I had been cooked for, not served. That is rarer than it sounds.",
    name: "Tomás L.",
    meta: "Dined in August",
    tint: "bg-amber/12",
  },
  {
    quote:
      "The menu had changed completely since our last visit and it was somehow still exactly what we wanted to eat.",
    name: "Aoife D.",
    meta: "Dined in August",
    tint: "bg-basil/10",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-line bg-parchment">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-amber" />
              From the room
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] font-light tracking-[-0.03em]">
                1,204 dinners, 4.9 stars.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream px-5 py-4">
              <span className="font-display text-4xl leading-none">4.9</span>
              <div>
                <p className="text-lg leading-none tracking-tight text-amber">
                  ★★★★★
                </p>
                <p className="mt-1.5 text-[12px] text-muted">
                  Google · TheFork · Tripadvisor
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <RevealGroup stagger={0.1} className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <RevealItem key={review.name} as="article">
              <figure
                className={`flex h-full flex-col rounded-[1.5rem] border border-line ${review.tint} p-7 transition-transform duration-500 hover:-translate-y-1`}
              >
                <p className="tracking-tight text-amber">★★★★★</p>
                <blockquote className="mt-5 flex-1 font-display text-[19px] leading-[1.45] font-light text-pretty">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{review.meta}</p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
