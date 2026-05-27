import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  statusOf,
  useSalesGoals,
  type GoalStatus,
} from '@/lib/mock/goals';
import { useMenuItems } from '@/lib/mock/menu';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { GoalCard } from './GoalCard';
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
  const { goals, stats } = useSalesGoals();
  const { items: menuItems } = useMenuItems();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('goals');
  const { notify } = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'Campaigns document removed',
      description: 'Upload a new PDF to publish a new campaign schedule.',
    });
  };

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
          <span className="eyebrow">Orientation · {meta.sowRef}</span>
          <h1>Sales Goals &amp; Campaigns</h1>
          <p className="ss-goals__lede">
            Dishes you want pushed this week — wine pairings, signature starters, the new dessert.
            Defined in the campaign PDF; the AI biases live upsell prompts toward active goals and
            the dashboard scores progress as orders land.
          </p>
        </div>
        <div className="ss-goals__header-actions">
          <Badge tone="brand" subtle dot>
            {stats.activeCount} active · {stats.upcomingCount} upcoming
          </Badge>
        </div>
      </motion.header>

      {source ? (
        <>
          <OrientationSourceBanner
            source={source}
            onReplace={() => setReplaceOpen(true)}
            onRemove={handleRemove}
          />

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

          {/* --- Filter rail ----------------------------------------------- */}
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
              title={`No ${filter === 'all' ? '' : filterLabels[filter].toLowerCase() + ' '}goals in this document`}
              description="Switch the filter back to All to see every campaign in the document, or replace the PDF to publish a new schedule."
            />
          ) : (
            <motion.div
              className="ss-goals__grid"
              variants={stagger(0.06, 0.05)}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((g) => (
                <GoalCard key={g.id} goal={g} menuItems={menuItems} />
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <motion.div variants={fadeUp}>
          <OrientationUpload module={meta} onComplete={uploadSource} />
        </motion.div>
      )}

      <OrientationReplaceDrawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        module={meta}
        onComplete={uploadSource}
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
