import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data — Menu Knowledge (SOW v2 §5.3.2).
   Manager uploads a file → system parses → manager reviews & edits items and
   (mandatorily) tags allergens. Allergen tagging is the food-safety layer:
   the live recommendation engine excludes allergen-matching dishes at the
   database level before any AI ranking.
   ============================================================================ */

/* Dish Type — SOW radio: Veg / Non-Veg (two options only). */
export type DishType = 'veg' | 'non-veg';

/* Portion Size — SOW: Light / Medium / Filling. */
export type PortionSize = 'light' | 'medium' | 'filling';

/* Taste Profile — SOW multi-select (exactly these six). */
export type TasteNote = 'spicy' | 'mild' | 'sweet' | 'savory' | 'smoky' | 'tangy';

/* Allergens — SOW multi-select (the full thirteen). MANDATORY per item. */
export type Allergen =
  | 'shellfish'
  | 'nuts'
  | 'dairy'
  | 'gluten'
  | 'eggs'
  | 'soy'
  | 'fish'
  | 'sesame'
  | 'celery'
  | 'mustard'
  | 'lupin'
  | 'molluscs'
  | 'sulphites';

export type MenuItemStatus = 'active' | 'inactive';

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
  price: number;             // USD
  dishType: DishType;
  portionSize: PortionSize;
  tasteProfile: TasteNote[];
  ingredients: string[];
  /** Free-form, manager-typed allergen tags (mirrors `ingredients`). Seeded
   *  values use the canonical thirteen but the field accepts anything. */
  allergens: string[];
  /** True once the manager has explicitly tagged allergens OR confirmed none.
   *  Save is blocked until this is true (food-safety gate). */
  allergensConfirmed: boolean;
  /* Priority tags (§4.3.4 — manager-defined badges the AI biases toward). */
  isSpecial: boolean;
  isHighMargin: boolean;
  isChefsPick: boolean;
  status: MenuItemStatus;
}

const STORAGE_CATS = 'ss_mock_menu_categories_v2';
const STORAGE_ITEMS = 'ss_mock_menu_items_v3';

export const dishTypeLabels: Record<DishType, string> = {
  veg: 'Veg',
  'non-veg': 'Non-Veg',
};

export const portionLabels: Record<PortionSize, string> = {
  light: 'Light',
  medium: 'Medium',
  filling: 'Filling',
};

export const tasteOrder: TasteNote[] = ['spicy', 'mild', 'sweet', 'savory', 'smoky', 'tangy'];
export const tasteLabels: Record<TasteNote, string> = {
  spicy: 'Spicy',
  mild: 'Mild',
  sweet: 'Sweet',
  savory: 'Savory',
  smoky: 'Smoky',
  tangy: 'Tangy',
};

export const allergenOrder: Allergen[] = [
  'shellfish',
  'nuts',
  'dairy',
  'gluten',
  'eggs',
  'soy',
  'fish',
  'sesame',
  'celery',
  'mustard',
  'lupin',
  'molluscs',
  'sulphites',
];
export const allergenLabels: Record<Allergen, string> = {
  shellfish: 'Shellfish',
  nuts: 'Nuts',
  dairy: 'Dairy',
  gluten: 'Gluten',
  eggs: 'Eggs',
  soy: 'Soy',
  fish: 'Fish',
  sesame: 'Sesame',
  celery: 'Celery',
  mustard: 'Mustard',
  lupin: 'Lupin',
  molluscs: 'Molluscs',
  sulphites: 'Sulphites',
};

/* Allergens are now free-form (manager-typed, like ingredients). Render a known
   canonical label when we have one, otherwise capitalise the typed value. */
export const formatAllergen = (a: string): string =>
  allergenLabels[a as Allergen] ?? a.replace(/\b\w/g, (c) => c.toUpperCase());

/* Category enum default per §5.3.2 (configurable by manager). */
const seedCategories: MenuCategory[] = [
  { id: 'cat_tapas', name: 'Tapas', order: 1 },
  { id: 'cat_sandwiches', name: 'Sandwiches', order: 2 },
  { id: 'cat_salads', name: 'Salads', order: 3 },
  { id: 'cat_mains', name: 'Main Courses', order: 4 },
  { id: 'cat_white_wine', name: 'White Wine', order: 5 },
  { id: 'cat_red_wine', name: 'Red Wine', order: 6 },
  { id: 'cat_desserts', name: 'Desserts', order: 7 },
  { id: 'cat_beverages', name: 'Beverages', order: 8 },
];

const seedItems: MenuItem[] = [
  {
    id: 'item_001',
    categoryId: 'cat_tapas',
    name: 'Gambas al Ajillo',
    description: 'Sizzling shrimp in garlic-chilli olive oil with a splash of sherry and crusty bread.',
    price: 16,
    dishType: 'non-veg',
    portionSize: 'light',
    tasteProfile: ['savory', 'spicy'],
    ingredients: ['shrimp', 'garlic', 'olive oil', 'chilli', 'sherry', 'parsley'],
    allergens: ['shellfish', 'sulphites'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_002',
    categoryId: 'cat_tapas',
    name: 'Padrón Peppers',
    description: 'Blistered Padrón peppers, flaked sea salt, finished with a drizzle of olive oil.',
    price: 9,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['savory', 'smoky'],
    ingredients: ['padrón peppers', 'olive oil', 'sea salt'],
    allergens: [],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_003',
    categoryId: 'cat_tapas',
    name: 'Spanish Tortilla',
    description: 'Classic slow-cooked potato and onion omelette, served warm with alioli.',
    price: 11,
    dishType: 'veg',
    portionSize: 'medium',
    tasteProfile: ['savory', 'mild'],
    ingredients: ['eggs', 'potato', 'onion', 'olive oil', 'alioli'],
    allergens: ['eggs'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_004',
    categoryId: 'cat_tapas',
    name: 'Patatas Bravas',
    description: 'Crisp potatoes with smoky brava sauce and a cool garlic alioli.',
    price: 10,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['spicy', 'tangy', 'smoky'],
    ingredients: ['potato', 'tomato', 'smoked paprika', 'garlic', 'alioli', 'eggs'],
    allergens: ['eggs'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_005',
    categoryId: 'cat_tapas',
    name: 'Txistorra Sausage',
    description: 'Fast-cured Basque sausage, pan-seared, with a cider reduction.',
    price: 13,
    dishType: 'non-veg',
    portionSize: 'light',
    tasteProfile: ['smoky', 'spicy'],
    ingredients: ['pork', 'paprika', 'garlic', 'cider'],
    allergens: ['sulphites'],
    allergensConfirmed: true,
    isSpecial: true,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_006',
    categoryId: 'cat_mains',
    name: 'Ibérico Pork Secreto',
    description: 'Grilled acorn-fed Ibérico pork, piquillo pepper purée, charred spring onion.',
    price: 32,
    dishType: 'non-veg',
    portionSize: 'filling',
    tasteProfile: ['savory', 'smoky'],
    ingredients: ['ibérico pork', 'piquillo pepper', 'spring onion', 'olive oil'],
    allergens: [],
    allergensConfirmed: true,
    isSpecial: true,
    isHighMargin: true,
    isChefsPick: true,
    status: 'active',
  },
  {
    id: 'item_007',
    categoryId: 'cat_mains',
    name: 'Pulpo a la Gallega',
    description: 'Galician-style octopus over potato, smoked paprika, and good olive oil.',
    price: 26,
    dishType: 'non-veg',
    portionSize: 'medium',
    tasteProfile: ['smoky', 'savory'],
    ingredients: ['octopus', 'potato', 'smoked paprika', 'olive oil', 'sea salt'],
    allergens: ['molluscs'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_008',
    categoryId: 'cat_mains',
    name: 'Seafood Paella',
    description: 'Bomba rice, saffron, shrimp, mussels, and white fish, finished with lemon. For two.',
    price: 48,
    dishType: 'non-veg',
    portionSize: 'filling',
    tasteProfile: ['savory', 'smoky'],
    ingredients: ['bomba rice', 'saffron', 'shrimp', 'mussels', 'white fish', 'peas', 'lemon'],
    allergens: ['shellfish', 'molluscs', 'fish'],
    allergensConfirmed: true,
    isSpecial: true,
    isHighMargin: true,
    isChefsPick: true,
    status: 'active',
  },
  {
    id: 'item_009',
    categoryId: 'cat_salads',
    name: 'Ensalada de Marcona',
    description: 'Little gem, manchego shavings, Marcona almonds, sherry vinaigrette.',
    price: 12,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['tangy', 'savory', 'mild'],
    ingredients: ['little gem lettuce', 'manchego', 'marcona almonds', 'sherry vinegar', 'olive oil'],
    allergens: ['nuts', 'dairy', 'sulphites'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_010',
    categoryId: 'cat_desserts',
    name: 'Crema Catalana',
    description: 'Citrus-and-cinnamon custard under a brittle caramelised sugar crust.',
    price: 10,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['sweet', 'tangy'],
    ingredients: ['milk', 'eggs', 'sugar', 'cinnamon', 'lemon', 'cornstarch'],
    allergens: ['dairy', 'eggs'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_011',
    categoryId: 'cat_desserts',
    name: 'Basque Burnt Cheesecake',
    description: 'Caramelised top, molten centre, a whisper of sea salt.',
    price: 11,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['sweet'],
    ingredients: ['cream cheese', 'cream', 'eggs', 'sugar', 'flour'],
    allergens: ['dairy', 'eggs', 'gluten'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_012',
    categoryId: 'cat_white_wine',
    name: 'Albariño, Rías Baixas',
    description: 'Crisp, aromatic Galician white — stone fruit and a saline finish. Glass.',
    price: 14,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['tangy', 'mild'],
    ingredients: ['white wine'],
    allergens: ['sulphites'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_013',
    categoryId: 'cat_red_wine',
    name: 'Conde Valdemar Rioja Reserva',
    description: 'Elegant Tempranillo — cherry, leather, vanilla oak. Pairs with the tapas board. Glass.',
    price: 16,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['savory', 'smoky'],
    ingredients: ['red wine'],
    allergens: ['sulphites'],
    allergensConfirmed: true,
    isSpecial: true,
    isHighMargin: true,
    isChefsPick: false,
    status: 'active',
  },
  {
    id: 'item_014',
    categoryId: 'cat_sandwiches',
    name: 'Bocadillo de Jamón',
    description: 'Crusty baguette, Ibérico ham, rubbed tomato, olive oil.',
    price: 14,
    dishType: 'non-veg',
    portionSize: 'medium',
    tasteProfile: ['savory', 'mild'],
    ingredients: ['baguette', 'ibérico ham', 'tomato', 'olive oil'],
    allergens: ['gluten'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'inactive',
  },
  {
    id: 'item_015',
    categoryId: 'cat_beverages',
    name: 'Red Sangría',
    description: 'House red, macerated citrus and berries, a splash of brandy. Glass.',
    price: 12,
    dishType: 'veg',
    portionSize: 'light',
    tasteProfile: ['sweet', 'tangy'],
    ingredients: ['red wine', 'orange', 'lemon', 'berries', 'brandy'],
    allergens: ['sulphites'],
    allergensConfirmed: true,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
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

  const toggle = useCallback((id: string, key: 'status' | 'isSpecial' | 'isHighMargin') => {
    setItems((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        if (key === 'status') {
          return { ...i, status: i.status === 'active' ? 'inactive' : 'active' };
        }
        return { ...i, [key]: !i[key] };
      }),
    );
  }, []);

  const bulkImport = useCallback((newItems: MenuItem[]) => {
    setItems((list) => [...list, ...newItems]);
  }, []);

  return { items, upsert, remove, toggle, bulkImport };
}

export function newMenuItemId() {
  return `item_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyMenuItem(categoryId: string): MenuItem {
  return {
    id: newMenuItemId(),
    categoryId,
    name: '',
    description: '',
    price: 0,
    dishType: 'veg',
    portionSize: 'medium',
    tasteProfile: [],
    ingredients: [],
    allergens: [],
    allergensConfirmed: false,
    isSpecial: false,
    isHighMargin: false,
    isChefsPick: false,
    status: 'active',
  };
}

/* --- Simulated PDF extraction (design preview) ---------------------------
   The parser extracts name / description / price / category only. Allergens,
   taste, and portion are NOT inferred — the manager must tag them in review.
   So extracted items arrive with allergensConfirmed = false to force the
   mandatory food-safety step. */
export function simulateExtraction(_filename: string): Promise<MenuItem[]> {
  return new Promise((resolve) => {
    const extracted: MenuItem[] = [
      {
        id: newMenuItemId(),
        categoryId: 'cat_tapas',
        name: 'Croquetas de Jamón',
        description: 'Creamy ham croquettes with a golden crumb. Six pieces.',
        price: 12,
        dishType: 'non-veg',
        portionSize: 'light',
        tasteProfile: [],
        ingredients: ['ham', 'milk', 'flour', 'breadcrumbs', 'egg'],
        allergens: [],
        allergensConfirmed: false,
        isSpecial: false,
        isHighMargin: false,
        isChefsPick: false,
        status: 'active',
      },
      {
        id: newMenuItemId(),
        categoryId: 'cat_tapas',
        name: 'Pan con Tomate',
        description: 'Grilled bread rubbed with ripe tomato, garlic, and olive oil.',
        price: 7,
        dishType: 'veg',
        portionSize: 'light',
        tasteProfile: [],
        ingredients: ['bread', 'tomato', 'garlic', 'olive oil'],
        allergens: [],
        allergensConfirmed: false,
        isSpecial: false,
        isHighMargin: false,
        isChefsPick: false,
        status: 'active',
      },
      {
        id: newMenuItemId(),
        categoryId: 'cat_mains',
        name: 'Fideuà de Marisco',
        description: 'Toasted noodle paella with shrimp, squid, and alioli.',
        price: 44,
        dishType: 'non-veg',
        portionSize: 'filling',
        tasteProfile: [],
        ingredients: ['noodles', 'shrimp', 'squid', 'saffron', 'alioli'],
        allergens: [],
        allergensConfirmed: false,
        isSpecial: false,
        isHighMargin: false,
        isChefsPick: false,
        status: 'active',
      },
    ];
    setTimeout(() => resolve(extracted), 2200);
  });
}
