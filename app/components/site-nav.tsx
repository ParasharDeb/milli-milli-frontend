"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoginCard } from "@/app/components/auth/login-card";
import { useCartDrawer } from "@/app/components/cart-drawer";
import { Wordmark } from "@/app/components/wordmark";
import { signOut } from "@/app/lib/auth";
import { useCart } from "@/app/lib/cart-context";
import { useUser } from "@/app/lib/use-auth";
import "./site-nav.css";

const LINKS = [
  { label: "Reservations", href: "/reserve-table" },
  { label: "Menu", href: "/menu" },
  { label: "Ask Milli", href: "/chat" },
  { label: "Contact", href: "/#contact" },
];

/**
 * The one navbar, on every guest page. Every page opens on a dark photograph,
 * so the bar floats over it transparent and turns charcoal once the page moves.
 */
export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const { open: openLogin } = useLoginCard();
  const { open: openCart } = useCartDrawer();
  const { cart } = useCart();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const items = cart?.totalItems ?? 0;

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  function account() {
    setOpen(false);
    if (user) {
      signOut();
      router.refresh();
    } else {
      openLogin();
    }
  }

  const accountLabel = user ? "Sign out" : "Sign in";
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="sn" data-lifted={lifted || undefined} data-open={open || undefined}>
      <Link href="/" className="sn__logo" aria-label="Milli Milli, home" onClick={() => setOpen(false)}>
        <Wordmark />
      </Link>

      <nav className="sn__nav" aria-label="Primary">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sn__actions">
        <button
          type="button"
          className="sn__cart"
          onClick={openCart}
          aria-label={`Your order, ${items} ${items === 1 ? "item" : "items"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 6h2l2.4 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L20.5 9H6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="20" r="1.1" fill="currentColor" />
            <circle cx="17" cy="20" r="1.1" fill="currentColor" />
          </svg>
          {items > 0 && <span className="sn__badge">{items}</span>}
        </button>

        <button
          type="button"
          className="sn__account"
          onClick={account}
          title={user ? `Signed in as ${user}` : undefined}
        >
          {accountLabel}
        </button>

        <button
          type="button"
          className="sn__toggle"
          aria-expanded={open}
          aria-controls="sn-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Small screens: the links on a full charcoal sheet */}
      <div id="sn-sheet" className="sn__sheet" hidden={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <span className="sn__num">0{i + 1}</span>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="sn__sheet-account" onClick={account}>
          {accountLabel}
        </button>
      </div>
    </header>
  );
}
