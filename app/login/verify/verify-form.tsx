"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { OtpInput } from "@/app/components/auth/otp-input";
import {
  DEMO_OTP,
  formatPhone,
  getPendingPhoneRaw,
  requestOtp,
  verifyOtp,
} from "@/app/lib/auth";
import { usePendingPhone } from "@/app/lib/use-auth";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const RESEND_SECONDS = 30;

export function VerifyForm() {
  const router = useRouter();
  const phone = usePendingPhone();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Nobody should land here without a number in flight. Read sessionStorage
  // directly rather than the hook: on the hydration pass the hook still holds
  // the server snapshot (null), which would bounce every visitor straight out.
  // A successful verify clears the number, so skip the check once we're on our
  // way to /menu — otherwise it races the redirect and wins.
  useEffect(() => {
    if (pending || success) return;
    if (!getPendingPhoneRaw()) router.replace("/");
  }, [pending, success, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  async function submit(fullCode: string) {
    if (pending || success) return;
    setPending(true);
    setError(null);
    const result = await verifyOtp(fullCode);

    if (!result.ok) {
      setPending(false);
      setError(result.error);
      setCode("");
      return;
    }
    // Set success before clearing pending so no render sees both as false.
    setSuccess(true);
    setPending(false);
    // Let the tick land before moving on.
    setTimeout(() => router.push("/menu"), 700);
  }

  async function resend() {
    if (!phone || secondsLeft > 0) return;
    await requestOtp(phone);
    setSecondsLeft(RESEND_SECONDS);
    setError(null);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      {/* form side */}
      <div className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none lowercase">
              milli
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="mt-12"
          >
            <p className="eyebrow text-muted">
              <span className="h-px w-6 bg-ember" />
              Step 2 of 2
            </p>
            <h1 className="mt-5 font-display text-[clamp(2rem,4.5vw,2.9rem)] leading-[1.05] font-light tracking-[-0.03em]">
              Enter your code.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              We sent six digits to{" "}
              <span className="font-medium text-ink">
                {phone ? formatPhone(phone) : "your phone"}
              </span>
              .{" "}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="underline underline-offset-2 hover:text-ink"
              >
                Wrong number?
              </button>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(code);
              }}
              className="mt-9"
            >
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={submit}
                disabled={pending || success}
                invalid={Boolean(error)}
              />

              <div className="mt-4 min-h-[1.5rem]">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px] text-ember"
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[13px] text-basil"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-basil text-[10px] text-cream">
                      ✓
                    </span>
                    Verified — taking you to the menu.
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={code.length < 6 || pending || success}
                className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Checking…" : success ? "Signed in" : "Verify and continue"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[13px] text-muted">
              <button
                type="button"
                onClick={resend}
                disabled={secondsLeft > 0}
                className="underline underline-offset-2 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
              >
                {secondsLeft > 0
                  ? `Resend code in ${secondsLeft}s`
                  : "Resend code"}
              </button>
              <Link href="/" className="hover:text-ink">
                Back to site
              </Link>
            </div>

            <p className="mt-10 rounded-xl border border-dashed border-line bg-parchment px-4 py-3 text-[12px] leading-relaxed text-muted">
              <span className="font-medium text-ink">Demo build.</span> No SMS is
              sent — use code{" "}
              <span className="font-mono font-medium text-ember">{DEMO_OTP}</span>{" "}
              to continue.
            </p>
          </motion.div>
        </div>
      </div>

      {/* image side */}
      <div className="relative hidden lg:block">
        <Image
          src="/img/room-dining.webp"
          alt=""
          aria-hidden
          fill
          sizes="45vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <blockquote className="absolute inset-x-10 bottom-12 text-cream">
          <p className="font-display text-2xl leading-snug font-light text-balance">
            “Twelve tables, zero pretence.”
          </p>
          <footer className="mt-3 text-[11px] tracking-[0.22em] text-cream/60 uppercase">
            The Guardian
          </footer>
        </blockquote>
      </div>
    </main>
  );
}
