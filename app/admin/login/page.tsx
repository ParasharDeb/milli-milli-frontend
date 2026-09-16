import type { Metadata } from "next";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Staff sign in — Milli",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
