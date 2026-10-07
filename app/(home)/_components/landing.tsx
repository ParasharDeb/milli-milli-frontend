import { EveningTimeline } from "./evening-timeline";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Reservation } from "./reservation";
import { RoomSection } from "./room-section";
import { TableSection } from "./table-section";
import { WhatsOn } from "./whats-on";

/** The landing page's sections, shared by / and the numbered palette pages. */
export function Landing() {
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
