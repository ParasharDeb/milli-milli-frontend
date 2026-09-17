import type { MenuItem } from "@/app/lib/menu-api";
import type { Category, Dish } from "./menu-data";

/**
 * Adapts database rows into the shape `DishOrbit` already renders.
 *
 * The orbit is a carefully tuned animation built around `Category`/`Dish`, so
 * the data is reshaped to fit it rather than the component being rewritten.
 */

/**
 * The photography that ships with the site, matched to dishes by keyword.
 * The database has no images, so anything unmatched renders as a plate of
 * colour instead. Order matters: "Dal Makhni" must hit `gravy-dal` before the
 * `makhani` rule claims it.
 */
const IMAGE_RULES: [RegExp, string][] = [
  [/\bdal\b|\bdaal\b/i, "gravy-dal"],
  [/prawn|shrimp/i, "rice-prawn"],
  [/biryani/i, "rice-biryani"],
  [/pulao|pilaf|fried rice/i, "rice-pulao"],
  [/curd rice|dahi|raita/i, "rice-curd"],
  [/\brice\b/i, "rice-pulao"],
  [/kulcha/i, "bread-kulcha"],
  [/paratha|laccha/i, "bread-paratha"],
  [/naan/i, "bread-naan"],
  [/roti|chapati|papad/i, "bread-roti"],
  [/makhani|makhni|butter chicken|murgh/i, "gravy-makhani"],
  [/palak|paneer|cottage cheese/i, "gravy-palak"],
  [/fish|meen|seafood|prawn curry/i, "gravy-meen"],
  [/jamun/i, "sweet-jamun"],
  [/rasmalai|ras malai/i, "sweet-rasmalai"],
  [/kulfi/i, "sweet-kulfi"],
  [/halwa|gajar/i, "sweet-halwa"],
  [/cheesecake|tiramisu|brownie|\bcake\b|dessert/i, "sweet-rasmalai"],
  [/curry|masala|gravy|tikka|kebab/i, "gravy-makhani"],
];

export function imageFor(name: string): string | undefined {
  for (const [pattern, slug] of IMAGE_RULES) {
    if (pattern.test(name)) return `/img/menu/${slug}.webp`;
  }
  return undefined;
}

/** The database records heat 0-5; the orbit draws three pips. */
function toPips(spice: number, confidence: number | null): Dish["spice"] {
  if (confidence == null || confidence < 0.5) return 0;
  if (spice <= 0) return 0;
  if (spice <= 2) return 1;
  if (spice <= 3) return 2;
  return 3;
}

function toTags(item: MenuItem): string[] {
  const tags: string[] = [];
  if (item.diet === "Vegeterian" || item.diet === "Jain") tags.push("Vegetarian");
  else if (item.diet === "OnlyFish") tags.push("Seafood");
  else if (item.diet === "Eggeterian") tags.push("Contains egg");

  const serves = item.serves ?? [];
  if (serves.length) {
    const low = Math.min(...serves);
    const high = Math.max(...serves);
    if (high > 1) tags.push(low === high ? `Serves ${low}` : `Serves ${low}-${high}`);
  }

  for (const taste of item.tasteTags.slice(0, 2)) {
    tags.push(taste.charAt(0).toUpperCase() + taste.slice(1));
  }
  return tags.slice(0, 3);
}

function toDish(item: MenuItem): Dish {
  return {
    id: item.id,
    name: item.name,
    desc: item.desc?.trim() || `${item.cuisine} ${item.course.toLowerCase()}, cooked to order.`,
    img: imageFor(item.name),
    tags: toTags(item),
    spice: toPips(item.spice, item.spiceConfidence),
  };
}

type Group = {
  id: string;
  label: string;
  note: string;
  accent: Category["accent"];
  courses: string[];
};

/** Nine database courses collapsed into the four the orbit can show well. */
const GROUPS: Group[] = [
  {
    id: "small",
    label: "Small plates",
    note: "What arrives first, meant for the middle of the table.",
    accent: "ember",
    courses: ["Starter", "Salad", "Sides"],
  },
  {
    id: "mains",
    label: "Mains",
    note: "Cooked to order, sent as they are ready rather than all at once.",
    accent: "amber",
    courses: ["MainCourse"],
  },
  {
    id: "breads",
    label: "Breads",
    note: "Off the tandoor, brought over in batches while you eat.",
    accent: "basil",
    courses: ["Bread"],
  },
  {
    id: "sweets",
    label: "Desserts",
    note: "One each, or one between two if the table is honest about it.",
    accent: "terracotta",
    courses: ["Dessert"],
  },
];

/** The orbit fans satellites along an arc; more than this and it reads as clutter. */
const MAX_PER_GROUP = 7;

export function buildCategories(items: MenuItem[]): Category[] {
  return GROUPS.map((group) => {
    const dishes = items
      .filter((i) => group.courses.includes(i.course))
      .map(toDish)
      // Dishes with photography and a real description carry the orbit best.
      .sort((a, b) => Number(Boolean(b.img)) - Number(Boolean(a.img)) || b.desc.length - a.desc.length)
      .slice(0, MAX_PER_GROUP);

    return {
      id: group.id,
      label: group.label,
      note: group.note,
      accent: group.accent,
      items: dishes,
    };
  }).filter((c) => c.items.length > 0);
}
