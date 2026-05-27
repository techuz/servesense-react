import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data for M2 — Restaurant Profile & Outlets.
   Persisted in localStorage so design reviewers can edit and refresh.
   When the real API ships, swap these hooks for fetch-based queries.
   ============================================================================ */

export interface RestaurantProfile {
  name: string;
  tagline: string;
  description: string;
  cuisine: string;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  website: string;
  timezone: string;
  currency: string;
}

export interface Outlet {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPhone: string;
  status: 'active' | 'inactive';
}

const PROFILE_KEY = 'ss_mock_restaurant_profile';
const OUTLETS_KEY = 'ss_mock_outlets';

const seedProfile: RestaurantProfile = {
  name: 'Lumière Bistro',
  tagline: 'Modern European, served with intention.',
  description:
    'A 78-seat neighbourhood bistro — wood-fired mains, natural wines, and a service standard worth talking about.',
  cuisine: 'Modern European',
  logoUrl: null,
  contactEmail: 'hello@lumierebistro.example',
  contactPhone: '+91 98123 45678',
  website: 'www.lumierebistro.example',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
};

/* Phase 1 ships single-outlet per manager. The data model still carries
 * outletId on staff and sessions so multi-outlet support is non-breaking
 * when it lands later, but the UI never exposes multi-outlet management. */
export const PRIMARY_OUTLET_ID = 'outlet_001';

const seedOutlets: Outlet[] = [
  {
    id: PRIMARY_OUTLET_ID,
    name: 'Lumière — Indiranagar',
    addressLine1: '12, 100ft Road',
    addressLine2: 'HAL 2nd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560038',
    contactPhone: '+91 80 4123 9900',
    status: 'active',
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors in design preview */
  }
}

/* --- Profile -------------------------------------------------------------- */
export function useRestaurantProfile() {
  const [profile, setProfile] = useState<RestaurantProfile>(() =>
    read(PROFILE_KEY, seedProfile),
  );

  useEffect(() => {
    write(PROFILE_KEY, profile);
  }, [profile]);

  const updateProfile = useCallback((patch: Partial<RestaurantProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const resetProfile = useCallback(() => setProfile(seedProfile), []);

  return { profile, updateProfile, resetProfile };
}

/* --- Outlets -------------------------------------------------------------- */
/**
 * Phase 1 = single outlet per manager. `useOutlets` still returns an array
 * (sessions/staff continue to reference outletId), but the UI only ever
 * exposes the primary outlet via `usePrimaryOutlet`. When multi-outlet
 * support lands, restore the upsert/remove/toggle actions and the array
 * is already in the right shape.
 */
export function useOutlets() {
  const [outlets] = useState<Outlet[]>(() => {
    const stored = read<Outlet[]>(OUTLETS_KEY, seedOutlets);
    // Migration: prior versions seeded two outlets. Collapse to the primary.
    if (stored.length > 1) {
      const primary = stored.find((o) => o.id === PRIMARY_OUTLET_ID) ?? stored[0];
      write(OUTLETS_KEY, [primary]);
      return [primary];
    }
    return stored;
  });

  return { outlets };
}

/** Convenience hook for the primary outlet + inline editing. */
export function usePrimaryOutlet() {
  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    const stored = read<Outlet[]>(OUTLETS_KEY, seedOutlets);
    if (stored.length > 1) {
      const primary = stored.find((o) => o.id === PRIMARY_OUTLET_ID) ?? stored[0];
      return [primary];
    }
    return stored;
  });

  useEffect(() => {
    write(OUTLETS_KEY, outlets);
  }, [outlets]);

  const outlet = outlets[0] ?? { ...seedOutlets[0] };

  const updateOutlet = useCallback((patch: Partial<Outlet>) => {
    setOutlets(([current = seedOutlets[0]]) => [{ ...current, ...patch }]);
  }, []);

  return { outlet, updateOutlet };
}

export const cuisineOptions = [
  'Modern European',
  'Italian',
  'French',
  'Japanese',
  'Indian',
  'Mediterranean',
  'Pan-Asian',
  'Steakhouse',
  'Seafood',
  'Casual Dining',
  'Fine Dining',
  'Café & Bakery',
  'Other',
];

export const timezoneOptions = [
  { value: 'Asia/Kolkata', label: 'Asia / Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia / Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia / Singapore (SGT)' },
  { value: 'Europe/London', label: 'Europe / London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe / Paris (CET)' },
  { value: 'America/New_York', label: 'America / New York (EST)' },
  { value: 'America/Los_Angeles', label: 'America / Los Angeles (PST)' },
  { value: 'UTC', label: 'UTC' },
];

export const currencyOptions = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ Pound Sterling (GBP)' },
  { value: 'AED', label: 'د.إ UAE Dirham (AED)' },
  { value: 'SGD', label: 'S$ Singapore Dollar (SGD)' },
];
