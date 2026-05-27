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
  outletName: string;
  onOpen: () => void;
}

export const StaffRow = ({ member, outletName, onOpen }: StaffRowProps) => {
  const tint = avatarTintFor(member.id);
  const isPending = member.inviteStatus === 'pending';
  const isInactive = member.status === 'inactive';

  return (
    <motion.div
      role="row"
      className={cn(
        'ss-staff-row',
        isPending && 'ss-staff-row--pending',
        isInactive && 'ss-staff-row--inactive',
      )}
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

      <div role="cell" className="ss-staff-row__outlet">
        {outletName}
      </div>

      <div role="cell" className="ss-staff-row__status">
        {isPending ? (
          <Badge tone="gold" subtle dot>
            Invite sent
          </Badge>
        ) : isInactive ? (
          <Badge tone="neutral" subtle dot>
            Inactive
          </Badge>
        ) : (
          <Badge tone="success" subtle dot>
            Active
          </Badge>
        )}
      </div>

      <div role="cell" className="ss-staff-row__last-seen">
        {isPending ? (
          <span className="ss-staff-row__muted">Invited {relativeTime(member.invitedAt)}</span>
        ) : (
          relativeTime(member.lastLoginAt)
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

      <div role="cell" className="ss-staff-row__chev" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
};
