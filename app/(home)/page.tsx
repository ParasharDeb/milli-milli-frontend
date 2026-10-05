import type { Metadata } from "next";
import { EveningTimeline } from "./_components/evening-timeline";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Reservation } from "./_components/reservation";
import { RoomSection } from "./_components/room-section";
import { TableSection } from "./_components/table-section";
import { WhatsOn } from "./_components/whats-on";

export const metadata: Metadata = {
  title: "Milli Milli — Dinner is only the beginning",
  description:
    "Restaurant, bar and late nights in Guwahati. Good food, longer nights, and whatever happens next.",
};

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <TableSection />
        <RoomSection />
        <EveningTimeline />
        <WhatsOn />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
