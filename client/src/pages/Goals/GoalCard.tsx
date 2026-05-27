import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Switch } from '@/components/primitives/Switch';
import { fadeUp, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  daysRemaining,
  goalTypeLabels,
  progressOf,
  statusOf,
  type SalesGoal,
} from '@/lib/mock/goals';
import type { MenuItem } from '@/lib/mock/menu';

interface GoalCardProps {
  goal: SalesGoal;
  menuItems: MenuItem[];
  onEdit: () => void;
  onToggle: () => void;
}

const fmtRange = (start: string, end: string) => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  const e = new Date(end).toLocaleDateString('en-US', opts);
  return start === end ? s : `${s} → ${e}`;
};

export const GoalCard = ({ goal, menuItems, onEdit, onToggle }: GoalCardProps) => {
  const status = statusOf(goal);
  const pct = progressOf(goal);
  const remaining = daysRemaining(goal);

  const targetNames = useMemo(() => {
    const map = new Map(menuItems.map((m) => [m.id, m.name]));
    return goal.targetItemIds.map((id) => map.get(id) ?? 'Removed item').filter(Boolean);
  }, [menuItems, goal.targetItemIds]);

  const statusTone: Record<typeof status, 'success' | 'gold' | 'neutral'> = {
    active: 'success',
    upcoming: 'gold',
    ended: 'neutral',
  };

  const isDimmed = !goal.isEnabled || status === 'ended';

  return (
    <motion.article
      className={cn(
        'ss-goal-card',
        `ss-goal-card--${status}`,
        isDimmed && 'ss-goal-card--dim',
      )}
      variants={fadeUp}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={transitions.base}
      whileHover={{ y: -2 }}
    >
      <button
        type="button"
        className="ss-goal-card__hit"
        onClick={onEdit}
        aria-label={`Edit ${goal.name}`}
      />

      <header className="ss-goal-card__head">
        <div className="ss-goal-card__title-block">
          <div className="ss-goal-card__badges">
            <Badge tone="brand" subtle>
              {goalTypeLabels[goal.type]}
            </Badge>
            <Badge tone={statusTone[status]} subtle dot>
              {status === 'active'
                ? `${remaining}d left`
                : status === 'upcoming'
                  ? 'Starts soon'
                  : 'Ended'}
            </Badge>
          </div>
          <h3 className="ss-goal-card__name">{goal.name}</h3>
        </div>
        <div className="ss-goal-card__switch" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={goal.isEnabled}
            onChange={onToggle}
            size="sm"
            aria-label={goal.isEnabled ? 'Pause goal' : 'Resume goal'}
          />
        </div>
      </header>

      {goal.description && (
        <p className="ss-goal-card__desc">{goal.description}</p>
      )}

      {/* --- Progress -------------------------------------------------- */}
      <div className="ss-goal-card__progress">
        <div className="ss-goal-card__progress-row">
          <span className="ss-goal-card__progress-readout">
            <strong>{goal.currentValue}</strong>
            <span className="ss-goal-card__progress-of"> / {goal.targetValue}</span>
            <span className="ss-goal-card__progress-unit"> orders</span>
          </span>
          <span className="ss-goal-card__progress-pct">{Math.round(pct * 100)}%</span>
        </div>
        <div className="ss-goal-card__progress-track" aria-hidden="true">
          <motion.div
            className="ss-goal-card__progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* --- Footer ---------------------------------------------------- */}
      <footer className="ss-goal-card__foot">
        <div className="ss-goal-card__items">
          {targetNames.slice(0, 3).map((name) => (
            <span key={name} className="ss-goal-card__item-chip">
              {name}
            </span>
          ))}
          {targetNames.length > 3 && (
            <span className="ss-goal-card__item-chip ss-goal-card__item-chip--more">
              +{targetNames.length - 3}
            </span>
          )}
          {targetNames.length === 0 && (
            <span className="ss-goal-card__items-empty">No items selected</span>
          )}
        </div>
        <span className="ss-goal-card__range">{fmtRange(goal.startDate, goal.endDate)}</span>
      </footer>

      <span className="ss-goal-card__edit-hint" aria-hidden="true">
        Edit →
      </span>
    </motion.article>
  );
};
