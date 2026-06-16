import { FormEvent, KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import {
  dishTypeLabels,
  portionLabels,
  tasteLabels,
  tasteOrder,
  type DishType,
  type MenuCategory,
  type MenuItem,
  type PortionSize,
  type TasteNote,
} from '@/lib/mock/menu';

interface MenuItemFormProps {
  /** Initial values — for the upload flow this is whatever was extracted. */
  item: MenuItem;
  categories: MenuCategory[];
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  submitLabel: string;
  /** Compact omits the divider switches into a tighter stack (upload review). */
  variant?: 'drawer' | 'inline';
}

const dishTypes: DishType[] = ['veg', 'non-veg'];
const portions: PortionSize[] = ['light', 'medium', 'filling'];

/* The single source of truth for the menu-item fields — shared by the
   Add/Edit drawer and the Upload review so the manager always sees the same
   form. Mount with a `key` (e.g. item id) to reset between items. */
export const MenuItemForm = ({
  item,
  categories,
  onSave,
  onCancel,
  onDelete,
  submitLabel,
  variant = 'drawer',
}: MenuItemFormProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<MenuItem>(item);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [attemptedSave, setAttemptedSave] = useState(false);

  const update = (patch: Partial<MenuItem>) => setDraft((d) => ({ ...d, ...patch }));

  const allergensResolved = draft.allergens.length > 0 || draft.allergensConfirmed;

  const toggleTaste = (t: TasteNote) =>
    setDraft((d) => ({
      ...d,
      tasteProfile: d.tasteProfile.includes(t)
        ? d.tasteProfile.filter((x) => x !== t)
        : [...d.tasteProfile, t],
    }));

  const addIngredient = () => {
    const v = ingredientInput.trim().toLowerCase();
    if (!v) return;
    if (!draft.ingredients.includes(v)) update({ ingredients: [...draft.ingredients, v] });
    setIngredientInput('');
  };

  const onIngredientKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient();
    } else if (e.key === 'Backspace' && !ingredientInput && draft.ingredients.length) {
      update({ ingredients: draft.ingredients.slice(0, -1) });
    }
  };

  const addAllergen = () => {
    const v = allergenInput.trim().toLowerCase();
    if (!v) return;
    if (!draft.allergens.includes(v)) {
      // Adding an allergen supersedes a prior "no allergens" confirmation.
      update({ allergens: [...draft.allergens, v], allergensConfirmed: false });
    }
    setAllergenInput('');
  };

  const onAllergenKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addAllergen();
    } else if (e.key === 'Backspace' && !allergenInput && draft.allergens.length) {
      update({ allergens: draft.allergens.slice(0, -1) });
    }
  };

  const nameError = attemptedSave && !draft.name.trim() ? 'Dish name is required' : undefined;
  const descError = attemptedSave && !draft.description.trim() ? 'A description is required' : undefined;
  const priceError = attemptedSave && !(draft.price > 0) ? 'Price must be greater than 0' : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAttemptedSave(true);

    if (!draft.name.trim() || !draft.description.trim() || !(draft.price > 0)) {
      notify({ tone: 'error', title: 'Check the highlighted fields', description: 'Name, description, and price are required.' });
      return;
    }
    if (!allergensResolved) {
      notify({
        tone: 'error',
        title: 'Allergens required',
        description: 'Tag the allergens for this dish, or confirm it has none. This is the food-safety layer.',
      });
      return;
    }

    onSave({
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      allergensConfirmed: true,
    });
  };

  return (
    <form className="ss-item-form" onSubmit={handleSubmit}>
      <Input
        label="Dish name"
        value={draft.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="e.g. Gambas al Ajillo"
        error={nameError}
        required
      />

      <Textarea
        label="Description"
        value={draft.description}
        onChange={(e) => update({ description: e.target.value })}
        rows={3}
        placeholder="How a waiter would describe the dish to a guest."
        error={descError}
        required
      />

      <div className="ss-item-form__row">
        <Input
          label="Price (USD)"
          type="number"
          min="0"
          step="0.01"
          value={draft.price ? String(draft.price) : ''}
          onChange={(e) => update({ price: Number(e.target.value) || 0 })}
          placeholder="0.00"
          error={priceError}
          required
        />
        <Select
          label="Category"
          value={draft.categoryId}
          onChange={(e) => update({ categoryId: e.target.value })}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      <div className="ss-item-form__row">
        <div className="ss-field">
          <span className="ss-field__label">Dish type</span>
          <div className="ss-seg" role="radiogroup" aria-label="Dish type">
            {dishTypes.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={draft.dishType === t}
                className={cn('ss-seg__opt', draft.dishType === t && 'ss-seg__opt--on')}
                onClick={() => update({ dishType: t })}
              >
                {draft.dishType === t && <motion.span layoutId={`dishtype-${draft.id}`} className="ss-seg__pill" />}
                <span className="ss-seg__label">{dishTypeLabels[t]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="ss-field">
          <span className="ss-field__label">Portion size</span>
          <div className="ss-seg" role="radiogroup" aria-label="Portion size">
            {portions.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={draft.portionSize === p}
                className={cn('ss-seg__opt', draft.portionSize === p && 'ss-seg__opt--on')}
                onClick={() => update({ portionSize: p })}
              >
                {draft.portionSize === p && <motion.span layoutId={`portion-${draft.id}`} className="ss-seg__pill" />}
                <span className="ss-seg__label">{portionLabels[p]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ss-field">
        <span className="ss-field__label">Taste profile</span>
        <div className="ss-chip-set">
          {tasteOrder.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={draft.tasteProfile.includes(t)}
              className={cn('ss-chip', draft.tasteProfile.includes(t) && 'ss-chip--on')}
              onClick={() => toggleTaste(t)}
            >
              {tasteLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="ss-field">
        <span className="ss-field__label">Ingredients</span>
        <div className="ss-tags">
          {draft.ingredients.map((ing) => (
            <span key={ing} className="ss-tag">
              {ing}
              <button
                type="button"
                className="ss-tag__x"
                onClick={() => update({ ingredients: draft.ingredients.filter((x) => x !== ing) })}
                aria-label={`Remove ${ing}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="ss-tags__input"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={onIngredientKey}
            onBlur={addIngredient}
            placeholder={draft.ingredients.length ? 'Add another…' : 'Type an ingredient, press Enter'}
          />
        </div>
        <p className="ss-field__hint">Used to cross-reference allergens during live sessions.</p>
      </div>

      <div className={cn('ss-allergens', attemptedSave && !allergensResolved && 'ss-allergens--error')}>
        <div className="ss-allergens__head">
          <span className="ss-allergens__title">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5l6 11H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6.5v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11.6" r="0.8" fill="currentColor" />
            </svg>
            Allergens
          </span>
          <span className="ss-allergens__req">Required · food-safety layer</span>
        </div>

        <div className="ss-tags ss-tags--allergen">
          {draft.allergens.map((a) => (
            <span key={a} className="ss-tag ss-tag--allergen">
              {a}
              <button
                type="button"
                className="ss-tag__x"
                onClick={() => update({ allergens: draft.allergens.filter((x) => x !== a) })}
                aria-label={`Remove ${a}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="ss-tags__input"
            value={allergenInput}
            onChange={(e) => setAllergenInput(e.target.value)}
            onKeyDown={onAllergenKey}
            onBlur={addAllergen}
            placeholder={draft.allergens.length ? 'Add another…' : 'Type an allergen, press Enter'}
          />
        </div>

        <label className="ss-allergens__none">
          <input
            type="checkbox"
            checked={draft.allergens.length === 0 && draft.allergensConfirmed}
            disabled={draft.allergens.length > 0}
            onChange={(e) => update({ allergensConfirmed: e.target.checked })}
          />
          <span>This dish has no allergens (explicitly confirmed)</span>
        </label>

        <AnimatePresence>
          {attemptedSave && !allergensResolved && (
            <motion.p
              className="ss-allergens__msg"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
            >
              Tag at least one allergen, or confirm the dish has none, before saving.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="ss-item-form__switches">
        <Switch
          checked={draft.isSpecial}
          onChange={(v) => update({ isSpecial: v })}
          label="Special"
          description="Marks a daily / weekly special."
        />
        <Switch
          checked={draft.isHighMargin}
          onChange={(v) => update({ isHighMargin: v })}
          label="High margin"
          description="Prioritised for upsell prompts."
        />
        <Switch
          checked={draft.isChefsPick}
          onChange={(v) => update({ isChefsPick: v })}
          label="Chef's Pick"
          description="Shown to waiters as a chef's recommendation."
        />
        <Switch
          checked={draft.status === 'active'}
          onChange={(v) => update({ status: v ? 'active' : 'inactive' })}
          label="Active"
          description="Inactive items are excluded from AI recommendations."
        />
      </div>

      <div className="ss-item-form__actions">
        {onDelete && (
          <Button type="button" variant="danger" onClick={() => onDelete(draft.id)}>
            {variant === 'inline' ? 'Remove' : 'Delete'}
          </Button>
        )}
        <div className="ss-item-form__actions-right">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};
