import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data — Best Practices & Excellence (SOW v2 §5.3.5, ADVANCED · Optional).
   Four areas (Anticipation, Peak Hours, VIPs, Recovery), each with a single
   Focus describing the advanced standard. (No house principle and no per-area
   phrase lists — those are not in the SOW.)
   ============================================================================ */

export type ExcellenceAreaKey = 'anticipation' | 'peak_hours' | 'vips' | 'recovery';

export interface ExcellenceArea {
  key: ExcellenceAreaKey;
  name: string;
  focus: string;
}

export type ExcellenceState = Record<ExcellenceAreaKey, ExcellenceArea>;

/** Fixed order of the four areas (SOW table). */
export const excellenceAreaOrder: ExcellenceAreaKey[] = ['anticipation', 'peak_hours', 'vips', 'recovery'];

const seed: ExcellenceState = {
  anticipation: {
    key: 'anticipation',
    name: 'Anticipation',
    focus: 'Water, napkins, and cutlery refreshed before the guest has to ask — spot the need ahead of the request.',
  },
  peak_hours: {
    key: 'peak_hours',
    name: 'Peak Hours',
    focus: 'Speed with clarity — move faster without sounding faster, and keep the guest from feeling the rush.',
  },
  vips: {
    key: 'vips',
    name: 'VIPs',
    focus: 'A personal touch for regulars — a name remembered, a preference recalled, a small off-menu gesture.',
  },
  recovery: {
    key: 'recovery',
    name: 'Recovery',
    focus: 'Calm, generous handling when something goes wrong — own it quickly and make the fix the memory.',
  },
};

const STORAGE_KEY = 'ss_mock_excellence_v2';

function read(): ExcellenceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<ExcellenceState>;
    return {
      anticipation: { ...seed.anticipation, ...parsed?.anticipation },
      peak_hours: { ...seed.peak_hours, ...parsed?.peak_hours },
      vips: { ...seed.vips, ...parsed?.vips },
      recovery: { ...seed.recovery, ...parsed?.recovery },
    };
  } catch {
    return seed;
  }
}

function write(value: ExcellenceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useExcellence() {
  const [areas, setAreas] = useState<ExcellenceState>(() => read());

  useEffect(() => {
    write(areas);
  }, [areas]);

  const updateArea = useCallback(
    (key: ExcellenceAreaKey, patch: Partial<Pick<ExcellenceArea, 'focus'>>) => {
      setAreas((a) => ({ ...a, [key]: { ...a[key], ...patch } }));
    },
    [],
  );

  return { areas, updateArea };
}
