"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { DEMO_ADMIN, adminSignIn } from "@/app/lib/auth";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await adminSignIn(email, password);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <main className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-deep px-6 py-14 text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.16),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(26,122,86,0.28),transparent_65%)] blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="relative w-full max-w-[25rem]"
      >
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none lowercase">milli</span>
          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          <span className="text-[10px] tracking-[0.22em] text-cream/50 uppercase">
            Staff
          </span>
        </Link>

        <div className="mt-8 rounded-[1.75rem] border border-cream/12 bg-cream/6 p-7 backdrop-blur-xl sm:p-8">
          <p className="eyebrow text-amber">
            <span className="h-px w-6 bg-amber" />
            Restricted
          </p>
          <h1 className="mt-4 font-display text-[1.9rem] leading-tight font-light">
            Staff sign in
          </h1>
          <p className="mt-2 text-[13px] text-cream/60">
            Front-of-house and kitchen management only.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <label
              htmlFor="email"
              className="text-[11px] tracking-[0.18em] text-cream/55 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@milli.pt"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="mt-2.5 w-full rounded-xl border border-cream/20 bg-forest-deep/60 px-4 py-3.5 text-sm text-cream placeholder:text-cream/35 focus:border-amber focus:outline-none"
            />

            <label
              htmlFor="password"
              className="mt-5 block text-[11px] tracking-[0.18em] text-cream/55 uppercase"
            >
              Password
            </label>
            <div className="relative mt-2.5">
              <input
                id="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-cream/20 bg-forest-deep/60 px-4 py-3.5 pr-20 text-sm text-cream placeholder:text-cream/35 focus:border-amber focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-3 text-[11px] tracking-[0.14em] text-cream/55 uppercase transition-colors hover:text-amber"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-4 min-h-[1.25rem]">
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[13px] text-ember"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-amber px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
              {!pending && (
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 rounded-xl border border-dashed border-cream/20 px-4 py-3 text-[12px] leading-relaxed text-cream/60">
            <span className="font-medium text-cream">Demo build.</span> Sign in
            with{" "}
            <span className="font-mono text-amber">{DEMO_ADMIN.email}</span> /{" "}
            <span className="font-mono text-amber">{DEMO_ADMIN.password}</span>.
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-cream/40">
          Lost access? Ask a manager to reset it in the till system.
        </p>
      </motion.div>
    </main>
  );
}
