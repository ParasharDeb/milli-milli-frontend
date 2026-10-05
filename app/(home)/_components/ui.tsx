import Image from "next/image";
import Link from "next/link";

export { Wordmark } from "@/app/components/wordmark";

/** The long, hairline arrow used beside every call to action. */
export function Arrow({ short = false }: { short?: boolean }) {
  const w = short ? 22 : 72;
  return (
    <svg
      className={short ? "mm-arrow mm-arrow--short" : "mm-arrow"}
      viewBox={`0 0 ${w} 10`}
      fill="none"
      aria-hidden
    >
      <path d={`M0 5H${w - 1}M${w - 6} 1l5 4-5 4`} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Draws the hairline rule under the label, as on the cream sections. */
  underline?: boolean;
  className?: string;
};

export function ArrowLink({ href, children, underline = false, className = "" }: ArrowLinkProps) {
  return (
    <Link href={href} className={`mm-cta ${underline ? "mm-cta--rule" : ""} ${className}`}>
      <span className="mm-cta__label">{children}</span>
      <Arrow />
    </Link>
  );
}

/** A handwritten margin note with its pen stroke underneath. */
export function Note({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <p className={`mm-note ${className}`}>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
      <svg className="mm-note__stroke" viewBox="0 0 200 18" fill="none" aria-hidden>
        <path
          d="M3 14C48 6 120 2 197 5M28 16c40-5 92-8 140-7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    </p>
  );
}

type PrintProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** CSS object-position for the crop. */
  focus?: string;
  priority?: boolean;
};

/** A photograph laid on the page like a print: cropped, never carded. */
export function Print({ src, alt, sizes, className = "", focus, priority }: PrintProps) {
  return (
    <figure className={`mm-print ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={focus ? { objectPosition: focus } : undefined}
      />
    </figure>
  );
}
