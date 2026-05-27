import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  cuisineOptions,
  currencyOptions,
  timezoneOptions,
  useOutlets,
  useRestaurantProfile,
  type Outlet,
} from '@/lib/mock/restaurant';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { LogoUpload } from './LogoUpload';
import { OutletCard } from './OutletCard';
import { OutletDrawer } from './OutletDrawer';
import './Restaurant.css';

export const RestaurantPage = () => {
  const { profile, updateProfile } = useRestaurantProfile();
  const { outlets, upsertOutlet, removeOutlet, toggleOutletStatus } = useOutlets();
  const { notify } = useToast();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);

  const brandInitial = profile.name.trim().charAt(0).toUpperCase() || 'S';
  const activeCount = useMemo(() => outlets.filter((o) => o.status === 'active').length, [outlets]);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(profile);
  };

  const saveEdit = () => {
    updateProfile(draft);
    setEditing(false);
    notify({
      tone: 'success',
      title: 'Profile updated',
      description: 'Restaurant details saved.',
    });
  };

  const openAddOutlet = () => {
    setEditingOutlet(null);
    setDrawerOpen(true);
  };

  const openEditOutlet = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setDrawerOpen(true);
  };

  return (
    <motion.div
      className="ss-restaurant"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          Header
          ============================================================ */}
      <motion.header className="ss-restaurant__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Setup</span>
          <h1>Restaurant & Outlets</h1>
          <p className="ss-restaurant__lede">
            Brand details, contact info, and the outlets ServeSense should scope staff, sessions,
            and KPIs against.
          </p>
        </div>
        <div className="ss-restaurant__header-actions">
          <Badge tone="brand" subtle dot>
            {activeCount} of {outlets.length} outlets active
          </Badge>
        </div>
      </motion.header>

      {/* ============================================================
          Profile card — read mode / edit mode
          ============================================================ */}
      <motion.section variants={fadeUp}>
        <Card padding="lg" elevation="low" className="ss-restaurant__profile">
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit"
                className="ss-profile-edit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.base}
              >
                <div className="ss-profile-edit__logo">
                  <LogoUpload
                    logoUrl={draft.logoUrl}
                    brandInitial={draft.name.charAt(0).toUpperCase() || 'S'}
                    onChange={(logoUrl) => setDraft((d) => ({ ...d, logoUrl }))}
                    editing
                  />
                </div>

                <div className="ss-profile-edit__fields">
                  <div className="ss-profile-edit__row">
                    <Input
                      label="Restaurant name"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Tagline"
                      value={draft.tagline}
                      onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                      placeholder="One short line about your brand"
                    />
                  </div>

                  <Textarea
                    label="Brand description"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={4}
                  />

                  <div className="ss-profile-edit__row">
                    <Select
                      label="Cuisine"
                      value={draft.cuisine}
                      onChange={(e) => setDraft({ ...draft, cuisine: e.target.value })}
                      options={cuisineOptions.map((c) => ({ value: c, label: c }))}
                    />
                    <Input
                      label="Website"
                      value={draft.website}
                      onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                      placeholder="www.example.com"
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Input
                      label="Contact email"
                      type="email"
                      value={draft.contactEmail}
                      onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
                    />
                    <Input
                      label="Contact phone"
                      type="tel"
                      value={draft.contactPhone}
                      onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Select
                      label="Timezone"
                      value={draft.timezone}
                      onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                      options={timezoneOptions}
                    />
                    <Select
                      label="Currency"
                      value={draft.currency}
                      onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                      options={currencyOptions}
                    />
                  </div>

                  <div className="ss-profile-edit__actions">
                    <Button variant="ghost" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={saveEdit}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                className="ss-profile-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.base}
              >
                <LogoUpload
                  logoUrl={profile.logoUrl}
                  brandInitial={brandInitial}
                  onChange={() => undefined}
                  editing={false}
                />
                <div className="ss-profile-view__content">
                  <div className="ss-profile-view__brand">
                    <span className="eyebrow">{profile.cuisine}</span>
                    <h2>{profile.name}</h2>
                    {profile.tagline && (
                      <p className="ss-profile-view__tagline">{profile.tagline}</p>
                    )}
                  </div>
                  <p className="ss-profile-view__description">{profile.description}</p>
                  <dl className="ss-profile-view__meta">
                    <div>
                      <dt>Contact email</dt>
                      <dd>{profile.contactEmail}</dd>
                    </div>
                    <div>
                      <dt>Contact phone</dt>
                      <dd>{profile.contactPhone}</dd>
                    </div>
                    <div>
                      <dt>Website</dt>
                      <dd>{profile.website || '—'}</dd>
                    </div>
                    <div>
                      <dt>Timezone</dt>
                      <dd>{profile.timezone}</dd>
                    </div>
                    <div>
                      <dt>Currency</dt>
                      <dd>{profile.currency}</dd>
                    </div>
                  </dl>
                </div>
                <div className="ss-profile-view__edit">
                  <Button variant="secondary" onClick={startEdit}>
                    Edit profile
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.section>

      {/* ============================================================
          Outlets
          ============================================================ */}
      <motion.section className="ss-restaurant__outlets" variants={fadeUp}>
        <div className="ss-restaurant__section-header">
          <div>
            <h2>Outlets</h2>
            <p className="ss-restaurant__section-desc">
              Add each location you operate from. Outlets become the scoping unit for staff, KPIs,
              and live sessions.
            </p>
          </div>
          {outlets.length > 0 && (
            <Button variant="primary" onClick={openAddOutlet}>
              + Add outlet
            </Button>
          )}
        </div>

        {outlets.length === 0 ? (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 21V11l9-6 9 6v10M9 21v-7h6v7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="No outlets yet"
            description="Add your first outlet to start scoping staff and live sessions across locations."
            action={
              <Button variant="primary" onClick={openAddOutlet}>
                + Add your first outlet
              </Button>
            }
          />
        ) : (
          <motion.div
            className="ss-outlet-grid"
            variants={stagger(0.06, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence initial={false}>
              {outlets.map((o) => (
                <OutletCard
                  key={o.id}
                  outlet={o}
                  onEdit={() => openEditOutlet(o)}
                  onToggleStatus={() => {
                    toggleOutletStatus(o.id);
                    notify({
                      tone: 'info',
                      title: o.status === 'active' ? 'Outlet deactivated' : 'Outlet activated',
                      description: o.name,
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.section>

      <OutletDrawer
        open={drawerOpen}
        outlet={editingOutlet}
        onClose={() => setDrawerOpen(false)}
        onSave={upsertOutlet}
        onDelete={removeOutlet}
      />
    </motion.div>
  );
};

export default RestaurantPage;
