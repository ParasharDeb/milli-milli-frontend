"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLoginCard } from "./auth/login-card";
import { useCartDrawer } from "./cart-drawer";
import { useCart } from "@/app/lib/cart-context";
import { signOut } from "@/app/lib/auth";
import { useUser } from "@/app/lib/use-auth";

const LINKS = [
  ["Menu", "/menu"],
  ["Reserve", "/reserve-table"],
  ["Ask Milli", "/chat"],
];

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useLoginCard();
  const { open: openCart } = useCartDrawer();
  const { cart } = useCart();
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUser();

  // Every page opens on a dark photograph, so the bar floats over it in light
  // type until the page moves.
  const dark = !lifted && !menuOpen;
  // The landing page outlines its booking button; the inner pages fill it.
  const solidBook = pathname !== "/";

  useMotionValueEvent(scrollY, "change", (y) => setLifted(y > 40));

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    router.refresh();
  }

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        dark
          ? "border-b border-transparent bg-transparent text-cream"
          : "border-b border-line bg-cream/92 text-ink backdrop-blur-xl"
      }`}
    >
      <nav
        className={`mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-5 transition-[padding] duration-300 md:px-10 ${
          lifted ? "py-3" : "py-4 md:py-6"
        }`}
      >
        <Link href="/" className="wordmark shrink-0 text-[26px] md:text-[30px]">
          Milli Milli
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-10">
          <ul className="hidden items-center gap-9 text-[13px] lg:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`group relative inline-block py-1.5 transition-opacity ${
                    isActive(href) ? "opacity-100" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ember transition-transform duration-300 ${
                      isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                title={`Signed in as ${user}. Sign out`}
                className="hidden text-[12px] opacity-70 transition-opacity hover:opacity-100 xl:block"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={open}
                className="hidden text-[12px] opacity-70 transition-opacity hover:opacity-100 xl:block"
              >
                Sign in
              </button>
            )}

            <button
              type="button"
              onClick={openCart}
              aria-label={`Your order, ${cart?.totalItems ?? 0} items`}
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                dark ? "hover:bg-cream/10" : "hover:bg-ink/5"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 6h2l2.4 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L20.5 9H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.2" fill="currentColor" />
                <circle cx="17" cy="20" r="1.2" fill="currentColor" />
              </svg>
              {(cart?.totalItems ?? 0) > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-medium tabular-nums text-cream">
                  {cart!.totalItems}
                </span>
              )}
            </button>

            <Link
              href="/reserve-table"
              className={`group hidden items-center gap-2 rounded-full border px-5 py-2.5 text-[12px] transition-colors md:inline-flex ${
                dark
                  ? solidBook
                    ? "border-cream bg-cream text-ink hover:border-ember hover:bg-ember hover:text-cream"
                    : "border-cream/60 text-cream hover:border-cream hover:bg-cream hover:text-ink"
                  : "border-ink bg-ink text-cream hover:border-ember hover:bg-ember"
              }`}
            >
              Book a table
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
            >
              <span
                className={`h-px w-6 bg-current transition-transform ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-6 bg-current transition-transform ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
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
            <ul className="mx-auto w-full max-w-[1400px] px-5 py-3 md:px-10">
              {LINKS.map(([label, href]) => (
                <li key={href} className="border-b border-line/70">
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-4 font-display text-2xl"
                  >
                    {label}
                    <span className="text-base text-muted">→</span>
                  </Link>
                </li>
              ))}
              <li className="grid gap-3 pt-5 pb-3">
                <Link
                  href="/reserve-table"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-ember py-3.5 text-center text-sm font-medium text-cream"
                >
                  Book a table →
                </Link>
                {user ? (
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[13px] text-muted">{user}</span>
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
                    className="rounded-full border border-line py-3.5 text-sm font-medium"
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
  );
}
