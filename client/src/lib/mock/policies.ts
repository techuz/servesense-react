import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — Standard Policies (SOW v2 §5.3.1).
   A flat list of policy records the manager maintains. Each record is just a
   type + title + description + status (the SOW "Exact Details to Cover" is
   guidance for what to write in the description, not structured fields).
   Active policies are what the AI retrieves during live sessions.
   Persisted in localStorage during the design phase.
   ============================================================================ */

export type PolicyType =
  | 'operatingTimings'
  | 'waiting'
  | 'reservation'
  | 'tableHolding'
  | 'diningRules'
  | 'guestAccommodation'
  | 'payments';

export type PolicyStatus = 'active' | 'inactive';

export interface Policy {
  id: string;
  type: PolicyType;
  title: string;
  description: string;
  status: PolicyStatus;
}

/** The seven policy types from §5.3.1, in the SOW's order. */
export const policyTypeOrder: PolicyType[] = [
  'operatingTimings',
  'waiting',
  'reservation',
  'tableHolding',
  'diningRules',
  'guestAccommodation',
  'payments',
];

export const policyTypeLabels: Record<PolicyType, string> = {
  operatingTimings: 'Operating Timings',
  waiting: 'Waiting Policy',
  reservation: 'Reservation Policy',
  tableHolding: 'Table Holding',
  diningRules: 'Dining Rules',
  guestAccommodation: 'Guest Accommodation',
  payments: 'Payments',
};

/** "Exact details to cover" from the SOW — shown as guidance in the editor. */
export const policyTypeHints: Record<PolicyType, string> = {
  operatingTimings: 'Opening time, closing time, last order time.',
  waiting: 'Walk-in waiting rules, queue handling.',
  reservation: 'Booking rules, no-show, cancellation.',
  tableHolding: 'How long a table can be held.',
  diningRules: 'Dine-in vs takeaway, outside food.',
  guestAccommodation: 'Child seating, elderly, wheelchair.',
  payments: 'Cash, card, mobile pay, split bills.',
};

const STORAGE_KEY = 'ss_mock_policies_v2';

const seed: Policy[] = [
  {
    id: 'policy_001',
    type: 'operatingTimings',
    title: 'Hours of operation',
    description:
      'Open Tuesday–Sunday. Lunch 11:30 AM–3:00 PM, dinner 5:00 PM–11:00 PM (kitchen last order 10:30 PM). Closed Mondays and on national holidays.',
    status: 'active',
  },
  {
    id: 'policy_002',
    type: 'waiting',
    title: 'Walk-ins & waitlist',
    description:
      'Walk-in guests are seated first-come, first-served. During peak hours we hold a waitlist with text-message notification; the maximum quoted wait is 30 minutes before we suggest the bar.',
    status: 'active',
  },
  {
    id: 'policy_003',
    type: 'reservation',
    title: 'Reservations & cancellations',
    description:
      'Reservations accepted up to 30 days in advance for parties of 2–8. Cancellations within 4 hours of the booking, or no-shows, are charged $20 per guest to the card on file.',
    status: 'active',
  },
  {
    id: 'policy_004',
    type: 'tableHolding',
    title: 'Table holding',
    description:
      'Reserved tables are held for 15 minutes past the booking time. After that the table may be released to walk-ins. We call the guest before releasing.',
    status: 'active',
  },
  {
    id: 'policy_005',
    type: 'diningRules',
    title: 'Dining & outside food',
    description:
      'Dine-in and takeaway only — no delivery. Outside food and beverages are not permitted. Celebration cakes are welcome with advance notice; a small plating fee applies.',
    status: 'active',
  },
  {
    id: 'policy_006',
    type: 'guestAccommodation',
    title: 'Accessibility & accommodation',
    description:
      'High chairs and booster seats available. Step-free main entrance and wheelchair-accessible restroom. Staff offer assistance to elderly guests on request.',
    status: 'active',
  },
  {
    id: 'policy_007',
    type: 'payments',
    title: 'Accepted payments',
    description:
      'Cash, all major credit/debit cards, and mobile pay (Apple Pay / Google Pay). Bills can be split up to four ways. An automatic 20% gratuity applies to parties of 6 or more.',
    status: 'active',
  },
];

function read(): Policy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as Policy[];
  } catch {
    return seed;
  }
}

function write(value: Policy[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newPolicyId() {
  return `policy_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyPolicy(type: PolicyType = 'operatingTimings'): Policy {
  return { id: newPolicyId(), type, title: '', description: '', status: 'active' };
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>(() => read());

  useEffect(() => {
    write(policies);
  }, [policies]);

  const upsert = useCallback((policy: Policy) => {
    setPolicies((list) => {
      const idx = list.findIndex((p) => p.id === policy.id);
      if (idx === -1) return [...list, policy];
      const next = [...list];
      next[idx] = policy;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPolicies((list) => list.filter((p) => p.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setPolicies((list) =>
      list.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p,
      ),
    );
  }, []);

  const stats = useMemo(() => {
    const total = policies.length;
    const active = policies.filter((p) => p.status === 'active').length;
    const typesCovered = new Set(policies.map((p) => p.type)).size;
    return { total, active, typesCovered, typeTotal: policyTypeOrder.length };
  }, [policies]);

  return { policies, upsert, remove, toggleStatus, stats };
}
