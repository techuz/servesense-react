import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/primitives/Input';
import { EmptyState } from '@/components/primitives/EmptyState';
import { useMenuCategories, useMenuItems } from '@/lib/mock/menu';
import { useRestaurantProfile } from '@/lib/mock/restaurant';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { MenuItemRow } from './MenuItemRow';
import './Menu.css';

export const MenuPage = () => {
  const { categories } = useMenuCategories();
  const { items } = useMenuItems();
  const { profile } = useRestaurantProfile();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('menu');
  const { notify } = useToast();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'Menu document removed',
      description: 'Upload a new PDF to populate this section.',
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCategory !== 'all' && it.categoryId !== activeCategory) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.ingredients.some((ing) => ing.includes(q))
      );
    });
  }, [items, query, activeCategory]);

  const stats = useMemo(() => {
    const total = items.length;
    const vegCount = items.filter((i) => i.dishType === 'veg' || i.dishType === 'vegan').length;
    const popularCount = items.filter((i) => i.isPopular).length;
    const offMenuCount = items.filter((i) => !i.isAvailable).length;
    const allergenSet = new Set<string>();
    items.forEach((i) => i.allergens.forEach((a) => allergenSet.add(a)));
    return { total, vegCount, popularCount, offMenuCount, allergenKinds: allergenSet.size };
  }, [items]);

  const currency = profile.currency || 'INR';
  const currencyLabel = (
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
  );

  const categoryCounts = useMemo(() => {
    const out: Record<string, number> = { all: items.length };
    for (const c of categories) {
      out[c.id] = items.filter((i) => i.categoryId === c.id).length;
    }
    return out;
  }, [items, categories]);

  return (
    <motion.div
      className="ss-menu"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-menu__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · {meta.sowRef}</span>
          <h1>Menu Knowledge</h1>
          <p className="ss-menu__lede">
            The single source of truth for every dish — used for live menu recommendations,
            allergy detection, and waiter accuracy scoring. Parsed from the menu PDF.
          </p>
        </div>
        <Badge tone="warning" subtle dot>
          Mandatory
        </Badge>
      </motion.header>

      {source ? (
        <>
          <OrientationSourceBanner
            source={source}
            onReplace={() => setReplaceOpen(true)}
            onRemove={handleRemove}
          />

          {/* Stats strip */}
          <motion.section className="ss-menu__stats" variants={fadeUp}>
            <Stat label="Items" value={stats.total} />
            <Stat label="Vegetarian + vegan" value={stats.vegCount} suffix={`of ${stats.total}`} />
            <Stat label="Marked popular" value={stats.popularCount} />
            <Stat label="Allergen kinds tracked" value={stats.allergenKinds} />
            <Stat
              label="Off-menu"
              value={stats.offMenuCount}
              tone={stats.offMenuCount > 0 ? 'warning' : 'neutral'}
            />
          </motion.section>

          {/* Toolbar */}
          <motion.section className="ss-menu__toolbar" variants={fadeUp}>
            <div className="ss-menu__search">
              <Input
                placeholder="Search by name, ingredient, or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leadingIcon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>
          </motion.section>

          {/* Category chip rail */}
          <motion.section className="ss-menu__category-rail" variants={fadeUp}>
            <CategoryChip
              label="All categories"
              count={categoryCounts.all}
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.name}
                count={categoryCounts[c.id] ?? 0}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
              />
            ))}
          </motion.section>

          {/* List grouped by category */}
          <motion.section className="ss-menu__list-wrap" variants={fadeUp}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 5h16v3H4zM4 11h16v3H4zM4 17h10v3H4z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                title="No items match your filters"
                description="Try clearing the search or switching to “All”."
              />
            ) : (
              <motion.div
                className="ss-menu__sections"
                variants={stagger(0.04)}
                initial="hidden"
                animate="visible"
                layout
              >
                {categories
                  .filter((c) => filtered.some((i) => i.categoryId === c.id))
                  .map((cat) => {
                    const itemsInCat = filtered.filter((i) => i.categoryId === cat.id);
                    return (
                      <motion.section
                        key={cat.id}
                        className="ss-menu-section"
                        variants={fadeUp}
                        layout
                      >
                        <header className="ss-menu-section__head">
                          <h2 className="ss-menu-section__title">{cat.name}</h2>
                          <span className="ss-menu-section__count">
                            {itemsInCat.length} item{itemsInCat.length === 1 ? '' : 's'}
                          </span>
                        </header>

                        <ul className="ss-menu-section__list">
                          {itemsInCat.map((item) => (
                            <MenuItemRow key={item.id} item={item} currency={currencyLabel} />
                          ))}
                        </ul>
                      </motion.section>
                    );
                  })}
              </motion.div>
            )}
          </motion.section>
        </>
      ) : (
        <motion.div variants={fadeUp}>
          <OrientationUpload module={meta} onComplete={uploadSource} />
        </motion.div>
      )}

      <OrientationReplaceDrawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        module={meta}
        onComplete={uploadSource}
      />
    </motion.div>
  );
};

/* --- Small helpers -------------------------------------------------------- */

const Stat = ({
  label,
  value,
  suffix,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  suffix?: string;
  tone?: 'neutral' | 'warning';
}) => (
  <div className={cn('ss-menu__stat', tone === 'warning' && 'ss-menu__stat--warning')}>
    <span className="ss-menu__stat-label">{label}</span>
    <span className="ss-menu__stat-value">
      {value}
      {suffix && <span className="ss-menu__stat-suffix">{suffix}</span>}
    </span>
  </div>
);

const CategoryChip = ({
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
    className={cn('ss-menu__cat-chip', active && 'ss-menu__cat-chip--on')}
    onClick={onClick}
  >
    {active && (
      <motion.span layoutId="ss-menu-cat-active" className="ss-menu__cat-pill" />
    )}
    <span className="ss-menu__cat-label">{label}</span>
    <span className="ss-menu__cat-count">{count}</span>
  </button>
);

export default MenuPage;
