import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { cn } from '@/lib/cn';
import {
  avatarTintFor,
  initialsOf,
  relativeTime,
  roleLabels,
  type StaffMember,
} from '@/lib/mock/staff';

interface StaffRowProps {
  member: StaffMember;
  onOpen: () => void;
}

const scoreTone = (score: number) =>
  score >= 85 ? 'good' : score >= 70 ? 'ok' : 'low';

export const StaffRow = ({ member, onOpen }: StaffRowProps) => {
  const tint = avatarTintFor(member.id);
  const isInactive = member.status === 'inactive';

  return (
    <motion.div
      role="row"
      className={cn('ss-staff-row', isInactive && 'ss-staff-row--inactive')}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 1 }}
    >
      <div role="cell" className="ss-staff-row__person">
        <span
          className="ss-staff-row__avatar"
          aria-hidden="true"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          {initialsOf(member.name)}
        </span>
        <div className="ss-staff-row__person-text">
          <span className="ss-staff-row__name">{member.name || 'Untitled'}</span>
          <span className="ss-staff-row__email">{member.email}</span>
        </div>
      </div>

      <div role="cell" className="ss-staff-row__role">
        {roleLabels[member.role]}
      </div>

      <div role="cell" className="ss-staff-row__status">
        {isInactive ? (
          <Badge tone="neutral" subtle dot>
            Inactive
          </Badge>
        ) : (
          <Badge tone="success" subtle dot>
            Active
          </Badge>
        )}
      </div>

      <div role="cell" className="ss-staff-row__sessions">
        {member.sessionCount > 0 ? (
          <>
            <strong>{member.sessionCount}</strong>
            <span className="ss-staff-row__sessions-unit"> sessions</span>
          </>
        ) : (
          <span className="ss-staff-row__muted">—</span>
        )}
      </div>

      <div role="cell" className="ss-staff-row__score">
        {member.avgOverallScore != null ? (
          <span className={cn('ss-staff-row__score-pill', `ss-staff-row__score-pill--${scoreTone(member.avgOverallScore)}`)}>
            {member.avgOverallScore}%
          </span>
        ) : (
          <span className="ss-staff-row__muted">—</span>
        )}
      </div>

      <div role="cell" className="ss-staff-row__last-active">
        {relativeTime(member.lastActiveAt)}
      </div>
    </motion.div>
  );
};
