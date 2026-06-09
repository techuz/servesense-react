import { FormEvent, useEffect, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/lib/toast';
import { emptySopStep, type SopStep } from '@/lib/mock/sop';

interface SopStepDrawerProps {
  open: boolean;
  step: SopStep | null;
  /** 1-based position shown as the (auto) step number. */
  position: number;
  onClose: () => void;
  onSave: (step: SopStep) => void;
  onDelete?: (id: string) => void;
}

export const SopStepDrawer = ({ open, step, position, onClose, onSave, onDelete }: SopStepDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<SopStep>(() => step ?? emptySopStep());
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});
  const isEdit = !!step;

  useEffect(() => {
    if (open) {
      setDraft(step ?? emptySopStep());
      setTouched({});
    }
  }, [open, step]);

  const nameError =
    touched.name && !draft.name.trim()
      ? 'Step name is required'
      : touched.name && draft.name.trim().length > 100
        ? 'Keep this under 100 characters'
        : undefined;
  const descError =
    touched.description && !draft.description.trim()
      ? 'A description is required'
      : touched.description && draft.description.trim().length > 500
        ? 'Keep this under 500 characters'
        : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, description: true });
    if (!draft.name.trim() || !draft.description.trim()) {
      notify({ tone: 'error', title: 'Add the missing details', description: 'Step name and description are required.' });
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      expectedOutcome: draft.expectedOutcome.trim(),
      scoringWeight: Number(draft.scoringWeight) || 0,
    });
    notify({ tone: 'success', title: isEdit ? 'Step updated' : 'Step added', description: draft.name.trim() });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit SOP step' : 'Add SOP step'} size="md">
      <form className="ss-sop-form" onSubmit={handleSubmit}>
        <div className="ss-sop-form__numhint">
          Step number <strong>{String(position).padStart(2, '0')}</strong> · set by its position in the sequence
        </div>

        <Input
          label="Step name"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="e.g. Greeting"
          error={nameError}
          required
        />

        <Textarea
          label="Description"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          rows={5}
          placeholder="What the waiter should do at this step."
          error={descError}
          required
        />

        <div className="ss-sop-form__row">
          <Input
            label="Expected outcome"
            value={draft.expectedOutcome}
            onChange={(e) => setDraft((d) => ({ ...d, expectedOutcome: e.target.value }))}
            placeholder="e.g. First impression"
            hint="Optional"
          />
          <Input
            label="Scoring weight"
            type="number"
            min="0"
            step="0.5"
            value={String(draft.scoringWeight)}
            onChange={(e) => setDraft((d) => ({ ...d, scoringWeight: Number(e.target.value) }))}
            hint="Weight in SOP scoring"
          />
        </div>

        <div className="ss-sop-form__actions">
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
          <div className="ss-sop-form__actions-right">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? 'Save changes' : 'Add step'}
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  );
};
