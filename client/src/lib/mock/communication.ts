import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M6 — Communication & Tone (SOW §3.4).
   Three aspects (Tone, Language, Listening) + a Difficult Situations playbook.
   Feeds the AI's tone analysis + de-escalation prompts (SOW §4.2).
   ============================================================================ */

export type CommAspectKey = 'tone' | 'language' | 'listening';

export interface CommAspectMeta {
  key: CommAspectKey;
  name: string;
  trainedBehaviour: string;
  purpose: string;
}

export interface CommAspectData {
  description: string;
  principles: string[];
  redFlags: string[];
  examplePhrases: string[];
}

export type CommState = Record<CommAspectKey, CommAspectData>;

export type SituationCategory =
  | 'complaint'
  | 'slow_service'
  | 'allergy'
  | 'special_request'
  | 'mistake'
  | 'language_barrier';

export interface DifficultSituation {
  id: string;
  category: SituationCategory;
  title: string;
  context: string;
  triggerSignals: string[];
  recoveryPhrases: string[];
}

export interface CommunicationData {
  aspects: CommState;
  situations: DifficultSituation[];
}

export const commAspects: CommAspectMeta[] = [
  {
    key: 'tone',
    name: 'Tone',
    trainedBehaviour: 'Calm, respectful, warm',
    purpose: 'De-escalation',
  },
  {
    key: 'language',
    name: 'Language',
    trainedBehaviour: 'Polite phrasing, brand voice',
    purpose: 'Professionalism',
  },
  {
    key: 'listening',
    name: 'Listening',
    trainedBehaviour: 'Active, no interruption',
    purpose: 'Guest feels heard',
  },
];

export const situationCategoryLabels: Record<SituationCategory, string> = {
  complaint: 'Guest complaint',
  slow_service: 'Slow service',
  allergy: 'Allergy concern',
  special_request: 'Special request',
  mistake: 'Service mistake',
  language_barrier: 'Language barrier',
};

const seed: CommunicationData = {
  aspects: {
    tone: {
      description:
        'Speak with a calm, measured pace and warm undertone — even when the restaurant is full or a guest is upset. Match the energy of the table without ever rising above it.',
      principles: [
        'Speak slightly slower than the guest, never faster',
        'Lower volume rather than raising it during disagreement',
        'Smile in your voice — even on the phone',
        'Maintain eye contact during difficult conversations',
      ],
      redFlags: [
        'Sighing or audible frustration',
        'Sarcastic or curt one-word responses',
        'Rushing through questions',
        'Raising voice over background noise',
      ],
      examplePhrases: [
        '“Of course — let me take care of that right away.”',
        '“I understand completely. Here\'s what I can do.”',
      ],
    },
    language: {
      description:
        'Use precise, warm phrasing that respects the guest\'s time. Avoid slang, restaurant jargon, or filler phrases that flatten the experience.',
      principles: [
        'Lead with "of course", "happily", "absolutely"',
        'Offer alternatives, never just refusals',
        'Use the guest\'s name once you know it',
        'Default to "may I" over "can I"',
      ],
      redFlags: [
        'Saying "no problem" — implies there was a problem',
        'Calling guests "you guys" — use "everyone" or names',
        'Telling guests "we don\'t do that" without an alternative',
        'Apologising for things that aren\'t your fault — undermines authority',
      ],
      examplePhrases: [
        '“Happily — I\'ll check with the chef.”',
        '“Absolutely, allow me a moment.”',
        '“Of course — would the next available time work for you?”',
      ],
    },
    listening: {
      description:
        'Let the guest finish before responding. Acknowledge with a small visual cue, repeat back the key detail, and pause briefly before offering a solution.',
      principles: [
        'Wait one full beat after the guest finishes speaking',
        'Repeat back the specific detail you heard',
        'Acknowledge with a nod or "I hear you" before solving',
        'Take notes openly for orders, allergies, requests',
      ],
      redFlags: [
        'Interrupting to finish the guest\'s sentence',
        'Looking past the guest as they speak',
        'Jumping to a solution before they\'re done',
        'Asking the same question twice in a session',
      ],
      examplePhrases: [
        '“So that\'s a hazelnut allergy and dairy-free for the dessert — got it.”',
        '“Just to make sure I heard that right…”',
      ],
    },
  },
  situations: [
    {
      id: 'sit_001',
      category: 'complaint',
      title: 'Dish sent back as overcooked',
      context:
        'Guest gestures or asks to speak with staff after a few bites. The complaint may or may not be valid; treat it as valid until proven otherwise.',
      triggerSignals: [
        'guest waves the waiter over',
        '"this is overdone"',
        '"can you take this back"',
        'guest pushing plate away',
      ],
      recoveryPhrases: [
        '“I\'m so sorry — let me have this redone for you right away. May I bring you a fresh starter while you wait?”',
        '“Thank you for letting me know. I\'ll get this sorted in the next ten minutes.”',
      ],
    },
    {
      id: 'sit_002',
      category: 'slow_service',
      title: 'Long wait between courses',
      context:
        'Mains have not arrived 20+ minutes after starters were cleared. Get ahead of it before the guest asks.',
      triggerSignals: [
        'guest checking watch repeatedly',
        '"how much longer"',
        '"we\'ve been waiting"',
        'irritated body language',
      ],
      recoveryPhrases: [
        '“I want to apologise for the wait — your mains are 3 minutes out. Can I top up your water in the meantime?”',
        '“I\'m so sorry — let me check with the kitchen and come right back.”',
      ],
    },
    {
      id: 'sit_003',
      category: 'allergy',
      title: 'Guest discloses a serious allergy mid-meal',
      context:
        'Guest mentions an allergy AFTER ordering, raising risk of cross-contamination. Take it seriously even if dish is already in front of them.',
      triggerSignals: [
        '"I forgot to mention"',
        '"I\'m allergic to"',
        '"is there any X in this"',
        '"deathly allergic"',
      ],
      recoveryPhrases: [
        '“Thank you for telling me — I\'ll have the kitchen confirm right away and we\'ll remake this if there\'s any risk.”',
        '“Let me pause this and check with the chef personally. We\'ll re-fire if there\'s any chance of contact.”',
      ],
    },
    {
      id: 'sit_004',
      category: 'special_request',
      title: 'Off-menu dish or modification',
      context:
        'Guest asks for something not on the menu, or a major modification (e.g. vegan version of a dairy-heavy dish).',
      triggerSignals: [
        '"can the chef do"',
        '"is there any way to"',
        '"without the cheese"',
        '"vegan version"',
      ],
      recoveryPhrases: [
        '“Let me check with the chef — happy to see what we can do. Are there any other ingredients we should avoid?”',
        '“We can absolutely make that work. Give me one moment.”',
      ],
    },
    {
      id: 'sit_005',
      category: 'mistake',
      title: 'Wrong order delivered',
      context:
        'Wrong dish has been placed in front of the guest. Acknowledge, retrieve, and correct without making the guest feel awkward.',
      triggerSignals: [
        '"I didn\'t order this"',
        '"this isn\'t mine"',
        'guest looking confused at the dish',
      ],
      recoveryPhrases: [
        '“My mistake entirely — let me bring you what you ordered right away. Please start with the appetiser on me.”',
        '“So sorry about that — your dish is coming up in two minutes.”',
      ],
    },
    {
      id: 'sit_006',
      category: 'language_barrier',
      title: 'Guest is more comfortable in another language',
      context:
        'Guest is hesitant, smiling but quiet, or asking for things by pointing. Adjust pace and use simpler language.',
      triggerSignals: [
        'guest pointing at menu items',
        '"sorry, English not so good"',
        'speaking softly, looking unsure',
      ],
      recoveryPhrases: [
        '“No problem at all — take your time. I can recommend a few favourites if that helps?”',
        '“We can do this slowly together — what flavours do you usually enjoy?”',
      ],
    },
  ],
};

const STORAGE_KEY = 'ss_mock_communication';

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

function read(): CommunicationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    // Only deep-merge aspects — the situations array should override directly
    // so deletions stick.
    return {
      aspects: deepMerge(seed.aspects, parsed?.aspects),
      situations: Array.isArray(parsed?.situations) ? parsed.situations : seed.situations,
    };
  } catch {
    return seed;
  }
}

function write(value: CommunicationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newSituationId() {
  return `sit_${Math.random().toString(36).slice(2, 9)}`;
}

export function useCommunication() {
  const [data, setData] = useState<CommunicationData>(() => read());

  useEffect(() => {
    write(data);
  }, [data]);

  const updateAspect = useCallback(
    (key: CommAspectKey, patch: Partial<CommAspectData>) => {
      setData((d) => ({ ...d, aspects: { ...d.aspects, [key]: { ...d.aspects[key], ...patch } } }));
    },
    [],
  );

  const upsertSituation = useCallback((situation: DifficultSituation) => {
    setData((d) => {
      const idx = d.situations.findIndex((s) => s.id === situation.id);
      if (idx === -1) return { ...d, situations: [...d.situations, situation] };
      const next = [...d.situations];
      next[idx] = situation;
      return { ...d, situations: next };
    });
  }, []);

  const removeSituation = useCallback((id: string) => {
    setData((d) => ({ ...d, situations: d.situations.filter((s) => s.id !== id) }));
  }, []);

  return { data, updateAspect, upsertSituation, removeSituation };
}
