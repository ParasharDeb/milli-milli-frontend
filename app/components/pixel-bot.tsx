"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * 16×16 pixel-art line cook, drawn as one <rect> per pixel so it stays crisp
 * at any size and picks up the site palette instead of a flat PNG.
 */
const SPRITE = [
  "................",
  ".....WWWWWW.....",
  "....WWWWWWWW....",
  "...WWWWWWWWWW...",
  "...WWWWWWWWWW...",
  "....SSSSSSSS....",
  "..DDDDDDDDDDDD..",
  ".DBBBBBBBBBBBBD.",
  ".DBEEBBBBBBEEBD.",
  ".DBEEBBBBBBEEBD.",
  ".DBBBBBBBBBBBBD.",
  ".DBBBBOOOOBBBBD.",
  ".DBBBBBBBBBBBBD.",
  ".DDDDDDDDDDDDDD.",
  "...DAAAAAAAAD...",
  "...DAAAAAAAAD...",
];

const PALETTE: Record<string, string> = {
  W: "#faf6ef", // toque
  S: "#e2d6c3", // hat band
  D: "#07281f", // outline
  B: "#0c3a2d", // face
  E: "#e9a319", // eyes
  O: "#e2542a", // mouth
  A: "#c2603c", // neckerchief
};

/** Eye pixels, reused to draw the blink. */
const EYES = [
  [3, 8],
  [4, 8],
  [3, 9],
  [4, 9],
  [11, 8],
  [12, 8],
  [11, 9],
  [12, 9],
];

const MOUTH = [
  [6, 11],
  [7, 11],
  [8, 11],
  [9, 11],
];

export function PixelBot({
  size = 48,
  talking = false,
  className,
}: {
  size?: number;
  talking?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Milli's pixel-art line cook"
    >
      {SPRITE.map((row, y) =>
        row.split("").map((char, x) => {
          const fill = PALETTE[char];
          if (!fill) return null;
          return (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
          );
        }),
      )}

      {/* blink: face-coloured pixels dropped over the eyes now and then */}
      {!reduced && (
        <motion.g
          animate={{ opacity: [0, 0, 0, 1, 0] }}
          transition={{
            duration: 4.4,
            times: [0, 0.82, 0.9, 0.94, 1],
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {EYES.map(([x, y]) => (
            <rect
              key={`lid-${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE.B}
            />
          ))}
        </motion.g>
      )}

      {/* talking: the mouth flickers while a reply is being written */}
      {talking && !reduced && (
        <motion.g
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {MOUTH.map(([x, y]) => (
            <rect
              key={`mouth-${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE.B}
            />
          ))}
        </motion.g>
      )}
    </svg>
  );
}

/** The bot with a gentle idle bob, for the page header. */
export function PixelBotIdle({
  size = 96,
  talking = false,
}: {
  size?: number;
  talking?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block"
    >
      <PixelBot size={size} talking={talking} />
    </motion.div>
  );
}
