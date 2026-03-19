import type { Property, PropertyCreate, Stats, PrefectureInfo, PropertyFilters } from './types';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function buildQuery(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  if (filters.prefecture) params.set('prefecture', filters.prefecture);
  if (filters.status) params.set('status', filters.status);
  if (filters.property_type) params.set('property_type', filters.property_type);
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price));
  if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price));
  if (filters.free_only) params.set('free_only', 'true');
  if (filters.has_subsidy) params.set('has_subsidy', 'true');
  if (filters.has_akiya_bank) params.set('has_akiya_bank', 'true');
  if (filters.sort_by) params.set('sort_by', filters.sort_by);
  if (filters.sort_order) params.set('sort_order', filters.sort_order);
  const q = params.toString();
  return q ? `?${q}` : '';
}

export const api = {
  getProperties: (filters: PropertyFilters = {}): Promise<Property[]> =>
    fetchJSON(`${BASE_URL}/properties${buildQuery(filters)}`),

  getProperty: (id: number): Promise<Property> =>
    fetchJSON(`${BASE_URL}/properties/${id}`),

  createProperty: (data: PropertyCreate): Promise<Property> =>
    fetchJSON(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateProperty: (id: number, data: Partial<PropertyCreate>): Promise<Property> =>
    fetchJSON(`${BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteProperty: (id: number): Promise<void> =>
    fetchJSON(`${BASE_URL}/properties/${id}`, { method: 'DELETE' }),

  getStats: (): Promise<Stats> =>
    fetchJSON(`${BASE_URL}/stats`),

  getPrefectures: (): Promise<PrefectureInfo[]> =>
    fetchJSON(`${BASE_URL}/prefectures`),
};

// Watch list (localStorage)
const WATCHLIST_KEY = 'akiya_watchlist';

export const watchlist = {
  get: (): number[] => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  },
  add: (id: number) => {
    const list = watchlist.get();
    if (!list.includes(id)) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...list, id]));
    }
  },
  remove: (id: number) => {
    const list = watchlist.get().filter(i => i !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  },
  toggle: (id: number) => {
    if (watchlist.get().includes(id)) watchlist.remove(id);
    else watchlist.add(id);
  },
  has: (id: number): boolean => watchlist.get().includes(id),
};
