import type { Metadata } from "next";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Confirm your number — Milli",
  description: "Enter the six-digit code we sent to your phone.",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return <VerifyForm />;
}
