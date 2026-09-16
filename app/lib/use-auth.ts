"use client";

import { useSyncExternalStore } from "react";
import {
  getAdmin,
  getPendingPhoneRaw,
  getUser,
  subscribeToAuth,
  type PendingPhone,
} from "./auth";

/**
 * Cookies and sessionStorage are external stores, so they are read through
 * `useSyncExternalStore` rather than copied into state inside an effect.
 * The server snapshot is always `null` — nothing is known until hydration.
 */

function subscribe(onChange: () => void) {
  const unsubscribe = subscribeToAuth(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", onChange);
  };
}

const serverSnapshot = () => null;

export function useUser() {
  return useSyncExternalStore(subscribe, getUser, serverSnapshot);
}

export function useAdmin() {
  return useSyncExternalStore(subscribe, getAdmin, serverSnapshot);
}

// getSnapshot must return a stable reference, so the parsed object is
// memoised against the raw string it was parsed from.
let phoneCache: { raw: string | null; value: PendingPhone | null } = {
  raw: null,
  value: null,
};

function getPendingPhoneSnapshot(): PendingPhone | null {
  const raw = getPendingPhoneRaw();
  if (raw !== phoneCache.raw) {
    let value: PendingPhone | null = null;
    if (raw) {
      try {
        value = JSON.parse(raw) as PendingPhone;
      } catch {
        value = null;
      }
    }
    phoneCache = { raw, value };
  }
  return phoneCache.value;
}

export function usePendingPhone() {
  return useSyncExternalStore(
    subscribe,
    getPendingPhoneSnapshot,
    serverSnapshot,
  );
}
