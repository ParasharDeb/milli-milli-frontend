"use client";

/**
 * − qty + control. Shared by the cart drawer, where changes go straight to the
 * order, and the chat's combo cards, where they stay local until "Add combo".
 */
export function Stepper({
  qty,
  busy = false,
  min = 0,
  max = 20,
  onChange,
  label,
  className = "rounded-full",
}: {
  qty: number;
  busy?: boolean;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  /** Names the dish for screen readers: "One fewer Chilli Cheese Kulcha". */
  label?: string;
  /** Shape of the outline; the noir pages pass a square one. */
  className?: string;
}) {
  const suffix = label ? ` ${label}` : "";
  return (
    <div className={`inline-flex items-center border border-ink/15 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={busy || qty <= min}
        aria-label={`One fewer${suffix}`}
        className="px-2.5 py-1 text-ink/60 transition-colors hover:text-ink disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-[13px] tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={busy || qty >= max}
        aria-label={`One more${suffix}`}
        className="px-2.5 py-1 text-ink/60 transition-colors hover:text-ink disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
