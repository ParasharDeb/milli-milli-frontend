export type Dish = {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  tags: string[];
  /** 0 = none, 3 = hot. Drawn as filled chilli pips. */
  spice: 0 | 1 | 2 | 3;
};

export type Category = {
  id: string;
  label: string;
  note: string;
  /** Accent used for the ring, price and pips while this category is open. */
  accent: "ember" | "amber" | "basil" | "terracotta";
  items: Dish[];
};

export const CATEGORIES: Category[] = [
  {
    id: "rice",
    label: "Rice dishes",
    note: "Sealed under dough and opened at the table, or tempered and served cool.",
    accent: "amber",
    items: [
      {
        id: "rice-biryani",
        name: "Hyderabadi lamb dum biryani",
        desc: "Aged basmati and slow-marinated lamb sealed under dough, opened at your table. Saffron, fried onion, mint. Served with burani raita and mirchi ka salan.",
        price: 780,
        img: "/img/menu/rice-biryani.webp",
        tags: ["Serves 2", "Dum-cooked"],
        spice: 2,
      },
      {
        id: "rice-prawn",
        name: "Malabar prawn biryani",
        desc: "Tiger prawns folded through short-grain kaima rice with curry leaf, green chilli and coconut oil. Coastal, fragrant, a little sharp.",
        price: 820,
        img: "/img/menu/rice-prawn.webp",
        tags: ["Coastal"],
        spice: 2,
      },
      {
        id: "rice-pulao",
        name: "Kashmiri pulao",
        desc: "Saffron rice with pomegranate, almond and pistachio, sweetened only by the fruit. The gentlest thing on the menu.",
        price: 520,
        img: "/img/menu/rice-pulao.webp",
        tags: ["Vegetarian", "Mild"],
        spice: 0,
      },
      {
        id: "rice-curd",
        name: "Curd rice, pomegranate",
        desc: "Set curd folded through rice, tempered with mustard seed, dried chilli and curry leaf. What the kitchen eats after service.",
        price: 320,
        img: "/img/menu/rice-curd.webp",
        tags: ["Vegetarian", "Cooling"],
        spice: 1,
      },
    ],
  },
  {
    id: "breads",
    label: "Breads",
    note: "Everything off the tandoor, to order, brushed while it is still too hot to hold.",
    accent: "terracotta",
    items: [
      {
        id: "bread-naan",
        name: "Butter naan",
        desc: "Slapped onto the tandoor wall and pulled blistered a minute later, brushed with white butter and nigella seed.",
        price: 120,
        img: "/img/menu/bread-naan.webp",
        tags: ["Vegetarian"],
        spice: 0,
      },
      {
        id: "bread-paratha",
        name: "Laccha paratha",
        desc: "Wound into a spiral and griddled in ghee until every one of its layers separates. Built for mopping.",
        price: 140,
        img: "/img/menu/bread-paratha.webp",
        tags: ["Vegetarian", "Flaky"],
        spice: 0,
      },
      {
        id: "bread-roti",
        name: "Tandoori roti",
        desc: "Stone-ground whole wheat, no fat, straight off the clay. The plain one, and the one we eat most of.",
        price: 90,
        img: "/img/menu/bread-roti.webp",
        tags: ["Vegetarian", "Vegan"],
        spice: 0,
      },
      {
        id: "bread-kulcha",
        name: "Amritsari aloo kulcha",
        desc: "Stuffed with spiced potato and coriander, cracked open at the edge and flooded with butter.",
        price: 180,
        img: "/img/menu/bread-kulcha.webp",
        tags: ["Vegetarian", "Stuffed"],
        spice: 1,
      },
    ],
  },
  {
    id: "gravies",
    label: "Gravies",
    note: "The pots that go on at six in the morning and are stirred all day.",
    accent: "ember",
    items: [
      {
        id: "gravy-makhani",
        name: "Murgh makhani",
        desc: "Tandoori chicken finished in tomatoes cooked down for four hours with butter, cream and crushed fenugreek. Sweet, smoky, unreasonable.",
        price: 640,
        img: "/img/menu/gravy-makhani.webp",
        tags: ["Signature"],
        spice: 1,
      },
      {
        id: "gravy-dal",
        name: "Dal makhani",
        desc: "Black urad simmered overnight on the lowest flame we have, finished with butter and cream at the pass. Twenty-two hours, start to bowl.",
        price: 480,
        img: "/img/menu/gravy-dal.webp",
        tags: ["Vegetarian", "Overnight"],
        spice: 1,
      },
      {
        id: "gravy-palak",
        name: "Palak paneer",
        desc: "Spinach blanched and blitzed the moment it is ordered so it stays green, with paneer we set in the morning.",
        price: 520,
        img: "/img/menu/gravy-palak.webp",
        tags: ["Vegetarian"],
        spice: 1,
      },
      {
        id: "gravy-meen",
        name: "Kerala meen curry",
        desc: "Kingfish in coconut and kokum with whole green chilli and curry leaf, finished with raw coconut oil. Sour and hot, the way it should be.",
        price: 720,
        img: "/img/menu/gravy-meen.webp",
        tags: ["Coastal"],
        spice: 3,
      },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    note: "Four sweets, all of them made in-house, none of them subtle.",
    accent: "basil",
    items: [
      {
        id: "sweet-jamun",
        name: "Gulab jamun",
        desc: "Khoya dumplings fried dark and left to drink a rose and cardamom syrup for an hour. Served warm, four to a bowl.",
        price: 260,
        img: "/img/menu/sweet-jamun.webp",
        tags: ["Vegetarian", "Warm"],
        spice: 0,
      },
      {
        id: "sweet-rasmalai",
        name: "Rasmalai",
        desc: "Fresh chhena discs pressed thin and steeped in saffron milk reduced by half. Pistachio, almond, a little rose.",
        price: 280,
        img: "/img/menu/sweet-rasmalai.webp",
        tags: ["Vegetarian", "Chilled"],
        spice: 0,
      },
      {
        id: "sweet-kulfi",
        name: "Pistachio kulfi",
        desc: "Milk cooked down for three hours, set in moulds overnight, sliced to order. Dense enough to need a knife.",
        price: 240,
        img: "/img/menu/sweet-kulfi.webp",
        tags: ["Vegetarian", "Frozen"],
        spice: 0,
      },
      {
        id: "sweet-halwa",
        name: "Gajar ka halwa",
        desc: "Winter carrots grated by hand and cooked in ghee and milk until they give up. Almond, pistachio, thick cream.",
        price: 300,
        img: "/img/menu/sweet-halwa.webp",
        tags: ["Vegetarian", "Seasonal"],
        spice: 0,
      },
    ],
  },
];

export const ACCENT_CLASS = {
  ember: {
    text: "text-ember",
    bg: "bg-ember",
    border: "border-ember/30",
    ring: "border-ember/25",
    glow: "rgba(226,84,42,0.28)",
  },
  amber: {
    text: "text-[#a97400]",
    bg: "bg-amber",
    border: "border-amber/40",
    ring: "border-amber/35",
    glow: "rgba(233,163,25,0.32)",
  },
  basil: {
    text: "text-basil",
    bg: "bg-basil",
    border: "border-basil/30",
    ring: "border-basil/25",
    glow: "rgba(26,122,86,0.24)",
  },
  terracotta: {
    text: "text-terracotta",
    bg: "bg-terracotta",
    border: "border-terracotta/30",
    ring: "border-terracotta/25",
    glow: "rgba(194,96,60,0.26)",
  },
} as const;
