import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { allergenLabels, dishTypeLabels, portionLabels, type MenuItem } from '@/lib/mock/menu';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { DishMark } from './MenuIcons';

interface Props {
  item: MenuItem;
  currency: string;
  onEdit: (item: MenuItem) => void;
}

export const MenuItemRow = ({ item, currency, onEdit }: Props) => {
  const inactive = item.status === 'inactive';
  return (
    <motion.li
      className={cn('ss-menu-row', inactive && 'ss-menu-row--off')}
      variants={fadeUp}
      layout
    >
      <button type="button" className="ss-menu-row__inner" onClick={() => onEdit(item)}>
        <div className="ss-menu-row__lead">
          <DishMark type={item.dishType} size={16} />
        </div>

        <div className="ss-menu-row__body">
          <div className="ss-menu-row__title">
            <h3 className="ss-menu-row__name">{item.name}</h3>
            <div className="ss-menu-row__badges">
              {item.isSpecial && (
                <Badge tone="gold" subtle>
                  Special
                </Badge>
              )}
              {item.isChefsPick && (
                <Badge tone="gold" subtle={false}>
                  Chef's Pick
                </Badge>
              )}
              {item.isHighMargin && (
                <Badge tone="brand" subtle>
                  High-margin
                </Badge>
              )}
              {inactive && (
                <Badge tone="warning" subtle>
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          <p className="ss-menu-row__desc">{item.description}</p>

          <div className="ss-menu-row__meta">
            <span className="ss-menu-row__dishtype">{dishTypeLabels[item.dishType]}</span>
            <span className="ss-menu-row__dot" aria-hidden="true" />
            <span>{portionLabels[item.portionSize]}</span>

            {item.allergens.length > 0 ? (
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
            ) : item.allergensConfirmed ? (
              <>
                <span className="ss-menu-row__dot" aria-hidden="true" />
                <span className="ss-menu-row__no-allergens">No allergens</span>
              </>
            ) : (
              <>
                <span className="ss-menu-row__dot" aria-hidden="true" />
                <span className="ss-menu-row__allergens-missing">Allergens not tagged</span>
              </>
            )}
          </div>
        </div>

        <div className="ss-menu-row__right">
          <div className="ss-menu-row__price">
            <span className="ss-menu-row__currency">{currency}</span>
            <span className="ss-menu-row__amount">{item.price.toLocaleString()}</span>
          </div>
          <span className="ss-menu-row__edit-hint" aria-hidden="true">
            Edit
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M4 2.5h6.5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.5 2.5L3 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </button>
    </motion.li>
  );
};
