import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import {
  emptyTable,
  tableSections,
  type RestaurantTable,
} from '@/lib/mock/tables';

interface TableDrawerProps {
  open: boolean;
  table: RestaurantTable | null;
  onClose: () => void;
  onSave: (table: RestaurantTable) => void;
  onDelete?: (id: string) => void;
  isDuplicateNumber: (number: string, exceptId?: string) => boolean;
}

export const TableDrawer = ({
  open,
  table,
  onClose,
  onSave,
  onDelete,
  isDuplicateNumber,
}: TableDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<RestaurantTable>(() => table ?? emptyTable());
  const [touched, setTouched] = useState<Partial<Record<keyof RestaurantTable, boolean>>>({});
  const isEdit = !!table;

  useEffect(() => {
    if (open) {
      setDraft(table ?? emptyTable());
      setTouched({});
    }
  }, [open, table]);

  const update = (patch: Partial<RestaurantTable>) => setDraft((d) => ({ ...d, ...patch }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof RestaurantTable, string>> = {};
    if (!draft.number.trim()) e.number = 'Table number is required';
    else if (isDuplicateNumber(draft.number, draft.id)) e.number = 'A table with this number already exists';
    if (!Number.isFinite(draft.seats) || draft.seats < 1) e.seats = 'Seats must be at least 1';
    return e;
  }, [draft, isDuplicateNumber]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ number: true, seats: true });
    if (Object.keys(errors).length > 0) {
      notify({ tone: 'error', title: 'Fix the highlighted fields', description: Object.values(errors)[0] });
      return;
    }
    onSave({ ...draft, number: draft.number.trim() });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit table' : 'Add table'}
      description={
        isEdit
          ? 'Update this table’s number, capacity, or section.'
          : 'Define a table so the waiter app can pick it when starting a session.'
      }
      size="sm"
      footer={
        <>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onDelete(draft.id);
                onClose();
              }}
              style={{ marginRight: 'auto', color: 'var(--ss-danger-500)' }}
            >
              Remove table
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-table-form" variant="primary">
            {isEdit ? 'Save changes' : 'Add table'}
          </Button>
        </>
      }
    >
      <form id="ss-table-form" className="ss-table-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Table number"
          value={draft.number}
          onChange={(e) => update({ number: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, number: true }))}
          placeholder="e.g. 12, P3, Bar 2"
          error={touched.number ? errors.number : undefined}
          required
        />

        <div className="ss-table-form__row">
          <Input
            label="Seats"
            type="number"
            min={1}
            value={String(draft.seats)}
            onChange={(e) => update({ seats: parseInt(e.target.value, 10) || 0 })}
            onBlur={() => setTouched((t) => ({ ...t, seats: true }))}
            error={touched.seats ? errors.seats : undefined}
            required
          />
          <Select
            label="Section"
            value={draft.section}
            onChange={(e) => update({ section: e.target.value })}
            options={tableSections.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div className="ss-table-form__divider" />

        <Switch
          checked={draft.status === 'active'}
          onChange={(on) => update({ status: on ? 'active' : 'inactive' })}
          label="Table is active"
          description="Inactive tables stay on record but aren't offered when starting a new session."
        />
      </form>
    </Drawer>
  );
};
