"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "./reveal";

const DETAILS = [
  ["Dinner", "Wed – Sun, one seating at 19:00"],
  ["Counter", "Walk-ins from 18:30, six stools"],
  ["Where", "Rua das Flores 14, 1200-194 Lisboa"],
  ["Private dining", "The back room seats ten"],
];

export function Room() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Two columns drifting at different rates.
  const slow = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const fast = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      id="room"
      ref={ref}
      className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 lg:py-32"
    >
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div>
          <Reveal as="p" className="eyebrow text-muted">
            <span className="h-px w-8 bg-terracotta" />
            The room
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[clamp(2.1rem,4.8vw,3.4rem)] leading-[1.02] font-light tracking-[-0.03em] text-balance">
              Plaster, oak, and
              <span className="text-basil italic"> one long window.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-muted text-pretty">
              A corner room on a quiet street, lit low. The pass is open, so you
              can watch dinner happen. Bring four people or come alone and sit at
              the end of the counter — both are the right answer.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <dl className="mt-10 grid gap-x-6 gap-y-6 border-t border-line pt-8 text-sm sm:grid-cols-2">
              {DETAILS.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
                    {k}
                  </dt>
                  <dd className="mt-1.5 leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.24}>
            <a
              href="#reserve"
              className="group mt-9 inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3.5 text-sm font-medium transition-colors hover:bg-ink hover:text-cream"
            >
              Check availability
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <motion.div
            style={reduced ? undefined : { y: slow }}
            className="space-y-4 sm:space-y-5"
          >
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/img/room-dining.webp"
                alt="The dining room at dusk, candlelit tables and a tall window"
                fill
                sizes="(max-width: 1024px) 45vw, 28vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
              />
              <figcaption className="absolute inset-x-4 bottom-4 font-display text-lg font-light text-cream drop-shadow-lg">
                The dining room
              </figcaption>
            </figure>
            <figure className="group relative aspect-square overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/img/wine-pour.webp"
                alt="Natural orange wine being poured into a glass by candlelight"
                fill
                sizes="(max-width: 1024px) 45vw, 28vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
              />
            </figure>
          </motion.div>

          <motion.div
            style={reduced ? undefined : { y: fast }}
            className="space-y-4 pt-10 sm:space-y-5 sm:pt-16"
          >
            <figure className="group relative aspect-square overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/img/room-hearth.webp"
                alt="Vegetables charring over the wood-fired hearth"
                fill
                sizes="(max-width: 1024px) 45vw, 28vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
              />
              <figcaption className="absolute inset-x-4 bottom-4 font-display text-lg font-light text-cream drop-shadow-lg">
                The hearth
              </figcaption>
            </figure>
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/img/room-pass.webp"
                alt="Chefs plating dishes at the open pass during service"
                fill
                sizes="(max-width: 1024px) 45vw, 28vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
              />
              <figcaption className="absolute inset-x-4 bottom-4 font-display text-lg font-light text-cream drop-shadow-lg">
                The open pass
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
