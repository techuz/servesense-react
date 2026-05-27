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
    'A 78-seat neighbourhood bistro spanning two outlets — wood-fired mains, natural wines, and a service standard worth talking about.',
  cuisine: 'Modern European',
  logoUrl: null,
  contactEmail: 'hello@lumierebistro.example',
  contactPhone: '+91 98123 45678',
  website: 'www.lumierebistro.example',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
};

const seedOutlets: Outlet[] = [
  {
    id: 'outlet_001',
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
  {
    id: 'outlet_002',
    name: 'Lumière — Koramangala',
    addressLine1: '5/2, 80ft Road',
    addressLine2: '4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560034',
    contactPhone: '+91 80 4156 1100',
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
export function useOutlets() {
  const [outlets, setOutlets] = useState<Outlet[]>(() => read(OUTLETS_KEY, seedOutlets));

  useEffect(() => {
    write(OUTLETS_KEY, outlets);
  }, [outlets]);

  const upsertOutlet = useCallback((outlet: Outlet) => {
    setOutlets((list) => {
      const idx = list.findIndex((o) => o.id === outlet.id);
      if (idx === -1) return [...list, outlet];
      const next = [...list];
      next[idx] = outlet;
      return next;
    });
  }, []);

  const removeOutlet = useCallback((id: string) => {
    setOutlets((list) => list.filter((o) => o.id !== id));
  }, []);

  const toggleOutletStatus = useCallback((id: string) => {
    setOutlets((list) =>
      list.map((o) =>
        o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o,
      ),
    );
  }, []);

  return { outlets, upsertOutlet, removeOutlet, toggleOutletStatus };
}

export function newOutletId() {
  return `outlet_${Math.random().toString(36).slice(2, 9)}`;
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
