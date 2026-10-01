"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { dishImage } from "@/app/lib/dish-images";
import {
  priceLabel,
  fetchFollowUp,
  sendChat,
  type CartView,
  type Combo,
  type FollowUp,
  type MenuItem,
  type RecommendationGroup,
} from "@/app/lib/menu-api";
import { useCart } from "@/app/lib/cart-context";
import { useCartDrawer } from "@/app/components/cart-drawer";
import { imageFor } from "../menu/menu-adapter";
import { orderIntent } from "./order-intent";
import { OPENING, reply, type Reply } from "./responses";
import { MENU_CARDS, VIEW_MENU, quickPick } from "./quick-picks";
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
  /** Cards for things the cart cannot take, such as sheesha. */
  browseOnly?: boolean;
  /** Food / Drinks / Sheesha cards to browse the menu from. */
  menuCards?: boolean;
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

/* ------------------------------------------------------------ topics -- */

function TopicIcon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      {children}
    </svg>
  );
}

const S = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * The sidebar. "General" starts the conversation over; every other topic asks
 * its question as though the guest had typed it.
 */
const TOPICS: { id: string; title: string; sub: string; ask: string | null; icon: ReactNode }[] = [
  {
    id: "general",
    title: "General",
    sub: "Menu, reservations",
    ask: null,
    icon: (
      <TopicIcon>
        <path d="M5 6h14v9H9l-4 3.5V6Z" {...S} />
        <path d="M9 10h6" {...S} />
      </TopicIcon>
    ),
  },
  {
    id: "menu",
    title: "The Menu",
    sub: "Dishes, ingredients, allergies",
    ask: VIEW_MENU,
    icon: (
      <TopicIcon>
        <path d="M7 3v8m-2.5-8v4.5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1-3.5 3.5-3.5 7.5H17" {...S} />
      </TopicIcon>
    ),
  },
  {
    id: "reservations",
    title: "Reservations",
    sub: "Availability, group bookings",
    ask: "Is there a table for tonight?",
    icon: (
      <TopicIcon>
        <rect x="4" y="5" width="16" height="15" rx="2" {...S} />
        <path d="M4 10h16M8.5 3v4m7-4v4m-6 7.5 2 2 3.5-3.5" {...S} />
      </TopicIcon>
    ),
  },
];

/* ------------------------------------------------------------ pieces -- */

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

function Avatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[17px] text-cream">
      M
    </span>
  );
}

function GuestAvatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-ink/60">
      <svg aria-hidden width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.5" {...S} />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" {...S} />
      </svg>
    </span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d={dir === "left" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} {...S} />
    </svg>
  );
}

function DishCard({ item, browseOnly }: { item: MenuItem; browseOnly?: boolean }) {
  const price = priceLabel(item);
  const img = item.imageUrl ?? dishImage(item.name) ?? imageFor(item.name);
  const cutout = img?.startsWith("/img/menu/");
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
      className="w-[46%] shrink-0 snap-start overflow-hidden rounded-lg border border-line bg-[#fbf8f3] sm:w-[168px]"
    >
      <span className="relative block aspect-[4/3] bg-sand">
        {img ? (
          <Image
            src={img}
            alt={item.name}
            fill
            sizes="170px"
            className={cutout ? "bg-[#f4efe7] object-contain p-2" : "object-cover"}
          />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-3xl text-muted/50">
            {item.name.trim().charAt(0)}
          </span>
        )}
      </span>
      <span className="block px-3 pt-2.5 pb-3">
        <span className="block text-[12.5px] leading-snug font-medium">{item.name}</span>
        {item.desc && (
          <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted">{item.desc}</span>
        )}
        <span className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[12.5px] text-ember tabular-nums">{price ?? ""}</span>
          {!browseOnly && (
            <motion.button
              type="button"
              onClick={handleAdd}
              disabled={busy || added}
              whileTap={{ scale: 0.9 }}
              aria-label={added ? `${item.name} added` : `Add ${item.name} to your order`}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors disabled:cursor-default ${
                added
                  ? "border-basil bg-basil text-cream"
                  : "border-ink/15 text-ink/70 hover:border-ember hover:text-ember disabled:opacity-60"
              }`}
            >
              {added ? "Added ✓" : "+ Add"}
            </motion.button>
          )}
        </span>
      </span>
    </motion.li>
  );
}

/** A row of dish cards that scrolls sideways, with arrows once it overflows. */
function DishRow({ items, browseOnly }: { items: MenuItem[]; browseOnly?: boolean }) {
  const row = useRef<HTMLUListElement>(null);
  const scroll = (d: number) => row.current?.scrollBy({ left: d * 360, behavior: "smooth" });

  return (
    <div className="relative mt-3">
      <motion.ul
        ref={row}
        variants={reveal}
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto"
      >
        {items.map((dish) => (
          <DishCard key={dish.id} item={dish} browseOnly={browseOnly} />
        ))}
      </motion.ul>
      {/* four cards fit the desktop column; past that the row scrolls */}
      {items.length > 4 && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll dishes back"
            className="absolute top-[38%] -left-4 hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-cream shadow-sm transition-colors hover:border-ink sm:flex"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll dishes on"
            className="absolute top-[38%] -right-4 hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-cream shadow-sm transition-colors hover:border-ink sm:flex"
          >
            <Chevron dir="right" />
          </button>
        </>
      )}
    </div>
  );
}

function GroupBlock({ group }: { group: RecommendationGroup }) {
  return (
    <motion.div variants={reveal} className="mt-4 first:mt-2">
      <motion.p
        variants={rise}
        className="flex items-baseline gap-2 font-display text-[17px] font-light"
      >
        {group.label}
        {group.count > 1 && <span className="font-sans text-[12.5px] text-muted">· {group.count} guests</span>}
      </motion.p>

      {group.recommendations.length > 0 ? (
        <DishRow items={group.recommendations.map((r) => r.item)} />
      ) : (
        <motion.p variants={rise} className="mt-2 text-[13px] text-muted">
          Nothing on tonight&apos;s menu fits this one — we never swap a dietary requirement for
          something close.
        </motion.p>
      )}

      {group.relaxations.length > 0 && (
        <motion.p variants={rise} className="mt-2 text-[12px] text-muted">
          Widened the search to fill this one.
        </motion.p>
      )}
    </motion.div>
  );
}

function MenuCards({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  return (
    <motion.ul variants={reveal} className="mt-3 grid gap-2 sm:grid-cols-3">
      {MENU_CARDS.map((card) => (
        <motion.li key={card.label} variants={deal}>
          <motion.button
            type="button"
            onClick={() => onPick(card.label)}
            disabled={disabled}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group flex w-full items-center gap-3 rounded-lg border border-line bg-[#fbf8f3] px-3.5 py-3 text-left transition-colors hover:border-ember/50 disabled:cursor-default disabled:opacity-60"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${card.dot}`} />
            <span className="flex-1">
              <span className="block text-[13.5px] leading-snug font-medium">{card.label}</span>
              <span className="block text-[11.5px] text-muted">{card.note}</span>
            </span>
            <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ember">→</span>
          </motion.button>
        </motion.li>
      ))}
    </motion.ul>
  );
}

/**
 * The replies a guest can tap, as cards in the thread -- not pills stacked on
 * the input, where they read as part of the composer. Same card as the menu
 * picker, so every question the kitchen asks looks like one.
 */
function ReplyCards({
  chips,
  onPick,
  disabled,
}: {
  chips: string[];
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <motion.ul variants={reveal} className="mt-4 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
      {chips.map((chip) => {
        const decline = /^no\b/i.test(chip);
        return (
          <motion.li key={chip} variants={deal}>
            <motion.button
              type="button"
              onClick={() => onPick(chip)}
              disabled={disabled}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group flex w-full items-center gap-3 rounded-lg border border-line bg-cream px-3.5 py-2.5 text-left transition-colors hover:border-ember/50 disabled:cursor-default disabled:opacity-60"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${decline ? "bg-ink/25" : "bg-ember"}`} />
              <span className={`flex-1 text-[13px] leading-snug ${decline ? "text-ink/70" : "font-medium"}`}>
                {chip}
              </span>
              <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ember">→</span>
            </motion.button>
          </motion.li>
        );
      })}
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
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-ember"
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

/** The dishes a reply put in front of the guest, whichever way it showed them. */
function shownDishes(m: Message): MenuItem[] {
  if (m.added?.length) return m.added;
  if (m.dishes?.length) return m.dishes;
  if (m.options?.length) return m.options.map((o) => o.item);
  if (m.groups?.length) return m.groups.flatMap((g) => g.recommendations.map((r) => r.item));
  return [];
}

/** Once something is in the order, "Place my order" is always one tap away. */
function withPlaceOrder(chips: string[] | undefined, cart: CartView): string[] | undefined {
  if (cart.totalItems === 0) return chips;
  const rest = (chips ?? []).filter((c) => !orderIntent(c));
  return ["Place my order", ...rest];
}

function opening(id: number): Message {
  return { id, from: "bot", text: OPENING.text, chips: OPENING.chips };
}

/* -------------------------------------------------------------- room -- */

export function ChatRoom() {
  // A reply that changes the order carries the whole new cart, so the nav badge
  // updates from it rather than refetching.
  const { apply, add, cart } = useCart();
  const { placeOrder } = useCartDrawer();
  const [messages, setMessages] = useState<Message[]>([opening(0)]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [topic, setTopic] = useState("general");
  const nextId = useRef(1);
  const end = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLUListElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const started = messages.length > 1 || thinking;

  /**
   * How far the latest message sits below the visible area, which ends at the
   * top of the composer pinned to the bottom of the window. The conversation
   * scrolls with the page rather than inside a box of its own.
   */
  function overhang() {
    const el = end.current;
    if (!el) return 0;
    const visibleBottom = window.innerHeight - (composer.current?.offsetHeight ?? 0);
    return el.getBoundingClientRect().bottom - visibleBottom;
  }

  function scrollToLatest() {
    const by = overhang() + 16;
    // Only ever scroll down to it; a short conversation needs no jump.
    if (by > 0) window.scrollBy({ top: by, behavior: "smooth" });
  }

  // Follow the conversation while the reader is at the bottom, but leave them
  // alone if they have scrolled up to reread something -- unless they just sent.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (started && (pinned || last?.from === "you")) scrollToLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, thinking]);

  // Replies keep changing height after they land: images load, chips arrive,
  // the typing dots fade out. While the reader is at the latest message, keep
  // it sitting just above the composer through all of that.
  const follow = useRef({ pinned, started });
  useEffect(() => {
    follow.current = { pinned, started };
  }, [pinned, started]);
  useEffect(() => {
    const el = thread.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!follow.current.pinned || !follow.current.started) return;
      const by = overhang() + 16;
      if (Math.abs(by) < 400) window.scrollBy({ top: by });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = () => setPinned(overhang() < 80);
    track();
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("resize", track);
    return () => {
      window.removeEventListener("scroll", track);
      window.removeEventListener("resize", track);
    };
  }, []);

  // Grow the textarea with what is typed, up to a few lines.
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

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
    setMessages([opening(nextId.current++)]);
    setDraft("");
    input.current?.focus();
  }

  function pickTopic(t: (typeof TOPICS)[number]) {
    if (thinking) return;
    setTopic(t.id);
    if (t.ask) void send(t.ask);
    else reset();
  }

  /**
   * Orders from the conversation. "Order this" right after a reply that showed
   * exactly one dish means that dish, so it goes in first; with several on
   * screen and none of them in the order yet, Milli asks which.
   */
  /**
   * The latest reply that put dishes in front of the guest, looking back past
   * Milli's own "which one?" (which only carries chips) but not far.
   */
  function lastShown(): { lastBot?: Message; shown: MenuItem[] } {
    const recent = messages.filter((m) => m.from === "bot").slice(-3).reverse();
    for (const m of recent) {
      const shown = shownDishes(m);
      if (shown.length) return { lastBot: m, shown };
    }
    return { shown: [] };
  }

  async function placeFromChat(refersToShown: boolean) {
    try {
      const { lastBot, shown } = lastShown();
      const inCart = (id: string) =>
        cart?.lines.some((l) => l.item.id === id) || lastBot?.added?.some((a) => a.id === id);

      if (refersToShown && shown.length === 1 && !inCart(shown[0].id)) await add(shown[0].id);

      // Rather than guess, and rather than placing whatever else is in the cart.
      if (refersToShown && shown.length > 1 && !shown.some((d) => inCart(d.id))) {
        say(
          "Happy to — which one should I order?",
          shown.slice(0, 3).map((d) => `Order ${d.name}`),
        );
        return;
      }

      await announceOrder();
    } catch (error) {
      orderFailed(error);
    }
  }

  /**
   * "Add X" or "Order X" naming, exactly, a dish the last reply showed. Handled
   * here by id, because the backend can ask "which one?" again for a name that
   * prefixes another dish's ("Paneer Tikka" / "Paneer Tikka Butter Masala").
   */
  function shownPick(text: string): { dish: MenuItem; place: boolean } | null {
    const match = /^(add|order)\s+(?:the\s+)?(.+?)[.!]*$/i.exec(text);
    if (!match) return null;
    const name = match[2].toLowerCase();
    const dish = lastShown().shown.find((d) => d.name.toLowerCase() === name);
    return dish ? { dish, place: match[1].toLowerCase() === "order" } : null;
  }

  async function orderShown({ dish, place }: { dish: MenuItem; place: boolean }) {
    try {
      await add(dish.id);
      if (place) await announceOrder();
      else say(`Added **${dish.name}** to your order.`, ["Place my order", "Something to drink?"]);
    } catch (error) {
      orderFailed(error);
    }
  }

  function say(text: string, chips?: string[]) {
    setMessages((m) => [...m, { id: nextId.current++, from: "bot", text, chips }]);
  }

  async function announceOrder() {
    const order = await placeOrder();
    if (!order) {
      say(
        "There's nothing in your order yet. Tell me what you'd like — say **add paneer tikka**, or ask for a suggestion — and I'll place it.",
        ["Suggest something", VIEW_MENU],
      );
      return;
    }

    const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
    const lines = order.lines.map(
      (l) => `• ${l.qty > 1 ? `${l.qty}× ` : ""}${l.item.name}${l.lineTotal != null ? ` — ${rupees(l.lineTotal)}` : ""}`,
    );
    const total = order.subtotal != null ? `\n\n**Total: ${rupees(order.subtotal)}**` : "";
    say(`Done — your order is placed. 🎉\n\n${lines.join("\n")}${total}\n\nThe kitchen has it. Anything else?`, [
      "Something to drink?",
      "Dessert ideas",
    ]);
  }

  function orderFailed(error: unknown) {
    console.error("[chat] placing the order failed:", error);
    say("I couldn't place the order just now — the kitchen isn't answering. Try again in a moment?", [
      "Place my order",
    ]);
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || thinking) return;

    setMessages((m) => [...m, { id: nextId.current++, from: "you", text }]);
    setDraft("");
    setThinking(true);
    let followUp: FollowUp | undefined;

    // Ordering is answered here: "yes, order this for me" places the order,
    // which the backend cannot do, and a dish picked by its exact name goes in
    // by id.
    const pick = shownPick(text);
    const intent = pick ? null : orderIntent(text);
    if (pick || intent) {
      if (pick) await orderShown(pick);
      else if (intent) await placeFromChat(intent.refersToShown);
      setThinking(false);
      return;
    }

    // The start-menu buttons are answered locally, with a fresh random pick.
    try {
      const picked = await quickPick(text);
      if (picked) {
        setMessages((m) => [...m, { id: nextId.current++, from: "bot", ...picked }]);
        setThinking(false);
        return;
      }
    } catch (error) {
      // The menu could not be fetched; let the backend have a go instead.
      console.error("[chat] quick pick failed:", error);
    }

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
          message = { id, from: "bot", text: res.answer, groups: res.groups, chips: res.chips };
          break;

        case "combos":
          message = { id, from: "bot", text: res.answer, combos: res.combos, chips: res.chips };
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
            chips: res.followUp ? undefined : withPlaceOrder(res.chips, res.cart),
          };
          break;

        // The backend would not guess between two dishes. Each option's message
        // is a ready-made reply, so tapping one resolves it on an exact name.
        case "clarify":
          message = { id, from: "bot", text: res.answer, options: res.options, chips: res.chips };
          break;

        default:
          message = { id, from: "bot", text: res.answer, dishes: res.dishes, chips: res.chips };
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

  return (
    <AfterAddContext.Provider value={(ids) => void afterAdd(ids)}>
      <MotionConfig reducedMotion="user">
        <section id="concierge" className="scroll-mt-16 bg-cream">
          <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-5 py-10 md:px-10 lg:grid-cols-[250px_1fr] lg:gap-10 lg:py-14">
            {/* topics */}
            <nav aria-label="Topics" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0">
                {TOPICS.map((t) => {
                  const on = t.id === topic;
                  return (
                    <li key={t.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => pickTopic(t)}
                        disabled={thinking}
                        aria-pressed={on}
                        className={`relative flex w-full items-center gap-3.5 rounded-full px-4 py-2.5 text-left transition-colors disabled:cursor-default lg:rounded-2xl lg:px-5 lg:py-3.5 ${
                          on ? "text-cream" : "text-ink/80 hover:bg-sand/70"
                        } max-lg:border max-lg:border-line`}
                      >
                        {on && (
                          <motion.span
                            layoutId="chat-topic"
                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                            className="absolute inset-0 rounded-full bg-ink lg:rounded-2xl"
                          />
                        )}
                        <span className="relative">{t.icon}</span>
                        <span className="relative">
                          <span className="block text-[13px] leading-tight whitespace-nowrap">{t.title}</span>
                          <span
                            className={`mt-0.5 hidden text-[11px] leading-tight lg:block ${
                              on ? "text-cream/60" : "text-muted"
                            }`}
                          >
                            {t.sub}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* conversation */}
            <div className="relative flex min-w-0 flex-col">
              <div className="min-h-[45svh]">
                <ul ref={thread} className="space-y-6 pb-6 sm:pr-5">
                  {messages.map((m) => {
                    if (m.from === "you") {
                      return (
                        <motion.li
                          key={m.id}
                          layout="position"
                          initial={{ opacity: 0, y: 18, x: 16, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                          transition={SPRING}
                          style={{ originX: 1, originY: 1 }}
                          className="flex items-end justify-end gap-3"
                        >
                          <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed text-cream whitespace-pre-wrap">
                            {m.text}
                          </div>
                          <GuestAvatar />
                        </motion.li>
                      );
                    }

                    const isLast = m === last;
                    const chips = isLast && !thinking ? m.chips : undefined;
                    const wide = Boolean(
                      m.combos?.length || m.groups?.length || m.dishes?.length || m.options?.length || m.added?.length,
                    );

                    return (
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
                            hidden: { opacity: 0, scale: 0.6 },
                            show: { opacity: 1, scale: 1, transition: SPRING },
                          }}
                          className="self-start"
                        >
                          <Avatar />
                        </motion.span>

                        <div className={wide ? "min-w-0 flex-1" : "min-w-0 max-w-[82%] sm:max-w-[70%]"}>
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
                            className="rounded-2xl rounded-tl-sm border border-line bg-[#fbf8f3] px-5 py-4 text-[13.5px] leading-relaxed text-ink"
                          >
                            <RichText text={m.text} />

                            {m.groups?.map((group) => <GroupBlock key={group.id} group={group} />)}

                            {m.combos && m.combos.length > 0 && (
                              <motion.div variants={deal}>
                                <ComboBlock combos={m.combos} />
                              </motion.div>
                            )}

                            {m.dishes && m.dishes.length > 0 && <DishRow items={m.dishes} browseOnly={m.browseOnly} />}

                            {m.menuCards && <MenuCards onPick={(t) => void send(t)} disabled={thinking} />}

                            {m.options && m.options.length > 0 && <DishRow items={m.options.map((o) => o.item)} />}

                            {m.added && m.added.length > 0 && (
                              <motion.div variants={reveal} className="mt-3 border-t border-line pt-1">
                                <DishRow items={m.added} />
                              </motion.div>
                            )}

                            {m.cart && m.cart.lines.length > 0 && (
                              <motion.p variants={rise} className="mt-3 border-t border-line pt-2 text-[12px] text-muted">
                                In your order: {m.cart.lines.map((l) => `${l.qty} x ${l.item.name}`).join(", ")}
                                {m.cart.subtotal != null && ` · ₹${Math.round(m.cart.subtotal).toLocaleString("en-IN")}`}
                              </motion.p>
                            )}

                            {m.offline && (
                              <motion.p variants={rise} className="mt-3 border-t border-line pt-2 text-[12px] text-muted">
                                The kitchen service is unreachable, so that came from the bundled menu rather than
                                tonight&apos;s live data.
                              </motion.p>
                            )}

                            {chips && chips.length > 0 && (
                              <ReplyCards chips={chips} onPick={(t) => void send(t)} disabled={thinking} />
                            )}
                          </motion.div>

                          {m.link && (
                            <motion.div variants={deal}>
                              <Link
                                href={m.link.href}
                                className="group mt-2.5 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-[12.5px] font-medium text-cream transition-colors hover:bg-ink"
                              >
                                {m.link.label}
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                              </Link>
                            </motion.div>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}

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
                        <Avatar />
                        <div className="rounded-2xl rounded-tl-sm border border-line bg-[#fbf8f3] px-5 py-3.5">
                          <Thinking />
                        </div>
                      </motion.li>
                    )}
                  </AnimatePresence>
                </ul>
                <div ref={end} aria-hidden />
              </div>

              {/* composer, pinned to the bottom of the window while the chat is on screen */}
              <div
                ref={composer}
                className="sticky bottom-0 z-10 -mx-2 bg-gradient-to-t from-cream from-80% to-cream/0 px-2 pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                {/* jump back down after scrolling up */}
                <AnimatePresence>
                  {started && !pinned && (
                    <motion.button
                      type="button"
                      onClick={scrollToLatest}
                      initial={{ opacity: 0, y: 12, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.8 }}
                      transition={SPRING}
                      aria-label="Scroll to the latest message"
                      className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-cream px-4 py-2 text-[12px] text-ink shadow-lg shadow-ink/10 hover:border-ember"
                    >
                      ↓ Latest
                    </motion.button>
                  )}
                </AnimatePresence>
  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send(draft);
                    }}
                    className="flex items-end gap-2 rounded-[1.75rem] border border-line bg-[#fbf8f3] py-1.5 pr-1.5 pl-5 shadow-[0_10px_30px_-24px_rgba(28,20,15,0.5)] transition-[border-color,box-shadow] focus-within:border-ember/60 focus-within:shadow-[0_0_0_4px_rgba(216,90,43,0.10)]"
                  >
                    <svg aria-hidden width="19" height="19" viewBox="0 0 24 24" fill="none" className="mb-3 shrink-0 text-ink/50">
                      <path d="M5 6h14v9H9l-4 3.5V6Z" {...S} />
                    </svg>
                    <label htmlFor="ask" className="sr-only">
                      Ask anything about Milli
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
                      placeholder="Ask anything about Milli…"
                      autoComplete="off"
                      className="max-h-36 min-w-0 flex-1 resize-none bg-transparent py-3 text-[14px] leading-6 placeholder:text-muted/70 focus:outline-none"
                    />
                    <motion.button
                      type="submit"
                      disabled={!draft.trim() || thinking}
                      aria-label="Send"
                      whileTap={{ scale: 0.9 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cream transition-colors disabled:cursor-not-allowed ${
                        draft.trim() && !thinking ? "bg-ember" : "bg-ink"
                      }`}
                    >
                      <Chevron dir="right" />
                    </motion.button>
                  </form>
                  <p className="mt-2.5 text-center text-[11px] text-muted">
                    Milli can make mistakes. For critical information, please confirm with our team.
                  </p>
              </div>
            </div>
          </div>
        </section>
      </MotionConfig>
    </AfterAddContext.Provider>
  );
}
