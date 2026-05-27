import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  statusOf,
  useSalesGoals,
  type GoalStatus,
  type SalesGoal,
} from '@/lib/mock/goals';
import { useMenuItems } from '@/lib/mock/menu';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { GoalCard } from './GoalCard';
import { GoalDrawer } from './GoalDrawer';
import './Goals.css';

type Filter = 'all' | GoalStatus;

const filterOrder: Filter[] = ['all', 'active', 'upcoming', 'ended'];
const filterLabels: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

export const GoalsPage = () => {
  const { goals, upsert, remove, toggleEnabled, stats } = useSalesGoals();
  const { items: menuItems } = useMenuItems();
  const { notify } = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SalesGoal | null>(null);

  const counts = useMemo(() => {
    const out: Record<Filter, number> = { all: goals.length, active: 0, upcoming: 0, ended: 0 };
    const today = new Date();
    for (const g of goals) out[statusOf(g, today)] += 1;
    return out;
  }, [goals]);

  const filtered = useMemo(() => {
    if (filter === 'all') return goals;
    const today = new Date();
    return goals.filter((g) => statusOf(g, today) === filter);
  }, [goals, filter]);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (goal: SalesGoal) => {
    setEditing(goal);
    setDrawerOpen(true);
  };

  return (
    <motion.div
      className="ss-goals"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* --- Header ----------------------------------------------------- */}
      <motion.header className="ss-goals__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · §3.6</span>
          <h1>Sales Goals &amp; Campaigns</h1>
          <p className="ss-goals__lede">
            Set the dishes you want pushed this week — wine pairings, signature starters, the new
            dessert. The AI biases live upsell prompts toward your active goals and the dashboard
            scores progress as orders land.
          </p>
        </div>
        <div className="ss-goals__header-actions">
          <Badge tone="brand" subtle dot>
            {stats.activeCount} active · {stats.upcomingCount} upcoming
          </Badge>
        </div>
      </motion.header>

      {/* --- Stats strip ----------------------------------------------- */}
      <motion.section className="ss-goals__stats" variants={fadeUp}>
        <StatTile
          label="Active campaigns"
          value={stats.activeCount.toString()}
          hint={stats.upcomingCount > 0 ? `${stats.upcomingCount} queued` : 'Live across the floor'}
        />
        <StatTile
          label="Orders toward target"
          value={stats.totalSoldOrders.toString()}
          hint={`of ${stats.totalTargetOrders} across active goals`}
        />
        <StatTile
          label="Avg. progress"
          value={`${Math.round(stats.avgProgress * 100)}%`}
          hint={stats.activeCount === 0 ? 'No active goals' : 'Mean across active campaigns'}
          accent
        />
        <StatTile
          label="Total goals"
          value={goals.length.toString()}
          hint={`${counts.ended} ended · ${counts.upcoming} upcoming`}
        />
      </motion.section>

      {/* --- Filter rail + add ----------------------------------------- */}
      <motion.section className="ss-goals__toolbar" variants={fadeUp}>
        <div className="ss-goals__filter-rail" role="tablist" aria-label="Filter goals">
          {filterOrder.map((f) => (
            <FilterChip
              key={f}
              label={filterLabels[f]}
              count={counts[f]}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
        <Button variant="primary" onClick={openAdd}>
          + New goal
        </Button>
      </motion.section>

      {/* --- Grid OR empty --------------------------------------------- */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19V6a1 1 0 011-1h4l2 2h8a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9 14l2.5-2.5 2 2L17 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title={filter === 'all' ? 'No goals yet' : `No ${filterLabels[filter].toLowerCase()} goals`}
          description={
            filter === 'all'
              ? 'Add your first sales campaign — give the AI something to push toward during live sessions.'
              : 'Try a different filter or add a new goal in this window.'
          }
          action={
            <Button variant="primary" onClick={openAdd}>
              + {filter === 'all' ? 'Add first goal' : 'New goal'}
            </Button>
          }
        />
      ) : (
        <motion.div
          className="ss-goals__grid"
          variants={stagger(0.06, 0.05)}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence initial={false}>
            {filtered.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                menuItems={menuItems}
                onEdit={() => openEdit(g)}
                onToggle={() => {
                  toggleEnabled(g.id);
                  notify({
                    tone: 'info',
                    title: g.isEnabled ? 'Goal paused' : 'Goal resumed',
                    description: g.name,
                  });
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div className="ss-goals__footer-note" variants={fadeUp}>
        <span className="ss-goals__footer-dot" aria-hidden="true" />
        Goals refresh the AI's upsell bias on the next live session.
      </motion.div>

      <GoalDrawer
        open={drawerOpen}
        goal={editing}
        menuItems={menuItems}
        onClose={() => setDrawerOpen(false)}
        onSave={(g) => {
          upsert(g);
          notify({
            tone: 'success',
            title: editing ? 'Goal updated' : 'Goal created',
            description: g.name,
          });
        }}
        onDelete={(id) => {
          const name = goals.find((g) => g.id === id)?.name ?? 'Goal';
          remove(id);
          notify({ tone: 'info', title: 'Goal removed', description: name });
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
  <div className={cn('ss-goals__stat', accent && 'ss-goals__stat--accent')}>
    <span className="ss-goals__stat-label">{label}</span>
    <span className="ss-goals__stat-value">{value}</span>
    {hint && <span className="ss-goals__stat-hint">{hint}</span>}
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
    className={cn('ss-goals__chip', active && 'ss-goals__chip--on')}
  >
    {active && <motion.span layoutId="ss-goals-filter-pill" className="ss-goals__chip-pill" />}
    <span className="ss-goals__chip-label">{label}</span>
    <span className="ss-goals__chip-count">{count}</span>
  </button>
);

export default GoalsPage;
