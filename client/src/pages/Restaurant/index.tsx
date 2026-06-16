import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { PhoneField } from '@/components/primitives/PhoneField';
import {
  cuisineOptions,
  currencyOptions,
  timezoneOptions,
  useRestaurantProfile,
} from '@/lib/mock/restaurant';
import { useTables, type RestaurantTable } from '@/lib/mock/tables';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { LogoUpload } from './LogoUpload';
import { TableDrawer } from './TableDrawer';
import './Restaurant.css';

export const RestaurantPage = () => {
  const { profile, updateProfile } = useRestaurantProfile();
  const { tables, upsert: upsertTable, remove: removeTable, isDuplicateNumber, stats: tableStats } =
    useTables();
  const { notify } = useToast();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const openAddTable = () => {
    setEditingTable(null);
    setTableDrawerOpen(true);
  };
  const openEditTable = (table: RestaurantTable) => {
    setEditingTable(table);
    setTableDrawerOpen(true);
  };

  // Group tables by section, preserving first-seen section order.
  const sections = Array.from(new Set(tables.map((t) => t.section)));

  const brandInitial = profile.name.trim().charAt(0).toUpperCase() || 'S';

  const startProfileEdit = () => {
    setProfileDraft(profile);
    setEditingProfile(true);
  };

  const saveProfileEdit = () => {
    updateProfile(profileDraft);
    setEditingProfile(false);
    notify({ tone: 'success', title: 'Profile updated', description: 'Restaurant details saved.' });
  };

  return (
    <motion.div
      className="ss-restaurant"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-restaurant__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Setup</span>
          <h1>Restaurant</h1>
          <p className="ss-restaurant__lede">
            Brand details, contact info, and the address ServeSense scopes all staff, sessions, and
            KPIs against.
          </p>
        </div>
        <div className="ss-restaurant__header-actions">
          <Badge tone="brand" subtle dot>
            One restaurant per account
          </Badge>
        </div>
      </motion.header>

      {/* ============================================================
          Profile card — read mode / edit mode
          ============================================================ */}
      <motion.section variants={fadeUp}>
        <Card padding="lg" elevation="low" className="ss-restaurant__profile">
          <AnimatePresence mode="wait" initial={false}>
            {editingProfile ? (
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
                    logoUrl={profileDraft.logoUrl}
                    brandInitial={profileDraft.name.charAt(0).toUpperCase() || 'S'}
                    onChange={(logoUrl) => setProfileDraft((d) => ({ ...d, logoUrl }))}
                    editing
                  />
                </div>

                <div className="ss-profile-edit__fields">
                  <div className="ss-profile-edit__row">
                    <Input
                      label="Restaurant name"
                      value={profileDraft.name}
                      onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Tagline"
                      value={profileDraft.tagline}
                      onChange={(e) => setProfileDraft({ ...profileDraft, tagline: e.target.value })}
                      placeholder="One short line about your brand"
                    />
                  </div>

                  <Textarea
                    label="Brand description"
                    value={profileDraft.description}
                    onChange={(e) => setProfileDraft({ ...profileDraft, description: e.target.value })}
                    rows={4}
                  />

                  <div className="ss-profile-edit__row">
                    <Select
                      label="Cuisine"
                      value={profileDraft.cuisine}
                      onChange={(e) => setProfileDraft({ ...profileDraft, cuisine: e.target.value })}
                      options={cuisineOptions.map((c) => ({ value: c, label: c }))}
                    />
                    <Input
                      label="Website"
                      value={profileDraft.website}
                      onChange={(e) => setProfileDraft({ ...profileDraft, website: e.target.value })}
                      placeholder="www.example.com"
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Input
                      label="Contact email"
                      type="email"
                      value={profileDraft.contactEmail}
                      onChange={(e) => setProfileDraft({ ...profileDraft, contactEmail: e.target.value })}
                    />
                    <PhoneField
                      label="Contact phone"
                      value={profileDraft.contactPhone}
                      onChange={(contactPhone) => setProfileDraft({ ...profileDraft, contactPhone })}
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Select
                      label="Timezone"
                      value={profileDraft.timezone}
                      onChange={(e) => setProfileDraft({ ...profileDraft, timezone: e.target.value })}
                      options={timezoneOptions}
                    />
                    <Select
                      label="Currency"
                      value={profileDraft.currency}
                      onChange={(e) => setProfileDraft({ ...profileDraft, currency: e.target.value })}
                      options={currencyOptions}
                    />
                  </div>

                  <div className="ss-profile-edit__divider" role="separator">
                    <span>Address</span>
                  </div>

                  <div className="ss-profile-edit__row">
                    <Input
                      label="Address line 1"
                      value={profileDraft.addressLine1}
                      onChange={(e) => setProfileDraft({ ...profileDraft, addressLine1: e.target.value })}
                    />
                    <Input
                      label="Address line 2"
                      value={profileDraft.addressLine2}
                      onChange={(e) => setProfileDraft({ ...profileDraft, addressLine2: e.target.value })}
                      placeholder="Suite, unit (optional)"
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Input
                      label="City"
                      value={profileDraft.city}
                      onChange={(e) => setProfileDraft({ ...profileDraft, city: e.target.value })}
                    />
                    <Input
                      label="State"
                      value={profileDraft.state}
                      onChange={(e) => setProfileDraft({ ...profileDraft, state: e.target.value })}
                    />
                  </div>

                  <div className="ss-profile-edit__row">
                    <Input
                      label="Postal code"
                      value={profileDraft.postalCode}
                      onChange={(e) => setProfileDraft({ ...profileDraft, postalCode: e.target.value })}
                    />
                    <Input
                      label="Country"
                      value={profileDraft.country}
                      onChange={(e) => setProfileDraft({ ...profileDraft, country: e.target.value })}
                    />
                  </div>

                  <div className="ss-profile-edit__actions">
                    <Button variant="ghost" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={saveProfileEdit}>
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
                  <address className="ss-profile-view__address">
                    {[
                      profile.addressLine1,
                      profile.addressLine2,
                      [profile.city, profile.state].filter(Boolean).join(', '),
                      [profile.postalCode, profile.country].filter(Boolean).join(' · '),
                    ]
                      .filter(Boolean)
                      .map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                  </address>
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
                  <Button variant="secondary" onClick={startProfileEdit}>
                    Edit profile
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.section>

      {/* ============================================================
          Tables — floor plan (not in SOW; added per dev request)
          ============================================================ */}
      <motion.section variants={fadeUp} className="ss-tables">
        <div className="ss-tables__head">
          <div>
            <h2 className="ss-tables__title">Tables</h2>
            <p className="ss-tables__lede">
              Define your floor so the waiter app can pick a table when starting a session.
            </p>
          </div>
          <div className="ss-tables__head-actions">
            <Badge tone="brand" subtle dot>
              {tableStats.active} active · {tableStats.seats} seats
            </Badge>
            <Button variant="primary" onClick={openAddTable}>
              + Add table
            </Button>
          </div>
        </div>

        {tables.length === 0 ? (
          <Card padding="lg" elevation="low" className="ss-tables__empty">
            <p>No tables yet.</p>
            <Button variant="secondary" onClick={openAddTable}>
              + Add your first table
            </Button>
          </Card>
        ) : (
          <div className="ss-tables__sections">
            {sections.map((section) => {
              const inSection = tables.filter((t) => t.section === section);
              return (
                <div key={section} className="ss-tables__section">
                  <div className="ss-tables__section-head">
                    <h3>{section}</h3>
                    <span>{inSection.length} table{inSection.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="ss-tables__grid">
                    {inSection.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={cn('ss-table-card', t.status === 'inactive' && 'ss-table-card--off')}
                        onClick={() => openEditTable(t)}
                      >
                        <span className="ss-table-card__num">{t.number}</span>
                        <span className="ss-table-card__seats">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M5 20c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                          {t.seats}
                        </span>
                        {t.status === 'inactive' && (
                          <span className="ss-table-card__off-tag">Inactive</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      <TableDrawer
        open={tableDrawerOpen}
        table={editingTable}
        onClose={() => setTableDrawerOpen(false)}
        isDuplicateNumber={isDuplicateNumber}
        onSave={(t) => {
          const isNew = !editingTable;
          upsertTable(t);
          notify({
            tone: 'success',
            title: isNew ? 'Table added' : 'Table updated',
            description: `Table ${t.number} · ${t.section}`,
          });
        }}
        onDelete={(id) => {
          const t = tables.find((x) => x.id === id);
          removeTable(id);
          notify({ tone: 'info', title: 'Table removed', description: t ? `Table ${t.number}` : undefined });
        }}
      />
    </motion.div>
  );
};

export default RestaurantPage;
