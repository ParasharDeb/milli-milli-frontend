import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/reveal";
import { MenuWelcome } from "./menu-welcome";

export const metadata: Metadata = {
  title: "Tonight's menu — Milli",
  description:
    "Five courses written at four this afternoon, from whatever the Lisbon market gave us this morning.",
};

type Course = {
  name: string;
  note: string;
  price: string;
  badge?: string;
  dot: string;
};

const COURSES: { heading: string; blurb: string; items: Course[] }[] = [
  {
    heading: "To begin",
    blurb: "Small, cold, and mostly raw. Two or three between you.",
    items: [
      { name: "Bread, cultured butter, smoked salt", note: "Sourdough baked at seven, still warm at eight", price: "450", dot: "bg-amber", badge: "V" },
      { name: "Charred leeks, hazelnut, aged sheep", note: "Vinaigrette made from last week's wine", price: "850", dot: "bg-basil", badge: "V" },
      { name: "Scarlet prawn, lemon, olive oil", note: "Landed at Cascais this morning, served raw", price: "1,450", dot: "bg-ember" },
      { name: "Tomatoes, oregano, stale bread", note: "Six varieties, none of them round", price: "1,000", dot: "bg-terracotta", badge: "V" },
    ],
  },
  {
    heading: "Larger",
    blurb: "One each, or the bream between two and nothing else.",
    items: [
      { name: "Salmon, saffron couscous, avocado", note: "The plate the room is named for", price: "2,200", dot: "bg-ember", badge: "Signature" },
      { name: "Grain bowl, market vegetables, herbs", note: "Whatever the growers had most of", price: "1,250", dot: "bg-basil", badge: "V" },
      { name: "Hearth bream, brown butter, capers", note: "Whole fish, for two, thirty minutes", price: "3,400", dot: "bg-terracotta", badge: "For 2" },
      { name: "Pork shoulder, quince, mustard greens", note: "Six hours over oak, finished on the grill", price: "2,400", dot: "bg-ember" },
    ],
  },
  {
    heading: "To finish",
    blurb: "Two puddings and a cheese. The tart is worth the wait.",
    items: [
      { name: "Burnt honey tart, crème fraîche", note: "Honey from the hills behind Sintra", price: "750", dot: "bg-amber" },
      { name: "Sheep's milk ice cream, olive oil", note: "Three ingredients, one of them salt", price: "650", dot: "bg-basil", badge: "V" },
      { name: "Azeitão, quince paste, crackers", note: "Ripened down the road, spooned not sliced", price: "900", dot: "bg-terracotta", badge: "V" },
    ],
  },
];

const WINE = [
  ["Vinho verde, Quinta da Lixa", "Minho, 2024", "450 / 2,400"],
  ["Orange, curtimenta blend", "Alentejo, 2022", "650 / 3,100"],
  ["Baga, old vines", "Bairrada, 2019", "750 / 3,600"],
  ["Moscatel, twenty years", "Setúbal, NV", "550 / —"],
];

export default function MenuPage() {
  return (
    <>
      <MenuWelcome />

      {/* header */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,rgba(233,163,25,0.18),transparent_65%)]"
        />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <Reveal as="p" className="eyebrow text-muted">
              <span className="h-px w-8 bg-ember" />
              Wednesday, 16 September
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance">
                Tonight&apos;s menu,
                <br />
                <span className="text-ember italic">written at four.</span>
              </h1>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line bg-cream p-6">
              <p className="text-[15px] leading-relaxed text-muted text-pretty">
                Order à la carte, or let the kitchen send everything for{" "}
                <span className="font-medium text-ink">₹5,400 a head</span> — the
                whole table, no choices, no substitutions beyond allergies.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/reserve-table"
                  className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember"
                >
                  Book a table
                </Link>
                <a
                  href="#wine"
                  className="rounded-full border border-line px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-ink"
                >
                  Wine by the glass
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* courses */}
      <section className="grain bg-sand">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 md:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.62fr] lg:gap-16">
            <div className="space-y-16">
              {COURSES.map((group) => (
                <div key={group.heading}>
                  <Reveal>
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
                      <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-light tracking-[-0.02em]">
                        {group.heading}
                      </h2>
                      <p className="text-[13px] text-muted">{group.blurb}</p>
                    </div>
                  </Reveal>

                  <RevealGroup as="ul" stagger={0.07}>
                    {group.items.map((course) => (
                      <RevealItem as="li" key={course.name} className="group border-b border-line">
                        <div className="flex items-baseline gap-4 py-6 transition-transform duration-500 ease-out group-hover:translate-x-2">
                          <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${course.dot} transition-transform duration-500 group-hover:scale-150`}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="flex flex-wrap items-center gap-2.5 font-display text-xl leading-snug font-light sm:text-2xl">
                              {course.name}
                              {course.badge && (
                                <span className="rounded-full border border-line bg-cream px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                                  {course.badge}
                                </span>
                              )}
                            </h3>
                            <p className="mt-1.5 text-sm text-muted">{course.note}</p>
                          </div>
                          <span className="font-display text-xl tabular-nums">
                            ₹{course.price}
                          </span>
                        </div>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </div>
              ))}

              <Reveal>
                <p className="text-[13px] leading-relaxed text-muted">
                  V = vegetarian. Tell us about allergies when you book — the menu
                  changes daily and we will work around almost anything. A 5%
                  service charge is added to tables of six or more.
                </p>
              </Reveal>
            </div>

            {/* sticky plate rail */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.05}>
                <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-parchment">
                  <Image
                    src="/img/dish-bream.webp"
                    alt="Whole grilled sea bream with brown butter and capers"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                  <figcaption className="absolute inset-x-5 bottom-5 text-cream">
                    <span className="inline-block rounded-full bg-amber px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-ink uppercase">
                      Order early
                    </span>
                    <p className="mt-3 font-display text-xl leading-tight font-light">
                      Hearth bream, brown butter, capers
                    </p>
                    <p className="mt-1.5 text-[13px] text-cream/70">
                      Six portions a night. Thirty minutes from fire to table.
                    </p>
                  </figcaption>
                </figure>
              </Reveal>

              <Reveal delay={0.1}>
                <div
                  id="wine"
                  className="mt-5 scroll-mt-28 rounded-2xl border border-line bg-cream p-6"
                >
                  <h2 className="font-display text-xl font-light">
                    By the glass / bottle
                  </h2>
                  <ul className="mt-5 space-y-4">
                    {WINE.map(([name, origin, price]) => (
                      <li key={name} className="flex items-baseline justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="text-[15px] leading-snug">{name}</p>
                          <p className="mt-0.5 text-[12px] text-muted">{origin}</p>
                        </div>
                        <span className="shrink-0 font-display tabular-nums">
                          ₹{price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
