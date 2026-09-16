import type { Metadata } from "next";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Milli staff",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminDashboardPage() {
  return <Dashboard />;
}
