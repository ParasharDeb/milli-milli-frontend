"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/img/milli/hero-indoor.webp", alt: "The dining room at night, lamps lit on every table", focus: "60% 55%" },
  { src: "/img/milli/room-cave.webp", alt: "The cave lounge, its carved walls glowing behind the banquettes", focus: "55% 45%" },
  { src: "/img/milli/room-lounge.webp", alt: "The lounge under crystal chandeliers", focus: "62% 50%" },
];

const INTERVAL = 7000;

/** The hero photograph and its 01 / 02 / 03 counter. */
export function HeroSlides() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <>
      <div className="mm-hero__media">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            aria-hidden={i !== index}
            fill
            priority={i === 0}
            sizes="100vw"
            data-active={i === index || undefined}
            style={{ objectPosition: slide.focus }}
          />
        ))}
      </div>

      <ol className="mm-hero__count" aria-label="Photographs">
        {SLIDES.map((slide, i) => (
          <li key={slide.src}>
            <button
              type="button"
              aria-label={`Show photograph ${i + 1} of ${SLIDES.length}`}
              aria-current={i === index || undefined}
              onClick={() => {
                setIndex(i);
                setPaused(true);
              }}
            >
              0{i + 1}
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
