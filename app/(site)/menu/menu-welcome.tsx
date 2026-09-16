"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUser } from "@/app/lib/use-auth";

/** Confirmation strip shown to anyone who just came through the OTP flow. */
export function MenuWelcome() {
  const user = useUser();
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {user && !dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b border-basil/20 bg-basil/10"
        >
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-3 md:px-10">
            <p className="flex items-center gap-2.5 text-[13px] text-basil">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-basil text-[10px] text-cream">
                ✓
              </span>
              <span>
                Signed in as{" "}
                <span className="font-medium">{user}</span> — your table
                preferences are saved.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 text-basil/60 transition-colors hover:text-basil"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
