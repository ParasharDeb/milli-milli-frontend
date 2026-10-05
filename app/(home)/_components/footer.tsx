import Link from "next/link";
import { Wordmark } from "./ui";

/** Placeholder profile and map links: swap for the real ones. */
const LINKS = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "Location", href: "https://maps.google.com/?q=Milli+Milli+Guwahati" },
  { label: "Contact", href: "mailto:hello@millimilli.in" },
];

export function Footer() {
  return (
    <footer id="contact" className="mm-footer">
      <Link href="/" className="mm-footer__logo" aria-label="Milli Milli, home">
        <Wordmark />
      </Link>
      <div className="mm-footer__about mm-micro">
        <p className="mm-footer__kinds">
          <span>Restaurant</span>
          <span>Bar</span>
          <span>Nights</span>
        </p>
        <p>Guwahati, India</p>
      </div>
      <ul className="mm-footer__links mm-micro">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
