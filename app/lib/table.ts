/**
 * Which table this guest is sitting at.
 *
 * Each table carries a QR code. It encodes a link to this site with
 * `?table=<number>` -- e.g. https://millimilli.in/menu?table=12 -- so scanning it
 * with the phone's own camera opens the menu already knowing the table, and
 * scanning it from inside the checkout reads the same link. Plain "12" and
 * "TABLE:12" are accepted too, so a printed code doesn't have to be a URL.
 *
 * Remembered for a few hours, not forever: tomorrow's visit is a different table.
 */

const KEY = "milli_table";
const TTL_MS = 4 * 60 * 60_000;

/** Mirrors the backend's rule in order.schema.ts. */
const TABLE_RE = /^[A-Za-z0-9][A-Za-z0-9 \-]{0,15}$/;

export function normaliseTable(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, " ");
  return TABLE_RE.test(t) ? t.toUpperCase() : null;
}

/** Reads a table number out of whatever a QR code held, or null if it isn't one of ours. */
export function tableFromQr(text: string): string | null {
  const raw = text.trim();

  // Only web links: "TABLE:7" also parses as a URL, with the scheme "table:".
  if (/^https?:\/\//i.test(raw)) {
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      return null;
    }
    const fromQuery = u.searchParams.get("table") ?? u.searchParams.get("t");
    if (fromQuery) return normaliseTable(fromQuery);
    const fromPath = /\/(?:table|t)\/([^/?#]+)/i.exec(u.pathname);
    return fromPath ? normaliseTable(decodeURIComponent(fromPath[1])) : null;
  }

  const tagged = /^(?:milli[:\-]?)?(?:table|tbl|t)[:\s#\-]*([A-Za-z0-9][A-Za-z0-9 \-]*)$/i.exec(raw);
  if (tagged) return normaliseTable(tagged[1]);
  return /^\d{1,3}$/.test(raw) ? raw : null;
}

export function getTable(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) return null;
    const { table, at } = JSON.parse(stored) as { table: string; at: number };
    if (Date.now() - at > TTL_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return normaliseTable(table);
  } catch {
    return null;
  }
}

export function setTable(table: string): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ table, at: Date.now() }));
  } catch {
    /* storage disabled: the guest types it at checkout instead */
  }
}

export function clearTable(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Picks `?table=` off the current URL, if the guest arrived by scanning. */
export function tableFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("table") ?? params.get("t");
  return raw ? normaliseTable(raw) : null;
}
