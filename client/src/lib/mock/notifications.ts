import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — In-app notifications (SOW v2 §7 Notification System).
   The §7 matrix lists 11 events; 7 of them target the Manager Dashboard column.
   This is the manager-facing in-app feed for exactly those 7 (push + most email
   are Phase 2 — "Email + in-app only for MVP"). Each event becomes a row in the
   topbar notification center, optionally deep-linking into the relevant module.
   ============================================================================ */

/* The 7 Manager (Dashboard ✅) events from the §7 matrix. */
export type NotificationType =
  | 'post_session_scores'   // Post-session scores available
  | 'coaching_assigned'     // Coaching lesson assigned
  | 'waiter_created'        // New waiter account created
  | 'waiter_deactivated'    // Waiter deactivated
  | 'menu_sop_updated'      // Menu / SOP updated (confirmation)
  | 'baseline_calculated'   // 30-day baseline calculated
  | 'weekly_summary';       // Weekly performance summary

export type NotificationTone = 'green' | 'gold' | 'danger' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** ISO timestamp the event fired. */
  createdAt: string;
  read: boolean;
  /** In-app route to open when the row is clicked. */
  link?: string;
}

/* Per-type display metadata — label + tone drive the icon tile colour. */
export const notificationMeta: Record<
  NotificationType,
  { label: string; tone: NotificationTone }
> = {
  post_session_scores: { label: 'Session scored', tone: 'green' },
  coaching_assigned: { label: 'Coaching assigned', tone: 'gold' },
  waiter_created: { label: 'New waiter', tone: 'green' },
  waiter_deactivated: { label: 'Waiter deactivated', tone: 'danger' },
  menu_sop_updated: { label: 'Content updated', tone: 'info' },
  baseline_calculated: { label: '30-day baseline', tone: 'gold' },
  weekly_summary: { label: 'Weekly summary', tone: 'gold' },
};

export const toneColor: Record<NotificationTone, string> = {
  green: 'var(--ss-green-700)',
  gold: 'var(--ss-gold-500)',
  danger: 'var(--ss-danger-500)',
  info: 'var(--ss-info-500)',
};

/* --- Relative time -------------------------------------------------------- */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.round(day / 7);
  return `${wk}w ago`;
}

/* --- Helpers -------------------------------------------------------------- */
function isoOffsetMinutes(minsAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minsAgo);
  return d.toISOString();
}

const HOUR = 60;
const DAY = 60 * 24;

const STORAGE_KEY = 'ss_mock_notifications_v1';

/* --- Seed ----------------------------------------------------------------- */
/* Tied to the Brasa Spanish Kitchen waiter seeds (staff.ts) so deep-links land
   on real records. Mixed read/unread, spread across the last few days. */
const seed: AppNotification[] = [
  {
    id: 'noti_001',
    type: 'weekly_summary',
    title: 'Weekly performance summary is ready',
    body: 'Upsell success up 6% week-over-week. Tone consistency held steady across the floor.',
    createdAt: isoOffsetMinutes(4),
    read: false,
    link: '/dashboard',
  },
  {
    id: 'noti_002',
    type: 'post_session_scores',
    title: 'Session scored — Marcus Reed, Table 12',
    body: 'Empathy 71 · Menu knowledge 88 · 2 upsells landed. Post-session scores are now available.',
    createdAt: isoOffsetMinutes(22),
    read: false,
    link: '/performance/staff_007',
  },
  {
    id: 'noti_003',
    type: 'baseline_calculated',
    title: '30-day baseline calculated — Hannah Kim',
    body: 'Hannah now has a full 30-day baseline. Her KPIs are unlocked for trend comparison.',
    createdAt: isoOffsetMinutes(HOUR * 3),
    read: false,
    link: '/performance/staff_006',
  },
  {
    id: 'noti_004',
    type: 'coaching_assigned',
    title: 'Coaching auto-assigned — Diego Morales',
    body: '"When a guest is upset — the recovery script" was assigned after empathy stayed low for 2 weeks.',
    createdAt: isoOffsetMinutes(HOUR * 6),
    read: false,
    link: '/coaching',
  },
  {
    id: 'noti_005',
    type: 'waiter_created',
    title: 'New waiter account created — Carla Jensen',
    body: 'Login credentials were emailed to the waiter. They can sign in to the mobile app now.',
    createdAt: isoOffsetMinutes(DAY + HOUR * 2),
    read: true,
    link: '/staff',
  },
  {
    id: 'noti_006',
    type: 'menu_sop_updated',
    title: 'Menu changes saved',
    body: '3 items updated and re-embedded into the knowledge base. The AI will use the new menu immediately.',
    createdAt: isoOffsetMinutes(DAY + HOUR * 5),
    read: true,
    link: '/orientation/menu',
  },
  {
    id: 'noti_007',
    type: 'post_session_scores',
    title: 'Session scored — Alex Rivera, Table 4',
    body: 'Tone 94 · Empathy 90 · 3 upsells landed. A standout dinner service.',
    createdAt: isoOffsetMinutes(DAY * 2),
    read: true,
    link: '/performance/staff_001',
  },
  {
    id: 'noti_008',
    type: 'waiter_deactivated',
    title: 'Waiter deactivated — Noah Bennett',
    body: 'The account can no longer sign in. Historical sessions and KPIs are retained.',
    createdAt: isoOffsetMinutes(DAY * 3),
    read: true,
    link: '/staff',
  },
  {
    id: 'noti_009',
    type: 'weekly_summary',
    title: 'Weekly performance summary is ready',
    body: 'Missed upsell opportunities dropped 11%. Two waiters crossed the 85 overall-score line.',
    createdAt: isoOffsetMinutes(DAY * 7),
    read: true,
    link: '/dashboard',
  },
];

/* --- Storage -------------------------------------------------------------- */
function read(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as AppNotification[];
  } catch {
    return seed;
  }
}

function write(value: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* --- Hook ----------------------------------------------------------------- */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => read());

  useEffect(() => {
    write(notifications);
  }, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return {
    notifications: sorted,
    unreadCount,
    markRead,
    markAllRead,
    remove,
    clearAll,
  };
}
