"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PixelBot } from "@/app/components/pixel-bot";
import {
  DIET_LABEL,
  isVeg,
  sendChat,
  spiceLabel,
  type MenuItem,
  type RecommendationGroup,
} from "@/app/lib/menu-api";
import { OPENING, reply, type Reply } from "./responses";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Message = {
  id: number;
  from: "bot" | "you";
  text: string;
  chips?: string[];
  link?: Reply["link"];
  /** Present when the backend answered with per-constraint recommendations. */
  groups?: RecommendationGroup[];
  /** Dishes the grounded answer drew on. */
  dishes?: MenuItem[];
  /** The backend could not be reached and this came from the bundled replies. */
  offline?: boolean;
};

/** Renders the **bold** and bullet lines the replies use. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((rawLine, i) => {
        const bullet = rawLine.startsWith("• ");
        const line = bullet ? rawLine.slice(2) : rawLine;
        if (!line.trim()) return <span key={i} className="block h-2.5" />;

        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        const body = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-medium">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          ),
        );

        return bullet ? (
          <span key={i} className="flex gap-2">
            <span aria-hidden className="text-ember">
              •
            </span>
            <span>{body}</span>
          </span>
        ) : (
          <span key={i} className="block">
            {body}
          </span>
        );
      })}
    </>
  );
}

function DishCard({ item }: { item: MenuItem }) {
  const heat = spiceLabel(item);
  const veg = isVeg(item);

  return (
    <li className="rounded-xl border border-line bg-parchment px-3.5 py-2.5">
      <p className="text-[14px] leading-snug font-medium">{item.name}</p>
      {item.desc && (
        <p className="mt-1 text-[12.5px] leading-snug text-muted">{item.desc}</p>
      )}
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] tracking-[0.12em] text-muted uppercase">
        <span className={veg ? "text-basil" : "text-ember"}>
          {DIET_LABEL[item.diet] ?? item.diet}
        </span>
        {/* Heat is omitted entirely when the kitchen data was never confident. */}
        {heat && (
          <>
            <span aria-hidden>·</span>
            <span>{heat}</span>
          </>
        )}
        <span aria-hidden>·</span>
        <span>{item.cuisine}</span>
      </p>
    </li>
  );
}

function GroupBlock({ group }: { group: RecommendationGroup }) {
  return (
    <div className="mt-3.5 first:mt-2">
      <p className="flex items-baseline gap-2 text-[11px] tracking-[0.14em] text-muted uppercase">
        <span className="h-px w-5 bg-ember" />
        {group.label}
        {group.count > 1 && (
          <span className="normal-case tracking-normal">· {group.count} guests</span>
        )}
      </p>

      {group.recommendations.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {group.recommendations.map((rec) => (
            <DishCard key={rec.item.id} item={rec.item} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted">
          Nothing on tonight&apos;s menu fits this one — we never swap a dietary
          requirement for something close.
        </p>
      )}

      {group.relaxations.length > 0 && (
        <p className="mt-2 text-[12px] text-muted italic">
          Widened the search to fill this one.
        </p>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1.5 py-1" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="h-1.5 w-1.5 rounded-full bg-forest"
        />
      ))}
    </span>
  );
}

function headline(groups: RecommendationGroup[], partySize: number): string {
  const filled = groups.filter((g) => g.recommendations.length > 0).length;
  if (filled === 0) return "I could not put anything together for that, I'm afraid.";
  const who = partySize > 0 ? ` for ${partySize}` : "";
  return `Here is what I would send out${who} — three options against each thing you asked for.`;
}

export function ChatRoom() {
  const reduced = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: OPENING.text, chips: OPENING.chips },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || thinking) return;

    setMessages((m) => [...m, { id: nextId.current++, from: "you", text }]);
    setDraft("");
    setThinking(true);

    try {
      const res = await sendChat(text);

      setMessages((m) => [
        ...m,
        res.kind === "recommendations"
          ? {
              id: nextId.current++,
              from: "bot",
              text: headline(res.groups, res.partySize),
              groups: res.groups,
              chips: ["Something spicier", "Anything vegetarian?", "What is in it?"],
              link: { href: "/reserve-table", label: "Book a table" },
            }
          : {
              id: nextId.current++,
              from: "bot",
              text: res.answer,
              dishes: res.dishes,
              chips: res.chips,
            },
      ]);
    } catch (error) {
      // The kitchen still has to answer. Fall back to the bundled replies rather
      // than showing a dead end, and say so instead of passing them off as live.
      console.error("[chat] backend unreachable:", error);
      const canned = reply(text);
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          from: "bot",
          text: canned.text,
          chips: canned.chips,
          link: canned.link,
          offline: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const last = messages[messages.length - 1];
  const lastChips = !thinking && last?.from === "bot" ? last.chips : undefined;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-cream shadow-xl shadow-ink/5">
      {/* header */}
      <div className="grain relative flex items-center gap-4 bg-forest px-5 py-4 text-cream sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-6 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.3),transparent_65%)] blur-xl"
        />
        <div className="relative shrink-0 rounded-xl bg-forest-deep/60 p-1.5">
          <PixelBot size={40} talking={thinking} />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="font-display text-lg leading-tight font-light">The pass</p>
          <p className="mt-0.5 flex items-center gap-2 text-[12px] text-cream/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            {thinking ? "reading the menu…" : "online · knows tonight's menu"}
          </p>
        </div>
        <Link
          href="/menu"
          className="relative hidden shrink-0 rounded-full border border-cream/25 px-4 py-2 text-[12px] transition-colors hover:border-amber hover:text-amber sm:block"
        >
          See the menu
        </Link>
      </div>

      {/* transcript */}
      <div
        ref={scroller}
        className="h-[min(62vh,34rem)] overflow-y-auto bg-parchment px-4 py-6 sm:px-6"
      >
        <ul className="space-y-5">
          {messages.map((m) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className={`flex gap-3 ${m.from === "you" ? "justify-end" : ""}`}
            >
              {m.from === "bot" && (
                <span className="mt-1 shrink-0 self-start rounded-lg bg-forest/10 p-1">
                  <PixelBot size={28} />
                </span>
              )}

              <div className={m.from === "you" ? "max-w-[82%]" : "max-w-[86%]"}>
                <div
                  className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.from === "bot"
                      ? "rounded-tl-sm border border-line bg-cream text-ink"
                      : "rounded-tr-sm bg-ink text-cream"
                  }`}
                >
                  <RichText text={m.text} />

                  {m.groups?.map((group) => (
                    <GroupBlock key={group.id} group={group} />
                  ))}

                  {m.dishes && m.dishes.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {m.dishes.map((dish) => (
                        <DishCard key={dish.id} item={dish} />
                      ))}
                    </ul>
                  )}

                  {m.offline && (
                    <p className="mt-3 border-t border-line pt-2 text-[12px] text-muted">
                      The kitchen service is unreachable, so that came from the
                      bundled menu rather than tonight&apos;s live data.
                    </p>
                  )}
                </div>

                {m.link && (
                  <Link
                    href={m.link.href}
                    className="group mt-2.5 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-amber hover:text-ink"
                  >
                    {m.link.label}
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </motion.li>
          ))}

          <AnimatePresence>
            {thinking && (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <span className="mt-1 shrink-0 self-start rounded-lg bg-forest/10 p-1">
                  <PixelBot size={28} talking />
                </span>
                <div className="rounded-2xl rounded-tl-sm border border-line bg-cream px-4 py-3">
                  <TypingDots />
                </div>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      </div>

      {/* suggestions + input */}
      <div className="border-t border-line bg-cream px-4 py-4 sm:px-6">
        <AnimatePresence mode="wait">
          {lastChips && lastChips.length > 0 && (
            <motion.div
              key={last!.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {lastChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => send(chip)}
                  className="rounded-full border border-line bg-parchment px-3.5 py-2 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  {chip}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="flex gap-2"
        >
          <label htmlFor="ask" className="sr-only">
            Ask about the menu
          </label>
          <input
            id="ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Try: 5 of us, 2 veg, 1 spicy non-veg…"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-line bg-parchment px-5 py-3.5 text-sm placeholder:text-muted/60 focus:border-ember focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || thinking}
            aria-label="Send"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </form>

        <p className="mt-3 text-[12px] text-muted">
          Answers come from tonight&apos;s actual menu — every dish is looked up
          before it is suggested, and heat is only quoted when the kitchen
          recorded it.
        </p>
      </div>
    </div>
  );
}
