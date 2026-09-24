/**
 * The id that ties a browser to its cart and conversation on the backend.
 *
 * A client-generated uuid in localStorage, sent as `X-Session-Id`, rather than a
 * cookie. The browser only ever talks to Next, which proxies `/api` onward, and
 * a `Set-Cookie` surviving that rewrite is an implementation detail of the proxy
 * rather than something to build on -- and `menu-api.ts` also runs from React
 * Server Components, where there is no cookie jar at all.
 *
 * It carries no credential, so there is nothing to forge: possession of the id
 * grants a list of dish ids and nothing else.
 */

const KEY = "milli_session";

export function getSessionId(): string | null {
  // Server-rendered passes have no localStorage and no cart to look up.
  if (typeof window === "undefined") return null;

  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;

    const fresh = crypto.randomUUID();
    window.localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Private mode, or storage disabled. The backend mints an id per request in
    // that case, so the guest gets a working -- if forgetful -- cart.
    return null;
  }
}

export function clearSessionId(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
