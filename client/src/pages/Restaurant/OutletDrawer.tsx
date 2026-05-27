import { FormEvent, useEffect, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Switch } from '@/components/primitives/Switch';
import { Button } from '@/components/primitives/Button';
import { newOutletId, type Outlet } from '@/lib/mock/restaurant';
import { useToast } from '@/lib/toast';

interface OutletDrawerProps {
  open: boolean;
  outlet: Outlet | null;
  onClose: () => void;
  onSave: (outlet: Outlet) => void;
  onDelete?: (id: string) => void;
}

const emptyOutlet = (): Outlet => ({
  id: newOutletId(),
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  contactPhone: '',
  status: 'active',
});

export const OutletDrawer = ({ open, outlet, onClose, onSave, onDelete }: OutletDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<Outlet>(() => outlet ?? emptyOutlet());
  const isEdit = !!outlet;

  useEffect(() => {
    if (open) setDraft(outlet ?? emptyOutlet());
  }, [open, outlet]);

  const update = (patch: Partial<Outlet>) => setDraft((d) => ({ ...d, ...patch }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      notify({ tone: 'error', title: 'Name required', description: 'Outlet name cannot be empty.' });
      return;
    }
    onSave(draft);
    notify({
      tone: 'success',
      title: isEdit ? 'Outlet updated' : 'Outlet added',
      description: draft.name,
    });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit outlet' : 'Add outlet'}
      description="Outlets scope staff, KPIs, and live sessions across your locations."
      size="md"
      footer={
        <>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onDelete(draft.id);
                notify({ tone: 'info', title: 'Outlet removed', description: draft.name });
                onClose();
              }}
              style={{ marginRight: 'auto', color: 'var(--ss-danger-500)' }}
            >
              Delete outlet
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-outlet-form" variant="primary">
            {isEdit ? 'Save changes' : 'Add outlet'}
          </Button>
        </>
      }
    >
      <form id="ss-outlet-form" onSubmit={handleSubmit} className="ss-outlet-form" noValidate>
        <Input
          label="Outlet name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. Lumière — Indiranagar"
          required
        />

        <div className="ss-outlet-form__row">
          <Input
            label="Address line 1"
            value={draft.addressLine1}
            onChange={(e) => update({ addressLine1: e.target.value })}
            placeholder="Street address"
          />
          <Input
            label="Address line 2"
            value={draft.addressLine2}
            onChange={(e) => update({ addressLine2: e.target.value })}
            placeholder="Apartment, suite, etc."
          />
        </div>

        <div className="ss-outlet-form__row">
          <Input
            label="City"
            value={draft.city}
            onChange={(e) => update({ city: e.target.value })}
          />
          <Input
            label="State"
            value={draft.state}
            onChange={(e) => update({ state: e.target.value })}
          />
        </div>

        <div className="ss-outlet-form__row">
          <Input
            label="Postal code"
            value={draft.postalCode}
            onChange={(e) => update({ postalCode: e.target.value })}
          />
          <Input
            label="Country"
            value={draft.country}
            onChange={(e) => update({ country: e.target.value })}
          />
        </div>

        <Input
          label="Outlet contact phone"
          type="tel"
          value={draft.contactPhone}
          onChange={(e) => update({ contactPhone: e.target.value })}
          placeholder="+91 80 4123 9900"
        />

        <div className="ss-outlet-form__divider" />

        <Switch
          checked={draft.status === 'active'}
          onChange={(on) => update({ status: on ? 'active' : 'inactive' })}
          label="Outlet is active"
          description="Inactive outlets stay in the system but don't accept new staff or sessions."
        />
      </form>
    </Drawer>
  );
};
