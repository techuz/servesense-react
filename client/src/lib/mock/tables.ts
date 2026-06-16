import { useCallback, useEffect, useMemo, useState } from 'react';

/* ============================================================================
   Mock data — Restaurant Tables.
   NOTE: Not specified in SOW v2 (the waiter types a free-text table number when
   starting a session). Added per dev request so the manager can define the
   floor plan up-front; the waiter app can later pick from this list instead of
   free-typing. Shape mirrors the future REST contract; persisted in localStorage.
   ============================================================================ */

export type TableStatus = 'active' | 'inactive';

export interface RestaurantTable {
  id: string;
  number: string;      // label / number, unique (e.g. "12", "P3", "Bar 2")
  seats: number;       // capacity
  section: string;     // zone (Main Dining, Patio, Bar, …)
  status: TableStatus;
}

const STORAGE_KEY = 'ss_mock_tables_v1';

export const tableSections = ['Main Dining', 'Patio', 'Bar', 'Private Room', 'Terrace'];

const seed: RestaurantTable[] = [
  { id: 'tbl_01', number: '1', seats: 2, section: 'Main Dining', status: 'active' },
  { id: 'tbl_02', number: '2', seats: 2, section: 'Main Dining', status: 'active' },
  { id: 'tbl_03', number: '3', seats: 4, section: 'Main Dining', status: 'active' },
  { id: 'tbl_04', number: '4', seats: 4, section: 'Main Dining', status: 'active' },
  { id: 'tbl_05', number: '5', seats: 6, section: 'Main Dining', status: 'active' },
  { id: 'tbl_06', number: 'P1', seats: 4, section: 'Patio', status: 'active' },
  { id: 'tbl_07', number: 'P2', seats: 4, section: 'Patio', status: 'inactive' },
  { id: 'tbl_08', number: 'Bar 1', seats: 1, section: 'Bar', status: 'active' },
  { id: 'tbl_09', number: 'Bar 2', seats: 1, section: 'Bar', status: 'active' },
  { id: 'tbl_10', number: 'PR1', seats: 12, section: 'Private Room', status: 'active' },
];

function read(): RestaurantTable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed;
    return parsed as RestaurantTable[];
  } catch {
    return seed;
  }
}

function write(value: RestaurantTable[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function newTableId() {
  return `tbl_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyTable(): RestaurantTable {
  return { id: newTableId(), number: '', seats: 2, section: tableSections[0], status: 'active' };
}

export function useTables() {
  const [tables, setTables] = useState<RestaurantTable[]>(() => read());

  useEffect(() => {
    write(tables);
  }, [tables]);

  const upsert = useCallback((table: RestaurantTable) => {
    setTables((list) => {
      const idx = list.findIndex((t) => t.id === table.id);
      if (idx === -1) return [...list, table];
      const next = [...list];
      next[idx] = table;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setTables((list) => list.filter((t) => t.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setTables((list) =>
      list.map((t) =>
        t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t,
      ),
    );
  }, []);

  /** Case-insensitive duplicate check on the table number/label. */
  const isDuplicateNumber = useCallback(
    (number: string, exceptId?: string) =>
      tables.some(
        (t) => t.id !== exceptId && t.number.trim().toLowerCase() === number.trim().toLowerCase(),
      ),
    [tables],
  );

  const stats = useMemo(() => {
    const active = tables.filter((t) => t.status === 'active');
    return {
      total: tables.length,
      active: active.length,
      inactive: tables.length - active.length,
      seats: active.reduce((sum, t) => sum + (Number(t.seats) || 0), 0),
    };
  }, [tables]);

  return { tables, upsert, remove, toggleStatus, isDuplicateNumber, stats };
}
