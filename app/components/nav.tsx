"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLoginCard } from "./auth/login-card";
import { signOut } from "@/app/lib/auth";
import { useUser } from "@/app/lib/use-auth";

const LINKS = [
  ["Menu", "/menu"],
  ["Reserve", "/reserve-table"],
  ["Signatures", "/#signatures"],
  ["The kitchen", "/#kitchen"],
  ["The room", "/#room"],
  ["Journal", "/#journal"],
];

export function Nav() {
  const router = useRouter();
  const { open } = useLoginCard();
  const { scrollY, scrollYProgress } = useScroll();
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUser();

  useMotionValueEvent(scrollY, "change", (y) => setLifted(y > 40));

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    router.refresh();
  }

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
          <Link href="/" className="flex shrink-0 items-baseline gap-2">
            <span className="font-display text-2xl leading-none tracking-[-0.02em] lowercase">
              milli
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            <span className="hidden text-[10px] leading-none tracking-[0.22em] text-muted uppercase sm:block">
              Lisboa
            </span>
          </Link>

          <ul className="hidden items-center gap-8 text-[14px] text-muted lg:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group relative inline-block py-1 transition-colors hover:text-ink"
                >
                  {label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ember transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <span className="rounded-full border border-basil/30 bg-basil/10 px-3.5 py-2 text-[12px] font-medium text-basil">
                  {user}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={open}
                className="hidden text-[13px] font-medium text-muted transition-colors hover:text-ink sm:block"
              >
                Sign in
              </button>
            )}

            <Link
              href="/reserve-table"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-ember"
            >
              Book a table
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line lg:hidden"
            >
              <span
                className={`h-px w-4 bg-ink transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-4 bg-ink transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line bg-cream lg:hidden"
            >
              <ul className="mx-auto w-full max-w-[1400px] px-6 py-3 md:px-10">
                {LINKS.map(([label, href]) => (
                  <li key={href} className="border-b border-line/70">
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3.5 font-display text-lg font-light"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li className="pt-4 pb-2">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-basil">{user}</span>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-[13px] text-muted underline underline-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        open();
                      }}
                      className="w-full rounded-full border border-line py-3 text-sm font-medium"
                    >
                      Sign in
                    </button>
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
