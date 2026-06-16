import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  categoryLabels,
  useLessons,
  type Lesson,
  type LessonCategory,
} from '@/lib/mock/coaching';
import { useStaff } from '@/lib/mock/staff';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { LessonCard } from './LessonCard';
import { LessonDrawer } from './LessonDrawer';
import { LessonAssignDrawer } from './LessonAssignDrawer';
import './Coaching.css';

type Filter = 'all' | LessonCategory;

const filterOrder: Filter[] = ['all', 'tone', 'empathy', 'menu', 'upsell'];

const filterLabel = (f: Filter) => (f === 'all' ? 'All' : categoryLabels[f]);

export const CoachingPage = () => {
  const { lessons, upsert, remove, toggleActive, stats } = useLessons();
  const { staff } = useStaff();
  const { notify } = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [assigning, setAssigning] = useState<Lesson | null>(null);

  const counts = useMemo(() => {
    const out: Record<Filter, number> = {
      all: lessons.length,
      tone: 0,
      empathy: 0,
      menu: 0,
      upsell: 0,
    };
    for (const l of lessons) out[l.category] += 1;
    return out;
  }, [lessons]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons.filter((l) => {
      if (filter !== 'all' && l.category !== filter) return false;
      if (q) {
        const hay = `${l.title} ${l.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [lessons, filter, search]);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setDrawerOpen(true);
  };

  const isFiltered = filter !== 'all' || search;
  const noResults = filtered.length === 0;

  return (
    <motion.div
      className="ss-coaching"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* --- Header ----------------------------------------------------- */}
      <motion.header className="ss-coaching__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Knowledge · §5.5</span>
          <h1>Coaching &amp; Lessons</h1>
          <p className="ss-coaching__lede">
            Short, KPI-mapped lessons the AI auto-recommends when a waiter's score dips. Assign
            them yourself, or let the recommendation engine push the right lesson at the right
            moment.
          </p>
        </div>
        <div className="ss-coaching__header-actions">
          <Badge tone="brand" subtle dot>
            {stats.activeCount} active of {stats.total} lessons
          </Badge>
        </div>
      </motion.header>

      {/* --- Stats strip ----------------------------------------------- */}
      <motion.section className="ss-coaching__stats" variants={fadeUp}>
        <StatTile
          label="Lessons"
          value={stats.total.toString()}
          hint={`${stats.activeCount} active · ${stats.total - stats.activeCount} archived`}
        />
        <StatTile
          label="Avg. completion"
          value={`${Math.round(stats.avgCompletion * 100)}%`}
          hint="Across active lessons"
          accent
        />
        <StatTile
          label="Assignments"
          value={stats.totalAssignments.toString()}
          hint={`${stats.completedAssignments} completed`}
        />
        <StatTile
          label="Staff in training"
          value={staff.length.toString()}
          hint="Eligible for assignment"
        />
      </motion.section>

      {/* --- Toolbar ---------------------------------------------------- */}
      <motion.section className="ss-coaching__toolbar" variants={fadeUp}>
        <div className="ss-coaching__filter-rail" role="tablist" aria-label="Filter by category">
          {filterOrder.map((f) => (
            <FilterChip
              key={f}
              label={filterLabel(f)}
              count={counts[f]}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
        <div className="ss-coaching__toolbar-right">
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ss-coaching__search"
            leadingIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <Button variant="primary" onClick={openAdd}>
            + Add lesson
          </Button>
        </div>
      </motion.section>

      {/* --- Grid OR empty --------------------------------------------- */}
      {noResults ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M10 9.5l5 2.5-5 2.5z"
                fill="currentColor"
              />
            </svg>
          }
          title={isFiltered ? 'No lessons match' : 'No lessons yet'}
          description={
            isFiltered
              ? 'Try a different category or clear the search.'
              : 'Add your first micro-lesson — a YouTube link mapped to a KPI. The AI will start auto-assigning it when scores dip.'
          }
          action={
            <Button variant="primary" onClick={openAdd}>
              + {isFiltered ? 'Add a new lesson' : 'Add first lesson'}
            </Button>
          }
        />
      ) : (
        <motion.div
          className="ss-coaching__grid"
          variants={stagger(0.06, 0.05)}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence initial={false}>
            {filtered.map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                staff={staff}
                onEdit={() => openEdit(l)}
                onAssign={() => setAssigning(l)}
                onToggleActive={() => {
                  toggleActive(l.id);
                  notify({
                    tone: 'info',
                    title: l.isActive ? 'Lesson archived' : 'Lesson active',
                    description: l.title,
                  });
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div className="ss-coaching__footer-note" variants={fadeUp}>
        <span className="ss-coaching__footer-dot" aria-hidden="true" />
        Archived lessons stop appearing in AI recommendations but stay assigned.
      </motion.div>

      <LessonDrawer
        open={drawerOpen}
        lesson={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={(l) => {
          upsert(l);
          notify({
            tone: 'success',
            title: editing ? 'Lesson updated' : 'Lesson created',
            description: l.title,
          });
        }}
        onDelete={(id) => {
          const title = lessons.find((l) => l.id === id)?.title ?? 'Lesson';
          remove(id);
          notify({ tone: 'info', title: 'Lesson removed', description: title });
        }}
      />

      <LessonAssignDrawer
        open={!!assigning}
        lesson={assigning}
        staff={staff}
        onClose={() => setAssigning(null)}
        onSave={(l) => {
          upsert(l);
          const n = l.assignments.length;
          notify({
            tone: 'success',
            title: 'Assignments saved',
            description: `${l.title} · ${n} staff assigned`,
          });
        }}
      />
    </motion.div>
  );
};

const StatTile = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) => (
  <div className={cn('ss-coaching__stat', accent && 'ss-coaching__stat--accent')}>
    <span className="ss-coaching__stat-label">{label}</span>
    <span className="ss-coaching__stat-value">{value}</span>
    {hint && <span className="ss-coaching__stat-hint">{hint}</span>}
  </div>
);

const FilterChip = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={cn('ss-coaching__chip', active && 'ss-coaching__chip--on')}
  >
    {active && (
      <motion.span layoutId="ss-coaching-filter-pill" className="ss-coaching__chip-pill" />
    )}
    <span className="ss-coaching__chip-label">{label}</span>
    <span className="ss-coaching__chip-count">{count}</span>
  </button>
);

export default CoachingPage;
