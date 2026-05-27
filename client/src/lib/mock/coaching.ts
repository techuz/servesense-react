import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data for M10 — Knowledge & Coaching Management (SOW §2.6).
   Lessons are short micro-trainings (typically YouTube videos) mapped to a
   KPI. Managers assign them to staff; the AI auto-recommends a lesson when a
   staff member's KPI dips. Completion is tracked per (lesson, staff) pair.
   ============================================================================ */

export type LessonCategory = 'tone' | 'empathy' | 'menu' | 'upsell' | 'safety' | 'sop';

export type KPIKey =
  | 'tone'
  | 'empathy'
  | 'menu_knowledge'
  | 'upsell_success'
  | 'food_safety'
  | 'sop_compliance'
  | 'confidence';

export interface LessonAssignment {
  staffId: string;
  /** 0–1 completion fraction (rule: > 0.9 counts as complete). */
  completion: number;
  completedAt: string | null;
  /** When the lesson was assigned to this staff member. */
  assignedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  /** Full YouTube URL — converted to thumbnail + embed via youtubeIdFromUrl(). */
  youtubeUrl: string;
  /** Estimated runtime in minutes — shown on the card. */
  durationMins: number;
  mappedKPI: KPIKey;
  assignments: LessonAssignment[];
  isActive: boolean;
  createdAt: string;
}

export const categoryLabels: Record<LessonCategory, string> = {
  tone: 'Tone',
  empathy: 'Empathy',
  menu: 'Menu',
  upsell: 'Upsell',
  safety: 'Safety',
  sop: 'SOP',
};

export const categoryAccent: Record<LessonCategory, string> = {
  tone: 'var(--ss-green-700)',
  empathy: 'var(--ss-green-500)',
  menu: 'var(--ss-gold-500)',
  upsell: 'var(--ss-gold-700)',
  safety: 'var(--ss-danger-500)',
  sop: 'var(--ss-warm-gray-600)',
};

export const kpiLabels: Record<KPIKey, string> = {
  tone: 'Tone Consistency',
  empathy: 'Empathy Score',
  menu_knowledge: 'Menu Knowledge',
  upsell_success: 'Upsell Success Rate',
  food_safety: 'Food Safety Awareness',
  sop_compliance: 'SOP Compliance',
  confidence: 'Confidence Score',
};

/* --- YouTube helpers ------------------------------------------------------ */
export function youtubeIdFromUrl(url: string): string | null {
  if (!url) return null;
  // Handles youtube.com/watch?v=, youtu.be/, /embed/, /shorts/, /v/
  const patterns = [
    /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/v\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumb(url: string): string | null {
  const id = youtubeIdFromUrl(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

/* --- Aggregation helpers -------------------------------------------------- */
export function lessonCompletionPct(lesson: Lesson): number {
  if (lesson.assignments.length === 0) return 0;
  const sum = lesson.assignments.reduce((s, a) => s + a.completion, 0);
  return sum / lesson.assignments.length;
}

export function lessonCompletedCount(lesson: Lesson): number {
  return lesson.assignments.filter((a) => a.completion >= 0.9).length;
}

/* --- Helpers -------------------------------------------------------------- */
function isoOffsetDays(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const STORAGE_KEY = 'ss_mock_lessons';

/* --- Seed ----------------------------------------------------------------- */
const seed: Lesson[] = [
  {
    id: 'lesson_001',
    title: 'Reading guest tone — the first 10 seconds',
    description:
      'How to calibrate your greeting and pace based on the table\'s mood. Subtle cues from posture, voice volume, and eye contact that change the rest of the meal.',
    category: 'tone',
    youtubeUrl: 'https://www.youtube.com/watch?v=Tuw8hxrFBH8',
    durationMins: 6,
    mappedKPI: 'tone',
    assignments: [
      { staffId: 'staff_001', completion: 1, completedAt: isoOffsetDays(8), assignedAt: isoOffsetDays(18) },
      { staffId: 'staff_002', completion: 1, completedAt: isoOffsetDays(12), assignedAt: isoOffsetDays(18) },
      { staffId: 'staff_003', completion: 0.4, completedAt: null, assignedAt: isoOffsetDays(5) },
      { staffId: 'staff_006', completion: 1, completedAt: isoOffsetDays(3), assignedAt: isoOffsetDays(18) },
      { staffId: 'staff_007', completion: 0.65, completedAt: null, assignedAt: isoOffsetDays(10) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(30),
  },
  {
    id: 'lesson_002',
    title: 'When a guest is upset — the recovery script',
    description:
      'Acknowledge, own, fix, follow up. A 7-minute walkthrough of how Lumière waiters de-escalate without becoming defensive — with three real-world examples.',
    category: 'empathy',
    youtubeUrl: 'https://www.youtube.com/watch?v=8ZdLXELdF9Q',
    durationMins: 7,
    mappedKPI: 'empathy',
    assignments: [
      { staffId: 'staff_001', completion: 1, completedAt: isoOffsetDays(20), assignedAt: isoOffsetDays(40) },
      { staffId: 'staff_003', completion: 0.2, completedAt: null, assignedAt: isoOffsetDays(5) },
      { staffId: 'staff_007', completion: 0.9, completedAt: isoOffsetDays(1), assignedAt: isoOffsetDays(15) },
      { staffId: 'staff_008', completion: 0, completedAt: null, assignedAt: isoOffsetDays(35) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(45),
  },
  {
    id: 'lesson_003',
    title: 'The wine-pairing decision tree',
    description:
      'A quick-reference framework for matching the four main dish types to our wine list. Designed for floor staff who don\'t come from a sommelier background.',
    category: 'menu',
    youtubeUrl: 'https://www.youtube.com/watch?v=JE3pmGS0SDc',
    durationMins: 12,
    mappedKPI: 'menu_knowledge',
    assignments: [
      { staffId: 'staff_001', completion: 1, completedAt: isoOffsetDays(2), assignedAt: isoOffsetDays(10) },
      { staffId: 'staff_002', completion: 1, completedAt: isoOffsetDays(4), assignedAt: isoOffsetDays(10) },
      { staffId: 'staff_006', completion: 0.55, completedAt: null, assignedAt: isoOffsetDays(7) },
      { staffId: 'staff_007', completion: 1, completedAt: isoOffsetDays(6), assignedAt: isoOffsetDays(10) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(20),
  },
  {
    id: 'lesson_004',
    title: 'Soft-sell upselling without sounding pushy',
    description:
      'The "would you like" trap and what to use instead. Six phrasings that land the upsell without the guest feeling sold to.',
    category: 'upsell',
    youtubeUrl: 'https://www.youtube.com/watch?v=YkADj0TPrJA',
    durationMins: 5,
    mappedKPI: 'upsell_success',
    assignments: [
      { staffId: 'staff_002', completion: 1, completedAt: isoOffsetDays(11), assignedAt: isoOffsetDays(22) },
      { staffId: 'staff_003', completion: 0.3, completedAt: null, assignedAt: isoOffsetDays(4) },
      { staffId: 'staff_006', completion: 0.85, completedAt: null, assignedAt: isoOffsetDays(9) },
      { staffId: 'staff_007', completion: 1, completedAt: isoOffsetDays(3), assignedAt: isoOffsetDays(22) },
      { staffId: 'staff_008', completion: 0.5, completedAt: null, assignedAt: isoOffsetDays(25) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(28),
  },
  {
    id: 'lesson_005',
    title: 'Allergen check-list — the 4-question pattern',
    description:
      'Every dish, every allergy, every time. A short drill on the four-question sequence Lumière uses for allergy confirmations.',
    category: 'safety',
    youtubeUrl: 'https://www.youtube.com/watch?v=PHe0bXAIuk0',
    durationMins: 4,
    mappedKPI: 'food_safety',
    assignments: [
      { staffId: 'staff_001', completion: 1, completedAt: isoOffsetDays(50), assignedAt: isoOffsetDays(60) },
      { staffId: 'staff_002', completion: 1, completedAt: isoOffsetDays(50), assignedAt: isoOffsetDays(60) },
      { staffId: 'staff_003', completion: 1, completedAt: isoOffsetDays(48), assignedAt: isoOffsetDays(60) },
      { staffId: 'staff_006', completion: 1, completedAt: isoOffsetDays(45), assignedAt: isoOffsetDays(60) },
      { staffId: 'staff_007', completion: 1, completedAt: isoOffsetDays(50), assignedAt: isoOffsetDays(60) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(60),
  },
  {
    id: 'lesson_006',
    title: 'The 10-step service flow — quick refresher',
    description:
      'Greeting, seating, menu, order, confirm, serve, check, clear, bill, farewell. The full SOP in 8 minutes with the most-missed steps highlighted.',
    category: 'sop',
    youtubeUrl: 'https://www.youtube.com/watch?v=u-7-bGQk7lI',
    durationMins: 8,
    mappedKPI: 'sop_compliance',
    assignments: [
      { staffId: 'staff_003', completion: 0.15, completedAt: null, assignedAt: isoOffsetDays(2) },
      { staffId: 'staff_008', completion: 0, completedAt: null, assignedAt: isoOffsetDays(1) },
    ],
    isActive: true,
    createdAt: isoOffsetDays(14),
  },
  {
    id: 'lesson_007',
    title: 'Confident table presence — body language for waiters',
    description:
      'How you stand at the table matters as much as what you say. Foot placement, hand position, the "open posture" rule.',
    category: 'tone',
    youtubeUrl: 'https://www.youtube.com/watch?v=ks-_Mh1QhMc',
    durationMins: 5,
    mappedKPI: 'confidence',
    assignments: [
      { staffId: 'staff_003', completion: 0, completedAt: null, assignedAt: isoOffsetDays(1) },
    ],
    isActive: false,
    createdAt: isoOffsetDays(7),
  },
];

/* --- Storage -------------------------------------------------------------- */
function read(): Lesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as Lesson[];
  } catch {
    return seed;
  }
}

function write(value: Lesson[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newLessonId() {
  return `lesson_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyLesson(): Lesson {
  return {
    id: newLessonId(),
    title: '',
    description: '',
    category: 'tone',
    youtubeUrl: '',
    durationMins: 5,
    mappedKPI: 'tone',
    assignments: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

/* --- Hook ----------------------------------------------------------------- */
export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(() => read());

  useEffect(() => {
    write(lessons);
  }, [lessons]);

  const upsert = useCallback((lesson: Lesson) => {
    setLessons((list) => {
      const idx = list.findIndex((l) => l.id === lesson.id);
      if (idx === -1) return [...list, lesson];
      const next = [...list];
      next[idx] = lesson;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLessons((list) => list.filter((l) => l.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    setLessons((list) =>
      list.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l)),
    );
  }, []);

  const stats = useMemo(() => {
    const active = lessons.filter((l) => l.isActive);
    const totalAssignments = lessons.reduce((s, l) => s + l.assignments.length, 0);
    const completedAssignments = lessons.reduce(
      (s, l) => s + lessonCompletedCount(l),
      0,
    );
    const avgCompletion =
      active.length === 0
        ? 0
        : active.reduce((s, l) => s + lessonCompletionPct(l), 0) / active.length;

    return {
      total: lessons.length,
      activeCount: active.length,
      totalAssignments,
      completedAssignments,
      avgCompletion,
    };
  }, [lessons]);

  return { lessons, upsert, remove, toggleActive, stats };
}
