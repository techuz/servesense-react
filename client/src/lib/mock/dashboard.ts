import { useMemo } from 'react';

/* ============================================================================
   Mock data — Manager Dashboard (SOW v2 §5.4).
   Two sections:
     A. ROI & Business Impact — additional revenue, before/after, KPI tiles
     B. Revenue & Sales Analytics — by category, top items, service errors
   Once the AI/analytics service ships, swap the buildMetrics() output for
   a fetch against /api/dashboard?period=...
   ============================================================================ */

export type Period = '7d' | '30d' | '90d';

export const periodLabels: Record<Period, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export const periodOrder: Period[] = ['7d', '30d', '90d'];

export interface BeforeAfter {
  before: number;
  after: number;
}

export interface KpiTile {
  key: KpiKey;
  label: string;
  current: number;
  previous: number;
  unit: 'pct' | 'usd' | 'rating' | 'count';
  /** When true, a lower number is better (e.g. service errors). */
  lowerIsBetter?: boolean;
  /** Short helper line beneath the tile. */
  helper: string;
}

export type KpiKey =
  | 'upsell_success'
  | 'avg_order_size'
  | 'customer_satisfaction'
  | 'service_errors'
  | 'staff_confidence';

export interface CategorySlice {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  revenue: number;
  units: number;
}

export interface ServiceError {
  type: string;
  description: string;
  count: number;
  /** -1..1 — trend vs prior period. Positive means more errors (worse). */
  trend: number;
}

export interface DashboardMetrics {
  period: Period;
  // Hero
  additionalRevenue: number;
  additionalRevenuePct: number;       // share of total revenue attributable
  revenueTrendPct: number;            // vs previous period
  revenueSparkline: number[];         // small chart values
  totalRevenue: number;

  // Before/after pre-platform vs current
  upsellRate: BeforeAfter;            // 0–1
  avgCheckSize: BeforeAfter;          // USD

  // Core KPI tiles
  kpis: KpiTile[];

  // Revenue & sales
  categoryRevenue: CategorySlice[];
  topItems: TopItem[];

  // Service errors
  serviceErrors: ServiceError[];
}

/* --- Helpers -------------------------------------------------------------- */
function spark(seed: number, n: number, drift = 0.04): number[] {
  // Deterministic-ish sparkline based on a seed.
  const out: number[] = [];
  let v = seed * 0.85;
  for (let i = 0; i < n; i++) {
    const wobble = Math.sin((seed + i) * 1.7) * 0.06 + (Math.cos(i * 0.9) * 0.04);
    v = Math.max(seed * 0.6, v + seed * (wobble + drift));
    out.push(Math.round(v));
  }
  return out;
}

export function formatUSD(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

export function formatKpi(tile: KpiTile, value: number): string {
  switch (tile.unit) {
    case 'pct':
      return `${value.toFixed(1)}%`;
    case 'usd':
      return formatUSD(Math.round(value));
    case 'rating':
      return `${value.toFixed(2)}`;
    case 'count':
      return Math.round(value).toLocaleString('en-US');
  }
}

export function deltaPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return (current - previous) / previous;
}

export function isImproved(tile: KpiTile): boolean {
  const delta = tile.current - tile.previous;
  return tile.lowerIsBetter ? delta < 0 : delta > 0;
}

/* --- Builder -------------------------------------------------------------- */
function buildMetrics(period: Period): DashboardMetrics {
  // Scale factors so a 30-day window > 7-day > 90-day spreads consistently.
  const scale = period === '7d' ? 0.22 : period === '30d' ? 1 : 2.85;
  const sparkLen = period === '7d' ? 7 : period === '30d' ? 30 : 12;
  const sparkSeed = 4200;

  const totalRevenue = Math.round(284_000 * scale);
  const additionalRevenue = Math.round(41_200 * scale);
  const previousAdditional = Math.round(33_500 * scale);

  const categoryRevenue: CategorySlice[] = [
    { categoryId: 'cat_mains', categoryName: 'Main Courses', revenue: Math.round(86_200 * scale), orders: Math.round(620 * scale) },
    { categoryId: 'cat_tapas', categoryName: 'Tapas', revenue: Math.round(58_400 * scale), orders: Math.round(1_310 * scale) },
    { categoryId: 'cat_red_wine', categoryName: 'Red Wine', revenue: Math.round(47_800 * scale), orders: Math.round(640 * scale) },
    { categoryId: 'cat_beverages', categoryName: 'Beverages', revenue: Math.round(31_200 * scale), orders: Math.round(980 * scale) },
    { categoryId: 'cat_white_wine', categoryName: 'White Wine', revenue: Math.round(22_400 * scale), orders: Math.round(360 * scale) },
    { categoryId: 'cat_desserts', categoryName: 'Desserts', revenue: Math.round(18_000 * scale), orders: Math.round(465 * scale) },
  ];

  const topItems: TopItem[] = [
    { itemId: 'item_006', itemName: 'Ibérico Pork Secreto', categoryName: 'Main Courses', revenue: Math.round(28_700 * scale), units: Math.round(244 * scale) },
    { itemId: 'item_013', itemName: 'Conde Valdemar Rioja', categoryName: 'Red Wine', revenue: Math.round(19_500 * scale), units: Math.round(271 * scale) },
    { itemId: 'item_008', itemName: 'Seafood Paella', categoryName: 'Main Courses', revenue: Math.round(17_200 * scale), units: Math.round(158 * scale) },
    { itemId: 'item_001', itemName: 'Gambas al Ajillo', categoryName: 'Tapas', revenue: Math.round(16_500 * scale), units: Math.round(239 * scale) },
    { itemId: 'item_005', itemName: 'Txistorra Sausage', categoryName: 'Tapas', revenue: Math.round(12_100 * scale), units: Math.round(186 * scale) },
    { itemId: 'item_010', itemName: 'Crema Catalana', categoryName: 'Desserts', revenue: Math.round(9_800 * scale), units: Math.round(204 * scale) },
  ];

  const kpis: KpiTile[] = [
    {
      key: 'upsell_success',
      label: 'Upsell Success Rate',
      current: 34.2,
      previous: 21.8,
      unit: 'pct',
      helper: 'Items added per upsell prompt',
    },
    {
      key: 'avg_order_size',
      label: 'Average Order Size',
      current: 58,
      previous: 44,
      unit: 'usd',
      helper: 'Total revenue ÷ orders',
    },
    {
      key: 'customer_satisfaction',
      label: 'Customer Satisfaction',
      current: 4.62,
      previous: 4.18,
      unit: 'rating',
      helper: 'Star rating from post-session survey',
    },
    {
      key: 'service_errors',
      label: 'Service Errors',
      current: Math.round(38 * scale),
      previous: Math.round(74 * scale),
      unit: 'count',
      lowerIsBetter: true,
      helper: 'Missed SOPs detected by AI',
    },
    {
      key: 'staff_confidence',
      label: 'Staff Confidence',
      current: 81,
      previous: 67,
      unit: 'pct',
      helper: 'Avg AI confidence per session',
    },
  ];

  const serviceErrors: ServiceError[] = [
    { type: 'Missed greeting', description: 'Welcome step skipped or under 5 seconds', count: Math.round(12 * scale), trend: -0.31 },
    { type: 'Allergy not confirmed', description: 'Allergy disclosure missed on a flagged dish', count: Math.round(9 * scale), trend: -0.48 },
    { type: 'Order not repeated back', description: 'Order confirmation step skipped', count: Math.round(8 * scale), trend: -0.22 },
    { type: 'Table check missed', description: 'Post-serve check-in not detected within 5 min', count: Math.round(6 * scale), trend: 0.18 },
    { type: 'Farewell skipped', description: 'No farewell phrase detected at session end', count: Math.round(3 * scale), trend: -0.6 },
  ];

  return {
    period,
    additionalRevenue,
    additionalRevenuePct: additionalRevenue / totalRevenue,
    revenueTrendPct: deltaPct(additionalRevenue, previousAdditional),
    revenueSparkline: spark(sparkSeed, sparkLen, period === '90d' ? 0.06 : 0.04),
    totalRevenue,

    upsellRate: { before: 0.165, after: 0.34 },
    avgCheckSize: { before: 44, after: 58 },

    kpis,
    categoryRevenue,
    topItems,
    serviceErrors,
  };
}

/* --- Hook ----------------------------------------------------------------- */
export function useDashboardMetrics(period: Period): DashboardMetrics {
  return useMemo(() => buildMetrics(period), [period]);
}
