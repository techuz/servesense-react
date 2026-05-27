import { useCallback, useEffect, useState } from 'react';
import type {
  OrientationModuleMeta,
  OrientationSource,
} from '@/components/orientation/types';

/* ============================================================================
   Mock data — orientation source PDF metadata (SOW §3.1–§3.6).

   Per the SOW, the restaurant manager feeds all orientation data into the
   portal by uploading a PDF document; the portal renders the extracted
   content read-only. This hook tracks the active PDF metadata per module.
   The actual displayed content (policies, menu, SOP, etc.) stays in each
   module's existing data hook; this hook only records which document the
   visible content was extracted from.
   ============================================================================ */

export type OrientationModuleKey =
  | 'policies'
  | 'menu'
  | 'sop'
  | 'communication'
  | 'excellence'
  | 'goals';

/* Every module starts with no source PDF — the empty upload state is the
 * first impression. The manager uploads a (mock) PDF to reveal the seeded
 * read-only content; the Delete action on the banner returns to empty. */
const seedSources: Record<OrientationModuleKey, OrientationSource | null> = {
  policies: null,
  menu: null,
  sop: null,
  communication: null,
  excellence: null,
  goals: null,
};

export const moduleMeta: Record<OrientationModuleKey, OrientationModuleMeta> = {
  policies: {
    label: 'standard policies',
    hint: 'Operating timings, reservations, dining rules, accommodation, and payments.',
    sowRef: '§3.1',
  },
  menu: {
    label: 'menu',
    hint: 'Dish names, prices, ingredients, allergens, taste profile, and portion sizes.',
    sowRef: '§3.2',
  },
  sop: {
    label: 'service SOP',
    hint: 'Greeting through farewell — the 10-step flow of service your team follows.',
    sowRef: '§3.3',
  },
  communication: {
    label: 'communication & tone',
    hint: 'Tone, language, listening behaviour, and difficult-situation playbook.',
    sowRef: '§3.4',
  },
  excellence: {
    label: 'excellence playbook',
    hint: 'Brand principles plus anticipation, peak-hour, VIP, and recovery practices.',
    sowRef: '§3.5',
  },
  goals: {
    label: 'sales goals & campaigns',
    hint: 'Daily and weekly targets, target items, and campaign validity windows.',
    sowRef: '§3.6',
  },
};

function storageKey(module: OrientationModuleKey): string {
  return `ss_mock_orientation_source_${module}`;
}

/* One-time migration: an earlier build auto-seeded every module with a
 * source PDF. The current build wants the empty-upload state as the first
 * impression, so on any browser that hasn't seen this version yet we wipe
 * the persisted source keys. The Delete action on the banner remains the
 * supported path after this initial clear. */
const STORAGE_VERSION = 2;
const VERSION_KEY = 'ss_mock_orientation_source_version';
let migrated = false;
function migrateOnce() {
  if (migrated) return;
  migrated = true;
  try {
    const current = Number(localStorage.getItem(VERSION_KEY) ?? '1');
    if (current >= STORAGE_VERSION) return;
    const modules: OrientationModuleKey[] = [
      'policies',
      'menu',
      'sop',
      'communication',
      'excellence',
      'goals',
    ];
    for (const m of modules) localStorage.removeItem(storageKey(m));
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
  } catch {
    /* ignore */
  }
}

function readSource(module: OrientationModuleKey): OrientationSource | null {
  migrateOnce();
  try {
    const raw = localStorage.getItem(storageKey(module));
    if (raw === null) return seedSources[module];
    if (raw === 'null') return null;
    return JSON.parse(raw) as OrientationSource;
  } catch {
    return seedSources[module];
  }
}

function writeSource(module: OrientationModuleKey, value: OrientationSource | null) {
  try {
    localStorage.setItem(storageKey(module), value === null ? 'null' : JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useOrientationSource(module: OrientationModuleKey) {
  const [source, setSource] = useState<OrientationSource | null>(() => readSource(module));

  useEffect(() => {
    writeSource(module, source);
  }, [module, source]);

  const uploadSource = useCallback((next: OrientationSource) => {
    setSource(next);
  }, []);

  const clearSource = useCallback(() => {
    setSource(null);
  }, []);

  return { source, uploadSource, clearSource, meta: moduleMeta[module] };
}
