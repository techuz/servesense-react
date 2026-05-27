import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { EmptyState } from '@/components/primitives/EmptyState';
import { useMenuCategories, useMenuItems, type DishType, type MenuItem } from '@/lib/mock/menu';
import { useRestaurantProfile } from '@/lib/mock/restaurant';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { MenuItemRow } from './MenuItemRow';
import { MenuItemDrawer } from './MenuItemDrawer';
import { UploadDrawer } from './UploadDrawer';
import './Menu.css';

type DishTypeFilter = 'all' | DishType;

const dishTypeFilterOrder: DishTypeFilter[] = ['all', 'veg', 'vegan', 'non-veg', 'seafood', 'egg'];
const dishTypeFilterLabel: Record<DishTypeFilter, string> = {
  all: 'All',
  veg: 'Veg',
  vegan: 'Vegan',
  egg: 'Egg',
  'non-veg': 'Non-veg',
  seafood: 'Seafood',
};

export const MenuPage = () => {
  const { categories } = useMenuCategories();
  const { items, upsert, remove, toggle, bulkImport } = useMenuItems();
  const { profile } = useRestaurantProfile();
  const { notify } = useToast();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDishType, setActiveDishType] = useState<DishTypeFilter>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCategory !== 'all' && it.categoryId !== activeCategory) return false;
      if (activeDishType !== 'all' && it.dishType !== activeDishType) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.ingredients.some((ing) => ing.includes(q))
      );
    });
  }, [items, query, activeCategory, activeDishType]);

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

  const openAdd = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };
  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  return (
    <motion.div
      className="ss-menu"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-menu__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · §3.2</span>
          <h1>Menu Knowledge</h1>
          <p className="ss-menu__lede">
            The single source of truth for every dish — used for live menu recommendations, allergy
            detection, and waiter accuracy scoring.
          </p>
        </div>
        <div className="ss-menu__header-actions">
          <Badge tone="warning" subtle dot>
            Mandatory
          </Badge>
          <Button variant="secondary" onClick={() => setUploadOpen(true)}>
            Upload PDF
          </Button>
          <Button variant="primary" onClick={openAdd}>
            + Add item
          </Button>
        </div>
      </motion.header>

      {/* Stats strip */}
      <motion.section className="ss-menu__stats" variants={fadeUp}>
        <Stat label="Items" value={stats.total} />
        <Stat label="Vegetarian + vegan" value={stats.vegCount} suffix={`of ${stats.total}`} />
        <Stat label="Marked popular" value={stats.popularCount} />
        <Stat label="Allergen kinds tracked" value={stats.allergenKinds} />
        <Stat label="Off-menu" value={stats.offMenuCount} tone={stats.offMenuCount > 0 ? 'warning' : 'neutral'} />
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

        <div className="ss-menu__dish-filter">
          {dishTypeFilterOrder.map((d) => (
            <button
              key={d}
              type="button"
              className={cn(
                'ss-menu__pill',
                activeDishType === d && 'ss-menu__pill--on',
              )}
              onClick={() => setActiveDishType(d)}
            >
              {dishTypeFilterLabel[d]}
            </button>
          ))}
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
            title={items.length === 0 ? 'No menu items yet' : 'No items match your filters'}
            description={
              items.length === 0
                ? 'Add items individually or upload a menu PDF to extract them automatically.'
                : 'Try clearing the search or switching to “All”.'
            }
            action={
              items.length === 0 ? (
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                  <Button variant="secondary" onClick={() => setUploadOpen(true)}>
                    Upload PDF
                  </Button>
                  <Button variant="primary" onClick={openAdd}>
                    + Add first item
                  </Button>
                </div>
              ) : null
            }
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
                      <AnimatePresence initial={false}>
                        {itemsInCat.map((item) => (
                          <MenuItemRow
                            key={item.id}
                            item={item}
                            currency={currencyLabel}
                            onEdit={() => openEdit(item)}
                            onToggleAvailability={() => {
                              toggle(item.id, 'isAvailable');
                              notify({
                                tone: 'info',
                                title: item.isAvailable ? 'Marked off menu' : 'Marked available',
                                description: item.name,
                              });
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  </motion.section>
                );
              })}
          </motion.div>
        )}
      </motion.section>

      <MenuItemDrawer
        open={drawerOpen}
        item={editingItem}
        categories={categories}
        currency={currencyLabel}
        onClose={() => setDrawerOpen(false)}
        onSave={upsert}
        onDelete={remove}
      />

      <UploadDrawer
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        categories={categories}
        currency={currencyLabel}
        onImport={bulkImport}
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
