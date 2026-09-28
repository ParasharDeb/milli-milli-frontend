import Image from "next/image";
import Link from "next/link";
import { TONIGHT, rupees } from "./dishes";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

export function Tonight() {
  return (
    <section id="tonight" className="scroll-mt-20 bg-cream">
      <div className="mx-auto w-full max-w-[1400px] px-5 pt-20 pb-20 md:px-10 lg:pt-24 lg:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <h2 className="font-display text-[clamp(2.3rem,4.6vw,3.6rem)] leading-[1] font-light">
                The market arrives
                <br />
                at 19:00.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="flex items-center gap-2.5 pb-2 text-[13px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              Menu changes daily
            </p>
          </Reveal>
        </div>

        {/* a swipeable row on phones, a grid once there is room */}
        <RevealGroup
          stagger={0.08}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:mt-12 lg:grid-cols-4 lg:gap-5"
        >
          {TONIGHT.map((dish) => (
            <RevealItem
              as="article"
              key={dish.id}
              className="w-[74%] shrink-0 snap-start sm:w-[46%] md:w-auto"
            >
              <Link
                href="/menu"
                className="group block h-full overflow-hidden rounded-md bg-[#fbf7f0] shadow-[0_1px_0_rgba(28,20,15,0.04),0_18px_40px_-28px_rgba(28,20,15,0.45)] transition-shadow duration-500 hover:shadow-[0_1px_0_rgba(28,20,15,0.04),0_28px_50px_-26px_rgba(28,20,15,0.55)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  <Image
                    src={dish.img}
                    alt={dish.alt}
                    fill
                    sizes="(max-width: 768px) 74vw, (max-width: 1024px) 46vw, 24vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="px-4 pt-4 pb-5">
                  <h3 className="font-display text-[24px] leading-tight font-light">{dish.name}</h3>
                  <p className="mt-1 text-[13.5px] text-muted">{dish.note}</p>
                  <p className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="text-[15px] text-ember tabular-nums">{rupees(dish.price)}</span>
                    <span className="text-[12.5px] text-muted">{dish.label}</span>
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
