"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StaffOrder, StaffReservation } from "./menu-api";

export type AdminStreamEvent =
  | { type: "order.created" | "order.updated"; data: StaffOrder }
  | { type: "reservation.created" | "reservation.updated"; data: StaffReservation };

type Listener = {
  onEvent: (event: AdminStreamEvent) => void;
  /** After a dropped connection comes back: refetch, events may have been missed. */
  onReconnect?: () => void;
};

export type AdminStream = {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
};

const BACKOFF_MS = [1000, 2000, 5000, 10000];
const EVENT_TYPES = new Set(["order.created", "order.updated", "reservation.created", "reservation.updated"]);

/**
 * One Server-Sent Events connection for the whole dashboard: every order and
 * reservation as it is created or decided.
 *
 * Read with fetch() rather than EventSource because the stream sits behind the
 * staff Bearer token, which EventSource cannot send. Reconnects with backoff;
 * a 401/403 stops it (the panels' own fetches sign the admin out).
 */
export function useAdminStream(token: string | null): AdminStream {
  const [connected, setConnected] = useState(false);
  const listeners = useRef(new Set<Listener>());

  useEffect(() => {
    if (!token) return;
    const abort = new AbortController();
    let attempt = 0;
    let timer: number | undefined;

    const dispatch = (block: string) => {
      let type = "";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) type = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!EVENT_TYPES.has(type) || !data) return;
      let event: AdminStreamEvent;
      try {
        event = { type, data: JSON.parse(data) } as AdminStreamEvent;
      } catch {
        return;
      }
      for (const l of listeners.current) l.onEvent(event);
    };

    const connect = async () => {
      try {
        const res = await fetch("/api/admin/stream", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: abort.signal,
        });
        if (res.status === 401 || res.status === 403) return;
        if (!res.ok || !res.body) throw new Error(`Stream answered ${res.status}`);

        setConnected(true);
        if (attempt > 0) for (const l of listeners.current) l.onReconnect?.();
        attempt = 0;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          // Events are separated by a blank line; keep any half-received one.
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";
          blocks.forEach(dispatch);
        }
      } catch {
        if (abort.signal.aborted) return;
      }
      setConnected(false);
      if (abort.signal.aborted) return;
      timer = window.setTimeout(connect, BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]);
      attempt++;
    };

    connect();
    return () => {
      abort.abort();
      window.clearTimeout(timer);
      setConnected(false);
    };
  }, [token]);

  const subscribe = useMemo(
    () => (listener: Listener) => {
      listeners.current.add(listener);
      return () => {
        listeners.current.delete(listener);
      };
    },
    [],
  );

  return { connected, subscribe };
}

/** Replaces the row with the same id, or puts a new one on top. */
export function upsertById<T extends { id: string; status: string }>(
  rows: T[],
  counts: Record<string, number>,
  row: T,
): { rows: T[]; counts: Record<string, number> } {
  const i = rows.findIndex((r) => r.id === row.id);
  const next = { ...counts };
  if (i === -1) {
    next[row.status] = (next[row.status] ?? 0) + 1;
    return { rows: [row, ...rows], counts: next };
  }
  const old = rows[i]!;
  if (old.status !== row.status) {
    next[old.status] = Math.max(0, (next[old.status] ?? 0) - 1);
    next[row.status] = (next[row.status] ?? 0) + 1;
  }
  return { rows: rows.map((r, j) => (j === i ? row : r)), counts: next };
}
