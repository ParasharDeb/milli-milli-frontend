"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { requestOtp } from "@/app/lib/auth";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const DIAL_CODES = ["+351", "+44", "+1", "+34", "+33"];

type LoginCardContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const LoginCardContext = createContext<LoginCardContextValue | null>(null);

export function useLoginCard() {
  const ctx = useContext(LoginCardContext);
  if (!ctx) {
    throw new Error("useLoginCard must be used inside <LoginCardProvider>");
  }
  return ctx;
}

export function LoginCardProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <LoginCardContext.Provider value={value}>
      {children}
      <LoginCard isOpen={isOpen} onClose={close} />
    </LoginCardContext.Provider>
  );
}

function LoginCard({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [dialCode, setDialCode] = useState(DIAL_CODES[0]);
  const [number, setNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape, and stop the page scrolling behind the card.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, onClose]);

  const digits = number.replace(/\D/g, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (digits.length < 6) {
      setError("Enter a valid phone number.");
      return;
    }
    setError(null);
    setPending(true);
    await requestOtp({ dialCode, number: digits });
    setPending(false);
    onClose();
    router.push("/login/verify");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close sign in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-card-title"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="relative w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-line bg-cream shadow-2xl shadow-ink/25"
          >
            {/* warm header */}
            <div className="grain relative bg-forest px-7 pt-7 pb-8 text-cream">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.35),transparent_65%)] blur-xl"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-cream/25 text-cream/70 transition-colors hover:border-cream/60 hover:text-cream"
              >
                ✕
              </button>
              <p className="eyebrow text-amber">
                <span className="h-px w-6 bg-amber" />
                Milli account
              </p>
              <h2
                id="login-card-title"
                className="relative mt-4 font-display text-[1.75rem] leading-tight font-light"
              >
                Sign in to book
                <br />
                in two taps.
              </h2>
              <p className="relative mt-2 text-[13px] text-cream/65">
                We send a six-digit code. No password to forget.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-7 pt-6 pb-7">
              <label
                htmlFor="phone"
                className="text-[11px] tracking-[0.18em] text-muted uppercase"
              >
                Mobile number
              </label>
              <div className="mt-2.5 flex gap-2">
                <select
                  aria-label="Country dialling code"
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  className="rounded-xl border border-line bg-parchment px-3 py-3.5 text-sm focus:border-ember focus:outline-none"
                >
                  {DIAL_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  placeholder="912 345 678"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    setError(null);
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-line bg-parchment px-4 py-3.5 text-sm tracking-wide placeholder:text-muted/60 focus:border-ember focus:outline-none"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-[13px] text-ember"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Sending code…" : "Send me a code"}
                {!pending && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              <p className="mt-4 text-center text-[12px] leading-relaxed text-muted">
                By continuing you agree to our{" "}
                <a href="#" className="underline underline-offset-2 hover:text-ink">
                  terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 hover:text-ink">
                  privacy notice
                </a>
                .
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
