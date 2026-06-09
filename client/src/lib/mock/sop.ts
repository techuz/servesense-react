import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — Service SOP / Flow of Service (SOW v2 §5.3.3).
   Manager-defined, reorderable steps. Each step has only the SOW fields:
   Step Number (the array order), Step Name, Description, Expected Outcome,
   and Scoring Weight. The AI tracks compliance and uses the weights in
   per-session scoring.
   ============================================================================ */

export interface SopStep {
  id: string;
  name: string;             // max 100
  description: string;      // max 500
  expectedOutcome: string;  // max 200, optional
  scoringWeight: number;    // decimal; default equal weight
}

const STORAGE_KEY = 'ss_mock_sop_v2';

/* Default SOP steps preloaded per §5.3.3 (manager can edit / reorder / add). */
const seed: SopStep[] = [
  {
    id: 'sop_greeting',
    name: 'Greeting',
    description:
      'Approach the guest within 30 seconds of arrival with a genuine smile and eye contact. Acknowledge any reservation or recognise repeat guests by name when possible.',
    expectedOutcome: 'First impression',
    scoringWeight: 10,
  },
  {
    id: 'sop_seating',
    name: 'Seating',
    description:
      'Confirm party size and any seating preferences before walking the guest to the table. Assist elderly or accessibility-needs guests.',
    expectedOutcome: 'Comfort',
    scoringWeight: 10,
  },
  {
    id: 'sop_menu_handover',
    name: 'Menu Handover',
    description:
      'Present menus open to the first page, then pause. Briefly mention specials, allergens of concern in tonight’s rotation, and the chef’s pick if asked.',
    expectedOutcome: 'Clarity',
    scoringWeight: 10,
  },
  {
    id: 'sop_order_taking',
    name: 'Order Taking',
    description:
      'Take starter, mains, and sides in clear order. Listen actively, do not interrupt, and repeat the order back before moving to the next guest.',
    expectedOutcome: 'Error reduction',
    scoringWeight: 10,
  },
  {
    id: 'sop_order_confirmation',
    name: 'Order Confirmation',
    description:
      'Before sending the ticket to the kitchen, repeat the full order back to the table. Re-state any allergy notes, preferences, and modifications.',
    expectedOutcome: 'Trust',
    scoringWeight: 10,
  },
  {
    id: 'sop_serving',
    name: 'Serving',
    description:
      'Serve from the guest’s right when possible, announce each dish clearly, and ensure water, bread, and condiments are on the table before stepping back.',
    expectedOutcome: 'Satisfaction',
    scoringWeight: 10,
  },
  {
    id: 'sop_table_check',
    name: 'Table Check',
    description:
      'Within two minutes of serving the mains, return once to ensure everything is to the guest’s satisfaction. Do not linger or hover after the check.',
    expectedOutcome: 'Care without hovering',
    scoringWeight: 10,
  },
  {
    id: 'sop_clearing',
    name: 'Clearing',
    description:
      'Wait until all guests have finished before clearing. Ask once if everyone is done; never assume from cutlery placement alone.',
    expectedOutcome: 'Closure',
    scoringWeight: 10,
  },
  {
    id: 'sop_billing',
    name: 'Billing',
    description:
      'Bring the bill folder face-down when requested. Itemise any modifications, the service / gratuity breakdown, and accepted payment methods clearly.',
    expectedOutcome: 'Smooth end',
    scoringWeight: 10,
  },
  {
    id: 'sop_farewell',
    name: 'Farewell',
    description:
      'Acknowledge each guest as they leave. Thank them by name where known, hand over any to-go items personally, and hold the door for guests with their hands full.',
    expectedOutcome: 'Brand recall',
    scoringWeight: 10,
  },
];

function read(): SopStep[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as SopStep[];
  } catch {
    return seed;
  }
}

function write(value: SopStep[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newSopStepId() {
  return `sop_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptySopStep(): SopStep {
  return { id: newSopStepId(), name: '', description: '', expectedOutcome: '', scoringWeight: 10 };
}

export function useSop() {
  const [steps, setSteps] = useState<SopStep[]>(() => read());

  useEffect(() => {
    write(steps);
  }, [steps]);

  const upsert = useCallback((step: SopStep) => {
    setSteps((list) => {
      const idx = list.findIndex((s) => s.id === step.id);
      if (idx === -1) return [...list, step];
      const next = [...list];
      next[idx] = step;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSteps((list) => list.filter((s) => s.id !== id));
  }, []);

  /** Move a step up (-1) or down (+1) in the sequence. */
  const move = useCallback((id: string, dir: -1 | 1) => {
    setSteps((list) => {
      const idx = list.findIndex((s) => s.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const total = steps.length;
    const totalWeight = steps.reduce((sum, s) => sum + (Number(s.scoringWeight) || 0), 0);
    return { total, totalWeight };
  }, [steps]);

  return { steps, upsert, remove, move, stats };
}
