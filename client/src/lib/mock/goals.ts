import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — Sales Goals & Campaigns (SOW v2 §5.3.6).
   Manager-defined push campaigns: "sell 50 wine pairings this week", etc.
   Fields per the SOW: Goal Name, Goal Type, Target Items, Target Value,
   Validity Period. The AI biases live upsell recommendations toward active
   goals and the dashboard scores progress against them.
   ============================================================================ */

export type GoalType = 'daily' | 'weekly';
export type GoalStatus = 'active' | 'upcoming' | 'ended';

export interface SalesGoal {
  id: string;
  name: string;
  type: GoalType;
  /** Menu-item IDs the goal counts toward (selected from active menu items). */
  targetItemIds: string[];
  /** Target number of orders containing any of the target items. */
  targetValue: number;
  /** System-computed progress (orders so far). Not a manager-entered field. */
  currentValue: number;
  /** Validity period — ISO date YYYY-MM-DD. */
  startDate: string;
  endDate: string;
}

const STORAGE_KEY = 'ss_mock_sales_goals_v2';

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
    name: 'Rioja & tapas pairing',
    type: 'weekly',
    targetItemIds: ['item_013', 'item_001'],
    targetValue: 80,
    currentValue: 47,
    startDate: isoOffset(-3),
    endDate: isoOffset(4),
  },
  {
    id: 'goal_dessert_weekend',
    name: 'Weekend dessert push',
    type: 'weekly',
    targetItemIds: ['item_010', 'item_011'],
    targetValue: 120,
    currentValue: 89,
    startDate: isoOffset(-6),
    endDate: isoOffset(1),
  },
  {
    id: 'goal_signature_starter',
    name: 'Tapas starter focus',
    type: 'daily',
    targetItemIds: ['item_001', 'item_002', 'item_003'],
    targetValue: 30,
    currentValue: 12,
    startDate: isoOffset(0),
    endDate: isoOffset(0),
  },
  {
    id: 'goal_ibrico_special',
    name: 'Ibérico Secreto seasonal',
    type: 'weekly',
    targetItemIds: ['item_006'],
    targetValue: 35,
    currentValue: 0,
    startDate: isoOffset(2),
    endDate: isoOffset(9),
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
    type: 'weekly',
    targetItemIds: [],
    targetValue: 10,
    currentValue: 0,
    startDate: isoOffset(0),
    endDate: isoOffset(7),
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

  const stats = useMemo(() => {
    const now = new Date();
    const active = goals.filter((g) => statusOf(g, now) === 'active');
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

  return { goals, upsert, remove, stats };
}
