import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/reveal";
import { ReservationForm } from "./reservation-form";
import { SpaceCarousel } from "./space-carousel";

export const metadata: Metadata = {
  title: "Reserve a table — Milli Milli",
  description: "Good food, better company. Choose a date, a time and where you would like to sit.",
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden width="34" height="34" viewBox="0 0 34 34" fill="none" className="text-ink/80">
      {children}
    </svg>
  );
}

const PROMISES = [
  {
    title: "Seasonal menu",
    body: "A menu built from the morning market.",
    icon: (
      <Icon>
        <path d="M17 29V14m0 0c0-5 3-8.5 7-9.5.5 4.5-2 8.5-7 9.5Zm0 0c0-4-2.5-7-6-8-.5 4 1.5 7 6 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="24.5" cy="6" r="1.6" fill="#d85a2b" />
      </Icon>
    ),
  },
  {
    title: "Indoor & outdoor",
    body: "Choose your favourite spot.",
    icon: (
      <Icon>
        <path d="M9 13c0-4 3.5-7 8-7s8 3 8 7-3.5 6-8 6-8-2-8-6Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M17 19v10m-5 0h10M13.5 13.5 17 17l3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="26" cy="6.5" r="1.6" fill="#d85a2b" />
      </Icon>
    ),
  },
  {
    title: "Great company",
    body: "For date nights, friends and celebrations.",
    icon: (
      <Icon>
        <path d="M8 7h7l-.8 7a2.7 2.7 0 0 1-5.4 0L8 7Zm3.5 10v9m-3 0h6M19 7h7l-.8 7a2.7 2.7 0 0 1-5.4 0L19 7Zm3.5 10v9m-3 0h6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="17" cy="4.5" r="1.6" fill="#d85a2b" />
      </Icon>
    ),
  },
  {
    title: "Special requests",
    body: "Tell us and we'll take care of the rest.",
    icon: (
      <Icon>
        <path d="M7 27h20M9 23l2-6L23 5l4 4-12 12-6 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="27" cy="4.5" r="1.6" fill="#d85a2b" />
      </Icon>
    ),
  },
];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ReserveTablePage({ searchParams }: PageProps<"/reserve-table">) {
  // The landing page's booking bar hands its choices over in the query string.
  const params = await searchParams;
  const date = one(params.date);
  const guests = Number(one(params.guests));
  const defaults = {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    time: one(params.time),
    guests: Number.isInteger(guests) ? guests : undefined,
  };

  return (
    <>
      {/* hero */}
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full md:w-[72%]">
          <Image
            src="/img/milli/outdoor-balcony.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 72vw"
            className="object-cover object-[60%_60%]"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#140e0a_0%,#140e0a_30%,rgba(20,14,10,0.55)_48%,rgba(20,14,10,0.05)_75%)] max-md:bg-[linear-gradient(180deg,rgba(20,14,10,0.5)_0%,rgba(20,14,10,0.88)_100%)]"
        />
        <div className="mx-auto w-full max-w-[1400px] px-5 pt-32 pb-16 md:px-10 md:pt-40 md:pb-24">
          <h1 className="font-display text-[clamp(3.4rem,8vw,6.6rem)] leading-[0.95] font-light">
            A table
            <br />
            awaits <span className="text-ember">you.</span>
          </h1>
          <p className="mt-6 max-w-xs text-[16px] leading-relaxed text-cream/85">
            Good food, better company.
            <br />
            Let us set the table.
          </p>
        </div>
      </section>

      {/* booking */}
      <section className="bg-cream">
        <div className="mx-auto grid w-full max-w-[1400px] gap-12 px-5 py-16 md:px-10 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <Reveal>
              <h2 className="font-display text-[clamp(2.4rem,4.4vw,3.5rem)] leading-[1.02] font-light">
                Plan your evening
                <br />
                at Milli.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <ReservationForm defaults={defaults} />
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:pt-2">
            <SpaceCarousel />
          </Reveal>
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 md:px-10">
          <RevealGroup stagger={0.08} className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 lg:grid-cols-4">
            {PROMISES.map((p) => (
              <RevealItem key={p.title}>
                {p.icon}
                <p className="mt-4 font-display text-[21px] leading-tight font-light">{p.title}</p>
                <p className="mt-2 max-w-[14rem] text-[13px] leading-relaxed text-muted">{p.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
