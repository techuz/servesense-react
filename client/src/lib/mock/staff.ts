import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data for M9 — Staff Management (SOW §2.2).
   Manager-created waiter accounts, scoped to a restaurant + outlet.
   Real backend will replace the localStorage swap with a fetch.
   ============================================================================ */

export type StaffRole = 'waiter' | 'receptionist' | 'bartender';
export type StaffStatus = 'active' | 'inactive';
export type InviteStatus = 'pending' | 'accepted';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;          // WhatsApp number (E.164-ish)
  role: StaffRole;
  outletId: string;
  status: StaffStatus;
  inviteStatus: InviteStatus;
  invitedAt: string;      // ISO timestamp
  lastLoginAt: string | null;
  /** Performance preview — populated post-session by the AI engine. */
  sessionCount: number;
  avgTone: number | null;       // 0–100
  avgEmpathy: number | null;    // 0–100
  upsellRate: number | null;    // 0–1
}

const STORAGE_KEY = 'ss_mock_staff';

export const roleLabels: Record<StaffRole, string> = {
  waiter: 'Waiter',
  receptionist: 'Receptionist',
  bartender: 'Bartender',
};

export const statusLabels: Record<StaffStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const inviteStatusLabels: Record<InviteStatus, string> = {
  pending: 'Invite pending',
  accepted: 'Joined',
};

/* --- Helpers -------------------------------------------------------------- */
function isoOffsetHours(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function isoOffsetDays(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'In the future';
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* --- Avatar tints — deterministic from name ------------------------------- */
const avatarTints = [
  { bg: 'var(--ss-green-700)', fg: 'var(--ss-cream-0)' },
  { bg: 'var(--ss-green-500)', fg: 'var(--ss-cream-0)' },
  { bg: 'var(--ss-gold-500)', fg: 'var(--ss-green-900)' },
  { bg: 'var(--ss-green-100)', fg: 'var(--ss-green-700)' },
  { bg: 'var(--ss-gold-300)', fg: 'var(--ss-green-900)' },
  { bg: 'var(--ss-warm-gray-600)', fg: 'var(--ss-cream-0)' },
] as const;

export function avatarTintFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return avatarTints[h % avatarTints.length];
}

/* --- Seed (uses outlet IDs from mock/restaurant.ts) ----------------------- */
const seed: StaffMember[] = [
  {
    id: 'staff_001',
    name: 'Aarav Mehta',
    email: 'aarav.m@lumiere.example',
    phone: '+91 98861 22134',
    role: 'waiter',
    outletId: 'outlet_001',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(120),
    lastLoginAt: isoOffsetHours(2),
    sessionCount: 482,
    avgTone: 87,
    avgEmpathy: 84,
    upsellRate: 0.32,
  },
  {
    id: 'staff_002',
    name: 'Priya Nair',
    email: 'priya.n@lumiere.example',
    phone: '+91 99007 51290',
    role: 'waiter',
    outletId: 'outlet_001',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(95),
    lastLoginAt: isoOffsetHours(5),
    sessionCount: 391,
    avgTone: 91,
    avgEmpathy: 89,
    upsellRate: 0.41,
  },
  {
    id: 'staff_003',
    name: 'Devansh Rao',
    email: 'devansh.r@lumiere.example',
    phone: '+91 99452 33810',
    role: 'waiter',
    outletId: 'outlet_001',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(60),
    lastLoginAt: isoOffsetDays(2),
    sessionCount: 211,
    avgTone: 76,
    avgEmpathy: 72,
    upsellRate: 0.19,
  },
  {
    id: 'staff_004',
    name: 'Meera Iyer',
    email: 'meera.i@lumiere.example',
    phone: '+91 98847 11023',
    role: 'receptionist',
    outletId: 'outlet_001',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(150),
    lastLoginAt: isoOffsetHours(1),
    sessionCount: 0,
    avgTone: 93,
    avgEmpathy: 90,
    upsellRate: null,
  },
  {
    id: 'staff_005',
    name: 'Karan Bhatia',
    email: 'karan.b@lumiere.example',
    phone: '+91 98199 67432',
    role: 'bartender',
    outletId: 'outlet_001',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(80),
    lastLoginAt: isoOffsetHours(8),
    sessionCount: 167,
    avgTone: 82,
    avgEmpathy: 78,
    upsellRate: 0.55,
  },
  {
    id: 'staff_006',
    name: 'Sana Qureshi',
    email: 'sana.q@lumiere.example',
    phone: '+91 99014 88792',
    role: 'waiter',
    outletId: 'outlet_002',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(45),
    lastLoginAt: isoOffsetHours(3),
    sessionCount: 178,
    avgTone: 88,
    avgEmpathy: 85,
    upsellRate: 0.29,
  },
  {
    id: 'staff_007',
    name: 'Rohit Verma',
    email: 'rohit.v@lumiere.example',
    phone: '+91 98442 90011',
    role: 'waiter',
    outletId: 'outlet_002',
    status: 'active',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(200),
    lastLoginAt: isoOffsetDays(1),
    sessionCount: 612,
    avgTone: 84,
    avgEmpathy: 81,
    upsellRate: 0.36,
  },
  {
    id: 'staff_008',
    name: 'Tara Krishnan',
    email: 'tara.k@lumiere.example',
    phone: '+91 99888 21345',
    role: 'waiter',
    outletId: 'outlet_002',
    status: 'inactive',
    inviteStatus: 'accepted',
    invitedAt: isoOffsetDays(220),
    lastLoginAt: isoOffsetDays(31),
    sessionCount: 489,
    avgTone: 79,
    avgEmpathy: 74,
    upsellRate: 0.22,
  },
  {
    id: 'staff_009',
    name: 'Nikhil Sundaram',
    email: 'nikhil.s@lumiere.example',
    phone: '+91 98765 43210',
    role: 'waiter',
    outletId: 'outlet_002',
    status: 'active',
    inviteStatus: 'pending',
    invitedAt: isoOffsetHours(18),
    lastLoginAt: null,
    sessionCount: 0,
    avgTone: null,
    avgEmpathy: null,
    upsellRate: null,
  },
  {
    id: 'staff_010',
    name: 'Ishaan Kapoor',
    email: 'ishaan.k@lumiere.example',
    phone: '+91 90011 23456',
    role: 'bartender',
    outletId: 'outlet_002',
    status: 'active',
    inviteStatus: 'pending',
    invitedAt: isoOffsetHours(40),
    lastLoginAt: null,
    sessionCount: 0,
    avgTone: null,
    avgEmpathy: null,
    upsellRate: null,
  },
];

/* --- Storage -------------------------------------------------------------- */
function read(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as StaffMember[];
  } catch {
    return seed;
  }
}

function write(value: StaffMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newStaffId() {
  return `staff_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyStaff(outletId: string): StaffMember {
  return {
    id: newStaffId(),
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    outletId,
    status: 'active',
    inviteStatus: 'pending',
    invitedAt: new Date().toISOString(),
    lastLoginAt: null,
    sessionCount: 0,
    avgTone: null,
    avgEmpathy: null,
    upsellRate: null,
  };
}

/* --- Hook ----------------------------------------------------------------- */
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(() => read());

  useEffect(() => {
    write(staff);
  }, [staff]);

  const upsert = useCallback((member: StaffMember) => {
    setStaff((list) => {
      const idx = list.findIndex((s) => s.id === member.id);
      if (idx === -1) return [...list, member];
      const next = [...list];
      next[idx] = member;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setStaff((list) => list.filter((s) => s.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setStaff((list) =>
      list.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s,
      ),
    );
  }, []);

  const resendInvite = useCallback((id: string) => {
    setStaff((list) =>
      list.map((s) => (s.id === id ? { ...s, invitedAt: new Date().toISOString() } : s)),
    );
  }, []);

  const stats = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s) => s.status === 'active' && s.inviteStatus === 'accepted').length,
      pending: staff.filter((s) => s.inviteStatus === 'pending').length,
      inactive: staff.filter((s) => s.status === 'inactive').length,
    };
  }, [staff]);

  return { staff, upsert, remove, toggleStatus, resendInvite, stats };
}
