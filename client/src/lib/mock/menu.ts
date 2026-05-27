import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M4 — Menu Knowledge (SOW §3.2).
   ============================================================================ */

export type DishType = 'veg' | 'vegan' | 'egg' | 'non-veg' | 'seafood';
export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'fiery';
export type PortionSize = 'light' | 'medium' | 'filling';
export type TasteNote =
  | 'spicy'
  | 'mild'
  | 'sweet'
  | 'savoury'
  | 'tangy'
  | 'bitter'
  | 'umami'
  | 'smoky'
  | 'creamy'
  | 'crisp';

export type Allergen = 'gluten' | 'dairy' | 'nuts' | 'shellfish' | 'eggs' | 'soy' | 'sesame' | 'mustard';

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  dishType: DishType;
  spiceLevel: SpiceLevel;
  portionSize: PortionSize;
  tasteProfile: TasteNote[];
  ingredients: string[];
  allergens: Allergen[];
  price: number;
  isPopular: boolean;
  isSignature: boolean;
  isAvailable: boolean;
}

const STORAGE_CATS = 'ss_mock_menu_categories';
const STORAGE_ITEMS = 'ss_mock_menu_items';

export const dishTypeLabels: Record<DishType, string> = {
  veg: 'Vegetarian',
  vegan: 'Vegan',
  egg: 'Egg',
  'non-veg': 'Non-vegetarian',
  seafood: 'Seafood',
};

export const spiceLabels: Record<SpiceLevel, string> = {
  none: 'No heat',
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
  fiery: 'Fiery',
};

export const portionLabels: Record<PortionSize, string> = {
  light: 'Light',
  medium: 'Medium',
  filling: 'Filling',
};

export const allergenLabels: Record<Allergen, string> = {
  gluten: 'Gluten',
  dairy: 'Dairy',
  nuts: 'Nuts',
  shellfish: 'Shellfish',
  eggs: 'Eggs',
  soy: 'Soy',
  sesame: 'Sesame',
  mustard: 'Mustard',
};

export const tasteLabels: Record<TasteNote, string> = {
  spicy: 'Spicy',
  mild: 'Mild',
  sweet: 'Sweet',
  savoury: 'Savoury',
  tangy: 'Tangy',
  bitter: 'Bitter',
  umami: 'Umami',
  smoky: 'Smoky',
  creamy: 'Creamy',
  crisp: 'Crisp',
};

const seedCategories: MenuCategory[] = [
  { id: 'cat_starters', name: 'Starters', order: 1 },
  { id: 'cat_mains_veg', name: 'Mains · Vegetarian', order: 2 },
  { id: 'cat_mains_nv', name: 'Mains · Non-vegetarian', order: 3 },
  { id: 'cat_pasta', name: 'Pasta & Risotto', order: 4 },
  { id: 'cat_desserts', name: 'Desserts', order: 5 },
  { id: 'cat_beverages', name: 'Beverages', order: 6 },
];

const seedItems: MenuItem[] = [
  {
    id: 'item_001',
    categoryId: 'cat_starters',
    name: 'Truffle Burrata',
    description:
      'Stracciatella heart with cold-pressed truffle oil, candied walnut, and saffron honey on grilled sourdough.',
    dishType: 'veg',
    spiceLevel: 'none',
    portionSize: 'light',
    tasteProfile: ['creamy', 'savoury', 'mild'],
    ingredients: ['burrata cheese', 'truffle oil', 'walnuts', 'sourdough', 'honey', 'saffron'],
    allergens: ['dairy', 'gluten', 'nuts'],
    price: 720,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
  },
  {
    id: 'item_002',
    categoryId: 'cat_starters',
    name: 'Smoked Beetroot Carpaccio',
    description: 'Beetroot smoked over applewood, citrus reduction, micro-greens, goat cheese crumble.',
    dishType: 'veg',
    spiceLevel: 'mild',
    portionSize: 'light',
    tasteProfile: ['smoky', 'tangy', 'savoury'],
    ingredients: ['beetroot', 'goat cheese', 'orange', 'olive oil', 'micro-greens'],
    allergens: ['dairy'],
    price: 540,
    isPopular: false,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_003',
    categoryId: 'cat_starters',
    name: 'Crispy Calamari',
    description: 'Lightly battered squid rings with charred lemon, paprika aioli, and pickled chillies.',
    dishType: 'seafood',
    spiceLevel: 'medium',
    portionSize: 'light',
    tasteProfile: ['crisp', 'tangy', 'spicy'],
    ingredients: ['squid', 'paprika', 'lemon', 'aioli', 'chillies'],
    allergens: ['gluten', 'shellfish', 'eggs', 'mustard'],
    price: 680,
    isPopular: true,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_004',
    categoryId: 'cat_mains_veg',
    name: 'Wood-fired Margherita',
    description:
      'San Marzano tomato base, fior di latte mozzarella, fresh basil, finished with extra-virgin olive oil.',
    dishType: 'veg',
    spiceLevel: 'none',
    portionSize: 'medium',
    tasteProfile: ['savoury', 'mild', 'creamy'],
    ingredients: ['tomato', 'mozzarella', 'basil', 'olive oil', 'wheat flour'],
    allergens: ['dairy', 'gluten'],
    price: 520,
    isPopular: true,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_005',
    categoryId: 'cat_mains_veg',
    name: 'Roasted Cauliflower Steak',
    description: 'Whole cauliflower roasted with za’atar, tahini drizzle, pomegranate, and crispy chickpeas.',
    dishType: 'vegan',
    spiceLevel: 'mild',
    portionSize: 'filling',
    tasteProfile: ['savoury', 'tangy', 'crisp'],
    ingredients: ['cauliflower', 'tahini', 'pomegranate', 'chickpeas', 'za’atar'],
    allergens: ['sesame'],
    price: 580,
    isPopular: false,
    isSignature: true,
    isAvailable: true,
  },
  {
    id: 'item_006',
    categoryId: 'cat_mains_nv',
    name: 'Slow-braised Lamb Shank',
    description: '6-hour braise in red wine and rosemary jus, root vegetable mash, gremolata.',
    dishType: 'non-veg',
    spiceLevel: 'mild',
    portionSize: 'filling',
    tasteProfile: ['savoury', 'umami', 'smoky'],
    ingredients: ['lamb', 'red wine', 'rosemary', 'root vegetables', 'parsley'],
    allergens: [],
    price: 1180,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
  },
  {
    id: 'item_007',
    categoryId: 'cat_mains_nv',
    name: 'Pan-seared Atlantic Salmon',
    description: 'Crisp-skin salmon, lemon-dill butter, asparagus, charred fingerling potatoes.',
    dishType: 'seafood',
    spiceLevel: 'none',
    portionSize: 'medium',
    tasteProfile: ['savoury', 'tangy', 'creamy'],
    ingredients: ['salmon', 'butter', 'lemon', 'dill', 'asparagus', 'potatoes'],
    allergens: ['dairy'],
    price: 980,
    isPopular: false,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_008',
    categoryId: 'cat_pasta',
    name: 'Cacio e Pepe',
    description: 'Hand-cut tonnarelli, aged Pecorino Romano, black peppercorn, finished tableside.',
    dishType: 'veg',
    spiceLevel: 'mild',
    portionSize: 'medium',
    tasteProfile: ['creamy', 'savoury', 'umami'],
    ingredients: ['pasta', 'pecorino romano', 'black pepper'],
    allergens: ['dairy', 'gluten', 'eggs'],
    price: 640,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
  },
  {
    id: 'item_009',
    categoryId: 'cat_pasta',
    name: 'Mushroom Truffle Risotto',
    description: 'Carnaroli rice, mixed wild mushrooms, parmesan, truffle butter, herb oil.',
    dishType: 'veg',
    spiceLevel: 'none',
    portionSize: 'filling',
    tasteProfile: ['creamy', 'umami', 'savoury'],
    ingredients: ['carnaroli rice', 'mushrooms', 'parmesan', 'truffle butter'],
    allergens: ['dairy'],
    price: 780,
    isPopular: false,
    isSignature: false,
    isAvailable: false,
  },
  {
    id: 'item_010',
    categoryId: 'cat_desserts',
    name: 'Dark Chocolate Fondant',
    description: '70% single-origin dark chocolate, molten centre, vanilla bean ice cream, sea salt.',
    dishType: 'veg',
    spiceLevel: 'none',
    portionSize: 'light',
    tasteProfile: ['sweet', 'creamy', 'bitter'],
    ingredients: ['dark chocolate', 'butter', 'eggs', 'flour', 'vanilla', 'cream'],
    allergens: ['dairy', 'eggs', 'gluten'],
    price: 480,
    isPopular: true,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_011',
    categoryId: 'cat_desserts',
    name: 'Coconut Panna Cotta',
    description: 'Silky coconut cream set with agar, mango coulis, passionfruit, toasted coconut.',
    dishType: 'vegan',
    spiceLevel: 'none',
    portionSize: 'light',
    tasteProfile: ['sweet', 'tangy', 'creamy'],
    ingredients: ['coconut cream', 'agar', 'mango', 'passionfruit', 'sugar'],
    allergens: [],
    price: 420,
    isPopular: false,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_012',
    categoryId: 'cat_beverages',
    name: 'House Cold Brew',
    description: 'Single-origin Coorg AA beans, 18-hour cold brew, served over a single ice rock.',
    dishType: 'vegan',
    spiceLevel: 'none',
    portionSize: 'light',
    tasteProfile: ['bitter', 'savoury'],
    ingredients: ['coffee'],
    allergens: [],
    price: 280,
    isPopular: true,
    isSignature: false,
    isAvailable: true,
  },
  {
    id: 'item_013',
    categoryId: 'cat_beverages',
    name: 'Smoked Old Fashioned',
    description: 'Bourbon, demerara, orange bitters, applewood-smoked under glass at the table.',
    dishType: 'vegan',
    spiceLevel: 'none',
    portionSize: 'light',
    tasteProfile: ['smoky', 'sweet', 'tangy'],
    ingredients: ['bourbon', 'demerara sugar', 'orange bitters', 'applewood'],
    allergens: [],
    price: 720,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
  },
];

/* --- Storage -------------------------------------------------------------- */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* --- Hooks ---------------------------------------------------------------- */
export function useMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>(() =>
    read(STORAGE_CATS, seedCategories),
  );

  useEffect(() => {
    write(STORAGE_CATS, categories);
  }, [categories]);

  const addCategory = useCallback((name: string) => {
    const id = `cat_${Math.random().toString(36).slice(2, 9)}`;
    setCategories((cats) => [
      ...cats,
      { id, name: name.trim() || 'Untitled category', order: cats.length + 1 },
    ]);
    return id;
  }, []);

  const renameCategory = useCallback((id: string, name: string) => {
    setCategories((cats) => cats.map((c) => (c.id === id ? { ...c, name } : c)));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((cats) => cats.filter((c) => c.id !== id));
  }, []);

  return { categories, addCategory, renameCategory, removeCategory };
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>(() => read(STORAGE_ITEMS, seedItems));

  useEffect(() => {
    write(STORAGE_ITEMS, items);
  }, [items]);

  const upsert = useCallback((item: MenuItem) => {
    setItems((list) => {
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx === -1) return [...list, item];
      const next = [...list];
      next[idx] = item;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((i) => i.id !== id));
  }, []);

  const toggle = useCallback(
    (id: string, key: 'isAvailable' | 'isPopular' | 'isSignature') => {
      setItems((list) =>
        list.map((i) => (i.id === id ? { ...i, [key]: !i[key] } : i)),
      );
    },
    [],
  );

  const bulkImport = useCallback((newItems: MenuItem[]) => {
    setItems((list) => [...list, ...newItems]);
  }, []);

  return { items, upsert, remove, toggle, bulkImport };
}

export function newMenuItemId() {
  return `item_${Math.random().toString(36).slice(2, 9)}`;
}

/* --- Simulated PDF extraction (for design preview) ----------------------- */
export function simulateExtraction(filename: string): Promise<MenuItem[]> {
  return new Promise((resolve) => {
    // Pretend the PDF was parsed and these items were detected.
    const extracted: MenuItem[] = [
      {
        id: newMenuItemId(),
        categoryId: 'cat_starters',
        name: 'Avocado Bruschetta',
        description: 'Toasted ciabatta, smashed avocado, pickled red onion, lime, chilli flakes.',
        dishType: 'vegan',
        spiceLevel: 'mild',
        portionSize: 'light',
        tasteProfile: ['tangy', 'crisp', 'savoury'],
        ingredients: ['avocado', 'ciabatta', 'red onion', 'lime'],
        allergens: ['gluten'],
        price: 460,
        isPopular: false,
        isSignature: false,
        isAvailable: true,
      },
      {
        id: newMenuItemId(),
        categoryId: 'cat_mains_veg',
        name: 'Paneer Tikka Masala',
        description: 'Charred paneer cubes in a tomato-fenugreek gravy with cream and butter.',
        dishType: 'veg',
        spiceLevel: 'medium',
        portionSize: 'filling',
        tasteProfile: ['creamy', 'spicy', 'tangy'],
        ingredients: ['paneer', 'tomato', 'cream', 'spices', 'fenugreek'],
        allergens: ['dairy'],
        price: 620,
        isPopular: false,
        isSignature: false,
        isAvailable: true,
      },
      {
        id: newMenuItemId(),
        categoryId: 'cat_desserts',
        name: 'Lemon Tart',
        description: 'Buttery shortcrust, sharp lemon curd, torched Italian meringue.',
        dishType: 'veg',
        spiceLevel: 'none',
        portionSize: 'light',
        tasteProfile: ['sweet', 'tangy'],
        ingredients: ['lemon', 'butter', 'eggs', 'flour', 'sugar'],
        allergens: ['dairy', 'eggs', 'gluten'],
        price: 380,
        isPopular: false,
        isSignature: false,
        isAvailable: true,
      },
    ];
    setTimeout(() => resolve(extracted), 2200 + filename.length * 0); // ~2.2s "processing"
  });
}
