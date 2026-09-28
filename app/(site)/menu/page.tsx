import type { Metadata } from "next";
import { fetchItems } from "@/app/lib/menu-api";
import { buildCategories } from "./menu-adapter";
import { MenuExperience } from "./menu-experience";

export const metadata: Metadata = {
  title: "Tonight's menu — Milli Milli",
  description:
    "Small plates, mains, breads and desserts — cooked to order from whatever the morning market gave us.",
};

/**
 * The menu is read from Postgres through the backend at request time. If the
 * backend is unreachable the page falls back to its bundled dishes, so it
 * never fails to render over a dropped API call.
 */
async function loadCategories() {
  try {
    const { items } = await fetchItems({ group: "food" });
    const categories = buildCategories(items);
    return categories.length > 0 ? categories : undefined;
  } catch (error) {
    console.error("[menu] backend unreachable, using bundled dishes:", error);
    return undefined;
  }
}

export default async function MenuPage() {
  const categories = await loadCategories();
  return <MenuExperience categories={categories} />;
}
