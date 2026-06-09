import { FormEvent, useEffect, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import {
  emptyPolicy,
  policyTypeHints,
  policyTypeLabels,
  policyTypeOrder,
  type Policy,
} from '@/lib/mock/policies';

interface PolicyDrawerProps {
  open: boolean;
  policy: Policy | null;
  onClose: () => void;
  onSave: (policy: Policy) => void;
  onDelete?: (id: string) => void;
}

export const PolicyDrawer = ({ open, policy, onClose, onSave, onDelete }: PolicyDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<Policy>(() => policy ?? emptyPolicy());
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});
  const isEdit = !!policy;

  useEffect(() => {
    if (open) {
      setDraft(policy ?? emptyPolicy());
      setTouched({});
    }
  }, [open, policy]);

  const titleError =
    touched.title && !draft.title.trim()
      ? 'Policy title is required'
      : touched.title && draft.title.trim().length > 200
        ? 'Keep this under 200 characters'
        : undefined;
  const descriptionError =
    touched.description && !draft.description.trim()
      ? 'A description is required'
      : touched.description && draft.description.trim().length > 2000
        ? 'Keep this under 2000 characters'
        : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true });
    if (!draft.title.trim() || !draft.description.trim()) {
      notify({ tone: 'error', title: 'Add the missing details', description: 'Title and description are required.' });
      return;
    }
    onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
    notify({
      tone: 'success',
      title: isEdit ? 'Policy updated' : 'Policy added',
      description: draft.title.trim(),
    });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit policy' : 'Add policy'} size="md">
      <form className="ss-policy-form" onSubmit={handleSubmit}>
        <Select
          label="Policy type"
          value={draft.type}
          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as Policy['type'] }))}
          options={policyTypeOrder.map((t) => ({ value: t, label: policyTypeLabels[t] }))}
          hint={policyTypeHints[draft.type]}
        />

        <Input
          label="Policy title"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          placeholder="e.g. Reservations & cancellations"
          error={titleError}
          required
        />

        <Textarea
          label="Policy description"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          placeholder="What staff and the AI should say when a guest asks about this."
          rows={6}
          error={descriptionError}
          hint={!descriptionError ? 'Used as the single source of truth during live sessions.' : undefined}
          required
        />

        <Switch
          checked={draft.status === 'active'}
          onChange={(checked) => setDraft((d) => ({ ...d, status: checked ? 'active' : 'inactive' }))}
          label="Active"
          description="Active policies are embedded for the AI to retrieve during sessions."
        />

        <div className="ss-policy-form__actions">
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
          <div className="ss-policy-form__actions-right">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? 'Save changes' : 'Add policy'}
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  );
};
