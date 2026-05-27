import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ApiError } from './api';

export interface AuthUser {
  id: number;
  email: string;
  phone: string | null;
  fullName: string;
  role: 'manager' | 'super_admin';
  initials: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY_TOKEN = 'ss_token';
const STORAGE_KEY_USER = 'ss_user';

const AuthContext = createContext<AuthContextValue | null>(null);

function readPersistedAuth(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEY_USER);
    const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const { token, user } = readPersistedAuth();
    return {
      token,
      user,
      status: token && user ? 'authenticated' : 'unauthenticated',
    };
  });

  // Cross-tab sync: respond when another tab logs in/out.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TOKEN || e.key === STORAGE_KEY_USER) {
        const { token, user } = readPersistedAuth();
        setState({
          token,
          user,
          status: token && user ? 'authenticated' : 'unauthenticated',
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setState((s) => ({ ...s, status: 'authenticating' }));
    try {
      const trimmed = identifier.trim();
      if (trimmed.length < 3) {
        throw {
          status: 400,
          code: 'INVALID_CREDENTIALS',
          message: 'Enter your email or phone',
        } satisfies ApiError;
      }
      if (password.length < 6) {
        throw {
          status: 400,
          code: 'INVALID_CREDENTIALS',
          message: 'Password must be at least 6 characters',
        } satisfies ApiError;
      }

      const isEmail = trimmed.includes('@');
      const fullName =
        trimmed
          .split(isEmail ? '@' : ' ')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Manager';
      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join('');

      const user: AuthUser = {
        id: 1,
        email: isEmail ? trimmed : 'manager@servesense.local',
        phone: isEmail ? null : trimmed,
        fullName,
        role: 'manager',
        initials,
      };
      const token = `mock.${btoa(`${user.id}:${user.email}:${Date.now()}`)}`;

      await new Promise((r) => setTimeout(r, 350));

      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      setState({ token, user, status: 'authenticated' });
    } catch (err) {
      setState((s) => ({ ...s, status: 'unauthenticated' }));
      throw err as ApiError;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setState({ token: null, user: null, status: 'unauthenticated' });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ ...state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
