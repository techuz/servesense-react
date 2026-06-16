import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  useStaff,
  type StaffMember,
  type StaffStatus,
} from '@/lib/mock/staff';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { StaffRow } from './StaffRow';
import { StaffDrawer } from './StaffDrawer';
import { InviteSuccessModal } from './InviteSuccessModal';
import './Staff.css';

type StatusFilter = 'all' | StaffStatus;

const statusFilterOrder: StatusFilter[] = ['all', 'active', 'inactive'];
const statusFilterLabels: Record<StatusFilter, string> = {
  all: 'All',
  active: 'Active',
  inactive: 'Inactive',
};

type SortKey = 'name' | 'score' | 'lastActive' | 'sessions';
const sortOptions = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'score', label: 'Overall score' },
  { value: 'lastActive', label: 'Last active' },
  { value: 'sessions', label: 'Sessions' },
];

export const StaffPage = () => {
  const { staff, upsert, remove, toggleStatus, stats } = useStaff();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [invited, setInvited] = useState<StaffMember | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = staff.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'score':
          return (b.avgOverallScore ?? -1) - (a.avgOverallScore ?? -1);
        case 'sessions':
          return b.sessionCount - a.sessionCount;
        case 'lastActive':
          return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [staff, search, statusFilter, sort]);

  const counts = useMemo(() => ({
    all: staff.length,
    active: stats.active,
    inactive: stats.inactive,
  }), [staff, stats]);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setDrawerOpen(true);
  };

  const noResults = filtered.length === 0;
  const isFiltered = !!search || statusFilter !== 'all';

  return (
    <motion.div
      className="ss-staff"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* --- Header ----------------------------------------------------- */}
      <motion.header className="ss-staff__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Setup · §5.2</span>
          <h1>Staff Management</h1>
          <p className="ss-staff__lede">
            Add waiters to ServeSense — they get an email invite with the app link and credentials.
            Deactivate accounts to revoke access without losing history; performance records stay
            intact.
          </p>
        </div>
        <div className="ss-staff__header-actions">
          <Badge tone="brand" subtle dot>
            {stats.active} active · {stats.inactive} inactive
          </Badge>
        </div>
      </motion.header>

      {/* --- Stats strip ----------------------------------------------- */}
      <motion.section className="ss-staff__stats" variants={fadeUp}>
        <StatTile label="Total staff" value={stats.total.toString()} hint="At your restaurant" />
        <StatTile
          label="On the floor"
          value={stats.active.toString()}
          hint="Active accounts"
          accent
        />
        <StatTile
          label="Deactivated"
          value={stats.inactive.toString()}
          hint="Kept for history"
        />
      </motion.section>

      {/* --- Toolbar ---------------------------------------------------- */}
      <motion.section className="ss-staff__toolbar" variants={fadeUp}>
        <div className="ss-staff__toolbar-filters">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ss-staff__search"
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

          <div
            className="ss-staff__status-rail"
            role="tablist"
            aria-label="Filter by status"
          >
            {statusFilterOrder.map((f) => (
              <FilterChip
                key={f}
                label={statusFilterLabels[f]}
                count={counts[f]}
                active={statusFilter === f}
                onClick={() => setStatusFilter(f)}
              />
            ))}
          </div>

          <Select
            aria-label="Sort staff"
            className="ss-staff__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            options={sortOptions}
          />
        </div>

        <Button variant="primary" onClick={openAdd}>
          + Add staff
        </Button>
      </motion.section>

      {/* --- Table OR empty -------------------------------------------- */}
      {noResults ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          }
          title={isFiltered ? 'No staff match your filters' : 'No staff yet'}
          description={
            isFiltered
              ? 'Try clearing a filter or add someone new.'
              : 'Add your first waiter to start scoring service interactions.'
          }
          action={
            <Button variant="primary" onClick={openAdd}>
              + {isFiltered ? 'Add someone new' : 'Add first waiter'}
            </Button>
          }
        />
      ) : (
        <motion.div className="ss-staff__table" variants={fadeUp}>
          <div className="ss-staff__table-head" role="row">
            <div role="columnheader">Staff</div>
            <div role="columnheader">Role</div>
            <div role="columnheader">Status</div>
            <div role="columnheader" className="ss-staff__th--right">Sessions</div>
            <div role="columnheader" className="ss-staff__th--right">Overall</div>
            <div role="columnheader">Last active</div>
          </div>
          <motion.div
            className="ss-staff__table-body"
            variants={stagger(0.03, 0)}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence initial={false}>
              {filtered.map((s) => (
                <StaffRow key={s.id} member={s} onOpen={() => openEdit(s)} />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}

      <motion.div className="ss-staff__footer-note" variants={fadeUp}>
        <span className="ss-staff__footer-dot" aria-hidden="true" />
        Deactivated accounts stay in performance history but cannot log in.
      </motion.div>

      <StaffDrawer
        open={drawerOpen}
        member={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={(m) => {
          const isNew = !editing;
          upsert(m);
          if (isNew) {
            // New waiter → surface the invite-sent confirmation modal.
            setInvited(m);
          } else {
            notify({ tone: 'success', title: 'Staff updated', description: m.name });
          }
        }}
        onDelete={(id) => {
          const name = staff.find((s) => s.id === id)?.name ?? 'Staff';
          remove(id);
          notify({ tone: 'info', title: 'Staff removed', description: name });
        }}
        onToggleStatus={(id) => {
          const member = staff.find((s) => s.id === id);
          if (!member) return;
          toggleStatus(id);
          notify({
            tone: 'info',
            title: member.status === 'active' ? 'Deactivated' : 'Reactivated',
            description: member.name,
          });
        }}
      />

      <InviteSuccessModal
        open={!!invited}
        member={invited}
        onClose={() => setInvited(null)}
        onAddAnother={() => {
          setInvited(null);
          openAdd();
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
  <div className={cn('ss-staff__stat', accent && 'ss-staff__stat--accent')}>
    <span className="ss-staff__stat-label">{label}</span>
    <span className="ss-staff__stat-value">{value}</span>
    {hint && <span className="ss-staff__stat-hint">{hint}</span>}
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
    className={cn('ss-staff__chip', active && 'ss-staff__chip--on')}
  >
    {active && <motion.span layoutId="ss-staff-filter-pill" className="ss-staff__chip-pill" />}
    <span className="ss-staff__chip-label">{label}</span>
    <span className="ss-staff__chip-count">{count}</span>
  </button>
);

export default StaffPage;
