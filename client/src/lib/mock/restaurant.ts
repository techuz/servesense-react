import { useCallback, useEffect, useState } from 'react';

/* ============================================================================
   Mock data — Restaurant Profile (SOW v2 §5.1.2).
   One restaurant per account (no outlet concept — multi-location is Phase 2).
   Captures the name + address the manager enters at signup, plus brand
   metadata used across the dashboard. Persisted in localStorage so design
   reviewers can edit and refresh. Swap for fetch-based queries when the API
   ships.
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
  /* Address — captured at signup (SOW v2 §5.1.2 "Restaurant Address"). */
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const PROFILE_KEY = 'ss_mock_restaurant_profile';

const seedProfile: RestaurantProfile = {
  name: 'Brasa Spanish Kitchen',
  tagline: 'Tapas, wood-fired plates, and natural Spanish wines.',
  description:
    'A 78-seat neighbourhood spot in the West Village — shared tapas, a wood-fired hearth, and a service standard worth talking about.',
  cuisine: 'Spanish',
  logoUrl: null,
  contactEmail: 'hello@brasakitchen.example',
  contactPhone: '+1 (212) 555-0142',
  website: 'www.brasakitchen.example',
  timezone: 'America/New_York',
  currency: 'USD',
  addressLine1: '128 Bleecker Street',
  addressLine2: '',
  city: 'New York',
  state: 'NY',
  country: 'United States',
  postalCode: '10012',
};

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
  const [profile, setProfile] = useState<RestaurantProfile>(() => ({
    // Deep-merge seed with stored so address fields added later never blank
    // out an existing reviewer's saved profile.
    ...seedProfile,
    ...read(PROFILE_KEY, {} as Partial<RestaurantProfile>),
  }));

  useEffect(() => {
    write(PROFILE_KEY, profile);
  }, [profile]);

  const updateProfile = useCallback((patch: Partial<RestaurantProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const resetProfile = useCallback(() => setProfile(seedProfile), []);

  return { profile, updateProfile, resetProfile };
}

export const cuisineOptions = [
  'Spanish',
  'Modern American',
  'Italian',
  'French',
  'Mediterranean',
  'Mexican',
  'Japanese',
  'Steakhouse',
  'Seafood',
  'Farm to Table',
  'Casual Dining',
  'Fine Dining',
  'Café & Bakery',
  'Other',
];

export const timezoneOptions = [
  { value: 'America/New_York', label: 'America / New York (ET)' },
  { value: 'America/Chicago', label: 'America / Chicago (CT)' },
  { value: 'America/Denver', label: 'America / Denver (MT)' },
  { value: 'America/Los_Angeles', label: 'America / Los Angeles (PT)' },
  { value: 'America/Phoenix', label: 'America / Phoenix (MST)' },
  { value: 'UTC', label: 'UTC' },
];

export const currencyOptions = [
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ Pound Sterling (GBP)' },
];
