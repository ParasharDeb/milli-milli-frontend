import { Hero } from "@/app/components/hero";
import { Journal } from "@/app/components/journal";
import { Market } from "@/app/components/market";
import { Menu } from "@/app/components/menu";
import { Reserve } from "@/app/components/reserve";
import { Room } from "@/app/components/room";
import { Tonight } from "@/app/components/tonight";

export default function Page() {
  return (
    <>
      <Hero />
      <Tonight />
      <Market />
      <Menu />
      <Room />
      <Reserve />
      <Journal />
    </>
  );
}
