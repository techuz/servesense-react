import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data — Communication & Tone Standards (SOW v2 §5.3.4).
   Three aspects (Tone, Language, Listening), each with a Trained Behavior and
   a Purpose. These are embedded for the AI to evaluate waiter speech against
   and trigger real-time tone nudges. (No difficult-situations playbook and no
   per-aspect phrase lists — those are not in the SOW.)
   ============================================================================ */

export type CommAspectKey = 'tone' | 'language' | 'listening';

export interface CommAspect {
  key: CommAspectKey;
  name: string;
  trainedBehavior: string;
  purpose: string;
}

export type CommState = Record<CommAspectKey, CommAspect>;

/** Fixed order of the three standard aspects (SOW table). */
export const commAspectOrder: CommAspectKey[] = ['tone', 'language', 'listening'];

const seed: CommState = {
  tone: {
    key: 'tone',
    name: 'Tone',
    trainedBehavior:
      'Calm and respectful — speak with a measured pace and a warm undertone, even at full capacity or with an upset guest. Lower your volume rather than raising it.',
    purpose: 'De-escalation',
  },
  language: {
    key: 'language',
    name: 'Language',
    trainedBehavior:
      'Polite phrasing — lead with “of course” and “happily”, offer alternatives instead of flat refusals, and use the guest’s name once you know it.',
    purpose: 'Professionalism',
  },
  listening: {
    key: 'listening',
    name: 'Listening',
    trainedBehavior:
      'No interruption — let the guest finish, acknowledge with a brief cue, and repeat back the key detail before offering a solution.',
    purpose: 'Guest feels heard',
  },
};

const STORAGE_KEY = 'ss_mock_communication_v2';

function read(): CommState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<CommState>;
    // Shallow-merge each aspect over the seed so new fields never blank out.
    return {
      tone: { ...seed.tone, ...parsed?.tone },
      language: { ...seed.language, ...parsed?.language },
      listening: { ...seed.listening, ...parsed?.listening },
    };
  } catch {
    return seed;
  }
}

function write(value: CommState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useCommunication() {
  const [aspects, setAspects] = useState<CommState>(() => read());

  useEffect(() => {
    write(aspects);
  }, [aspects]);

  const updateAspect = useCallback(
    (key: CommAspectKey, patch: Partial<Pick<CommAspect, 'trainedBehavior' | 'purpose'>>) => {
      setAspects((a) => ({ ...a, [key]: { ...a[key], ...patch } }));
    },
    [],
  );

  return { aspects, updateAspect };
}
