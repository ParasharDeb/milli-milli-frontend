import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Inter, Manrope, Nothing_You_Could_Do } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// The house type: display serif, UI sans and the margin-note hand.
const display = Cormorant_Garamond({
  variable: "--font-mm-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const ui = Manrope({
  variable: "--font-mm-ui",
  subsets: ["latin"],
});

const hand = Nothing_You_Could_Do({
  variable: "--font-mm-hand",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Milli Milli — A small kitchen that cooks the morning market",
  description:
    "Twelve tables. One menu, rewritten every day from what the growers and the markets bring in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${display.variable} ${ui.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
