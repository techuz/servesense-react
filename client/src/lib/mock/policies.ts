import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M3 — Standard Policies (SOW §3.1).
   Restaurant-wide. Persisted in localStorage during the design phase.
   ============================================================================ */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  closed: boolean;
  open: string;        // 24h "HH:MM"
  close: string;
  lastOrder: string;
}

export interface OperatingTimings {
  schedule: Record<DayKey, DayHours>;
  notes: string;       // holiday hours, special exceptions
}

export interface WaitingPolicy {
  walkInsAllowed: boolean;
  maxWaitMinutes: number;
  queueRules: string;
}

export interface ReservationPolicy {
  bookingEnabled: boolean;
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number;
  cancellationWindowHours: number;
  noShowFee: string;
  rules: string;
}

export interface TableHolding {
  maxHoldMinutes: number;
  rules: string;
}

export interface DiningRules {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  outsideFoodAllowed: boolean;
  byob: boolean;
  rules: string;
}

export interface GuestAccommodation {
  childSeating: boolean;
  highChairs: boolean;
  elderlyAssistance: boolean;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  groupBookings: boolean;
  notes: string;
}

export interface Payments {
  cash: boolean;
  card: boolean;
  upi: boolean;
  netBanking: boolean;
  wallets: boolean;
  splitBills: boolean;
  notes: string;
}

export interface StandardPolicies {
  operatingTimings: OperatingTimings;
  waitingPolicy: WaitingPolicy;
  reservationPolicy: ReservationPolicy;
  tableHolding: TableHolding;
  diningRules: DiningRules;
  guestAccommodation: GuestAccommodation;
  payments: Payments;
}

export const dayLabels: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const dayOrder: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const standardDay: DayHours = {
  closed: false,
  open: '12:00',
  close: '23:00',
  lastOrder: '22:30',
};

const seedPolicies: StandardPolicies = {
  operatingTimings: {
    schedule: {
      mon: { ...standardDay, closed: true, open: '', close: '', lastOrder: '' },
      tue: { ...standardDay },
      wed: { ...standardDay },
      thu: { ...standardDay },
      fri: { ...standardDay, close: '23:30', lastOrder: '23:00' },
      sat: { ...standardDay, open: '11:30', close: '23:30', lastOrder: '23:00' },
      sun: { ...standardDay, open: '11:30' },
    },
    notes: 'Closed on national holidays. Diwali & New Year hours announced 2 weeks in advance.',
  },
  waitingPolicy: {
    walkInsAllowed: true,
    maxWaitMinutes: 30,
    queueRules:
      'Walk-in guests are seated on a first-come, first-served basis. Group size is confirmed at the door; we do not split tables that exceed a 30-minute wait.',
  },
  reservationPolicy: {
    bookingEnabled: true,
    advanceBookingDays: 30,
    minPartySize: 2,
    maxPartySize: 12,
    cancellationWindowHours: 4,
    noShowFee: '₹500 per person',
    rules:
      'Reservations can be made up to 30 days in advance. Cancellations within 4 hours of the reservation are charged a no-show fee per person.',
  },
  tableHolding: {
    maxHoldMinutes: 15,
    rules:
      'Tables are held for 15 minutes past the reservation time. Beyond this, the table is released to walk-ins. Guests are notified by phone before releasing.',
  },
  diningRules: {
    dineIn: true,
    takeaway: true,
    delivery: false,
    outsideFoodAllowed: false,
    byob: false,
    rules:
      'Outside food and beverages are not permitted. Birthday cakes may be brought in with prior notice; a small plating fee applies.',
  },
  guestAccommodation: {
    childSeating: true,
    highChairs: true,
    elderlyAssistance: true,
    wheelchairAccessible: true,
    petFriendly: false,
    groupBookings: true,
    notes:
      'Children under 12 receive a complimentary mocktail. Step-free main entrance; assisted ramp access at the side entrance for wheelchair users.',
  },
  payments: {
    cash: true,
    card: true,
    upi: true,
    netBanking: false,
    wallets: true,
    splitBills: true,
    notes:
      'Split bills supported across cash + card or multiple cards. Service charge of 5% is included and is fully distributed to the team.',
  },
};

const STORAGE_KEY = 'ss_mock_policies';

/* Deep-merge stored data with seed so additions/removals to the policy shape
   don't blank out fields the user already has saved. */
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

function readPolicies(): StandardPolicies {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPolicies;
    const parsed = JSON.parse(raw);
    return deepMerge(seedPolicies, parsed);
  } catch {
    return seedPolicies;
  }
}

function writePolicies(value: StandardPolicies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function usePolicies() {
  const [policies, setPolicies] = useState<StandardPolicies>(() => readPolicies());

  useEffect(() => {
    writePolicies(policies);
  }, [policies]);

  const update = useCallback(
    <K extends keyof StandardPolicies>(section: K, patch: Partial<StandardPolicies[K]>) => {
      setPolicies((p) => ({ ...p, [section]: { ...p[section], ...patch } }));
    },
    [],
  );

  return { policies, update };
}

/* --- Completion logic ----------------------------------------------------- */

export type PolicySectionKey =
  | 'operatingTimings'
  | 'waitingPolicy'
  | 'reservationPolicy'
  | 'tableHolding'
  | 'diningRules'
  | 'guestAccommodation'
  | 'payments';

export interface PolicySectionMeta {
  key: PolicySectionKey;
  title: string;
  description: string;
  short: string;       // 1-line summary for the nav
}

export const policySections: PolicySectionMeta[] = [
  {
    key: 'operatingTimings',
    title: 'Operating Timings',
    description: 'When the outlet is open, the last order cut-off, and any seasonal exceptions.',
    short: 'Weekly hours & last order',
  },
  {
    key: 'waitingPolicy',
    title: 'Waiting Policy',
    description: 'How walk-ins are handled, queue rules, and the maximum wait you commit to.',
    short: 'Walk-ins & queue rules',
  },
  {
    key: 'reservationPolicy',
    title: 'Reservation Policy',
    description: 'Booking windows, party-size limits, cancellation rules, and no-show charges.',
    short: 'Bookings & cancellations',
  },
  {
    key: 'tableHolding',
    title: 'Table Holding',
    description: 'How long a reserved table is held past the booking time before being released.',
    short: 'Reserved table holds',
  },
  {
    key: 'diningRules',
    title: 'Dining Rules',
    description: 'Dine-in, takeaway, delivery, outside food, and any special restrictions.',
    short: 'Service modes & restrictions',
  },
  {
    key: 'guestAccommodation',
    title: 'Guest Accommodation',
    description: 'Child seating, accessibility, pet policy, and group booking support.',
    short: 'Accessibility & special needs',
  },
  {
    key: 'payments',
    title: 'Payments',
    description: 'Accepted payment methods and bill-splitting rules displayed at billing.',
    short: 'Payment methods accepted',
  },
];

/* Quick completion heuristic per section — used by the nav progress chip. */
export function isSectionComplete(
  policies: StandardPolicies,
  key: PolicySectionKey,
): boolean {
  switch (key) {
    case 'operatingTimings': {
      const open = Object.values(policies.operatingTimings.schedule).filter((d) => !d.closed);
      return open.every((d) => d.open && d.close);
    }
    case 'waitingPolicy':
      return policies.waitingPolicy.queueRules.trim().length > 10;
    case 'reservationPolicy':
      return policies.reservationPolicy.rules.trim().length > 10;
    case 'tableHolding':
      return policies.tableHolding.rules.trim().length > 10;
    case 'diningRules':
      return [
        policies.diningRules.dineIn,
        policies.diningRules.takeaway,
        policies.diningRules.delivery,
      ].some(Boolean);
    case 'guestAccommodation':
      return policies.guestAccommodation.notes.trim().length > 0;
    case 'payments':
      return [
        policies.payments.cash,
        policies.payments.card,
        policies.payments.upi,
        policies.payments.wallets,
        policies.payments.netBanking,
      ].some(Boolean);
  }
}

export function completionStats(policies: StandardPolicies) {
  const total = policySections.length;
  const complete = policySections.filter((s) => isSectionComplete(policies, s.key)).length;
  return { complete, total, percent: Math.round((complete / total) * 100) };
}
