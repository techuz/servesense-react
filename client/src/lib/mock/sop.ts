import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M5 — Service SOP (Flow of Service) — SOW §3.3
   The 10 steps are fixed in name and order (per the spec table). The Manager
   can enable/disable each one, edit the description, and curate phrases.
   ============================================================================ */

export type SopStepKey =
  | 'greeting'
  | 'seating'
  | 'menu_handover'
  | 'order_taking'
  | 'order_confirmation'
  | 'serving'
  | 'table_check'
  | 'clearing'
  | 'billing'
  | 'farewell';

export interface SopStepMeta {
  key: SopStepKey;
  order: number;
  name: string;
  shortPrinciple: string;   // e.g. "Warm welcome"
  outcome: string;          // e.g. "First impression"
}

export interface SopStepData {
  enabled: boolean;
  description: string;
  bestPractices: string[];
  thingsToAvoid: string[];
  examplePhrases: string[];
}

export type SopState = Record<SopStepKey, SopStepData>;

export const sopSteps: SopStepMeta[] = [
  {
    key: 'greeting',
    order: 1,
    name: 'Greeting',
    shortPrinciple: 'Warm welcome',
    outcome: 'First impression',
  },
  {
    key: 'seating',
    order: 2,
    name: 'Seating',
    shortPrinciple: 'Preference-based',
    outcome: 'Comfort',
  },
  {
    key: 'menu_handover',
    order: 3,
    name: 'Menu Handover',
    shortPrinciple: 'Clear & calm',
    outcome: 'Clarity',
  },
  {
    key: 'order_taking',
    order: 4,
    name: 'Order Taking',
    shortPrinciple: 'Listen & repeat',
    outcome: 'Error reduction',
  },
  {
    key: 'order_confirmation',
    order: 5,
    name: 'Order Confirmation',
    shortPrinciple: 'Verify preferences',
    outcome: 'Trust',
  },
  {
    key: 'serving',
    order: 6,
    name: 'Serving',
    shortPrinciple: 'Timely & accurate',
    outcome: 'Satisfaction',
  },
  {
    key: 'table_check',
    order: 7,
    name: 'Table Check',
    shortPrinciple: 'Once post-serving',
    outcome: 'Care without hovering',
  },
  {
    key: 'clearing',
    order: 8,
    name: 'Clearing',
    shortPrinciple: 'Polite',
    outcome: 'Closure',
  },
  {
    key: 'billing',
    order: 9,
    name: 'Billing',
    shortPrinciple: 'Transparent',
    outcome: 'Smooth end',
  },
  {
    key: 'farewell',
    order: 10,
    name: 'Farewell',
    shortPrinciple: 'Thank & invite back',
    outcome: 'Brand recall',
  },
];

const seedState: SopState = {
  greeting: {
    enabled: true,
    description:
      'Approach the guest within 30 seconds of arrival with a genuine smile and eye contact. Acknowledge any reservation or recognise repeat guests by name when possible.',
    bestPractices: [
      'Smile and make eye contact before speaking',
      'Use the guest\'s name if known',
      'Acknowledge reservation status immediately',
    ],
    thingsToAvoid: [
      'Keeping the guest waiting at the door',
      'Greeting from behind a screen or counter',
      'Sounding rehearsed or robotic',
    ],
    examplePhrases: [
      '“Good evening, welcome to Lumière. Do you have a reservation with us tonight?”',
      '“Lovely to see you again — your usual table?”',
    ],
  },
  seating: {
    enabled: true,
    description:
      'Confirm party size and any seating preferences before walking the guest to the table. Pull out chairs for elderly or accessibility-needs guests; place napkins on laps where appropriate.',
    bestPractices: [
      'Confirm party size with a quick visual count',
      'Ask preference — booth, banquette, window, quiet area',
      'Walk one pace ahead, gesture to the table',
    ],
    thingsToAvoid: [
      'Seating large parties in tight corners',
      'Pointing at the table from a distance',
      'Assuming preferences without asking',
    ],
    examplePhrases: [
      '“Right this way — would you prefer the booth or the window seat?”',
    ],
  },
  menu_handover: {
    enabled: true,
    description:
      'Present menus open to the first page, then pause. Briefly mention specials or off-menu items, allergens of concern in tonight\'s rotation, and recommend the chef\'s pick if asked.',
    bestPractices: [
      'Present the menu open, not closed',
      'Mention one or two specials, not a list',
      'Offer the wine list separately if relevant',
    ],
    thingsToAvoid: [
      'Reciting the entire specials menu without being asked',
      'Skipping the wine/cocktail menu',
      'Walking away before the guest is settled',
    ],
    examplePhrases: [
      '“Tonight chef is featuring a hand-cut tagliatelle with porcini ragù — happy to walk you through anything.”',
    ],
  },
  order_taking: {
    enabled: true,
    description:
      'Take starter, mains, and sides in clear order. Listen actively, do not interrupt, and repeat the order back to the guest before moving to the next person.',
    bestPractices: [
      'Stand on the guest\'s left when writing',
      'Take ladies first, then gentlemen, host last',
      'Note allergies and dietary restrictions twice',
    ],
    thingsToAvoid: [
      'Looking at the pad rather than the guest',
      'Suggesting upsells before the guest has decided',
      'Forgetting to ask about doneness or preference levels',
    ],
    examplePhrases: [
      '“And how would you like the lamb cooked tonight?”',
      '“So that\'s the burrata to start, then the cacio e pepe for you — anything to drink with that?”',
    ],
  },
  order_confirmation: {
    enabled: true,
    description:
      'Before sending the ticket to the kitchen, repeat the full order back to the table. Specifically re-state any allergy notes, preferences, and modifications.',
    bestPractices: [
      'Repeat the order item-by-item, in the order it was given',
      'Confirm spice / cook levels verbally',
      'Confirm allergies a second time aloud',
    ],
    thingsToAvoid: [
      'Reading orders by guest position instead of by item',
      'Skipping confirmation for "simple" tables',
      'Mumbling through the repeat',
    ],
    examplePhrases: [
      '“Just to confirm — one truffle burrata, one lamb shank medium-rare, and the cauliflower steak with no sesame. Yes?”',
    ],
  },
  serving: {
    enabled: true,
    description:
      'Serve from the guest\'s right when possible, announce each dish clearly, and ensure all required accompaniments (water, bread, condiments) are on the table before stepping back.',
    bestPractices: [
      'Announce the dish by name as you set it down',
      'Place dishes in the order received from the kitchen',
      'Check water levels with each pass',
    ],
    thingsToAvoid: [
      'Reaching across guests',
      'Setting hot plates without warning',
      'Stacking arms with too many plates',
    ],
    examplePhrases: [
      '“Cacio e pepe, finished with cracked pepper — enjoy.”',
    ],
  },
  table_check: {
    enabled: true,
    description:
      'Within two minutes of serving the mains, return once to ensure everything is to the guest\'s satisfaction. Do not linger or hover after the check.',
    bestPractices: [
      'Make brief eye contact, ask a specific question',
      'Refill water and address any concerns immediately',
      'Step away once acknowledged',
    ],
    thingsToAvoid: [
      'Asking "how is everything?" multiple times',
      'Interrupting mid-bite',
      'Hovering after the check is done',
    ],
    examplePhrases: [
      '“How are you finding the lamb?”',
    ],
  },
  clearing: {
    enabled: true,
    description:
      'Wait until all guests at the table have finished before clearing. Ask once if everyone is done, never assume from cutlery placement alone for unfamiliar guests.',
    bestPractices: [
      'Clear from the right when possible',
      'Ask: "May I clear?" before reaching',
      'Take all plates in one trip if feasible',
    ],
    thingsToAvoid: [
      'Clearing while one guest is still eating',
      'Scraping plates within earshot of the table',
      'Clearing cutlery before dessert is offered',
    ],
    examplePhrases: [
      '“May I take these for you? Would you like to see the dessert menu?”',
    ],
  },
  billing: {
    enabled: true,
    description:
      'Bring the bill folder face-down when requested. Itemise any modifications, service charge breakdown, and accepted payment modes clearly.',
    bestPractices: [
      'Bring the bill within 2 minutes of request',
      'Place it equidistant if no host is obvious',
      'Process payment promptly, return change/receipt within 90 seconds',
    ],
    thingsToAvoid: [
      'Bringing the bill before it\'s asked for',
      'Lingering while the guest reviews the bill',
      'Walking away with the card without acknowledging',
    ],
    examplePhrases: [
      '“Whenever you\'re ready — and we accept all major cards and UPI.”',
    ],
  },
  farewell: {
    enabled: true,
    description:
      'Acknowledge each guest as they leave. Thank them by name where known, hand over any to-go items personally, and hold the door open for elderly or families with children.',
    bestPractices: [
      'Make eye contact and thank by name',
      'Mention the next visit or upcoming event lightly',
      'Hold the door for guests with their hands full',
    ],
    thingsToAvoid: [
      'Saying "have a good one" robotically',
      'Letting guests walk out unacknowledged',
      'Forgetting to-go items at the host stand',
    ],
    examplePhrases: [
      '“Thank you for joining us tonight — we hope to see you again soon.”',
    ],
  },
};

const STORAGE_KEY = 'ss_mock_sop';

function deepMerge<T>(fallback: T, override: unknown): T {
  if (
    typeof fallback !== 'object' ||
    fallback === null ||
    Array.isArray(fallback) ||
    typeof override !== 'object' ||
    override === null ||
    Array.isArray(override)
  ) {
    return (override === undefined ? fallback : (override as T));
  }
  const result: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const fb = (fallback as Record<string, unknown>)[key];
    const ov = (override as Record<string, unknown>)[key];
    result[key] = deepMerge(fb, ov);
  }
  return result as T;
}

function readState(): SopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState;
    return deepMerge(seedState, JSON.parse(raw));
  } catch {
    return seedState;
  }
}

function writeState(value: SopState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useSop() {
  const [state, setState] = useState<SopState>(() => readState());

  useEffect(() => {
    writeState(state);
  }, [state]);

  const updateStep = useCallback(
    (key: SopStepKey, patch: Partial<SopStepData>) => {
      setState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
    },
    [],
  );

  return { state, updateStep };
}

export function sopProgress(state: SopState): { enabled: number; total: number; customized: number } {
  const total = sopSteps.length;
  const enabled = sopSteps.filter((s) => state[s.key]?.enabled).length;
  const customized = sopSteps.filter((s) => {
    const d = state[s.key];
    return d?.bestPractices.length > 0 || d?.examplePhrases.length > 0;
  }).length;
  return { enabled, total, customized };
}
