import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { PhoneField } from '@/components/primitives/PhoneField';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import {
  emptyStaff,
  initialsOf,
  avatarTintFor,
  roleLabels,
  type StaffMember,
  type StaffRole,
} from '@/lib/mock/staff';
import './StaffDrawer.css';

interface StaffDrawerProps {
  open: boolean;
  member: StaffMember | null;
  onClose: () => void;
  onSave: (member: StaffMember) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9\s()-]{7,}$/;

export const StaffDrawer = ({
  open,
  member,
  onClose,
  onSave,
  onDelete,
  onToggleStatus,
}: StaffDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<StaffMember>(
    () => member ?? emptyStaff(),
  );
  const [touched, setTouched] = useState<Partial<Record<keyof StaffMember, boolean>>>({});
  const isEdit = !!member;

  useEffect(() => {
    if (open) {
      setDraft(member ?? emptyStaff());
      setTouched({});
    }
  }, [open, member]);

  const update = (patch: Partial<StaffMember>) => setDraft((d) => ({ ...d, ...patch }));
  const markTouched = (key: keyof StaffMember) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof StaffMember, string>> = {};
    if (!draft.name.trim()) e.name = 'Name is required';
    if (!draft.email.trim()) e.email = 'Email is required';
    else if (!emailRe.test(draft.email.trim())) e.email = 'Enter a valid email';
    if (!draft.phone.trim()) e.phone = 'WhatsApp number is required';
    else if (!phoneRe.test(draft.phone.trim())) e.phone = 'Enter a valid phone number';
    return e;
  }, [draft]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    if (Object.keys(errors).length > 0) {
      notify({
        tone: 'error',
        title: 'Fix the highlighted fields',
        description: Object.values(errors)[0],
      });
      return;
    }
    onSave(draft);
    onClose();
  };

  const tint = avatarTintFor(draft.id);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit staff' : 'Add staff'}
      description={
        isEdit
          ? 'Update contact details, role, or active state.'
          : "Add a waiter — they'll get an email invite with the app link and credentials."
      }
      size="md"
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
              Remove staff
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-staff-form" variant="primary">
            {isEdit ? 'Save changes' : 'Add staff'}
          </Button>
        </>
      }
    >
      <form
        id="ss-staff-form"
        className="ss-staff-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* --- Identity preview ---------------------------------- */}
        <div className="ss-staff-form__identity">
          <span
            className="ss-staff-form__avatar"
            aria-hidden="true"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            {initialsOf(draft.name || '?')}
          </span>
          <div className="ss-staff-form__identity-text">
            <span className="ss-staff-form__identity-name">
              {draft.name.trim() || 'New staff member'}
            </span>
            <span className="ss-staff-form__identity-sub">
              {roleLabels[draft.role]}
            </span>
          </div>
        </div>

        {/* --- Basics -------------------------------------------- */}
        <Input
          label="Full name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => markTouched('name')}
          placeholder="e.g. Alex Rivera"
          error={touched.name ? errors.name : undefined}
          required
        />

        <Input
          label="Email"
          type="email"
          value={draft.email}
          onChange={(e) => update({ email: e.target.value })}
          onBlur={() => markTouched('email')}
          placeholder="alex@brasakitchen.example"
          error={touched.email ? errors.email : undefined}
          required
        />

        <PhoneField
          label="WhatsApp number"
          value={draft.phone}
          onChange={(phone) => update({ phone })}
          onBlur={() => markTouched('phone')}
          error={touched.phone ? errors.phone : undefined}
          required
        />

        <Select
          label="Role"
          value={draft.role}
          onChange={(e) => update({ role: e.target.value as StaffRole })}
          options={(Object.keys(roleLabels) as StaffRole[]).map((r) => ({
            value: r,
            label: roleLabels[r],
          }))}
        />

        {/* --- Performance preview (edit + has sessions only) ---- */}
        {isEdit && draft.sessionCount > 0 && (
          <div className="ss-staff-form__perf">
            <div className="ss-staff-form__perf-label">Performance preview</div>
            <div className="ss-staff-form__perf-tiles">
              <PerfTile label="Sessions" value={draft.sessionCount.toString()} />
              <PerfTile
                label="Tone"
                value={draft.avgTone != null ? `${draft.avgTone}` : '—'}
                suffix={draft.avgTone != null ? '/100' : ''}
              />
              <PerfTile
                label="Empathy"
                value={draft.avgEmpathy != null ? `${draft.avgEmpathy}` : '—'}
                suffix={draft.avgEmpathy != null ? '/100' : ''}
              />
              <PerfTile
                label="Upsell rate"
                value={
                  draft.upsellRate != null
                    ? `${Math.round(draft.upsellRate * 100)}`
                    : '—'
                }
                suffix={draft.upsellRate != null ? '%' : ''}
              />
            </div>
          </div>
        )}

        <div className="ss-staff-form__divider" />

        {/* --- Status toggle ------------------------------------- */}
        <Switch
          checked={draft.status === 'active'}
          onChange={(on) => {
            update({ status: on ? 'active' : 'inactive' });
            if (isEdit && onToggleStatus) onToggleStatus(draft.id);
          }}
          label="Account is active"
          description="Inactive accounts stay in the system for history but cannot log in to the mobile app."
        />
      </form>
    </Drawer>
  );
};

const PerfTile = ({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) => (
  <div className="ss-staff-form__perf-tile">
    <span className="ss-staff-form__perf-tile-label">{label}</span>
    <span className="ss-staff-form__perf-tile-value">
      {value}
      {suffix && <span className="ss-staff-form__perf-tile-suffix">{suffix}</span>}
    </span>
  </div>
);
