import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { EmptyState } from '@/components/primitives/EmptyState';
import { DateFilterControl } from '@/components/primitives/DateFilterControl';
import { useStaff } from '@/lib/mock/staff';
import {
  healthScoreTone,
  useAllStaffPerformance,
  type DateFilter,
  type StaffPerformance,
} from '@/lib/mock/performance';
import { avatarTintFor, initialsOf, relativeTime, roleLabels, type StaffMember } from '@/lib/mock/staff';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import './Performance.css';

type SortKey = 'health' | 'sessions' | 'upsell' | 'rating' | 'tone';

const sortLabels: Record<SortKey, string> = {
  health: 'Health score',
  sessions: 'Sessions',
  upsell: 'Upsell rate',
  rating: 'Guest rating',
  tone: 'Tone',
};

export const PerformancePage = () => {
  const { staff, stats } = useStaff();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    kind: 'preset',
    preset: 'last_30_days',
  });
  const performance = useAllStaffPerformance(dateFilter);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('health');

  const staffMap = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const joined = performance
      .map((p) => ({ perf: p, member: staffMap.get(p.staffId) }))
      .filter((r): r is { perf: StaffPerformance; member: StaffMember } => !!r.member)
      .filter(({ member }) => {
        if (q) {
          const hay = `${member.name} ${member.email}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    return joined.sort((a, b) => {
      switch (sortBy) {
        case 'health':
          return b.perf.healthScore - a.perf.healthScore;
        case 'sessions':
          return b.perf.totalSessions - a.perf.totalSessions;
        case 'upsell':
          return b.perf.upsellSuccessRate - a.perf.upsellSuccessRate;
        case 'rating':
          return (b.perf.avgGuestRating ?? 0) - (a.perf.avgGuestRating ?? 0);
        case 'tone':
          return b.perf.avgTone - a.perf.avgTone;
      }
    });
  }, [performance, staffMap, search, sortBy]);

  const totals = useMemo(() => {
    const totalSessions = performance.reduce((s, p) => s + p.totalSessions, 0);
    const totalAttempts = performance.reduce((s, p) => s + p.totalUpsellAttempts, 0);
    const totalSuccess = performance.reduce((s, p) => s + p.totalSuccessfulUpsells, 0);
    const ratings = performance.map((p) => p.avgGuestRating).filter((r): r is number => r != null);
    return {
      totalSessions,
      avgUpsell: totalAttempts === 0 ? 0 : (totalSuccess / totalAttempts) * 100,
      avgRating:
        ratings.length === 0
          ? 0
          : ratings.reduce((s, r) => s + r, 0) / ratings.length,
    };
  }, [performance]);

  const isFiltered = !!search;

  return (
    <motion.div
      className="ss-perf"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-perf__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Performance · §2.5</span>
          <h1>Staff performance</h1>
          <p className="ss-perf__lede">
            Aggregated KPIs across every active session — sortable, drill-down to individual
            staff and the conversations that fed each score.
          </p>
        </div>
        <div className="ss-perf__header-actions">
          <DateFilterControl value={dateFilter} onChange={setDateFilter} />
          <Badge tone="brand" subtle dot>
            {stats.active} active · {rows.length} shown
          </Badge>
        </div>
      </motion.header>

      <motion.section className="ss-perf__stats" variants={fadeUp}>
        <StatTile label="Active staff" value={stats.active.toString()} hint="At your outlet" />
        <StatTile
          label="Total sessions"
          value={totals.totalSessions.toString()}
          hint="Captured this week"
        />
        <StatTile
          label="Avg upsell rate"
          value={`${Math.round(totals.avgUpsell)}%`}
          hint="Successful / attempts"
          accent
        />
        <StatTile
          label="Avg guest rating"
          value={totals.avgRating ? totals.avgRating.toFixed(2) : '—'}
          hint="Post-session survey"
        />
      </motion.section>

      <motion.section className="ss-perf__toolbar" variants={fadeUp}>
        <div className="ss-perf__filters">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ss-perf__search"
            leadingIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
        <div className="ss-perf__sort">
          <span className="ss-perf__sort-label">Sort by</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            options={(Object.keys(sortLabels) as SortKey[]).map((k) => ({
              value: k,
              label: sortLabels[k],
            }))}
            className="ss-perf__sort-select"
          />
        </div>
      </motion.section>

      {rows.length === 0 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17l6-6 4 4 7-8M14 7h6v6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title={isFiltered ? 'No staff match your search' : 'No performance data yet'}
          description={
            isFiltered
              ? 'Try clearing the search.'
              : 'Once live sessions begin, performance KPIs will appear here automatically.'
          }
        />
      ) : (
        <motion.div
          className="ss-perf__grid"
          variants={stagger(0.05, 0.05)}
          initial="hidden"
          animate="visible"
        >
          {rows.map(({ perf, member }) => (
            <PerfCard key={perf.staffId} perf={perf} member={member} />
          ))}
        </motion.div>
      )}

      <motion.div className="ss-perf__footer-note" variants={fadeUp}>
        <span className="ss-perf__footer-dot" aria-hidden="true" />
        Health score = weighted blend of tone, empathy, menu knowledge, and confidence.
      </motion.div>
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
  <div className={cn('ss-perf__stat', accent && 'ss-perf__stat--accent')}>
    <span className="ss-perf__stat-label">{label}</span>
    <span className="ss-perf__stat-value">{value}</span>
    {hint && <span className="ss-perf__stat-hint">{hint}</span>}
  </div>
);

const PerfCard = ({
  perf,
  member,
}: {
  perf: StaffPerformance;
  member: StaffMember;
}) => {
  const tint = avatarTintFor(member.id);
  const tone = healthScoreTone(perf.healthScore);

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
      <Link
        to={`/performance/${member.id}`}
        className={cn('ss-perf-card', `ss-perf-card--${tone}`)}
      >
        <div className="ss-perf-card__top">
          <div className="ss-perf-card__identity">
            <span
              className="ss-perf-card__avatar"
              aria-hidden="true"
              style={{ backgroundColor: tint.bg, color: tint.fg }}
            >
              {initialsOf(member.name)}
            </span>
            <div className="ss-perf-card__id-text">
              <span className="ss-perf-card__name">{member.name}</span>
              <span className="ss-perf-card__sub">
                {roleLabels[member.role]}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'ss-perf-card__health',
              `ss-perf-card__health--${tone}`,
            )}
          >
            <span className="ss-perf-card__health-num">{perf.healthScore}</span>
            <span className="ss-perf-card__health-label">Health</span>
          </div>
        </div>

        <div className="ss-perf-card__kpis">
          <KpiCell label="Sessions" value={perf.totalSessions.toString()} />
          <KpiCell label="Upsell" value={`${Math.round(perf.upsellSuccessRate)}%`} />
          <KpiCell label="Tone" value={`${perf.avgTone}`} unit="/100" />
          <KpiCell label="Menu" value={`${perf.avgMenuKnowledge}`} unit="%" />
          <KpiCell
            label="Rating"
            value={perf.avgGuestRating != null ? perf.avgGuestRating.toFixed(1) : '—'}
            unit={perf.avgGuestRating != null ? '/5' : ''}
            star
          />
        </div>

        <div className="ss-perf-card__foot">
          <span className="ss-perf-card__last">
            Last session {perf.lastSessionAt ? relativeTime(perf.lastSessionAt) : 'never'}
          </span>
          <span className="ss-perf-card__cta">
            View detail →
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

const KpiCell = ({
  label,
  value,
  unit,
  star,
}: {
  label: string;
  value: string;
  unit?: string;
  star?: boolean;
}) => (
  <div className="ss-perf-card__cell">
    <span className="ss-perf-card__cell-label">{label}</span>
    <span className="ss-perf-card__cell-value">
      {star && value !== '—' && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--ss-gold-500)' }}>
          <path d="M12 2l2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.7L12 2z" />
        </svg>
      )}
      {value}
      {unit && <span className="ss-perf-card__cell-unit">{unit}</span>}
    </span>
  </div>
);

export default PerformancePage;
