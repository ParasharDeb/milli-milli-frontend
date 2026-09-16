import { Hero } from "@/app/components/hero";
import { Marquee } from "@/app/components/marquee";
import { Menu } from "@/app/components/menu";
import { Press } from "@/app/components/press";
import { Reserve } from "@/app/components/reserve";
import { Room } from "@/app/components/room";
import { Signatures } from "@/app/components/signatures";
import { Story } from "@/app/components/story";
import { Testimonials } from "@/app/components/testimonials";

export default function Page() {
  return (
    <>
      <Hero />
      <Press />
      <Story />
      <Marquee />
      <Signatures />
      <Menu />
      <Room />
      <Testimonials />
      <Reserve />
    </>
  );
}
