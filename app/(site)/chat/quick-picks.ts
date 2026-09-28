import { fetchItems, type MenuItem } from "@/app/lib/menu-api";

/**
 * The start-menu buttons, answered here rather than by the backend: each one is
 * a random handful from the live menu, so tapping it twice gives a different
 * answer. Sheesha is not on the POS menu at all, so it is bundled below.
 */

export const HOT = "What's hot tonight?";
/** The opening chip; answered the same way as HOT. */
export const TODAY = "Show me today's menu";
export const VIEW_MENU = "View the menu";
export const FOOD = "Food items";
export const DRINKS = "Drinks";
export const SHEESHA = "Sheesha";

/** Rendered as cards in the thread, not as chips over the input. */
export const MENU_CARDS = [
  { label: FOOD, note: "From the kitchen", dot: "bg-ember" },
  { label: DRINKS, note: "Mocktails and cocktails", dot: "bg-amber" },
  { label: SHEESHA, note: "From the lounge", dot: "bg-basil" },
];

export type QuickPick = {
  text: string;
  dishes?: MenuItem[];
  /** Not in the backend's cart, so the cards show no "Add to order". */
  browseOnly?: boolean;
  /** Show the Food / Drinks / Sheesha cards under the reply. */
  menuCards?: boolean;
  chips?: string[];
};

function sheesha(name: string, desc: string): MenuItem {
  return {
    id: `sheesha-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    name,
    desc,
    price: null,
    cuisine: "Lounge",
    course: "Sheesha",
    diet: "",
    protein: "",
    spice: 0,
    spiceConfidence: null,
    tasteTags: [],
    tags: [],
    servesMin: 1,
    servesMax: 4,
    allergens: [],
    allergensVerified: false,
    imageUrl: null,
  };
}

const SHEESHA_MENU: MenuItem[] = [
  sheesha("Double apple", "The classic — sweet red and green apple with a hint of aniseed."),
  sheesha("Mint", "Clean, cold and cutting. The one to have after a heavy meal."),
  sheesha("Paan rasmalai", "Betel leaf, gulkand and a creamy saffron finish."),
  sheesha("Blueberry mint", "Jammy blueberry over a cooling mint base."),
  sheesha("Watermelon chill", "Juicy watermelon with an icy edge."),
  sheesha("Grape mint", "Dark grape, sweet and deep, lifted with mint."),
  sheesha("Kiwi lemon", "Sharp and bright, with a sour-sweet pull."),
  sheesha("Guava chilli", "Pink guava with a little chilli-salt kick."),
  sheesha("Orange mint", "Sweet citrus peel and fresh mint."),
  sheesha("Pan masala", "Heady, spiced and nostalgic — ask for it strong."),
];

function pick<T>(items: T[], n: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// One fetch per visit; the picks are shuffled fresh each time.
let food: Promise<MenuItem[]> | null = null;
let drinks: Promise<MenuItem[]> | null = null;

function loadFood() {
  food ??= fetchItems({ group: "food" }).then((r) => r.items);
  food.catch(() => (food = null));
  return food;
}

function loadDrinks() {
  // Soft drinks and cocktails. The bar is mostly 30ml pours of spirits, which
  // make for a dull suggestion.
  drinks ??= fetchItems({ group: "drink" }).then((r) =>
    r.items.filter((i) => i.course === "Beverage" || i.drinkStyle === "cocktail"),
  );
  drinks.catch(() => (drinks = null));
  return drinks;
}

/** Null when the text is not one of the start-menu buttons. */
export async function quickPick(input: string): Promise<QuickPick | null> {
  const text = input.trim().toLowerCase();

  if (
    text === HOT.toLowerCase() ||
    text === TODAY.toLowerCase() ||
    text === "what's hot" ||
    text === "whats hot tonight"
  ) {
    return {
      text: "Here are some popular options from today's menu:",
      dishes: pick(await loadFood(), 4),
      chips: [HOT, VIEW_MENU],
    };
  }

  if (text === VIEW_MENU.toLowerCase() || text === "menu") {
    return { text: "What are you in the mood for?", menuCards: true };
  }

  if (text === FOOD.toLowerCase() || text === "food") {
    return {
      text: "Three from the kitchen:",
      dishes: pick(await loadFood(), 3),
      menuCards: true,
    };
  }

  if (text === DRINKS.toLowerCase() || text === "drink") {
    return {
      text: "Three from the bar:",
      dishes: pick(await loadDrinks(), 3),
      menuCards: true,
    };
  }

  if (text === SHEESHA.toLowerCase() || text === "shisha" || text === "hookah") {
    return {
      text: "Three from the lounge — order these at the table:",
      dishes: pick(SHEESHA_MENU, 3),
      browseOnly: true,
      menuCards: true,
    };
  }

  return null;
}
