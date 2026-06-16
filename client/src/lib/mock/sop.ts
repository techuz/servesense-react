import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — Service SOP / Flow of Service (SOW v2 §5.3.3, extended per dev).

   The manager uploads a service document; an LLM extracts the flow as a set of
   STAGES (the SOP steps — Greeting, Seating, …), and within each stage a set of
   RULES the AI checks during live sessions. Each rule has a priority
   (must / should), an instruction, and an optional verbatim script.

   The manager can edit any extracted rule, add rules, and add stages. Stage-level
   Expected Outcome + Scoring Weight (SOW §5.3.3) are preserved for KPI scoring.
   ============================================================================ */

export type SopRulePriority = 'must' | 'should';

export interface SopRule {
  id: string;
  priority: SopRulePriority;
  instruction: string;   // what the waiter must/should do
  script: string;        // optional verbatim line ("Welcome to…")
}

export interface SopStage {
  id: string;
  name: string;             // e.g. "Greeting"
  expectedOutcome: string;  // SOW §5.3.3 (optional)
  scoringWeight: number;    // SOW §5.3.3 — weight in KPI scoring
  rules: SopRule[];
}

/** Metadata for the source document the SOP was extracted from. */
export interface SopSource {
  fileName: string;
  uploadedAt: string;  // ISO
  pageCount: number;
}

export interface SopState {
  source: SopSource | null;
  stages: SopStage[];
}

const STORAGE_KEY = 'ss_mock_sop_v3';

export const priorityLabels: Record<SopRulePriority, string> = {
  must: 'Must',
  should: 'Should',
};

/* Default flow (pre-loaded as if extracted from the seed document). */
const seedStages: SopStage[] = [
  {
    id: 'sop_greeting',
    name: 'Greeting',
    expectedOutcome: 'First impression',
    scoringWeight: 10,
    rules: [
      { id: 'r_greet_1', priority: 'must', instruction: 'Approach the guest within 30 seconds of arrival with eye contact and a genuine smile.', script: 'Welcome to Brasa — great to have you with us tonight.' },
      { id: 'r_greet_2', priority: 'should', instruction: 'Recognise repeat guests by name and acknowledge any reservation.', script: '' },
    ],
  },
  {
    id: 'sop_seating',
    name: 'Seating',
    expectedOutcome: 'Comfort',
    scoringWeight: 10,
    rules: [
      { id: 'r_seat_1', priority: 'must', instruction: 'Confirm party size before walking the guest to the table.', script: '' },
      { id: 'r_seat_2', priority: 'should', instruction: 'Offer assistance to elderly guests or those with accessibility needs.', script: '' },
    ],
  },
  {
    id: 'sop_menu_handover',
    name: 'Menu Handover',
    expectedOutcome: 'Clarity',
    scoringWeight: 10,
    rules: [
      { id: 'r_menu_1', priority: 'must', instruction: 'Present menus open and pause before listing specials.', script: '' },
      { id: 'r_menu_2', priority: 'should', instruction: 'Mention tonight’s specials and the chef’s pick if asked.', script: 'Tonight the chef is recommending the seafood paella.' },
    ],
  },
  {
    id: 'sop_order_taking',
    name: 'Order Taking',
    expectedOutcome: 'Error reduction',
    scoringWeight: 10,
    rules: [
      { id: 'r_order_1', priority: 'must', instruction: 'Listen actively without interrupting, and repeat each item back as it is ordered.', script: '' },
    ],
  },
  {
    id: 'sop_order_confirmation',
    name: 'Order Confirmation',
    expectedOutcome: 'Trust',
    scoringWeight: 10,
    rules: [
      { id: 'r_conf_1', priority: 'must', instruction: 'Repeat the full order back to the table before sending the ticket.', script: 'Let me read that back to make sure I have it right…' },
      { id: 'r_conf_2', priority: 'must', instruction: 'Re-state any allergy notes and confirm them with the guest.', script: '' },
    ],
  },
  {
    id: 'sop_serving',
    name: 'Serving',
    expectedOutcome: 'Satisfaction',
    scoringWeight: 10,
    rules: [
      { id: 'r_serve_1', priority: 'must', instruction: 'Announce each dish clearly as it is placed.', script: '' },
      { id: 'r_serve_2', priority: 'should', instruction: 'Ensure water, bread, and condiments are on the table before stepping back.', script: '' },
    ],
  },
  {
    id: 'sop_table_check',
    name: 'Table Check',
    expectedOutcome: 'Care without hovering',
    scoringWeight: 10,
    rules: [
      { id: 'r_check_1', priority: 'should', instruction: 'Return once within two minutes of serving the mains to check satisfaction; do not hover.', script: 'How is everything tasting so far?' },
    ],
  },
  {
    id: 'sop_clearing',
    name: 'Clearing',
    expectedOutcome: 'Closure',
    scoringWeight: 10,
    rules: [
      { id: 'r_clear_1', priority: 'should', instruction: 'Wait until all guests have finished before clearing; ask once rather than assuming.', script: '' },
    ],
  },
  {
    id: 'sop_billing',
    name: 'Billing',
    expectedOutcome: 'Smooth end',
    scoringWeight: 10,
    rules: [
      { id: 'r_bill_1', priority: 'must', instruction: 'Bring the bill folder face-down when requested and itemise any modifications.', script: '' },
    ],
  },
  {
    id: 'sop_farewell',
    name: 'Farewell',
    expectedOutcome: 'Brand recall',
    scoringWeight: 10,
    rules: [
      { id: 'r_fare_1', priority: 'should', instruction: 'Acknowledge each guest as they leave, thanking them by name where known.', script: 'Thank you for joining us — we hope to see you again soon.' },
    ],
  },
];

const seedState: SopState = {
  source: {
    fileName: 'brasa_service_sop_2026.pdf',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    pageCount: 6,
  },
  stages: seedStages,
};

function read(): SopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.stages)) return seedState;
    return parsed as SopState;
  } catch {
    return seedState;
  }
}

function write(value: SopState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export function emptyRule(): SopRule {
  return { id: rid('r'), priority: 'must', instruction: '', script: '' };
}

export function emptyStage(): SopStage {
  return { id: rid('sop'), name: '', expectedOutcome: '', scoringWeight: 10, rules: [emptyRule()] };
}

/** Simulate the LLM extracting stages + rules from an uploaded document. */
export function simulateSopExtraction(_fileName: string): Promise<SopStage[]> {
  // Deterministic in design preview — returns a fresh copy of the seed flow.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seedStages.map((s) => ({ ...s, rules: s.rules.map((r) => ({ ...r })) })));
    }, 2200);
  });
}

export function useSop() {
  const [state, setState] = useState<SopState>(() => read());

  useEffect(() => {
    write(state);
  }, [state]);

  const setStages = (updater: (stages: SopStage[]) => SopStage[]) =>
    setState((s) => ({ ...s, stages: updater(s.stages) }));

  /* --- Document --------------------------------------------------------- */
  const setFromUpload = useCallback((fileName: string, stages: SopStage[], pageCount: number) => {
    setState({
      source: { fileName, uploadedAt: new Date().toISOString(), pageCount },
      stages,
    });
  }, []);

  const clearSource = useCallback(() => {
    setState({ source: null, stages: [] });
  }, []);

  /* --- Stages ----------------------------------------------------------- */
  const upsertStage = useCallback((stage: SopStage) => {
    setStages((list) => {
      const idx = list.findIndex((s) => s.id === stage.id);
      if (idx === -1) return [...list, stage];
      const next = [...list];
      next[idx] = stage;
      return next;
    });
  }, []);

  const removeStage = useCallback((id: string) => {
    setStages((list) => list.filter((s) => s.id !== id));
  }, []);

  const moveStage = useCallback((id: string, dir: -1 | 1) => {
    setStages((list) => {
      const idx = list.findIndex((s) => s.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  /* --- Rules (scoped to a stage) ---------------------------------------- */
  const updateStageRules = (stageId: string, fn: (rules: SopRule[]) => SopRule[]) =>
    setStages((list) => list.map((s) => (s.id === stageId ? { ...s, rules: fn(s.rules) } : s)));

  const addRule = useCallback((stageId: string) => {
    updateStageRules(stageId, (rules) => [...rules, emptyRule()]);
  }, []);

  const upsertRule = useCallback((stageId: string, rule: SopRule) => {
    updateStageRules(stageId, (rules) => {
      const idx = rules.findIndex((r) => r.id === rule.id);
      if (idx === -1) return [...rules, rule];
      const next = [...rules];
      next[idx] = rule;
      return next;
    });
  }, []);

  const removeRule = useCallback((stageId: string, ruleId: string) => {
    updateStageRules(stageId, (rules) => rules.filter((r) => r.id !== ruleId));
  }, []);

  const stats = useMemo(() => {
    const stageCount = state.stages.length;
    const ruleCount = state.stages.reduce((n, s) => n + s.rules.length, 0);
    const mustCount = state.stages.reduce(
      (n, s) => n + s.rules.filter((r) => r.priority === 'must').length,
      0,
    );
    const totalWeight = state.stages.reduce((n, s) => n + (Number(s.scoringWeight) || 0), 0);
    return { stageCount, ruleCount, mustCount, totalWeight };
  }, [state.stages]);

  return {
    source: state.source,
    stages: state.stages,
    setFromUpload,
    clearSource,
    upsertStage,
    removeStage,
    moveStage,
    addRule,
    upsertRule,
    removeRule,
    stats,
  };
}
