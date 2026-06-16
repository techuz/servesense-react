import { motion } from 'framer-motion';
import { Modal } from '@/components/primitives/Modal';
import { Button } from '@/components/primitives/Button';
import { initialsOf, avatarTintFor, roleLabels, type StaffMember } from '@/lib/mock/staff';
import './InviteSuccessModal.css';

interface InviteSuccessModalProps {
  open: boolean;
  member: StaffMember | null;
  onClose: () => void;
  onAddAnother: () => void;
}

/**
 * Confirmation shown after a new waiter is added (SOW v2 §5.2 — invite is sent
 * via email with the app link + credentials). Mock mode: nothing is actually
 * emailed, so this stands in as the "invite sent" acknowledgement.
 */
export const InviteSuccessModal = ({
  open,
  member,
  onClose,
  onAddAnother,
}: InviteSuccessModalProps) => {
  const tint = member ? avatarTintFor(member.id) : { bg: '', fg: '' };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onAddAnother}>
            Add another
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="ss-invite-success">
        <motion.div
          className="ss-invite-success__check"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.05 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            />
          </svg>
        </motion.div>

        <h2 className="ss-invite-success__title">Invite sent</h2>
        <p className="ss-invite-success__lede">
          We&apos;ve emailed an invite with the app link and login credentials.
        </p>

        {member && (
          <div className="ss-invite-success__card">
            <span
              className="ss-invite-success__avatar"
              aria-hidden="true"
              style={{ backgroundColor: tint.bg, color: tint.fg }}
            >
              {initialsOf(member.name || '?')}
            </span>
            <div className="ss-invite-success__details">
              <span className="ss-invite-success__name">{member.name}</span>
              <span className="ss-invite-success__email">{member.email}</span>
              <span className="ss-invite-success__role">{roleLabels[member.role]}</span>
            </div>
          </div>
        )}

        <p className="ss-invite-success__note">
          They&apos;ll appear as <strong>Active</strong> once they accept the invite and sign in.
        </p>
      </div>
    </Modal>
  );
};
