import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data for M8 — Sales Goals & Campaigns (SOW §3.6).
   Manager-defined push campaigns: "sell 50 wine pairings this week", etc.
   The AI biases live upsell recommendations toward these targets and the
   manager dashboard scores progress against them.
   ============================================================================ */

export type GoalType = 'daily' | 'weekly';
export type GoalStatus = 'active' | 'upcoming' | 'ended';

export interface SalesGoal {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  /** Menu-item IDs the goal counts toward. */
  targetItemIds: string[];
  /** Target number of orders containing any of the target items. */
  targetValue: number;
  /** Mock progress so cards feel populated. Real data lands once sessions exist. */
  currentValue: number;
  /** ISO date YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** Manager toggle — paused goals stop biasing AI upsells. */
  isEnabled: boolean;
}

const STORAGE_KEY = 'ss_mock_sales_goals';

/* --- Helpers -------------------------------------------------------------- */
function isoOffset(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export function statusOf(goal: SalesGoal, today = new Date()): GoalStatus {
  const t = today.toISOString().slice(0, 10);
  if (t < goal.startDate) return 'upcoming';
  if (t > goal.endDate) return 'ended';
  return 'active';
}

export function progressOf(goal: SalesGoal): number {
  if (goal.targetValue <= 0) return 0;
  return Math.min(1, goal.currentValue / goal.targetValue);
}

export function daysRemaining(goal: SalesGoal, today = new Date()): number {
  const end = new Date(goal.endDate + 'T23:59:59');
  const ms = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export const goalTypeLabels: Record<GoalType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
};

export const goalStatusLabels: Record<GoalStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

/* --- Seed (built off the existing menu-item IDs in mock/menu.ts) ---------- */
const seed: SalesGoal[] = [
  {
    id: 'goal_wine_push',
    name: 'Signature cocktail blitz',
    description:
      'Push the Smoked Old Fashioned and Truffle Burrata pairing through the dinner service. High-margin combo that lands well with the after-work crowd.',
    type: 'weekly',
    targetItemIds: ['item_013', 'item_001'],
    targetValue: 80,
    currentValue: 47,
    startDate: isoOffset(-3),
    endDate: isoOffset(4),
    isEnabled: true,
  },
  {
    id: 'goal_dessert_weekend',
    name: 'Weekend dessert push',
    description:
      'Move the chocolate fondant and coconut panna cotta as the post-main upsell — a small "anything sweet?" beat after the table check.',
    type: 'weekly',
    targetItemIds: ['item_010', 'item_011'],
    targetValue: 120,
    currentValue: 89,
    startDate: isoOffset(-6),
    endDate: isoOffset(1),
    isEnabled: true,
  },
  {
    id: 'goal_signature_starter',
    name: 'Signature starter focus',
    description:
      'Lift starter attach-rate on Wednesday and Thursday — Truffle Burrata, Beetroot Carpaccio, Crispy Calamari.',
    type: 'daily',
    targetItemIds: ['item_001', 'item_002', 'item_003'],
    targetValue: 30,
    currentValue: 12,
    startDate: isoOffset(0),
    endDate: isoOffset(0),
    isEnabled: true,
  },
  {
    id: 'goal_lamb_special',
    name: 'Lamb Shank seasonal',
    description:
      'New seasonal lamb shank — a slow-mover early in the week, build awareness through a soft pitch on the recommendation prompt.',
    type: 'weekly',
    targetItemIds: ['item_006'],
    targetValue: 35,
    currentValue: 0,
    startDate: isoOffset(2),
    endDate: isoOffset(9),
    isEnabled: true,
  },
];

/* --- Storage -------------------------------------------------------------- */
function read(): SalesGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as SalesGoal[];
  } catch {
    return seed;
  }
}

function write(value: SalesGoal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newGoalId() {
  return `goal_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyGoal(): SalesGoal {
  return {
    id: newGoalId(),
    name: '',
    description: '',
    type: 'weekly',
    targetItemIds: [],
    targetValue: 10,
    currentValue: 0,
    startDate: isoOffset(0),
    endDate: isoOffset(7),
    isEnabled: true,
  };
}

/* --- Hook ----------------------------------------------------------------- */
export function useSalesGoals() {
  const [goals, setGoals] = useState<SalesGoal[]>(() => read());

  useEffect(() => {
    write(goals);
  }, [goals]);

  const upsert = useCallback((goal: SalesGoal) => {
    setGoals((list) => {
      const idx = list.findIndex((g) => g.id === goal.id);
      if (idx === -1) return [...list, goal];
      const next = [...list];
      next[idx] = goal;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setGoals((list) => list.filter((g) => g.id !== id));
  }, []);

  const toggleEnabled = useCallback((id: string) => {
    setGoals((list) =>
      list.map((g) => (g.id === id ? { ...g, isEnabled: !g.isEnabled } : g)),
    );
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const active = goals.filter((g) => g.isEnabled && statusOf(g, now) === 'active');
    const upcoming = goals.filter((g) => statusOf(g, now) === 'upcoming');
    const totalProgress =
      active.length === 0
        ? 0
        : active.reduce((sum, g) => sum + progressOf(g), 0) / active.length;
    const totalTargetOrders = active.reduce((sum, g) => sum + g.targetValue, 0);
    const totalSoldOrders = active.reduce((sum, g) => sum + g.currentValue, 0);
    return {
      activeCount: active.length,
      upcomingCount: upcoming.length,
      avgProgress: totalProgress,
      totalTargetOrders,
      totalSoldOrders,
    };
  }, [goals]);

  return { goals, upsert, remove, toggleEnabled, stats };
}
