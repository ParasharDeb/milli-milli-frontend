import { CATEGORIES, type Dish } from "../menu/menu-data";

/**
 * Canned replies for the demo. There is no model behind this — it keyword-
 * matches against the same menu data the /menu page renders, so the answers
 * stay true to the actual dishes, prices and heat levels.
 *
 * Swap `reply()` for an API call when you want this to think for itself.
 */

export type Reply = {
  text: string;
  /** Follow-up suggestions rendered as chips under the message. */
  chips?: string[];
  link?: { href: string; label: string };
};

const ALL: { dish: Dish; category: string }[] = CATEGORIES.flatMap((c) =>
  c.items.map((dish) => ({ dish, category: c.label })),
);

const HEAT_WORD = ["not spicy at all", "gently spiced", "properly spicy", "hot"];

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function describe(dish: Dish, category: string): Reply {
  const heat =
    dish.spice === 0
      ? "There is no chilli heat in it."
      : `Heat-wise it is ${HEAT_WORD[dish.spice]} — ${dish.spice} out of 3.`;

  return {
    text: `**${dish.name}** — ${inr(dish.price)}, from the ${category.toLowerCase()}.\n\n${dish.desc}\n\n${heat}${
      dish.tags.includes("Vegetarian") ? " It is vegetarian." : ""
    }`,
    chips: ["What goes well with it?", "Anything vegetarian?", "Book a table"],
  };
}

function list(items: { dish: Dish; category?: string }[]) {
  return items
    .map(({ dish }) => `• ${dish.name} — ${inr(dish.price)}`)
    .join("\n");
}

function findDish(text: string) {
  // Longest name first so "prawn biryani" beats a bare "biryani".
  const sorted = [...ALL].sort((a, b) => b.dish.name.length - a.dish.name.length);

  for (const entry of sorted) {
    const words = entry.dish.name
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (words.some((w) => text.includes(w))) return entry;
  }
  return null;
}

export function reply(input: string): Reply {
  const text = input.toLowerCase().trim();

  if (!text) {
    return { text: "Ask me anything about tonight's menu." };
  }

  if (/^(hi|hey|hello|yo|namaste|good (morning|evening))\b/.test(text)) {
    return {
      text: "Hello. I am the pass — I know what is on tonight and roughly how hot it is. What are you after?",
      chips: [
        "What's in the biryani?",
        "Anything vegetarian?",
        "What's the least spicy thing?",
      ],
    };
  }

  if (/\b(thanks|thank you|cheers|ta)\b/.test(text)) {
    return {
      text: "Any time. Come hungry.",
      chips: ["Book a table"],
    };
  }

  if (/\b(book|reserve|table|reservation|availability)\b/.test(text)) {
    return {
      text: "We keep twelve tables and one seating a night, Wednesday to Sunday. Six counter stools are held back for walk-ins from 18:30.",
      link: { href: "/reserve-table", label: "Reserve a table" },
      chips: ["What should I order for two?"],
    };
  }

  if (/\b(vegetarian|veggie|veg\b|no meat|meat free)\b/.test(text)) {
    const veg = ALL.filter((e) => e.dish.tags.includes("Vegetarian"));
    return {
      text: `Half the menu is vegetarian. Tonight that is:\n\n${list(veg)}\n\nThe dal makhani is the one people come back for.`,
      chips: ["Tell me about the dal makhani", "Anything vegan?"],
    };
  }

  if (/\b(vegan|dairy free|no dairy)\b/.test(text)) {
    return {
      text: "Only the tandoori roti is vegan as it stands — nearly everything else sees butter, ghee or cream at some point.\n\nTell the kitchen when you book and they will put together a vegan version of the grain and vegetable dishes.",
      link: { href: "/reserve-table", label: "Book and leave a note" },
    };
  }

  if (/\b(spicy|spice|hot|heat|mild|chilli|chili)\b/.test(text)) {
    const hottest = [...ALL].sort((a, b) => b.dish.spice - a.dish.spice)[0];
    const mild = ALL.filter((e) => e.dish.spice === 0);
    return {
      text: `The hottest thing on tonight is **${hottest.dish.name}** — ${HEAT_WORD[hottest.dish.spice]}, 3 out of 3.\n\nAt the other end, these carry no chilli heat at all:\n\n${list(mild)}\n\nThe kitchen will dial heat down on most things if you ask.`,
      chips: ["Tell me about the meen curry", "What's the mildest rice dish?"],
    };
  }

  if (/\b(price|cost|how much|expensive|cheap|budget)\b/.test(text)) {
    const prices = ALL.map((e) => e.dish.price);
    return {
      text: `Dishes run from ${inr(Math.min(...prices))} for a tandoori roti to ${inr(Math.max(...prices))} for the prawn biryani.\n\nIf you would rather not choose, the full thali is ₹5,400 a head and the kitchen sends everything.`,
      link: { href: "/menu", label: "See the full menu" },
    };
  }

  if (/\b(recommend|suggest|what should|order for|best|favourite|favorite)\b/.test(text)) {
    return {
      text: "For two people I would send:\n\n• Murgh makhani — ₹640\n• Dal makhani — ₹480\n• Butter naan and a laccha paratha — ₹260\n• Gulab jamun to finish — ₹260\n\nThat is about ₹1,640 for the table and nobody leaves hungry. Add the bream-sized biryani if you are three or more.",
      chips: ["Anything vegetarian?", "How spicy is that?", "Book a table"],
    };
  }

  if (/\b(allerg|nut|gluten|peanut|shellfish)\b/.test(text)) {
    return {
      text: "Tell us when you book and we will work around almost anything — the menu is rewritten daily, so there is usually room to move.\n\nWorth flagging: the biryani and several sweets carry tree nuts, and the prawn dishes share a pan with other shellfish.",
      link: { href: "/reserve-table", label: "Book and leave a note" },
    };
  }

  // A whole category?
  for (const category of CATEGORIES) {
    const key = category.label.toLowerCase().split(" ")[0];
    const singular = key.replace(/s$/, "");
    if (
      text.includes(key) ||
      text.includes(singular) ||
      (category.id === "desserts" && /\b(sweet|pudding|dessert)\b/.test(text)) ||
      (category.id === "gravies" && /\b(curry|curries|gravy)\b/.test(text)) ||
      (category.id === "breads" && /\b(naan|roti|bread)\b/.test(text))
    ) {
      const dish = findDish(text);
      if (dish) return describe(dish.dish, dish.category);
      return {
        text: `${category.note}\n\n${list(category.items.map((d) => ({ dish: d })))}`,
        chips: category.items.slice(0, 2).map((d) => `Tell me about the ${d.name.split(",")[0].toLowerCase()}`),
      };
    }
  }

  const dish = findDish(text);
  if (dish) return describe(dish.dish, dish.category);

  return {
    text: "I only know tonight's menu, I am afraid — rice dishes, breads, gravies and sweets.\n\nTry asking about a dish by name, or what is vegetarian, or how hot something is.",
    chips: [
      "What's in the biryani?",
      "Anything vegetarian?",
      "What should I order for two?",
    ],
  };
}

export const OPENING: Reply = {
  text: "Evening. I am the pass at Milli — I know every dish going out tonight, what is in it and how hot it runs.\n\nWhat can I tell you?",
  chips: [
    "What's in the biryani?",
    "Anything vegetarian?",
    "What should I order for two?",
    "How spicy is the meen curry?",
  ],
};
