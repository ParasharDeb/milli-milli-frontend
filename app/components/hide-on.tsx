"use client";

import { usePathname } from "next/navigation";

/**
 * Drops the site chrome on routes that take over the whole screen -- the chat
 * brings its own top bar, so the nav and footer would only eat into it.
 */
export function HideOn({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  if (paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
