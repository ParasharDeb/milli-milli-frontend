import Image from "next/image";
import Link from "next/link";

const LINKS = [
  ["Menu", "/menu"],
  ["Reserve", "/reserve-table"],
  ["The Room", "/#room"],
  ["Journal", "/#journal"],
  ["About", "/#about"],
];

/** Placeholder profiles: swap the hrefs for the real accounts. */
const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <path
        d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.3-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.1H8.2V13h2.4v7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Find us",
    href: "#",
    icon: (
      <>
        <path d="M12 3.5 20.5 12 12 20.5 3.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9.5 13.5v-2a1 1 0 0 1 1-1h4m-1.5-1.5 1.5 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-espresso text-cream">
      <Image
        src="/img/milli/room-indoor.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-[0.16]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso via-espresso/70 to-espresso/90" />

      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-10 md:py-16">
        <div>
          <Link href="/" className="wordmark text-[30px]">
            Milli Milli
          </Link>
          <p className="mt-3 max-w-[14rem] text-[13px] leading-relaxed text-cream/65">
            A small kitchen that cooks the morning market.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-cream/80 transition-colors hover:text-ember">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4 md:items-end">
          <p className="text-[13px] text-cream/70">Since 2019, in Kolkata</p>
          <ul className="flex gap-3">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/35 text-cream/85 transition-colors hover:border-ember hover:text-ember"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                    {s.icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto w-full max-w-[1400px] px-5 py-5 text-[11.5px] text-cream/45 md:px-10">
          © {new Date().getFullYear()} Milli Milli. Everything on the menu may change before you arrive.
        </p>
      </div>
    </footer>
  );
}
