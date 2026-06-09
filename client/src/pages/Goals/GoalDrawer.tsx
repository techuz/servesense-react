import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { emptyGoal, type GoalType, type SalesGoal } from '@/lib/mock/goals';
import type { MenuCategory, MenuItem } from '@/lib/mock/menu';
import './GoalDrawer.css';

interface GoalDrawerProps {
  open: boolean;
  goal: SalesGoal | null;
  menuItems: MenuItem[];
  categories: MenuCategory[];
  onClose: () => void;
  onSave: (goal: SalesGoal) => void;
  onDelete?: (id: string) => void;
}

const types: GoalType[] = ['daily', 'weekly'];
const typeLabels: Record<GoalType, string> = { daily: 'Daily', weekly: 'Weekly' };

const todayIso = () => new Date().toISOString().slice(0, 10);

export const GoalDrawer = ({ open, goal, menuItems, categories, onClose, onSave, onDelete }: GoalDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<SalesGoal>(() => goal ?? emptyGoal());
  const [query, setQuery] = useState('');
  const [attempted, setAttempted] = useState(false);
  const isEdit = !!goal;

  useEffect(() => {
    if (open) {
      setDraft(goal ?? emptyGoal());
      setQuery('');
      setAttempted(false);
    }
  }, [open, goal]);

  // Only active menu items can be targeted (SOW §5.3.6).
  const activeItems = useMemo(() => menuItems.filter((i) => i.status === 'active'), [menuItems]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({
        category: c,
        items: activeItems.filter(
          (i) => i.categoryId === c.id && (!q || i.name.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeItems, categories, query]);

  const toggleItem = (id: string) =>
    setDraft((d) => ({
      ...d,
      targetItemIds: d.targetItemIds.includes(id)
        ? d.targetItemIds.filter((x) => x !== id)
        : [...d.targetItemIds, id],
    }));

  const nameError = attempted && !draft.name.trim() ? 'Goal name is required' : undefined;
  const itemsError = attempted && draft.targetItemIds.length === 0 ? 'Select at least one item' : undefined;
  const valueError = attempted && !(draft.targetValue > 0) ? 'Target must be greater than 0' : undefined;
  const dateError =
    attempted && draft.endDate < draft.startDate
      ? 'End date must be after the start date'
      : attempted && !isEdit && draft.startDate < todayIso()
        ? 'Start date must be today or later'
        : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (
      !draft.name.trim() ||
      draft.targetItemIds.length === 0 ||
      !(draft.targetValue > 0) ||
      draft.endDate < draft.startDate ||
      (!isEdit && draft.startDate < todayIso())
    ) {
      notify({ tone: 'error', title: 'Check the highlighted fields', description: 'A few details need a fix.' });
      return;
    }
    onSave({ ...draft, name: draft.name.trim() });
    notify({ tone: 'success', title: isEdit ? 'Goal updated' : 'Goal created', description: draft.name.trim() });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit goal' : 'New goal'} size="md">
      <form className="ss-goal-form" onSubmit={handleSubmit}>
        <Input
          label="Goal name"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Rioja & tapas pairing"
          error={nameError}
          required
        />

        {/* Goal type */}
        <div className="ss-field">
          <span className="ss-field__label">Goal type</span>
          <div className="ss-seg" role="radiogroup" aria-label="Goal type">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={draft.type === t}
                className={cn('ss-seg__opt', draft.type === t && 'ss-seg__opt--on')}
                onClick={() => setDraft((d) => ({ ...d, type: t }))}
              >
                {draft.type === t && <motion.span layoutId="ss-goal-type" className="ss-seg__pill" />}
                <span className="ss-seg__label">{typeLabels[t]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target value + validity period */}
        <div className="ss-goal-form__row">
          <Input
            label="Target value"
            type="number"
            min="1"
            value={draft.targetValue ? String(draft.targetValue) : ''}
            onChange={(e) => setDraft((d) => ({ ...d, targetValue: Number(e.target.value) || 0 }))}
            placeholder="e.g. 80"
            hint="Orders containing a target item"
            error={valueError}
            required
          />
        </div>

        <div className="ss-goal-form__row">
          <Input
            label="Start date"
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
            error={dateError && draft.startDate ? ' ' : undefined}
          />
          <Input
            label="End date"
            type="date"
            value={draft.endDate}
            min={draft.startDate}
            onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
          />
        </div>
        {dateError && <p className="ss-field__error">{dateError}</p>}

        {/* Target items */}
        <div className="ss-field">
          <span className="ss-field__label">
            Target items <span aria-hidden="true" className="ss-field__required">*</span>
          </span>
          <Input
            placeholder="Search active menu items"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
          />
          {itemsError && <p className="ss-field__error">{itemsError}</p>}
          <div className="ss-goal-form__picker">
            {grouped.length === 0 ? (
              <p className="ss-goal-form__picker-empty">No active items match.</p>
            ) : (
              grouped.map(({ category, items }) => (
                <div key={category.id} className="ss-goal-form__picker-group">
                  <span className="ss-goal-form__picker-cat">{category.name}</span>
                  {items.map((item) => {
                    const on = draft.targetItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn('ss-goal-form__pick', on && 'ss-goal-form__pick--on')}
                        onClick={() => toggleItem(item.id)}
                        aria-pressed={on}
                      >
                        <span className="ss-goal-form__pick-box" aria-hidden="true" />
                        <span className="ss-goal-form__pick-name">{item.name}</span>
                        <span className="ss-goal-form__pick-price">${item.price}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          {draft.targetItemIds.length > 0 && (
            <span className="ss-goal-form__count">{draft.targetItemIds.length} selected</span>
          )}
        </div>

        <div className="ss-goal-form__actions">
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete(draft.id);
                onClose();
              }}
            >
              Delete
            </Button>
          )}
          <div className="ss-goal-form__actions-right">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? 'Save changes' : 'Create goal'}
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  );
};
