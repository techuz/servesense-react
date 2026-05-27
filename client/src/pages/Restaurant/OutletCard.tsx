import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Switch } from '@/components/primitives/Switch';
import { fadeUp, hoverLift } from '@/lib/motion';
import type { Outlet } from '@/lib/mock/restaurant';

interface OutletCardProps {
  outlet: Outlet;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export const OutletCard = ({ outlet, onEdit, onToggleStatus }: OutletCardProps) => {
  const addressLines = [
    outlet.addressLine1,
    outlet.addressLine2,
    [outlet.city, outlet.state].filter(Boolean).join(', '),
    [outlet.postalCode, outlet.country].filter(Boolean).join(' · '),
  ].filter(Boolean);

  const active = outlet.status === 'active';

  return (
    <motion.article
      className="ss-outlet-card"
      variants={fadeUp}
      {...hoverLift}
      layout
    >
      <button
        type="button"
        className="ss-outlet-card__main"
        onClick={onEdit}
        aria-label={`Edit ${outlet.name}`}
      >
        <header className="ss-outlet-card__header">
          <div className="ss-outlet-card__title-row">
            <h3 className="ss-outlet-card__title">{outlet.name}</h3>
            <Badge tone={active ? 'success' : 'neutral'} dot>
              {active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="ss-outlet-card__edit-hint" aria-hidden="true">
            Edit
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </header>

        <address className="ss-outlet-card__address">
          {addressLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </address>

        {outlet.contactPhone && (
          <div className="ss-outlet-card__phone">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3.5 1.5a1 1 0 011 .8l.5 2.4-1.5 1A8 8 0 008.3 10.5l1-1.5 2.4.5a1 1 0 01.8 1v1.8a1 1 0 01-1.1 1A10 10 0 011.2 3.6 1 1 0 012.2 2.5l1.3-1z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            {outlet.contactPhone}
          </div>
        )}
      </button>

      <footer
        className="ss-outlet-card__footer"
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          checked={active}
          onChange={onToggleStatus}
          label={active ? 'Active' : 'Inactive'}
          size="sm"
        />
      </footer>
    </motion.article>
  );
};
