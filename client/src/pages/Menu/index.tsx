import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { EmptyState } from '@/components/primitives/EmptyState';
import { useMenuCategories, useMenuItems, type MenuItem } from '@/lib/mock/menu';
import { useRestaurantProfile } from '@/lib/mock/restaurant';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { MenuItemRow } from './MenuItemRow';
import { MenuItemDrawer } from './MenuItemDrawer';
import { MenuUploadDrawer } from './MenuUploadDrawer';
import './Menu.css';

export const MenuPage = () => {
  const { categories } = useMenuCategories();
  const { items, upsert, remove, bulkImport } = useMenuItems();
  const { profile } = useRestaurantProfile();
  const { notify } = useToast();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setItemDrawerOpen(true);
  };
  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setItemDrawerOpen(true);
  };
  const handleDelete = (id: string) => {
    remove(id);
    notify({ tone: 'info', title: 'Item removed', description: 'It will no longer appear in recommendations.' });
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
    const vegCount = items.filter((i) => i.dishType === 'veg').length;
    const highMargin = items.filter((i) => i.isHighMargin).length;
    const inactive = items.filter((i) => i.status === 'inactive').length;
    const untagged = items.filter((i) => i.allergens.length === 0 && !i.allergensConfirmed).length;
    return { total, vegCount, highMargin, inactive, untagged };
  }, [items]);

  const currency = profile.currency || 'USD';
  const currencyLabel = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;

  const categoryCounts = useMemo(() => {
    const out: Record<string, number> = { all: items.length };
    for (const c of categories) out[c.id] = items.filter((i) => i.categoryId === c.id).length;
    return out;
  }, [items, categories]);

  const firstCategoryId = categories[0]?.id ?? 'cat_tapas';

  return (
    <motion.div className="ss-menu" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-menu__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · §5.3.2</span>
          <h1>Menu Knowledge</h1>
          <p className="ss-menu__lede">
            The single source of truth for every dish — powering live menu recommendations, allergy
            detection, and waiter accuracy scoring. Upload a menu file to extract items, or add them
            by hand. Allergens are mandatory on every dish.
          </p>
        </div>
        <div className="ss-menu__header-actions">
          <Badge tone="warning" subtle dot>
            Mandatory
          </Badge>
          <Button variant="secondary" onClick={() => setUploadOpen(true)}>
            Upload menu
          </Button>
          <Button variant="primary" onClick={openNew}>
            + Add item
          </Button>
        </div>
      </motion.header>

      {stats.untagged > 0 && (
        <motion.div className="ss-menu__safety-banner" variants={fadeUp} role="alert">
          <span className="ss-menu__safety-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5l6 11H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6.5v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11.6" r="0.8" fill="currentColor" />
            </svg>
          </span>
          {stats.untagged} item{stats.untagged === 1 ? '' : 's'} {stats.untagged === 1 ? 'is' : 'are'} missing
          allergen tags. The AI can't keep guests safe until every dish is tagged.
        </motion.div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16v3H4zM4 11h16v3H4zM4 17h10v3H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          }
          title="No menu items yet"
          description="Upload your menu file to extract dishes, or add your first item by hand."
          action={
            <div className="ss-menu__empty-actions">
              <Button variant="secondary" onClick={() => setUploadOpen(true)}>
                Upload menu
              </Button>
              <Button variant="primary" onClick={openNew}>
                + Add item
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <motion.section className="ss-menu__stats" variants={fadeUp}>
            <Stat label="Items" value={stats.total} />
            <Stat label="Vegetarian" value={stats.vegCount} suffix={`of ${stats.total}`} />
            <Stat label="High-margin" value={stats.highMargin} />
            <Stat label="Inactive" value={stats.inactive} tone={stats.inactive > 0 ? 'warning' : 'neutral'} />
            <Stat label="Allergens untagged" value={stats.untagged} tone={stats.untagged > 0 ? 'warning' : 'neutral'} />
          </motion.section>

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

          <motion.section className="ss-menu__category-rail" variants={fadeUp}>
            <CategoryChip label="All categories" count={categoryCounts.all} active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
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

          <motion.section className="ss-menu__list-wrap" variants={fadeUp}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5h16v3H4zM4 11h16v3H4zM4 17h10v3H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                }
                title="No items match your filters"
                description="Try clearing the search or switching to “All categories”."
              />
            ) : (
              <motion.div className="ss-menu__sections" variants={stagger(0.04)} initial="hidden" animate="visible" layout>
                {categories
                  .filter((c) => filtered.some((i) => i.categoryId === c.id))
                  .map((cat) => {
                    const itemsInCat = filtered.filter((i) => i.categoryId === cat.id);
                    return (
                      <motion.section key={cat.id} className="ss-menu-section" variants={fadeUp} layout>
                        <header className="ss-menu-section__head">
                          <h2 className="ss-menu-section__title">{cat.name}</h2>
                          <span className="ss-menu-section__count">
                            {itemsInCat.length} item{itemsInCat.length === 1 ? '' : 's'}
                          </span>
                        </header>
                        <ul className="ss-menu-section__list">
                          {itemsInCat.map((item) => (
                            <MenuItemRow key={item.id} item={item} currency={currencyLabel} onEdit={openEdit} />
                          ))}
                        </ul>
                      </motion.section>
                    );
                  })}
              </motion.div>
            )}
          </motion.section>
        </>
      )}

      <MenuItemDrawer
        open={itemDrawerOpen}
        item={editing}
        categories={categories}
        defaultCategoryId={firstCategoryId}
        onClose={() => setItemDrawerOpen(false)}
        onSave={upsert}
        onDelete={handleDelete}
      />
      <MenuUploadDrawer
        open={uploadOpen}
        categories={categories}
        onClose={() => setUploadOpen(false)}
        onImport={bulkImport}
      />
    </motion.div>
  );
};

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
  <div className={cn('ss-menu__stat', tone === 'warning' && value > 0 && 'ss-menu__stat--warning')}>
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
  <button type="button" className={cn('ss-menu__cat-chip', active && 'ss-menu__cat-chip--on')} onClick={onClick}>
    {active && <motion.span layoutId="ss-menu-cat-active" className="ss-menu__cat-pill" />}
    <span className="ss-menu__cat-label">{label}</span>
    <span className="ss-menu__cat-count">{count}</span>
  </button>
);

export default MenuPage;
