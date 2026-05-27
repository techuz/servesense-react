import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M7 — Best Practices & Excellence (SOW §3.5, ADVANCED).
   Four focus areas for the more experienced tier of staff. Feeds the AI's
   recognition layer — staff whose live sessions hit these signals get higher
   scores and are flagged as leadership-ready.
   ============================================================================ */

export type ExcellenceAreaKey = 'anticipation' | 'peak_hours' | 'vips' | 'recovery';

export interface ExcellenceAreaMeta {
  key: ExcellenceAreaKey;
  name: string;
  focus: string;        // The SOW "Focus" column
  principle: string;    // Short tagline shown under the title
}

export interface ExcellenceAreaData {
  description: string;
  hallmarks: string[];          // Signature behaviours — what excellent looks like
  recognitionTriggers: string[];// Signals the AI scores as proactive
  examplePhrases: string[];
}

export interface ExcellenceData {
  brandPrinciple: string;
  areas: Record<ExcellenceAreaKey, ExcellenceAreaData>;
}

export const excellenceAreas: ExcellenceAreaMeta[] = [
  {
    key: 'anticipation',
    name: 'Anticipation',
    focus: 'Water, napkins, cutlery',
    principle: 'Spot the need before the ask.',
  },
  {
    key: 'peak_hours',
    name: 'Peak Hours',
    focus: 'Speed + clarity',
    principle: 'Move faster without sounding faster.',
  },
  {
    key: 'vips',
    name: 'VIPs',
    focus: 'Personal touch',
    principle: 'Make the regular feel one-of-a-kind.',
  },
  {
    key: 'recovery',
    name: 'Recovery',
    focus: 'Calm mistake handling',
    principle: 'Turn a wrong moment into a memorable one.',
  },
];

const seed: ExcellenceData = {
  brandPrinciple:
    'Excellence at Lumière isn\'t about following a script — it\'s about reading the room and crafting a moment the guest didn\'t know they wanted.',
  areas: {
    anticipation: {
      description:
        'See the table holistically. Refills, replacement cutlery, fresh napkins, side plates for sharing — handle them before the guest has to ask. Anticipation is the quiet difference between good service and great service.',
      hallmarks: [
        'Water refilled at the 1/3 mark, never the empty mark',
        'Extra plates appear when a sharing dish arrives, without being asked',
        'Replacement cutlery delivered between courses on the appropriate side',
        'Bread basket re-stocked before it\'s empty',
        'A second napkin offered with messy dishes (ribs, lobster, dumplings)',
      ],
      recognitionTriggers: [
        'guest mentions surprise: "oh thank you"',
        'no requests during a 20-min period',
        'multiple proactive touches per table-check',
      ],
      examplePhrases: [
        '“I\'ll bring out extra plates — this is great for sharing.”',
        '“Another napkin for you — these can get a little messy.”',
      ],
    },
    peak_hours: {
      description:
        'When the floor is full, the bar three-deep, and the kitchen ticket queue is climbing — speed matters, but so does poise. The guest should never feel the pressure you are under.',
      hallmarks: [
        'Eye contact made with every newly-arrived guest within 60 seconds',
        'Hands always carry on the way out of the kitchen — never an empty trip',
        'Communicates wait times honestly without apologising repeatedly',
        'Acknowledges tables on the walk-by even when not their section',
        'Voice stays soft and pace stays steady, even when moving quickly',
      ],
      recognitionTriggers: [
        'high session count during peak window',
        'no detected stress signals (raised tone, sigh)',
        'positive guest sentiment maintained',
      ],
      examplePhrases: [
        '“With you in just a moment — thank you for your patience.”',
        '“The mains are about 12 minutes — would another round suit you while you wait?”',
      ],
    },
    vips: {
      description:
        'Regulars, industry friends, repeat anniversary guests. The right touch — using a name, remembering a preference, sending out an off-menu amuse — is what turns a good restaurant into "their" restaurant.',
      hallmarks: [
        'Greets repeat guests by name without checking the reservation',
        'Recalls a previous order or preference unprompted',
        'Sends a small off-menu touch (amuse, palate cleanser, dessert) for milestones',
        'Coordinates with the kitchen on guest-specific preparations quietly',
        'Walks VIPs to the table personally on arrival',
      ],
      recognitionTriggers: [
        'guest name used early in the conversation',
        'previous-visit reference made',
        'positive emotional response detected',
      ],
      examplePhrases: [
        '“Lovely to see you again — Chef put aside the burrata especially when she saw your name on the book.”',
        '“The usual table?”',
      ],
    },
    recovery: {
      description:
        'Things go wrong — kitchen mis-fires, wine corked, a guest is unhappy. Excellence isn\'t avoiding mistakes; it\'s how you handle them. Own it quickly, fix it generously, and the recovery becomes the memory.',
      hallmarks: [
        'Acknowledges the issue within 30 seconds, without defensiveness',
        'Owns the mistake on behalf of the restaurant — never blames the kitchen or another shift',
        'Offers a meaningful gesture (course on us, dessert, drink) without being asked',
        'Follows up at the table 5 minutes after the fix to confirm satisfaction',
        'Pre-empts any further issue (e.g. checks the rest of the table\'s food immediately)',
      ],
      recognitionTriggers: [
        'complaint detected in first half of session, sentiment turns positive by end',
        'apology + gesture phrasing detected together',
        'guest verbalises satisfaction post-recovery',
      ],
      examplePhrases: [
        '“This is entirely on us — your dish is being remade and the next course is on the house.”',
        '“I want to make absolutely sure the rest of your evening is perfect — please let me know if anything else needs adjusting.”',
      ],
    },
  },
};

const STORAGE_KEY = 'ss_mock_excellence';

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

function read(): ExcellenceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    return deepMerge(seed, JSON.parse(raw));
  } catch {
    return seed;
  }
}

function write(value: ExcellenceData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useExcellence() {
  const [data, setData] = useState<ExcellenceData>(() => read());

  useEffect(() => {
    write(data);
  }, [data]);

  const updatePrinciple = useCallback((principle: string) => {
    setData((d) => ({ ...d, brandPrinciple: principle }));
  }, []);

  const updateArea = useCallback(
    (key: ExcellenceAreaKey, patch: Partial<ExcellenceAreaData>) => {
      setData((d) => ({ ...d, areas: { ...d.areas, [key]: { ...d.areas[key], ...patch } } }));
    },
    [],
  );

  return { data, updatePrinciple, updateArea };
}
