import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  policyTypeLabels,
  policyTypeOrder,
  usePolicies,
  type Policy,
} from '@/lib/mock/policies';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { PolicyDrawer } from './PolicyDrawer';
import './Policies.css';

export const PoliciesPage = () => {
  const { policies, upsert, remove, toggleStatus, stats } = usePolicies();
  const { notify } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Policy | null>(null);

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (policy: Policy) => {
    setEditing(policy);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    remove(id);
    notify({ tone: 'info', title: 'Policy removed', description: 'It will no longer be used during sessions.' });
  };

  // Order policies by the SOW type order, then by title.
  const ordered = [...policies].sort(
    (a, b) =>
      policyTypeOrder.indexOf(a.type) - policyTypeOrder.indexOf(b.type) ||
      a.title.localeCompare(b.title),
  );

  return (
    <motion.div className="ss-policies" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-policies__page-header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · §5.3.1</span>
          <h1>Standard Policies</h1>
          <p className="ss-policies__lede">
            The service rules every staff member and the AI assistant follow. Active policies are the
            single source of truth the AI retrieves when a guest asks a policy question.
          </p>
        </div>
        <div className="ss-policies__header-actions">
          <Badge tone="warning" subtle dot>
            Mandatory
          </Badge>
          <Button variant="primary" onClick={openNew}>
            + Add policy
          </Button>
        </div>
      </motion.header>

      <motion.section className="ss-policies__stats" variants={fadeUp}>
        <StatTile label="Total policies" value={stats.total.toString()} hint="Across all types" />
        <StatTile label="Active" value={stats.active.toString()} hint="Live during sessions" />
        <StatTile
          label="Types covered"
          value={`${stats.typesCovered} / ${stats.typeTotal}`}
          hint="Of the 7 standard policy types"
        />
      </motion.section>

      {ordered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M13 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
          title="No policies yet"
          description="Add your first standard policy so the AI can answer guest questions consistently."
          action={
            <Button variant="primary" onClick={openNew}>
              + Add policy
            </Button>
          }
        />
      ) : (
        <motion.div className="ss-policies__grid" variants={stagger(0.05, 0.05)} initial="hidden" animate="visible">
          {ordered.map((p) => (
            <PolicyCard
              key={p.id}
              policy={p}
              onEdit={() => openEdit(p)}
              onToggle={() => toggleStatus(p.id)}
            />
          ))}
        </motion.div>
      )}

      <PolicyDrawer
        open={drawerOpen}
        policy={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={upsert}
        onDelete={handleDelete}
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
  <div className={cn('ss-policies__stat', accent && 'ss-policies__stat--accent')}>
    <span className="ss-policies__stat-label">{label}</span>
    <span className="ss-policies__stat-value">{value}</span>
    {hint && <span className="ss-policies__stat-hint">{hint}</span>}
  </div>
);

const PolicyCard = ({
  policy,
  onEdit,
  onToggle,
}: {
  policy: Policy;
  onEdit: () => void;
  onToggle: () => void;
}) => {
  const inactive = policy.status === 'inactive';
  return (
    <motion.div variants={fadeUp}>
      <Card padding="lg" className={cn('ss-policy-card', inactive && 'ss-policy-card--inactive')}>
        <div className="ss-policy-card__top">
          <Badge tone="brand" subtle>
            {policyTypeLabels[policy.type]}
          </Badge>
          <button
            type="button"
            className={cn('ss-policy-card__status', inactive && 'ss-policy-card__status--off')}
            onClick={onToggle}
            title={inactive ? 'Activate policy' : 'Deactivate policy'}
          >
            <span className="ss-policy-card__status-dot" />
            {inactive ? 'Inactive' : 'Active'}
          </button>
        </div>
        <h3 className="ss-policy-card__title">{policy.title || 'Untitled policy'}</h3>
        <p className="ss-policy-card__desc">{policy.description}</p>
        <div className="ss-policy-card__footer">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit →
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default PoliciesPage;
