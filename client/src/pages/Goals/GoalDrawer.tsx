import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import {
  emptyGoal,
  goalTypeLabels,
  type GoalType,
  type SalesGoal,
} from '@/lib/mock/goals';
import type { MenuItem } from '@/lib/mock/menu';
import './GoalDrawer.css';

interface GoalDrawerProps {
  open: boolean;
  goal: SalesGoal | null;
  menuItems: MenuItem[];
  onClose: () => void;
  onSave: (goal: SalesGoal) => void;
  onDelete?: (id: string) => void;
}

export const GoalDrawer = ({
  open,
  goal,
  menuItems,
  onClose,
  onSave,
  onDelete,
}: GoalDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<SalesGoal>(() => goal ?? emptyGoal());
  const [search, setSearch] = useState('');
  const isEdit = !!goal;

  useEffect(() => {
    if (open) {
      setDraft(goal ?? emptyGoal());
      setSearch('');
    }
  }, [open, goal]);

  const update = (patch: Partial<SalesGoal>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const toggleItem = (id: string) => {
    setDraft((d) => ({
      ...d,
      targetItemIds: d.targetItemIds.includes(id)
        ? d.targetItemIds.filter((x) => x !== id)
        : [...d.targetItemIds, id],
    }));
  };

  /* --- Grouped & filtered items for the picker --------------------- */
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? menuItems.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.ingredients.some((i) => i.toLowerCase().includes(q)),
        )
      : menuItems;
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      const cat = item.categoryId;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries());
  }, [menuItems, search]);

  const selectedCount = draft.targetItemIds.length;

  /* --- Validation ------------------------------------------------- */
  const errors = useMemo(() => {
    const e: Partial<Record<keyof SalesGoal, string>> = {};
    if (!draft.name.trim()) e.name = 'Name is required';
    if (draft.targetValue <= 0) e.targetValue = 'Target must be greater than zero';
    if (draft.startDate > draft.endDate) e.endDate = 'End date must be on or after start date';
    if (draft.targetItemIds.length === 0) e.targetItemIds = 'Select at least one item';
    return e;
  }, [draft]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      notify({ tone: 'error', title: 'Fix the highlighted fields', description: first });
      return;
    }
    onSave(draft);
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete || !isEdit) return;
    onDelete(draft.id);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit goal' : 'New sales goal'}
      description="Manager-set push targets the AI uses to bias live upsell prompts."
      size="lg"
      footer={
        <>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              style={{ marginRight: 'auto', color: 'var(--ss-danger-500)' }}
            >
              Delete goal
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-goal-form" variant="primary">
            {isEdit ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form
        id="ss-goal-form"
        className="ss-goal-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* --- Basics --------------------------------------------- */}
        <Input
          label="Goal name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. Weekend dessert push"
          error={errors.name}
          required
        />

        <Textarea
          label="Description"
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What's the campaign about? Context the AI can use when prompting waiters."
          rows={3}
          hint="Optional — feeds into the live coaching prompt copy."
        />

        {/* --- Type segmented control ----------------------------- */}
        <div className="ss-goal-form__field">
          <label className="ss-goal-form__label">Goal cadence</label>
          <div className="ss-goal-seg" role="radiogroup" aria-label="Goal cadence">
            {(['daily', 'weekly'] as GoalType[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={draft.type === t}
                onClick={() => update({ type: t })}
                className={cn(
                  'ss-goal-seg__option',
                  draft.type === t && 'ss-goal-seg__option--on',
                )}
              >
                {draft.type === t && (
                  <motion.span
                    layoutId="ss-goal-seg-pill"
                    className="ss-goal-seg__pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="ss-goal-seg__label">{goalTypeLabels[t]}</span>
                <span className="ss-goal-seg__sub">
                  {t === 'daily' ? 'Reset every shift' : 'Rolls across the week'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Target value + date range -------------------------- */}
        <div className="ss-goal-form__row">
          <Input
            label="Target orders"
            type="number"
            min={1}
            value={draft.targetValue}
            onChange={(e) => update({ targetValue: Number(e.target.value) || 0 })}
            error={errors.targetValue}
            hint="Total orders containing any selected item"
          />
          <div className="ss-goal-form__field">
            <label className="ss-goal-form__label">Validity</label>
            <div className="ss-goal-form__dates">
              <Input
                aria-label="Start date"
                type="date"
                value={draft.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="ss-goal-form__date"
              />
              <span className="ss-goal-form__date-arrow" aria-hidden="true">→</span>
              <Input
                aria-label="End date"
                type="date"
                value={draft.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                error={errors.endDate}
                className="ss-goal-form__date"
              />
            </div>
          </div>
        </div>

        {/* --- Target items picker -------------------------------- */}
        <div className="ss-goal-form__field">
          <div className="ss-goal-form__picker-head">
            <label className="ss-goal-form__label">
              Target items
              <span className="ss-goal-form__count">
                {selectedCount} selected
              </span>
            </label>
            {errors.targetItemIds && (
              <span className="ss-goal-form__error">{errors.targetItemIds}</span>
            )}
          </div>

          <Input
            placeholder="Search by name or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <div className="ss-goal-picker">
            {grouped.length === 0 ? (
              <div className="ss-goal-picker__empty">
                No items match "{search}"
              </div>
            ) : (
              grouped.map(([catId, items]) => (
                <div key={catId} className="ss-goal-picker__group">
                  <div className="ss-goal-picker__group-head">
                    <span>{items[0].categoryId.replace(/^cat_/, '').replace(/_/g, ' ')}</span>
                    <span className="ss-goal-picker__group-count">{items.length}</span>
                  </div>
                  {items.map((item) => {
                    const checked = draft.targetItemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          'ss-goal-picker__row',
                          checked && 'ss-goal-picker__row--on',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.id)}
                          className="ss-goal-picker__cb-input"
                        />
                        <span className="ss-goal-picker__cb" aria-hidden="true">
                          <motion.svg
                            width="12"
                            height="12"
                            viewBox="0 0 14 14"
                            initial={false}
                            animate={{
                              scale: checked ? 1 : 0.4,
                              opacity: checked ? 1 : 0,
                            }}
                            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                          >
                            <path
                              d="M3 7.5l2.5 2.5L11 4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        </span>
                        <span className="ss-goal-picker__name">{item.name}</span>
                        <span className="ss-goal-picker__price">₹{item.price}</span>
                      </label>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ss-goal-form__divider" />

        <Switch
          checked={draft.isEnabled}
          onChange={(on) => update({ isEnabled: on })}
          label="Goal is active"
          description="Disabled goals are kept but the AI stops biasing upsells toward them."
        />
      </form>
    </Drawer>
  );
};
