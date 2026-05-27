import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { EmptyState } from '@/components/primitives/EmptyState';
import { useStaff } from '@/lib/mock/staff';
import { useOutlets } from '@/lib/mock/restaurant';
import {
  formatSessionDate,
  healthScoreTone,
  serviceModeLabels,
  useStaffPerformance,
  useStaffSessions,
  type Session,
} from '@/lib/mock/performance';
import {
  avatarTintFor,
  initialsOf,
  relativeTime,
  roleLabels,
} from '@/lib/mock/staff';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { SessionDrawer } from './SessionDrawer';
import './StaffDetail.css';

type ModeFilter = 'all' | 'lunch' | 'dinner';

export const StaffDetailPage = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const { staff } = useStaff();
  const { outlets } = useOutlets();
  const perf = useStaffPerformance(staffId);
  const sessions = useStaffSessions(staffId);

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const member = staff.find((s) => s.id === staffId);
  const outletName = outlets.find((o) => o.id === member?.outletId)?.name ?? 'Unassigned';

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (q) {
        const hay = `${s.tableNumber} ${s.guestName ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (modeFilter !== 'all' && s.serviceMode !== modeFilter) return false;
      return true;
    });
  }, [sessions, search, modeFilter]);

  if (!member || !perf) {
    return (
      <div className="ss-staff-detail__missing">
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          title="Staff member not found"
          description="The staff member you're looking for may have been removed."
          action={
            <Link to="/performance">
              <Button variant="primary">← Back to performance</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const tint = avatarTintFor(member.id);
  const tone = healthScoreTone(perf.healthScore);

  return (
    <motion.div
      className="ss-staff-detail"
      variants={stagger(0.07, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* --- Breadcrumb back ----------------------------------------- */}
      <motion.div variants={fadeUp}>
        <Link to="/performance" className="ss-staff-detail__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All staff
        </Link>
      </motion.div>

      {/* --- Identity hero ------------------------------------------- */}
      <motion.section
        className={cn('ss-staff-detail__hero', `ss-staff-detail__hero--${tone}`)}
        variants={fadeUp}
      >
        <div className="ss-staff-detail__hero-identity">
          <span
            className="ss-staff-detail__avatar"
            aria-hidden="true"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            {initialsOf(member.name)}
          </span>
          <div className="ss-staff-detail__hero-text">
            <span className="eyebrow">{roleLabels[member.role]} · {outletName}</span>
            <h1>{member.name}</h1>
            <div className="ss-staff-detail__hero-meta">
              <Badge tone={member.status === 'active' ? 'success' : 'neutral'} subtle dot>
                {member.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="ss-staff-detail__hero-sep">·</span>
              <span className="ss-staff-detail__hero-last">
                Last session{' '}
                {perf.lastSessionAt ? relativeTime(perf.lastSessionAt) : 'never'}
              </span>
            </div>
          </div>
        </div>

        <div className={cn('ss-staff-detail__health-tile', `ss-staff-detail__health-tile--${tone}`)}>
          <span className="ss-staff-detail__health-label">Health score</span>
          <div className="ss-staff-detail__health-num">{perf.healthScore}</div>
          <span className="ss-staff-detail__health-cap">
            {tone === 'green'
              ? 'Performing strong'
              : tone === 'gold'
                ? 'Solid — minor coaching wins'
                : 'Needs focused coaching'}
          </span>
        </div>
      </motion.section>

      {/* --- KPI grid ------------------------------------------------ */}
      <motion.section className="ss-staff-detail__kpis" variants={fadeUp}>
        <KpiBig
          label="Sessions"
          value={perf.totalSessions.toString()}
          hint={`${perf.totalUpsellAttempts} upsell attempts`}
        />
        <KpiBig
          label="Upsell rate"
          value={`${Math.round(perf.upsellSuccessRate)}%`}
          hint={`${perf.totalSuccessfulUpsells} of ${perf.totalUpsellAttempts}`}
          accent="gold"
        />
        <KpiBig
          label="Missed opps."
          value={perf.missedOpportunities.toString()}
          hint="Eligible scenarios not pitched"
          accent="danger"
        />
        <KpiBig
          label="Confidence"
          value={perf.avgConfidence.toString()}
          unit="/100"
          hint="Voice clarity, timing"
        />
        <KpiBig
          label="Menu knowledge"
          value={perf.avgMenuKnowledge.toString()}
          unit="%"
          hint="Correct vs total"
        />
        <KpiBig
          label="Tone"
          value={perf.avgTone.toString()}
          unit="/100"
          hint="Sentiment + politeness"
        />
        <KpiBig
          label="Empathy"
          value={perf.avgEmpathy.toString()}
          unit="/100"
          hint="Acknowledgment, patience"
        />
        <KpiBig
          label="Food safety"
          value={perf.avgFoodSafety.toString()}
          unit="%"
          hint="Allergy & cross-contam."
        />
        <KpiBig
          label="Tone consistency"
          value={perf.avgToneConsistency.toString()}
          unit="%"
          hint="Stability across session"
        />
        <KpiBig
          label="Guest rating"
          value={perf.avgGuestRating != null ? perf.avgGuestRating.toFixed(2) : '—'}
          unit={perf.avgGuestRating != null ? '/5' : ''}
          hint={`${perf.totalSessions} sessions`}
          star
        />
      </motion.section>

      {/* --- Sessions list ------------------------------------------- */}
      <motion.section className="ss-staff-detail__sessions" variants={fadeUp}>
        <div className="ss-staff-detail__sessions-head">
          <div>
            <span className="eyebrow ss-staff-detail__sessions-eyebrow">Conversation history</span>
            <h2>Sessions ({sessions.length})</h2>
          </div>
          <div className="ss-staff-detail__sessions-filters">
            <Input
              placeholder="Filter by table or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ss-staff-detail__search"
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
            <div className="ss-staff-detail__mode-rail">
              {(['all', 'lunch', 'dinner'] as ModeFilter[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeFilter(m)}
                  className={cn(
                    'ss-staff-detail__mode-chip',
                    modeFilter === m && 'ss-staff-detail__mode-chip--on',
                  )}
                >
                  {m === 'all' && (
                    <motion.span
                      layoutId={modeFilter === 'all' ? 'ss-staff-detail-mode-pill' : undefined}
                      className="ss-staff-detail__mode-pill"
                    />
                  )}
                  {m === modeFilter && m !== 'all' && (
                    <motion.span
                      layoutId="ss-staff-detail-mode-pill"
                      className="ss-staff-detail__mode-pill"
                    />
                  )}
                  <span>{m === 'all' ? 'All' : serviceModeLabels[m]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            }
            title="No sessions match"
            description="Try clearing the filters."
          />
        ) : (
          <div className="ss-sessions-table">
            <div className="ss-sessions-table__head" role="row">
              <div role="columnheader">Table</div>
              <div role="columnheader">Guest</div>
              <div role="columnheader">Service</div>
              <div role="columnheader">When</div>
              <div role="columnheader" className="ss-sessions-table__th--right">Rating</div>
              <div role="columnheader">Highlights</div>
              <div role="columnheader" aria-label="Actions" />
            </div>
            <div className="ss-sessions-table__body">
              {filtered.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onOpen={() => setSelectedSessionId(session.id)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.section>

      <SessionDrawer
        open={!!selectedSession}
        session={selectedSession}
        staffName={member.name}
        onClose={() => setSelectedSessionId(null)}
      />
    </motion.div>
  );
};

const KpiBig = ({
  label,
  value,
  unit,
  hint,
  accent,
  star,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: 'gold' | 'danger';
  star?: boolean;
}) => (
  <motion.div
    className={cn('ss-kpi-big', accent && `ss-kpi-big--${accent}`)}
    variants={fadeUp}
  >
    <span className="ss-kpi-big__label">{label}</span>
    <div className="ss-kpi-big__value">
      {star && value !== '—' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: 'var(--ss-gold-500)', marginRight: 4 }}
        >
          <path d="M12 2l2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.7L12 2z" />
        </svg>
      )}
      {value}
      {unit && <span className="ss-kpi-big__unit">{unit}</span>}
    </div>
    {hint && <span className="ss-kpi-big__hint">{hint}</span>}
  </motion.div>
);

const SessionRow = ({
  session,
  onOpen,
}: {
  session: Session;
  onOpen: () => void;
}) => {
  const positive = session.highlights.filter((h) => h.type === 'positive').length;
  const negative = session.highlights.filter((h) => h.type === 'negative').length;

  return (
    <motion.div
      className="ss-sessions-row"
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ x: 1 }}
    >
      <div role="cell" className="ss-sessions-row__table">{session.tableNumber}</div>
      <div role="cell" className="ss-sessions-row__guest">
        {session.guestName ?? <span className="ss-sessions-row__muted">Walk-in</span>}
      </div>
      <div role="cell" className="ss-sessions-row__mode">
        <Badge tone={session.serviceMode === 'dinner' ? 'brand' : 'gold'} subtle>
          {serviceModeLabels[session.serviceMode]}
        </Badge>
      </div>
      <div role="cell" className="ss-sessions-row__when">{formatSessionDate(session.startedAt)}</div>
      <div role="cell" className="ss-sessions-row__rating">
        {session.guestRating != null ? (
          <span className="ss-sessions-row__stars">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--ss-gold-500)' }}>
              <path d="M12 2l2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.7L12 2z" />
            </svg>
            <strong>{session.guestRating.toFixed(1)}</strong>
          </span>
        ) : (
          <span className="ss-sessions-row__muted">—</span>
        )}
      </div>
      <div role="cell" className="ss-sessions-row__highlights">
        {positive > 0 && (
          <span className="ss-sessions-row__hl ss-sessions-row__hl--pos">
            +{positive}
          </span>
        )}
        {negative > 0 && (
          <span className="ss-sessions-row__hl ss-sessions-row__hl--neg">
            −{negative}
          </span>
        )}
      </div>
      <div role="cell" className="ss-sessions-row__chev" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
};

export default StaffDetailPage;
