import { useMemo } from 'react';

/* ============================================================================
   Mock data for M12 — Staff Performance List & Drill-Down (SOW §2.5).
   Sessions are the atomic unit — each carries the full KPI library defined
   in §7. Aggregates (per-staff metrics) are computed from session data, so
   when the real AI service ships we just swap the session loader.
   ============================================================================ */

export type ServiceMode = 'lunch' | 'dinner';

export interface SessionHighlight {
  type: 'positive' | 'negative';
  text: string;
}

export interface Session {
  id: string;
  staffId: string;
  outletId: string;
  tableNumber: string;
  guestName?: string;
  serviceMode: ServiceMode;
  /** ISO datetime */
  startedAt: string;
  endedAt: string;
  durationMins: number;

  /* --- KPIs (per cross-cutting library §7) ----------------------- */
  upsellAttempts: number;
  successfulUpsells: number;
  missedOpportunities: number;
  confidenceScore: number;       // 0–100
  menuKnowledgeAccuracy: number; // 0–100 (%)
  toneScore: number;             // 0–100
  empathyScore: number;          // 0–100
  foodSafetyAwareness: number;   // 0–100 (%)
  toneConsistency: number;       // 0–100 (%)
  /** 1–5 stars; null if guest didn't rate */
  guestRating: number | null;

  /* --- Notes & highlights --------------------------------------- */
  highlights: SessionHighlight[];
  /** Free-form transcript snippet — populated once the AI service is live. */
  transcriptPreview?: string;
}

export interface StaffPerformance {
  staffId: string;
  totalSessions: number;
  totalUpsellAttempts: number;
  totalSuccessfulUpsells: number;
  upsellSuccessRate: number;     // % (0–100)
  missedOpportunities: number;
  avgConfidence: number;         // 0–100
  avgMenuKnowledge: number;      // 0–100
  avgTone: number;               // 0–100
  avgEmpathy: number;            // 0–100
  avgFoodSafety: number;         // 0–100
  avgToneConsistency: number;    // 0–100
  avgGuestRating: number | null; // 1–5 (or null)
  lastSessionAt: string | null;
  /** Composite 0–100 health score — a simple weighted blend. */
  healthScore: number;
}

const STORAGE_KEY = 'ss_mock_performance';

/* --- Helpers -------------------------------------------------------------- */
function isoOffsetHours(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* --- Deterministic per-staff seed generator ----------------------------- */
/* Each staff member gets ~6–10 sessions with metrics that orbit a baseline
   tied to their staffId (so high-performing staff stay high, struggling
   staff stay low — the data feels lived-in rather than random). */

interface BaselineProfile {
  tone: number;
  empathy: number;
  menu: number;
  confidence: number;
  upsellRate: number;
  foodSafety: number;
  toneConsistency: number;
  ratingBias: number; // -1..1 — shifts star ratings
}

const baselines: Record<string, BaselineProfile> = {
  staff_001: { tone: 87, empathy: 84, menu: 90, confidence: 88, upsellRate: 0.32, foodSafety: 96, toneConsistency: 89, ratingBias: 0.5 },
  staff_002: { tone: 91, empathy: 89, menu: 94, confidence: 92, upsellRate: 0.41, foodSafety: 97, toneConsistency: 93, ratingBias: 0.8 },
  staff_003: { tone: 76, empathy: 72, menu: 68, confidence: 70, upsellRate: 0.19, foodSafety: 82, toneConsistency: 71, ratingBias: -0.3 },
  staff_004: { tone: 93, empathy: 90, menu: 80, confidence: 91, upsellRate: 0.10, foodSafety: 95, toneConsistency: 92, ratingBias: 0.6 },
  staff_005: { tone: 82, empathy: 78, menu: 88, confidence: 85, upsellRate: 0.55, foodSafety: 92, toneConsistency: 80, ratingBias: 0.3 },
  staff_006: { tone: 88, empathy: 85, menu: 86, confidence: 86, upsellRate: 0.29, foodSafety: 93, toneConsistency: 86, ratingBias: 0.4 },
  staff_007: { tone: 84, empathy: 81, menu: 89, confidence: 87, upsellRate: 0.36, foodSafety: 91, toneConsistency: 84, ratingBias: 0.2 },
  staff_008: { tone: 79, empathy: 74, menu: 77, confidence: 75, upsellRate: 0.22, foodSafety: 85, toneConsistency: 76, ratingBias: -0.2 },
};

const guestNamePool = [
  'Vikram Iyer', 'Anya Sethi', 'Daniel Hwang', 'Mira Roy', 'Felix Tan',
  'Naomi Park', 'Hassan Ali', 'Sophie Bauer', 'Aditya Shah', 'Lila Owusu',
  'Tomás García', 'Yuki Tanaka', 'Eleanor Wright', null, null, null,
];

const tablePool = ['T2', 'T4', 'T7', 'T11', 'B3', 'B5', 'P1', 'P4', 'T9', 'T12'];

const positiveHighlights = [
  'Recovered a slow-kitchen complaint with calm acknowledgement and a complimentary dessert.',
  'Greeted regulars by name; landed off-menu chef\'s recommendation on the first try.',
  'Closed the wine pairing within 90s of the main course recommendation.',
  'Anticipated water refill before the table asked.',
  'Pre-empted allergy concern unprompted on a flagged dish.',
  'Smoothed a delayed bill with apology + small courtesy gesture.',
  'Pitched the seasonal dessert with strong ingredient detail.',
  'Maintained calm tone through the peak-hour rush.',
];

const negativeHighlights = [
  'Skipped order repeat-back on a 4-course party.',
  'Missed allergen confirmation on a flagged dish — corrected later in the session.',
  'Greeting felt rushed (sub-5 seconds).',
  'Did not offer the dessert/coffee upsell at table check.',
  'Tone shifted noticeably during a pricing question.',
  'Farewell phrase not detected at session end.',
  'Initial recommendation mentioned a 86\'d item (oversight).',
];

/* Tiny seeded pseudo-random — same input always gives same output. */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffffffff) / 0x100000000;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function jitter(rng: () => number, base: number, spread = 8): number {
  return clamp(Math.round(base + (rng() * 2 - 1) * spread), 0, 100);
}

function buildSessionsForStaff(staffId: string): Session[] {
  const profile = baselines[staffId];
  if (!profile) return [];
  const rng = rand(staffId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const count = 6 + Math.floor(rng() * 5); // 6–10
  const sessions: Session[] = [];

  for (let i = 0; i < count; i++) {
    const hoursAgo = (i * 18) + Math.floor(rng() * 12); // sessions in the last ~ week
    const startedAt = isoOffsetHours(hoursAgo);
    const durationMins = 45 + Math.floor(rng() * 50); // 45–95 min
    const endedAt = new Date(new Date(startedAt).getTime() + durationMins * 60_000).toISOString();

    const upsellAttempts = 2 + Math.floor(rng() * 5); // 2–6
    const successRate = clamp(profile.upsellRate + (rng() * 0.2 - 0.1), 0, 1);
    const successfulUpsells = Math.round(upsellAttempts * successRate);
    const missedOpportunities = 1 + Math.floor(rng() * 3);

    // Highlight selection — biased to profile quality
    const highlightCount = 1 + Math.floor(rng() * 2);
    const highlights: SessionHighlight[] = [];
    const qualityRoll = rng();
    const positiveBias = profile.tone > 85 ? 0.75 : profile.tone > 75 ? 0.55 : 0.35;
    for (let h = 0; h < highlightCount; h++) {
      const isPositive = qualityRoll < positiveBias;
      if (isPositive) {
        highlights.push({
          type: 'positive',
          text: positiveHighlights[Math.floor(rng() * positiveHighlights.length)],
        });
      } else {
        highlights.push({
          type: 'negative',
          text: negativeHighlights[Math.floor(rng() * negativeHighlights.length)],
        });
      }
    }

    // Star rating: profile bias + small noise; 70% of sessions get a rating
    const ratingBase = 4 + profile.ratingBias * 0.5 + (rng() * 0.7 - 0.35);
    const guestRating = rng() < 0.7 ? round1(clamp(ratingBase, 1, 5)) : null;

    const guestName = guestNamePool[Math.floor(rng() * guestNamePool.length)] ?? undefined;
    const tableNumber = tablePool[Math.floor(rng() * tablePool.length)];
    const serviceMode: ServiceMode = rng() < 0.55 ? 'dinner' : 'lunch';

    sessions.push({
      id: `sess_${staffId}_${i}`,
      staffId,
      outletId: ['staff_001', 'staff_002', 'staff_003', 'staff_004', 'staff_005'].includes(staffId)
        ? 'outlet_001'
        : 'outlet_002',
      tableNumber,
      guestName: guestName || undefined,
      serviceMode,
      startedAt,
      endedAt,
      durationMins,
      upsellAttempts,
      successfulUpsells,
      missedOpportunities,
      confidenceScore: jitter(rng, profile.confidence, 6),
      menuKnowledgeAccuracy: jitter(rng, profile.menu, 7),
      toneScore: jitter(rng, profile.tone, 5),
      empathyScore: jitter(rng, profile.empathy, 6),
      foodSafetyAwareness: jitter(rng, profile.foodSafety, 5),
      toneConsistency: jitter(rng, profile.toneConsistency, 6),
      guestRating,
      highlights,
      transcriptPreview:
        i === 0
          ? 'Welcome to Lumière, do you have a reservation with us this evening? — Yes, under Iyer. — Perfect, follow me to your table. May I start you off with our cocktail of the week, the Smoked Old Fashioned?'
          : undefined,
    });
  }

  // Sort newest first
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/* --- Seed --------------------------------------------------------------- */
function buildSeed(): Session[] {
  const all: Session[] = [];
  for (const staffId of Object.keys(baselines)) {
    all.push(...buildSessionsForStaff(staffId));
  }
  return all;
}

function read(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return buildSeed();
    return parsed as Session[];
  } catch {
    return buildSeed();
  }
}

/* --- Aggregation -------------------------------------------------------- */
function aggregate(staffId: string, sessions: Session[]): StaffPerformance {
  const mine = sessions.filter((s) => s.staffId === staffId);
  const totalUpsellAttempts = mine.reduce((s, x) => s + x.upsellAttempts, 0);
  const totalSuccessfulUpsells = mine.reduce((s, x) => s + x.successfulUpsells, 0);
  const ratings = mine.map((s) => s.guestRating).filter((r): r is number => r != null);

  const tone = avg(mine.map((s) => s.toneScore));
  const empathy = avg(mine.map((s) => s.empathyScore));
  const menu = avg(mine.map((s) => s.menuKnowledgeAccuracy));
  const confidence = avg(mine.map((s) => s.confidenceScore));

  // Composite health: weighted blend of the 4 core dimensions
  const healthScore = Math.round(
    tone * 0.25 + empathy * 0.25 + menu * 0.25 + confidence * 0.25,
  );

  const sorted = [...mine].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return {
    staffId,
    totalSessions: mine.length,
    totalUpsellAttempts,
    totalSuccessfulUpsells,
    upsellSuccessRate:
      totalUpsellAttempts === 0 ? 0 : (totalSuccessfulUpsells / totalUpsellAttempts) * 100,
    missedOpportunities: mine.reduce((s, x) => s + x.missedOpportunities, 0),
    avgConfidence: Math.round(confidence),
    avgMenuKnowledge: Math.round(menu),
    avgTone: Math.round(tone),
    avgEmpathy: Math.round(empathy),
    avgFoodSafety: Math.round(avg(mine.map((s) => s.foodSafetyAwareness))),
    avgToneConsistency: Math.round(avg(mine.map((s) => s.toneConsistency))),
    avgGuestRating: ratings.length === 0 ? null : round1(avg(ratings)),
    lastSessionAt: sorted[0]?.startedAt ?? null,
    healthScore,
  };
}

/* --- Hooks -------------------------------------------------------------- */
export function useAllSessions(): Session[] {
  return useMemo(() => read(), []);
}

export function useStaffSessions(staffId: string | undefined): Session[] {
  const all = useAllSessions();
  return useMemo(
    () => (staffId ? all.filter((s) => s.staffId === staffId) : []),
    [all, staffId],
  );
}

export function useStaffPerformance(staffId: string | undefined): StaffPerformance | null {
  const all = useAllSessions();
  return useMemo(
    () => (staffId ? aggregate(staffId, all) : null),
    [all, staffId],
  );
}

export function useAllStaffPerformance(): StaffPerformance[] {
  const all = useAllSessions();
  return useMemo(() => {
    return Object.keys(baselines).map((id) => aggregate(id, all));
  }, [all]);
}

export function useSession(sessionId: string | undefined): Session | null {
  const all = useAllSessions();
  return useMemo(
    () => (sessionId ? all.find((s) => s.id === sessionId) ?? null : null),
    [all, sessionId],
  );
}

/* --- Formatting helpers ------------------------------------------------- */
export const serviceModeLabels: Record<ServiceMode, string> = {
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
}

export function healthScoreTone(score: number): 'green' | 'gold' | 'danger' {
  if (score >= 85) return 'green';
  if (score >= 70) return 'gold';
  return 'danger';
}
