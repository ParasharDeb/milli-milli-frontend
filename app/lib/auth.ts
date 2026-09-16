/**
 * Demo authentication.
 *
 * There is no backend in this project, so both flows are simulated in the
 * browser: the "OTP" is a fixed code and the admin credentials are checked
 * against the constants below. Sessions live in a cookie so `proxy.ts` can do
 * an optimistic redirect on the server, plus sessionStorage for the in-flight
 * phone number.
 *
 * To make this real, replace `requestOtp` / `verifyOtp` / `adminSignIn` with
 * calls to your API and set the session cookie server-side, HttpOnly. Nothing
 * here is a security boundary.
 *
 * This module is also imported by `proxy.ts`, so it must stay free of React
 * and of any work at import time.
 */

export const USER_COOKIE = "milli_user";
export const ADMIN_COOKIE = "milli_admin";

const PENDING_PHONE_KEY = "milli_pending_phone";

/** A real build would text a one-time code instead. */
export const DEMO_OTP = "123456";
export const DEMO_ADMIN = {
  email: "admin@milli.pt",
  password: "milli2026",
};

export type PendingPhone = {
  dialCode: string;
  number: string;
};

/* --- change notifications, so `useSyncExternalStore` can track writes --- */

const listeners = new Set<() => void>();

export function subscribeToAuth(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function notify() {
  for (const listener of listeners) listener();
}

/* --- cookie helpers --- */

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

/** Fakes the network round-trip so the UI shows real pending states. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* --- flows --- */

export function formatPhone({ dialCode, number }: PendingPhone) {
  return `${dialCode} ${number}`;
}

export async function requestOtp(phone: PendingPhone) {
  await delay(700);
  sessionStorage.setItem(PENDING_PHONE_KEY, JSON.stringify(phone));
  notify();
  return { sent: true };
}

export function getPendingPhoneRaw(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(PENDING_PHONE_KEY);
}

export function getPendingPhone(): PendingPhone | null {
  const raw = getPendingPhoneRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPhone;
  } catch {
    return null;
  }
}

export async function verifyOtp(code: string) {
  await delay(800);
  if (code !== DEMO_OTP) {
    return { ok: false as const, error: "That code doesn't match. Try again." };
  }
  const phone = getPendingPhone();
  setCookie(USER_COOKIE, phone ? formatPhone(phone) : "guest", 60 * 60 * 24 * 30);
  sessionStorage.removeItem(PENDING_PHONE_KEY);
  notify();
  return { ok: true as const };
}

export async function adminSignIn(email: string, password: string) {
  await delay(800);
  if (
    email.trim().toLowerCase() !== DEMO_ADMIN.email ||
    password !== DEMO_ADMIN.password
  ) {
    return { ok: false as const, error: "Wrong email or password." };
  }
  setCookie(ADMIN_COOKIE, email.trim().toLowerCase(), 60 * 60 * 8);
  notify();
  return { ok: true as const };
}

export function getUser() {
  return readCookie(USER_COOKIE);
}

export function getAdmin() {
  return readCookie(ADMIN_COOKIE);
}

export function signOut() {
  clearCookie(USER_COOKIE);
  clearCookie(ADMIN_COOKIE);
  notify();
}
