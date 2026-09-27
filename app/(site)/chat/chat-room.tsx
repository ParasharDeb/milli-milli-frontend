"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";
import { PixelBot, PixelBotIdle } from "@/app/components/pixel-bot";
import { useCartDrawer } from "@/app/components/cart-drawer";
import {
  DIET_LABEL,
  isVeg,
  priceLabel,
  fetchFollowUp,
  sendChat,
  spiceLabel,
  type CartView,
  type Combo,
  type FollowUp,
  type MenuItem,
  type RecommendationGroup,
} from "@/app/lib/menu-api";
import { useCart } from "@/app/lib/cart-context";
import { OPENING, reply, type Reply } from "./responses";
import { ComboBlock } from "./combo-block";
import { AfterAddContext, useAfterAdd } from "./after-add";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;

type Message = {
  id: number;
  from: "bot" | "you";
  text: string;
  chips?: string[];
  link?: Reply["link"];
  /** Present when the backend answered with per-constraint recommendations. */
  groups?: RecommendationGroup[];
  /** Three adjustable combos. */
  combos?: Combo[];
  /** Dishes the grounded answer drew on. */
  dishes?: MenuItem[];
  /** The backend could not be reached and this came from the bundled replies. */
  offline?: boolean;
  /** Set on a reply that changed the order, so the confirmation can be shown. */
  cart?: CartView;
  added?: MenuItem[];
  /** Set when the backend refused to guess which dish was meant. */
  options?: { label: string; message: string; item: MenuItem }[];
};

/* A bot reply is written out line by line, then its cards deal in one after
   another. Children only name the variant, so the stagger flows down from the
   bubble through lists and groups without each one needing its own timing. */
const reveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const deal: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
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
          <motion.span key={i} variants={rise} className="flex gap-2">
            <span aria-hidden className="text-ember">
              •
            </span>
            <span>{body}</span>
          </motion.span>
        ) : (
          <motion.span key={i} variants={rise} className="block">
            {body}
          </motion.span>
        );
      })}
    </>
  );
}

function DishCard({ item }: { item: MenuItem }) {
  const heat = spiceLabel(item);
  const veg = isVeg(item);
  const price = priceLabel(item);
  const { add, busy } = useCart();
  const afterAdd = useAfterAdd();
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    await add(item.id);
    setAdded(true);
    afterAdd([item.id]);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.li
      variants={deal}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-line bg-parchment px-3.5 py-2.5 transition-shadow hover:shadow-md hover:shadow-ink/5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] leading-snug font-medium">{item.name}</p>
        {price && <span className="shrink-0 text-[13px] tabular-nums text-muted">{price}</span>}
      </div>
      {item.desc && (
        <p className="mt-1 text-[12.5px] leading-snug text-muted">{item.desc}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] tracking-[0.12em] text-muted uppercase">
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

        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={busy || added}
          whileTap={{ scale: 0.92 }}
          className={`relative shrink-0 overflow-hidden rounded-full border px-3 py-1 text-[11px] font-medium transition-colors disabled:cursor-default ${
            added
              ? "border-basil bg-basil text-cream"
              : "border-ink/15 text-ink/70 hover:border-ember hover:text-ember disabled:opacity-60"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={added ? "added" : "add"}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="block"
            >
              {added ? "Added ✓" : "Add to order"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.li>
  );
}

function GroupBlock({ group }: { group: RecommendationGroup }) {
  return (
    <motion.div variants={reveal} className="mt-4 first:mt-2">
      <motion.p
        variants={rise}
        className="flex items-baseline gap-2 text-[11px] tracking-[0.14em] text-muted uppercase"
      >
        <span className="h-px w-5 bg-ember" />
        {group.label}
        {group.count > 1 && (
          <span className="normal-case tracking-normal">· {group.count} guests</span>
        )}
      </motion.p>

      {group.recommendations.length > 0 ? (
        <motion.ul variants={reveal} className="mt-2 grid gap-2 sm:grid-cols-2">
          {group.recommendations.map((rec) => (
            <DishCard key={rec.item.id} item={rec.item} />
          ))}
        </motion.ul>
      ) : (
        <motion.p variants={rise} className="mt-2 text-[13px] text-muted">
          Nothing on tonight&apos;s menu fits this one — we never swap a dietary
          requirement for something close.
        </motion.p>
      )}

      {group.relaxations.length > 0 && (
        <motion.p variants={rise} className="mt-2 text-[12px] text-muted italic">
          Widened the search to fill this one.
        </motion.p>
      )}
    </motion.div>
  );
}

function DishList({ items }: { items: MenuItem[] }) {
  return (
    <motion.ul variants={reveal} className="mt-3 grid gap-2 sm:grid-cols-2">
      {items.map((dish) => (
        <DishCard key={dish.id} item={dish} />
      ))}
    </motion.ul>
  );
}

const THINKING = [
  "Reading tonight's menu…",
  "Asking the kitchen…",
  "Checking the heat levels…",
  "Plating up an answer…",
];

function Thinking() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % THINKING.length), 1700);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3" aria-label="Typing">
      <span className="flex items-center gap-1.5">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-forest"
          />
        ))}
      </span>
      <span className="relative h-5 overflow-hidden text-[13px] text-muted">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="shimmer block whitespace-nowrap"
          >
            {THINKING[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function headline(groups: RecommendationGroup[], partySize: number): string {
  const filled = groups.filter((g) => g.recommendations.length > 0).length;
  if (filled === 0) return "I could not put anything together for that, I'm afraid.";
  const who = partySize > 0 ? ` for ${partySize}` : "";
  return `Here is what I would send out${who} — three options against each thing you asked for.`;
}

/** Slow candlelit drift behind everything, so the room never looks static. */
function Backdrop() {
  const blobs = [
    { c: "rgba(233,163,25,0.22)", s: "w-[42rem] h-[42rem] -top-60 -left-40", x: [0, 80, -20, 0], y: [0, 40, 90, 0], d: 26 },
    { c: "rgba(26,122,86,0.14)", s: "w-[36rem] h-[36rem] top-1/3 -right-48", x: [0, -70, 10, 0], y: [0, 60, -40, 0], d: 32 },
    { c: "rgba(226,84,42,0.10)", s: "w-[30rem] h-[30rem] -bottom-40 left-1/4", x: [0, 60, -50, 0], y: [0, -50, 10, 0], d: 29 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          animate={{ x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute rounded-full blur-3xl ${b.s}`}
          style={{ background: `radial-gradient(circle, ${b.c}, transparent 65%)` }}
        />
      ))}
    </div>
  );
}

function CartButton() {
  const { open } = useCartDrawer();
  const { cart } = useCart();
  const count = cart?.totalItems ?? 0;

  return (
    <motion.button
      type="button"
      onClick={open}
      whileTap={{ scale: 0.9 }}
      aria-label={`Your order, ${count} items`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-amber hover:text-amber"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 6h2l2.4 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L20.5 9H6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.2" fill="currentColor" />
        <circle cx="17" cy="20" r="1.2" fill="currentColor" />
      </svg>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-medium tabular-nums text-cream"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  const words = ["Someone", "who", "has", "tasted", "everything."];

  return (
    <motion.div
      key="welcome"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -24, filter: "blur(8px)", transition: { duration: 0.35 } }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-10 text-center"
    >
      <motion.div variants={deal} className="relative">
        {/* two rings breathing out from the cook */}
        {[0, 1].map((r) => (
          <motion.span
            key={r}
            aria-hidden
            animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: r * 1.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-3xl border border-amber/60"
          />
        ))}
        <div className="relative rounded-3xl bg-forest p-4 shadow-2xl shadow-forest/25">
          <PixelBotIdle size={76} />
        </div>
      </motion.div>

      <motion.p variants={rise} className="eyebrow mt-8 text-muted">
        <span className="h-px w-8 bg-ember" />
        Ask the pass
        <span className="h-px w-8 bg-ember" />
      </motion.p>

      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,4.2rem)] leading-[1] font-light tracking-[-0.035em] text-balance">
        {words.map((w, i) => (
          <motion.span
            key={w}
            variants={rise}
            className={`inline-block ${i >= 3 ? "text-ember italic" : ""}`}
          >
            {w}
            {i < words.length - 1 && " "}
          </motion.span>
        ))}
      </h1>

      <motion.p
        variants={rise}
        className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted text-pretty"
      >
        Every dish going out tonight, what is in it, how hot it runs and what to
        order if you cannot decide. Ask in plain words.
      </motion.p>

      <motion.ul
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } } }}
        className="mt-9 grid w-full gap-2.5 sm:grid-cols-2"
      >
        {(OPENING.chips ?? []).map((chip, i) => (
          <motion.li key={chip} variants={deal}>
            <motion.button
              type="button"
              onClick={() => onPick(chip)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-cream/80 px-4 py-3.5 text-left text-[14.5px] backdrop-blur transition-[border-color,box-shadow] hover:border-ember/50 hover:shadow-lg hover:shadow-ember/10"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  ["bg-amber", "bg-basil", "bg-ember", "bg-terracotta"][i % 4]
                }`}
              />
              <span className="flex-1">{chip}</span>
              <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ember">
                →
              </span>
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>

      <motion.p variants={rise} className="mt-7 text-[12.5px] text-muted">
        Try something like <span className="text-ink">“5 of us, 2 veg, 1 spicy non-veg”</span>
      </motion.p>
    </motion.div>
  );
}

export function ChatRoom() {
  // A reply that changes the order carries the whole new cart, so the nav badge
  // updates from it rather than refetching.
  const { apply } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: OPENING.text, chips: OPENING.chips },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pinned, setPinned] = useState(true);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const started = messages.length > 1 || thinking;

  // Follow the conversation while the reader is at the bottom, but leave them
  // alone if they have scrolled up to reread something -- unless they just sent.
  useEffect(() => {
    const el = scroller.current;
    const last = messages[messages.length - 1];
    if (el && started && (pinned || last?.from === "you")) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, thinking]);

  // Grow the textarea with what is typed, up to a few lines.
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  function handleScroll() {
    const el = scroller.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }

  /**
   * The one "bread or rice with that?". It arrives as its own message after a
   * short pause, the way a waiter would ask once the order is written down.
   */
  function askFollowUp(followUp: FollowUp) {
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          from: "bot",
          text: followUp.question,
          dishes: followUp.options,
          chips: followUp.chips,
        },
      ]);
      setThinking(false);
    }, 800);
  }

  // A button add inside the chat. The backend decides whether to ask at all,
  // and says no to every call after the first.
  async function afterAdd(itemIds: string[]) {
    if (thinking || itemIds.length === 0) return;
    try {
      const { followUp } = await fetchFollowUp(itemIds);
      if (followUp) askFollowUp(followUp);
    } catch {
      // Not asking is the right failure for an upsell.
    }
  }

  function reset() {
    if (thinking) return;
    setMessages([{ id: nextId.current++, from: "bot", text: OPENING.text, chips: OPENING.chips }]);
    setDraft("");
    input.current?.focus();
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || thinking) return;

    setMessages((m) => [...m, { id: nextId.current++, from: "you", text }]);
    setDraft("");
    setThinking(true);
    let followUp: FollowUp | undefined;

    try {
      const res = await sendChat(text);
      const id = nextId.current++;
      let message: Message;

      switch (res.kind) {
        case "recommendations":
          message = {
            id,
            from: "bot",
            text: headline(res.groups, res.partySize),
            groups: res.groups,
            chips: ["Something spicier", "Anything vegetarian?", "Add the first one"],
            link: { href: "/reserve-table", label: "Book a table" },
          };
          break;

        // A composed suggestion. It reuses the recommendation group shape, so it
        // renders through exactly the same cards -- only the headline differs,
        // because here the kitchen actually wrote one.
        case "advice":
          message = {
            id,
            from: "bot",
            text: res.answer,
            groups: res.groups,
            chips: res.chips,
          };
          break;

        case "combos":
          message = {
            id,
            from: "bot",
            text: res.answer,
            combos: res.combos,
            chips: res.chips,
          };
          break;

        case "cart":
          apply(res.cart);
          message = {
            id,
            from: "bot",
            text: res.answer,
            cart: res.cart,
            added: res.changed,
            // The follow-up carries its own chips; the confirmation keeps none,
            // so "No thanks" only ever sits under the question it answers.
            chips: res.followUp ? undefined : res.chips,
          };
          break;

        // The backend would not guess between two dishes. Each option's message
        // is a ready-made reply, so tapping one resolves it on an exact name.
        case "clarify":
          message = {
            id,
            from: "bot",
            text: res.answer,
            options: res.options,
            chips: res.chips,
          };
          break;

        default:
          message = {
            id,
            from: "bot",
            text: res.answer,
            dishes: res.dishes,
            chips: res.chips,
          };
      }

      setMessages((m) => [...m, message]);
      if (res.kind === "cart") followUp = res.followUp;
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
      // A follow-up keeps the typing dots up until it lands.
      if (followUp) askFollowUp(followUp);
      else setThinking(false);
    }
  }

  const last = messages[messages.length - 1];
  const lastChips = started && !thinking && last?.from === "bot" ? last.chips : undefined;

  return (
    <AfterAddContext.Provider value={(ids) => void afterAdd(ids)}>
      <MotionConfig reducedMotion="user">
        <div className="relative flex h-dvh flex-col overflow-hidden bg-parchment">
          {/* top bar */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="grain relative z-20 shrink-0 bg-forest text-cream"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,163,25,0.28),transparent_65%)] blur-xl"
            />
            <div className="relative mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
              <Link
                href="/"
                className="group flex shrink-0 items-baseline gap-2 rounded-full py-1 pr-2"
                aria-label="Back to Milli"
              >
                <span className="text-cream/50 transition-transform group-hover:-translate-x-1">←</span>
                <span className="font-display text-xl leading-none tracking-[-0.02em] lowercase">
                  milli
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              </Link>

              <span className="h-6 w-px shrink-0 bg-cream/15" />

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative shrink-0 rounded-xl bg-forest-deep/70 p-1">
                  <PixelBot size={32} talking={thinking} />
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-forest bg-amber">
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber/70" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[17px] leading-tight font-light">The pass</p>
                  <div className="relative h-4 overflow-hidden text-[11.5px] text-cream/60">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p
                        key={thinking ? "t" : "o"}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className="truncate"
                      >
                        {thinking ? "typing…" : "online · knows tonight's menu"}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {started && (
                  <motion.button
                    type="button"
                    onClick={reset}
                    disabled={thinking}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    whileTap={{ scale: 0.94 }}
                    className="hidden shrink-0 rounded-full border border-cream/20 px-4 py-2 text-[12px] transition-colors hover:border-amber hover:text-amber disabled:opacity-40 sm:block"
                  >
                    New chat
                  </motion.button>
                )}
              </AnimatePresence>
              <Link
                href="/menu"
                className="hidden shrink-0 rounded-full border border-cream/20 px-4 py-2 text-[12px] transition-colors hover:border-amber hover:text-amber md:block"
              >
                See the menu
              </Link>
              <CartButton />
            </div>
          </motion.header>

          {/* transcript */}
          <div className="relative min-h-0 flex-1">
            <Backdrop />

            <div
              ref={scroller}
              onScroll={handleScroll}
              className="relative h-full overflow-y-auto overscroll-contain"
            >
              <AnimatePresence mode="wait">
                {!started ? (
                  <Welcome key="welcome" onPick={(t) => void send(t)} />
                ) : (
                  <motion.ul
                    key="thread"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-8 pb-10 sm:px-6"
                  >
                    {messages.map((m) =>
                      m.from === "you" ? (
                        <motion.li
                          key={m.id}
                          layout="position"
                          initial={{ opacity: 0, y: 18, x: 16, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                          transition={SPRING}
                          style={{ originX: 1, originY: 1 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-[15px] leading-relaxed text-cream shadow-lg shadow-ink/10 whitespace-pre-wrap">
                            {m.text}
                          </div>
                        </motion.li>
                      ) : (
                        <motion.li
                          key={m.id}
                          layout="position"
                          initial="hidden"
                          animate="show"
                          variants={reveal}
                          className="flex gap-3"
                        >
                          <motion.span
                            variants={{
                              hidden: { opacity: 0, scale: 0.6, rotate: -12 },
                              show: { opacity: 1, scale: 1, rotate: 0, transition: SPRING },
                            }}
                            className="mt-1 shrink-0 self-start rounded-lg bg-forest p-1 shadow-md shadow-forest/20"
                          >
                            <PixelBot size={26} />
                          </motion.span>

                          {/* Three combos side by side need the full row. */}
                          <div className={m.combos?.length || m.groups?.length ? "min-w-0 flex-1" : "min-w-0 max-w-[86%]"}>
                            <motion.div
                              variants={{
                                hidden: { opacity: 0, y: 10, scale: 0.98 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: { ...SPRING, staggerChildren: 0.07, delayChildren: 0.08 },
                                },
                              }}
                              style={{ originX: 0, originY: 0 }}
                              className="rounded-2xl rounded-tl-sm border border-line bg-cream/90 px-4 py-3 text-[15px] leading-relaxed text-ink shadow-sm shadow-ink/5 backdrop-blur"
                            >
                              <RichText text={m.text} />

                              {m.groups?.map((group) => (
                                <GroupBlock key={group.id} group={group} />
                              ))}

                              {m.combos && m.combos.length > 0 && (
                                <motion.div variants={deal}>
                                  <ComboBlock combos={m.combos} />
                                </motion.div>
                              )}

                              {m.dishes && m.dishes.length > 0 && <DishList items={m.dishes} />}

                              {m.options && m.options.length > 0 && (
                                <DishList items={m.options.map((o) => o.item)} />
                              )}

                              {m.added && m.added.length > 0 && (
                                <motion.div variants={reveal} className="mt-3 border-t border-line pt-1">
                                  <DishList items={m.added} />
                                </motion.div>
                              )}

                              {m.cart && m.cart.lines.length > 0 && (
                                <motion.p
                                  variants={rise}
                                  className="mt-3 border-t border-line pt-2 text-[12px] text-muted"
                                >
                                  In your order:{" "}
                                  {m.cart.lines.map((l) => `${l.qty} x ${l.item.name}`).join(", ")}
                                  {m.cart.subtotal != null &&
                                    ` · ₹${Math.round(m.cart.subtotal).toLocaleString("en-IN")}`}
                                </motion.p>
                              )}

                              {m.offline && (
                                <motion.p
                                  variants={rise}
                                  className="mt-3 border-t border-line pt-2 text-[12px] text-muted"
                                >
                                  The kitchen service is unreachable, so that came from the
                                  bundled menu rather than tonight&apos;s live data.
                                </motion.p>
                              )}
                            </motion.div>

                            {m.link && (
                              <motion.div variants={deal}>
                                <Link
                                  href={m.link.href}
                                  className="group mt-2.5 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-[13px] font-medium text-cream shadow-lg shadow-ember/20 transition-colors hover:bg-amber hover:text-ink"
                                >
                                  {m.link.label}
                                  <span className="transition-transform group-hover:translate-x-1">
                                    →
                                  </span>
                                </Link>
                              </motion.div>
                            )}
                          </div>
                        </motion.li>
                      ),
                    )}

                    <AnimatePresence>
                      {thinking && (
                        <motion.li
                          key="thinking"
                          layout="position"
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                          transition={SPRING}
                          style={{ originX: 0 }}
                          className="flex gap-3"
                        >
                          <span className="mt-1 shrink-0 self-start rounded-lg bg-forest p-1 shadow-md shadow-forest/20">
                            <PixelBot size={26} talking />
                          </span>
                          <div className="rounded-2xl rounded-tl-sm border border-line bg-cream/90 px-4 py-3 backdrop-blur">
                            <Thinking />
                          </div>
                        </motion.li>
                      )}
                    </AnimatePresence>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* jump back down after scrolling up */}
            <AnimatePresence>
              {started && !pinned && (
                <motion.button
                  type="button"
                  onClick={() =>
                    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })
                  }
                  initial={{ opacity: 0, y: 12, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.8 }}
                  transition={SPRING}
                  aria-label="Scroll to the latest message"
                  className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-cream px-4 py-2 text-[12px] text-ink shadow-lg shadow-ink/10 hover:border-ember"
                >
                  ↓ Latest
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* suggestions + composer */}
          <div className="relative z-10 shrink-0 border-t border-line bg-cream/85 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-4xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
              <AnimatePresence mode="wait">
                {lastChips && lastChips.length > 0 && (
                  <motion.div
                    key={last!.id}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } } }}
                    className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
                  >
                    {lastChips.map((chip) => (
                      <motion.button
                        key={chip}
                        type="button"
                        onClick={() => send(chip)}
                        variants={{
                          hidden: { opacity: 0, y: 10, scale: 0.9 },
                          show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="shrink-0 rounded-full border border-line bg-parchment px-3.5 py-2 text-[13px] whitespace-nowrap text-muted transition-colors hover:border-ember hover:text-ink"
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(draft);
                }}
                className="group relative flex items-end gap-2 rounded-[1.6rem] border border-line bg-parchment p-1.5 pl-5 shadow-sm transition-[border-color,box-shadow] duration-300 focus-within:border-ember/60 focus-within:shadow-[0_0_0_4px_rgba(226,84,42,0.10)]"
              >
                <label htmlFor="ask" className="sr-only">
                  Ask about the menu
                </label>
                <textarea
                  id="ask"
                  ref={input}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      void send(draft);
                    }
                  }}
                  placeholder="Try: 5 of us, 2 veg, 1 spicy non-veg…"
                  autoComplete="off"
                  className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 placeholder:text-muted/60 focus:outline-none"
                />
                <motion.button
                  type="submit"
                  disabled={!draft.trim() || thinking}
                  aria-label="Send"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.88 }}
                  animate={{
                    backgroundColor: draft.trim() && !thinking ? "#e2542a" : "#151210",
                    opacity: draft.trim() && !thinking ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.25 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cream disabled:cursor-not-allowed"
                >
                  <motion.svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    animate={{ rotate: draft.trim() ? -45 : 0 }}
                    transition={SPRING}
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.button>
              </form>

              <p className="mt-2 text-center text-[11px] text-muted">
                Answers come from tonight&apos;s actual menu — every dish is looked up
                before it is suggested, and heat is only quoted when the kitchen recorded it.
              </p>
            </div>
          </div>
        </div>
      </MotionConfig>
    </AfterAddContext.Provider>
  );
}
