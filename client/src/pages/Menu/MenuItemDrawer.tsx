import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import {
  allergenLabels,
  dishTypeLabels,
  newMenuItemId,
  portionLabels,
  spiceLabels,
  tasteLabels,
  type Allergen,
  type DishType,
  type MenuCategory,
  type MenuItem,
  type PortionSize,
  type SpiceLevel,
  type TasteNote,
} from '@/lib/mock/menu';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  item: MenuItem | null;
  categories: MenuCategory[];
  currency: string;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
}

const emptyItem = (categoryId: string): MenuItem => ({
  id: newMenuItemId(),
  categoryId,
  name: '',
  description: '',
  dishType: 'veg',
  spiceLevel: 'mild',
  portionSize: 'medium',
  tasteProfile: [],
  ingredients: [],
  allergens: [],
  price: 0,
  isPopular: false,
  isSignature: false,
  isAvailable: true,
});

export const MenuItemDrawer = ({
  open,
  item,
  categories,
  currency,
  onClose,
  onSave,
  onDelete,
}: Props) => {
  const { notify } = useToast();
  const isEdit = !!item;
  const [draft, setDraft] = useState<MenuItem>(() => item ?? emptyItem(categories[0]?.id ?? ''));
  const [ingredientDraft, setIngredientDraft] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(item ?? emptyItem(categories[0]?.id ?? ''));
      setIngredientDraft('');
    }
  }, [open, item, categories]);

  const update = (patch: Partial<MenuItem>) => setDraft((d) => ({ ...d, ...patch }));

  const addIngredient = () => {
    const v = ingredientDraft.trim().toLowerCase();
    if (!v) return;
    if (draft.ingredients.includes(v)) {
      setIngredientDraft('');
      return;
    }
    update({ ingredients: [...draft.ingredients, v] });
    setIngredientDraft('');
  };

  const removeIngredient = (ing: string) => {
    update({ ingredients: draft.ingredients.filter((i) => i !== ing) });
  };

  const toggleAllergen = (a: Allergen) => {
    update({
      allergens: draft.allergens.includes(a)
        ? draft.allergens.filter((x) => x !== a)
        : [...draft.allergens, a],
    });
  };

  const toggleTaste = (t: TasteNote) => {
    update({
      tasteProfile: draft.tasteProfile.includes(t)
        ? draft.tasteProfile.filter((x) => x !== t)
        : [...draft.tasteProfile, t],
    });
  };

  const onIngredientKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient();
    } else if (e.key === 'Backspace' && !ingredientDraft && draft.ingredients.length) {
      removeIngredient(draft.ingredients[draft.ingredients.length - 1]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      notify({ tone: 'error', title: 'Item name required', description: 'Give the dish a name first.' });
      return;
    }
    onSave(draft);
    notify({
      tone: 'success',
      title: isEdit ? 'Item updated' : 'Item added',
      description: draft.name,
    });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit menu item' : 'Add menu item'}
      description="Captured menu data powers allergy detection, recommendations, and accuracy scoring."
      size="lg"
      footer={
        <>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onDelete(draft.id);
                notify({ tone: 'info', title: 'Item removed', description: draft.name });
                onClose();
              }}
              style={{ marginRight: 'auto', color: 'var(--ss-danger-500)' }}
            >
              Delete item
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-menu-item-form" variant="primary">
            {isEdit ? 'Save changes' : 'Add item'}
          </Button>
        </>
      }
    >
      <form
        id="ss-menu-item-form"
        onSubmit={handleSubmit}
        className="ss-menu-form"
        noValidate
      >
        <Input
          label="Item name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. Truffle Burrata"
          required
        />

        <Textarea
          label="Description"
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          hint="Two short sentences — taste, technique, signature ingredient."
        />

        <div className="ss-menu-form__row">
          <Select
            label="Category"
            value={draft.categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input
            label={`Price (${currency})`}
            type="number"
            min={0}
            step={10}
            value={draft.price}
            onChange={(e) => update({ price: Number(e.target.value) })}
          />
        </div>

        <div className="ss-menu-form__row">
          <Select
            label="Dish type"
            value={draft.dishType}
            onChange={(e) => update({ dishType: e.target.value as DishType })}
            options={(Object.keys(dishTypeLabels) as DishType[]).map((d) => ({
              value: d,
              label: dishTypeLabels[d],
            }))}
          />
          <Select
            label="Portion size"
            value={draft.portionSize}
            onChange={(e) => update({ portionSize: e.target.value as PortionSize })}
            options={(Object.keys(portionLabels) as PortionSize[]).map((p) => ({
              value: p,
              label: portionLabels[p],
            }))}
          />
        </div>

        <Select
          label="Spice level"
          value={draft.spiceLevel}
          onChange={(e) => update({ spiceLevel: e.target.value as SpiceLevel })}
          options={(Object.keys(spiceLabels) as SpiceLevel[]).map((s) => ({
            value: s,
            label: spiceLabels[s],
          }))}
        />

        {/* Taste profile chips */}
        <div className="ss-menu-form__field">
          <span className="ss-menu-form__label">Taste profile</span>
          <span className="ss-menu-form__hint">Pick all flavour notes that fit.</span>
          <div className="ss-chip-set">
            {(Object.keys(tasteLabels) as TasteNote[]).map((t) => (
              <button
                key={t}
                type="button"
                className={cn('ss-chip', draft.tasteProfile.includes(t) && 'ss-chip--on')}
                onClick={() => toggleTaste(t)}
              >
                {tasteLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients tag input */}
        <div className="ss-menu-form__field">
          <span className="ss-menu-form__label">Ingredients</span>
          <span className="ss-menu-form__hint">
            Press <kbd>Enter</kbd> or comma to add. Powers allergy detection during live sessions.
          </span>
          <div className="ss-tag-input">
            {draft.ingredients.map((ing) => (
              <motion.span
                key={ing}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="ss-tag"
              >
                {ing}
                <button
                  type="button"
                  className="ss-tag__remove"
                  onClick={() => removeIngredient(ing)}
                  aria-label={`Remove ${ing}`}
                >
                  ×
                </button>
              </motion.span>
            ))}
            <input
              type="text"
              value={ingredientDraft}
              onChange={(e) => setIngredientDraft(e.target.value)}
              onKeyDown={onIngredientKey}
              onBlur={addIngredient}
              placeholder={draft.ingredients.length === 0 ? 'tomato, basil, mozzarella…' : ''}
              className="ss-tag-input__field"
            />
          </div>
        </div>

        {/* Allergens checkbox grid */}
        <div className="ss-menu-form__field">
          <span className="ss-menu-form__label">Allergens</span>
          <span className="ss-menu-form__hint">
            Flagged in real time when a guest mentions a restriction.
          </span>
          <div className="ss-menu-form__check-grid">
            {(Object.keys(allergenLabels) as Allergen[]).map((a) => (
              <Checkbox
                key={a}
                checked={draft.allergens.includes(a)}
                onChange={() => toggleAllergen(a)}
                label={allergenLabels[a]}
              />
            ))}
          </div>
        </div>

        {/* Status toggles */}
        <div className="ss-menu-form__field ss-menu-form__field--row">
          <Checkbox
            checked={draft.isPopular}
            onChange={(on) => update({ isPopular: on })}
            label="Popular item"
            description="Recommended more often by the AI"
          />
          <Checkbox
            checked={draft.isSignature}
            onChange={(on) => update({ isSignature: on })}
            label="Signature dish"
            description="Featured during menu walkthroughs"
          />
          <Checkbox
            checked={draft.isAvailable}
            onChange={(on) => update({ isAvailable: on })}
            label="Available right now"
            description="Toggle off when the kitchen 86s the dish"
          />
        </div>
      </form>
    </Drawer>
  );
};
