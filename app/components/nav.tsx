"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";

const LINKS = [
  ["Menu", "#menu"],
  ["Signatures", "#signatures"],
  ["The kitchen", "#kitchen"],
  ["The room", "#room"],
  ["Journal", "#journal"],
];

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setLifted(y > 40));

  return (
    <>
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-amber via-ember to-terracotta"
      />

      {/* announcement bar */}
      <div className="grain relative bg-forest text-cream">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-2.5 text-[12px] md:px-10">
          <p className="flex items-center gap-2.5">
            <span className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber" />
            <span className="truncate">
              Autumn menu is live · December bookings open Monday at 09:00
            </span>
          </p>
          <a
            href="tel:+351210000000"
            className="hidden shrink-0 text-cream/70 transition-colors hover:text-amber sm:block"
          >
            +351 21 000 0000
          </a>
        </div>
      </div>

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          lifted
            ? "border-b border-line bg-cream/90 py-1 backdrop-blur-xl"
            : "border-b border-transparent py-2"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8 px-6 py-3 md:px-10">
          <a href="#" className="flex shrink-0 items-baseline gap-2">
            <span className="font-display text-2xl leading-none tracking-[-0.02em] lowercase">
              milli
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            <span className="hidden text-[10px] leading-none tracking-[0.22em] text-muted uppercase sm:block">
              Lisboa
            </span>
          </a>

          <ul className="hidden items-center gap-8 text-[14px] text-muted lg:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  className="group relative inline-block py-1 transition-colors hover:text-ink"
                >
                  {label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ember transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#reserve"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember"
            >
              Book a table
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line lg:hidden"
            >
              <span
                className={`h-px w-4 bg-ink transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-4 bg-ink transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line bg-cream lg:hidden"
            >
              <ul className="mx-auto w-full max-w-[1400px] px-6 py-3 md:px-10">
                {LINKS.map(([label, href]) => (
                  <li key={href} className="border-b border-line/70 last:border-0">
                    <a
                      href={href}
                      onClick={() => setOpen(false)}
                      className="block py-3.5 font-display text-lg font-light"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
