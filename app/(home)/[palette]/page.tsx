import type { Metadata } from "next";
import { Landing } from "../_components/landing";

/**
 * The landing page again, recoloured: /1 to /6 each pair #171717, #27364b,
 * #71583a and #d3c4ad differently. The colours live in home.css under
 * [data-palette]; this list only names the routes.
 */
const PALETTES = ["1", "2", "3", "4", "5", "6"];

export const dynamicParams = false;

export function generateStaticParams() {
  return PALETTES.map((palette) => ({ palette }));
}

export const metadata: Metadata = {
  title: "Milli Milli — Dinner is only the beginning",
  description:
    "Restaurant, bar and late nights in Kolkata. Good food, longer nights, and whatever happens next.",
  robots: { index: false },
};

export default async function PalettePage({ params }: PageProps<"/[palette]">) {
  const { palette } = await params;
  return (
    <div className="mm-palette" data-palette={palette}>
      <Landing />
    </div>
  );
}
