/**
 * Authentication.
 *
 * Staff sign-in is real: `adminSignIn` calls POST /api/auth/admin/login and
 * keeps the JWT it returns, which the dashboard sends with every staff-only
 * request. The backend checks that token -- the cookies here only drive the
 * optimistic redirect in `proxy.ts` and are not what protects the data.
 *
 * The guest OTP flow is still simulated in the browser against a fixed code.
 * To make that real, replace `requestOtp` / `verifyOtp` with calls to the API.
 *
 * This module is also imported by `proxy.ts`, so it must stay free of React
 * and of any work at import time.
 */

export const USER_COOKIE = "milli_user";
export const ADMIN_COOKIE = "milli_admin";
const ADMIN_TOKEN_COOKIE = "milli_admin_token";
const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

const PENDING_PHONE_KEY = "milli_pending_phone";

/** A real build would text a one-time code instead. */
export const DEMO_OTP = "123456";

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
  let res: Response;
  try {
    res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    return { ok: false as const, error: "Could not reach the server. Try again." };
  }
  if (res.status === 401 || res.status === 400) {
    return { ok: false as const, error: "Wrong email or password." };
  }
  const body = (await res.json().catch(() => null)) as
    | { token: string; admin: { email: string } }
    | null;
  if (!res.ok || !body?.token) {
    return { ok: false as const, error: "Sign-in failed. Try again." };
  }
  setCookie(ADMIN_TOKEN_COOKIE, body.token, ADMIN_SESSION_SECONDS);
  setCookie(ADMIN_COOKIE, body.admin.email, ADMIN_SESSION_SECONDS);
  notify();
  return { ok: true as const };
}

/** The bearer token for staff-only API calls. */
export function getAdminToken() {
  return readCookie(ADMIN_TOKEN_COOKIE);
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
  clearCookie(ADMIN_TOKEN_COOKIE);
  notify();
}
