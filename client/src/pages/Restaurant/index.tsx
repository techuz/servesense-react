import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import {
  cuisineOptions,
  currencyOptions,
  timezoneOptions,
  usePrimaryOutlet,
  useRestaurantProfile,
} from '@/lib/mock/restaurant';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { LogoUpload } from './LogoUpload';
import './Restaurant.css';

export const RestaurantPage = () => {
  const { profile, updateProfile } = useRestaurantProfile();
  const { outlet, updateOutlet } = usePrimaryOutlet();
  const { notify } = useToast();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  const [editingOutlet, setEditingOutlet] = useState(false);
  const [outletDraft, setOutletDraft] = useState(outlet);

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

  const startOutletEdit = () => {
    setOutletDraft(outlet);
    setEditingOutlet(true);
  };

  const saveOutletEdit = () => {
    updateOutlet(outletDraft);
    setEditingOutlet(false);
    notify({ tone: 'success', title: 'Outlet updated', description: outletDraft.name });
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
            Brand details, contact info, and the outlet ServeSense scopes staff, sessions, and
            KPIs against. Multi-outlet support is coming in a later phase.
          </p>
        </div>
        <div className="ss-restaurant__header-actions">
          <Badge tone="brand" subtle dot>
            Single outlet · Phase 1
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
                    <Input
                      label="Contact phone"
                      type="tel"
                      value={profileDraft.contactPhone}
                      onChange={(e) => setProfileDraft({ ...profileDraft, contactPhone: e.target.value })}
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
          Outlet — single, inline
          ============================================================ */}
      <motion.section className="ss-restaurant__outlets" variants={fadeUp}>
        <div className="ss-restaurant__section-header">
          <div>
            <h2>Outlet location</h2>
            <p className="ss-restaurant__section-desc">
              Address and contact for the location your team operates from.
            </p>
          </div>
          {!editingOutlet && (
            <Button variant="secondary" onClick={startOutletEdit}>
              Edit outlet
            </Button>
          )}
        </div>

        <Card padding="lg" elevation="low">
          <AnimatePresence mode="wait" initial={false}>
            {editingOutlet ? (
              <motion.div
                key="outlet-edit"
                className="ss-outlet-edit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.base}
              >
                <Input
                  label="Outlet name"
                  value={outletDraft.name}
                  onChange={(e) => setOutletDraft({ ...outletDraft, name: e.target.value })}
                  required
                />
                <div className="ss-outlet-edit__row">
                  <Input
                    label="Address line 1"
                    value={outletDraft.addressLine1}
                    onChange={(e) => setOutletDraft({ ...outletDraft, addressLine1: e.target.value })}
                  />
                  <Input
                    label="Address line 2"
                    value={outletDraft.addressLine2}
                    onChange={(e) => setOutletDraft({ ...outletDraft, addressLine2: e.target.value })}
                  />
                </div>
                <div className="ss-outlet-edit__row">
                  <Input
                    label="City"
                    value={outletDraft.city}
                    onChange={(e) => setOutletDraft({ ...outletDraft, city: e.target.value })}
                  />
                  <Input
                    label="State"
                    value={outletDraft.state}
                    onChange={(e) => setOutletDraft({ ...outletDraft, state: e.target.value })}
                  />
                </div>
                <div className="ss-outlet-edit__row">
                  <Input
                    label="Postal code"
                    value={outletDraft.postalCode}
                    onChange={(e) => setOutletDraft({ ...outletDraft, postalCode: e.target.value })}
                  />
                  <Input
                    label="Country"
                    value={outletDraft.country}
                    onChange={(e) => setOutletDraft({ ...outletDraft, country: e.target.value })}
                  />
                </div>
                <Input
                  label="Outlet phone"
                  type="tel"
                  value={outletDraft.contactPhone}
                  onChange={(e) => setOutletDraft({ ...outletDraft, contactPhone: e.target.value })}
                />
                <div className="ss-profile-edit__actions">
                  <Button variant="ghost" onClick={() => setEditingOutlet(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveOutletEdit}>
                    Save outlet
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="outlet-view"
                className="ss-outlet-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.base}
              >
                <div className="ss-outlet-view__title-row">
                  <h3 className="ss-outlet-view__name">{outlet.name}</h3>
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                </div>
                <address className="ss-outlet-view__address">
                  {[
                    outlet.addressLine1,
                    outlet.addressLine2,
                    [outlet.city, outlet.state].filter(Boolean).join(', '),
                    [outlet.postalCode, outlet.country].filter(Boolean).join(' · '),
                  ]
                    .filter(Boolean)
                    .map((line, i) => (
                      <span key={i}>{line}</span>
                    ))}
                </address>
                {outlet.contactPhone && (
                  <div className="ss-outlet-view__phone">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 1.5a1 1 0 011 .8l.5 2.4-1.5 1A8 8 0 008.3 10.5l1-1.5 2.4.5a1 1 0 01.8 1v1.8a1 1 0 01-1.1 1A10 10 0 011.2 3.6 1 1 0 012.2 2.5l1.3-1z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                    {outlet.contactPhone}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.section>
    </motion.div>
  );
};

export default RestaurantPage;
