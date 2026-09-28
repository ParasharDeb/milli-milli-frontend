import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const STORIES = [
  {
    title: "The morning market",
    blurb: "People, produce and the rhythm of the city.",
    date: "18 Sep 2026",
    img: "/img/milli/market.webp",
    alt: "Baskets of vegetables and herbs at the morning market",
  },
  {
    title: "Inside Milli",
    blurb: "A look into our space and design.",
    date: "04 Sep 2026",
    img: "/img/milli/room-canopy.webp",
    alt: "Rattan canopy over the lounge booths beside the tall windows",
  },
  {
    title: "Meet the chef",
    blurb: "The philosophy behind the food.",
    date: "28 Aug 2026",
    img: "/img/milli/chef.webp",
    alt: "The chef plating a dish at the pass",
  },
];

export function Journal() {
  return (
    <section id="journal" className="scroll-mt-16 bg-cream">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal>
              <h2 className="font-display text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1] font-light">
                Stories from the kitchen
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link href="/#journal" className="group inline-flex items-center gap-2 pb-1.5 text-[13px] hover:text-ember">
              View all stories
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <RevealGroup
          stagger={0.1}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:mt-12"
        >
          {STORIES.map((s) => (
            <RevealItem as="article" key={s.title} className="w-[78%] shrink-0 snap-start sm:w-[48%] md:w-auto">
              <a href="#journal" className="group block h-full overflow-hidden rounded-md bg-[#fbf7f0] shadow-[0_18px_40px_-30px_rgba(28,20,15,0.5)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                  <Image
                    src={s.img}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 768px) 78vw, 32vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="px-5 pt-5 pb-6">
                  <h3 className="font-display text-[22px] leading-tight transition-colors group-hover:text-ember">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-muted">{s.blurb}</p>
                  <p className="mt-5 text-[11.5px] text-muted/80">{s.date}</p>
                </div>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
