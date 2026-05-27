import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import {
  emptyStaff,
  initialsOf,
  avatarTintFor,
  relativeTime,
  roleLabels,
  type StaffMember,
  type StaffRole,
} from '@/lib/mock/staff';
import type { Outlet } from '@/lib/mock/restaurant';
import './StaffDrawer.css';

interface StaffDrawerProps {
  open: boolean;
  member: StaffMember | null;
  outlets: Outlet[];
  onClose: () => void;
  onSave: (member: StaffMember) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onResendInvite?: (id: string) => void;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9\s()-]{7,}$/;

export const StaffDrawer = ({
  open,
  member,
  outlets,
  onClose,
  onSave,
  onDelete,
  onToggleStatus,
  onResendInvite,
}: StaffDrawerProps) => {
  const { notify } = useToast();
  const defaultOutletId = outlets[0]?.id ?? '';
  const [draft, setDraft] = useState<StaffMember>(
    () => member ?? emptyStaff(defaultOutletId),
  );
  const [touched, setTouched] = useState<Partial<Record<keyof StaffMember, boolean>>>({});
  const isEdit = !!member;

  useEffect(() => {
    if (open) {
      setDraft(member ?? emptyStaff(defaultOutletId));
      setTouched({});
    }
  }, [open, member, defaultOutletId]);

  const update = (patch: Partial<StaffMember>) => setDraft((d) => ({ ...d, ...patch }));
  const markTouched = (key: keyof StaffMember) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof StaffMember, string>> = {};
    if (!draft.name.trim()) e.name = 'Name is required';
    if (!draft.email.trim()) e.email = 'Email is required';
    else if (!emailRe.test(draft.email.trim())) e.email = 'Enter a valid email';
    if (!draft.phone.trim()) e.phone = 'WhatsApp number is required';
    else if (!phoneRe.test(draft.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!draft.outletId) e.outletId = 'Assign an outlet';
    return e;
  }, [draft]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, outletId: true });
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

  const isPending = isEdit && member?.inviteStatus === 'pending';
  const tint = avatarTintFor(draft.id);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit staff' : 'Invite staff'}
      description={
        isEdit
          ? 'Update details, toggle access, or resend the invite.'
          : 'Send an invite by email + WhatsApp. They\'ll set their PIN on first sign-in.'
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
            {isEdit ? 'Save changes' : 'Send invite'}
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
              {roleLabels[draft.role]} ·{' '}
              {outlets.find((o) => o.id === draft.outletId)?.name ?? 'No outlet'}
            </span>
          </div>
        </div>

        {/* --- Invite status banner ------------------------------ */}
        {isPending && (
          <div className="ss-staff-form__banner ss-staff-form__banner--pending">
            <div className="ss-staff-form__banner-text">
              <strong>Invite still pending.</strong> Sent{' '}
              {relativeTime(member!.invitedAt)} — they haven't signed in yet.
            </div>
            {onResendInvite && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onResendInvite(draft.id)}
              >
                Resend invite
              </Button>
            )}
          </div>
        )}

        {/* --- Basics -------------------------------------------- */}
        <Input
          label="Full name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => markTouched('name')}
          placeholder="e.g. Aarav Mehta"
          error={touched.name ? errors.name : undefined}
          required
        />

        <div className="ss-staff-form__row">
          <Input
            label="Email"
            type="email"
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            onBlur={() => markTouched('email')}
            placeholder="aarav@example.com"
            error={touched.email ? errors.email : undefined}
            required
          />
          <Input
            label="WhatsApp number"
            type="tel"
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value })}
            onBlur={() => markTouched('phone')}
            placeholder="+91 98xxx xxxxx"
            error={touched.phone ? errors.phone : undefined}
            required
          />
        </div>

        <div className="ss-staff-form__row">
          <Select
            label="Role"
            value={draft.role}
            onChange={(e) => update({ role: e.target.value as StaffRole })}
            options={(Object.keys(roleLabels) as StaffRole[]).map((r) => ({
              value: r,
              label: roleLabels[r],
            }))}
          />
          <Select
            label="Outlet"
            value={draft.outletId}
            onChange={(e) => update({ outletId: e.target.value })}
            options={outlets.map((o) => ({ value: o.id, label: o.name }))}
            error={touched.outletId ? errors.outletId : undefined}
          />
        </div>

        {/* --- Performance preview (edit + accepted only) -------- */}
        {isEdit && !isPending && draft.sessionCount > 0 && (
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
