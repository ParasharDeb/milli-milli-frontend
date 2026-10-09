import type { Metadata } from "next";
import { Landing } from "./_components/landing";

export const metadata: Metadata = {
  title: "Milli Milli — Dinner is only the beginning",
  description:
    "Restaurant, bar and late nights in Kolkata. Good food, longer nights, and whatever happens next.",
};

export default function HomePage() {
  return <Landing />;
}
