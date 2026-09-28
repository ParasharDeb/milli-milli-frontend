/**
 * Tonight's short menu on the landing page. The full, database-backed menu
 * lives at /menu; this is the handful the kitchen wants to lead with.
 */

export type Course = "Small Plates" | "Mains" | "From the Fire" | "Sides" | "Desserts";

export type LandingDish = {
  id: string;
  name: string;
  note: string;
  price: number;
  course: Course;
  /** Shown above the name on the "Tonight at Milli" cards. */
  label: string;
  img: string;
  alt: string;
};

export const COURSES: Course[] = ["Small Plates", "Mains", "From the Fire", "Sides", "Desserts"];

export const DISHES: LandingDish[] = [
  {
    id: "aubergine",
    name: "Smoked aubergine",
    note: "Wild herbs, yoghurt, chilli oil",
    price: 420,
    course: "Small Plates",
    label: "Starters",
    img: "/img/milli/dish-aubergine.webp",
    alt: "Smoked aubergine halves under yoghurt, chilli oil and wild herbs",
  },
  {
    id: "tomato",
    name: "Heirloom tomato",
    note: "Burrata, basil, olive oil",
    price: 450,
    course: "Small Plates",
    label: "Starters",
    img: "/img/milli/dish-tomato.webp",
    alt: "Sliced heirloom tomatoes with torn burrata and basil",
  },
  {
    id: "octopus",
    name: "Grilled octopus",
    note: "Lemon, fennel, smoked butter",
    price: 680,
    course: "Small Plates",
    label: "Starters",
    img: "/img/milli/dish-octopus.webp",
    alt: "Grilled octopus on shaved fennel with smoked butter",
  },
  {
    id: "seabass",
    name: "Charred sea bass",
    note: "Market vegetables, lemon",
    price: 680,
    course: "Mains",
    label: "Mains",
    img: "/img/milli/dish-seabass.webp",
    alt: "Charred sea bass fillet with roasted market vegetables and lemon",
  },
  {
    id: "chicken",
    name: "Wood-fired chicken",
    note: "Wild garlic, jus",
    price: 620,
    course: "From the Fire",
    label: "From the fire",
    img: "/img/milli/dish-chicken.webp",
    alt: "Wood-fired chicken with wild garlic and a dark jus",
  },
  {
    id: "pappardelle",
    name: "Handmade pappardelle",
    note: "Wild mushroom, parmesan",
    price: 560,
    course: "Mains",
    label: "Pasta",
    img: "/img/milli/dish-pappardelle.webp",
    alt: "Handmade pappardelle with wild mushrooms and shaved parmesan",
  },
  {
    id: "greens",
    name: "Market greens",
    note: "Seasonal vegetables, herb dressing",
    price: 380,
    course: "Sides",
    label: "Sides",
    img: "/img/milli/dish-greens.webp",
    alt: "Charred market greens with herb dressing and toasted seeds",
  },
  {
    id: "honey",
    name: "Burnt honey",
    note: "Fig, almond, cream",
    price: 380,
    course: "Desserts",
    label: "Dessert",
    img: "/img/milli/dish-honey.webp",
    alt: "Burnt honey cake with roasted figs, almonds and cream",
  },
];

/** The four that lead the "Tonight at Milli" row. */
export const TONIGHT = ["aubergine", "seabass", "pappardelle", "honey"].map(
  (id) => DISHES.find((d) => d.id === id)!,
);

export function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
