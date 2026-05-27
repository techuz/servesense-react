import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Switch } from '@/components/primitives/Switch';
import {
  allergenLabels,
  dishTypeLabels,
  portionLabels,
  spiceLabels,
  type MenuItem,
} from '@/lib/mock/menu';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { DishMark, SpiceMeter } from './MenuIcons';

interface Props {
  item: MenuItem;
  currency: string;
  onEdit: () => void;
  onToggleAvailability: () => void;
}

export const MenuItemRow = ({ item, currency, onEdit, onToggleAvailability }: Props) => {
  return (
    <motion.li
      className={cn('ss-menu-row', !item.isAvailable && 'ss-menu-row--off')}
      variants={fadeUp}
      layout
    >
      <button
        type="button"
        className="ss-menu-row__btn"
        onClick={onEdit}
        aria-label={`Edit ${item.name}`}
      >
        <div className="ss-menu-row__lead">
          <DishMark type={item.dishType} size={16} />
        </div>

        <div className="ss-menu-row__body">
          <div className="ss-menu-row__title">
            <h3 className="ss-menu-row__name">{item.name}</h3>
            <div className="ss-menu-row__badges">
              {item.isSignature && (
                <Badge tone="gold" subtle>
                  Signature
                </Badge>
              )}
              {item.isPopular && (
                <Badge tone="brand" subtle>
                  Popular
                </Badge>
              )}
              {!item.isAvailable && (
                <Badge tone="warning" subtle>
                  Off menu
                </Badge>
              )}
            </div>
          </div>

          <p className="ss-menu-row__desc">{item.description}</p>

          <div className="ss-menu-row__meta">
            <span className="ss-menu-row__dishtype">{dishTypeLabels[item.dishType]}</span>
            <span className="ss-menu-row__dot" aria-hidden="true" />
            <SpiceMeter level={item.spiceLevel} />
            <span className="ss-menu-row__spice-label">{spiceLabels[item.spiceLevel]}</span>
            <span className="ss-menu-row__dot" aria-hidden="true" />
            <span>{portionLabels[item.portionSize]}</span>

            {item.allergens.length > 0 && (
              <>
                <span className="ss-menu-row__dot" aria-hidden="true" />
                <span className="ss-menu-row__allergens">
                  <span className="ss-menu-row__allergen-icon" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1l5 9H1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      <path d="M6 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="6" cy="9" r="0.6" fill="currentColor" />
                    </svg>
                  </span>
                  {item.allergens.map((a) => allergenLabels[a]).join(' · ')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="ss-menu-row__right">
          <div className="ss-menu-row__price">
            <span className="ss-menu-row__currency">{currency}</span>
            <span className="ss-menu-row__amount">{item.price.toLocaleString()}</span>
          </div>
          <div className="ss-menu-row__chev" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </button>

      <div className="ss-menu-row__toggle" onClick={(e) => e.stopPropagation()}>
        <Switch checked={item.isAvailable} onChange={onToggleAvailability} size="sm" />
      </div>
    </motion.li>
  );
};
