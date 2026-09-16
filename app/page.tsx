import { Footer } from "./components/footer";
import { Hero } from "./components/hero";
import { Marquee } from "./components/marquee";
import { Menu } from "./components/menu";
import { Nav } from "./components/nav";
import { Press } from "./components/press";
import { Reserve } from "./components/reserve";
import { Room } from "./components/room";
import { Signatures } from "./components/signatures";
import { Story } from "./components/story";
import { Testimonials } from "./components/testimonials";

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Press />
        <Story />
        <Marquee />
        <Signatures />
        <Menu />
        <Room />
        <Testimonials />
        <Reserve />
      </main>
      <Footer />
    </>
  );
}
