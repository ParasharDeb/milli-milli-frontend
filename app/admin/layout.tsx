import type { Metadata } from "next";

/**
 * Nothing under /admin is linked from the public site, and this keeps it out
 * of search results too. The `proxy.ts` matcher handles the redirect for
 * anyone hitting the dashboard without a session.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-parchment">{children}</div>;
}
