"use client";

import { useEffect, useRef } from "react";

const LENGTH = 6;

/**
 * Six single-character boxes that behave like one field: typing advances,
 * Backspace walks back, arrows move, and a pasted code fills every box.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function setDigit(index: number, digit: string) {
    const next = value.padEnd(LENGTH, " ").split("");
    next[index] = digit || " ";
    const joined = next.join("").replace(/\s+$/, "");
    onChange(joined.trimEnd());
    return joined.replace(/\s/g, "");
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;

    if (digits.length > 1) {
      // A paste landed in one box — spread it across the rest.
      const filled = (value.slice(0, index) + digits)
        .replace(/\D/g, "")
        .slice(0, LENGTH);
      onChange(filled);
      const focus = Math.min(filled.length, LENGTH - 1);
      refs.current[focus]?.focus();
      if (filled.length === LENGTH) onComplete?.(filled);
      return;
    }

    const complete = setDigit(index, digits);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
    if (complete.length === LENGTH) onComplete?.(complete);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-full min-w-0 rounded-xl border bg-parchment text-center font-display text-2xl transition-colors focus:outline-none disabled:opacity-60 sm:h-16 ${
            invalid
              ? "border-ember text-ember"
              : "border-line focus:border-ember"
          }`}
        />
      ))}
    </div>
  );
}
