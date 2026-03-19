import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import type { Property, PropertyFilters, PropertyType, PropertyStatus, PropertyCondition } from '../types';
import { JAPANESE_PREFECTURES } from '../types';
import { PropertyCard } from './PropertyCard';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Recently Added / 追加順' },
  { value: 'price_jpy', label: 'Price / 価格' },
  { value: 'building_area_m2', label: 'Building Area / 建物面積' },
  { value: 'land_area_m2', label: 'Land Area / 敷地面積' },
  { value: 'year_built', label: 'Year Built / 築年' },
  { value: 'municipal_subsidy_jpy', label: 'Subsidy Amount / 補助金額' },
];

export function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchText, setSearchText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProperties(filters);
      setProperties(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filteredProperties = searchText.trim()
    ? properties.filter(p => {
        const q = searchText.toLowerCase();
        return (
          p.title_jp.includes(searchText) ||
          p.title_en.toLowerCase().includes(q) ||
          p.prefecture.includes(searchText) ||
          p.municipality.includes(searchText) ||
          (p.village_name || '').includes(searchText) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      })
    : properties;

  const updateFilter = (key: keyof PropertyFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({ sort_by: 'created_at', sort_order: 'desc' });
    setSearchText('');
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['sort_by', 'sort_order'].includes(k) && v !== undefined && v !== false
  ).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className={`lg:w-64 xl:w-72 shrink-0 ${sidebarOpen ? '' : 'hidden lg:block'}`}>
        <div className="card p-4 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-indigo-900">フィルター / Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-terracotta-500 hover:text-terracotta-600 underline"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Prefecture */}
            <div>
              <label className="label">都道府県 / Prefecture</label>
              <select
                className="input text-sm"
                value={filters.prefecture || ''}
                onChange={e => updateFilter('prefecture', e.target.value)}
              >
                <option value="">All prefectures</option>
                {JAPANESE_PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="label">ステータス / Status</label>
              <select
                className="input text-sm"
                value={filters.status || ''}
                onChange={e => updateFilter('status', e.target.value as PropertyStatus)}
              >
                <option value="">All statuses</option>
                <option value="available">空き (Available)</option>
                <option value="negotiating">交渉中 (Negotiating)</option>
                <option value="reserved">予約済 (Reserved)</option>
                <option value="sold">成約済 (Sold)</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="label">物件種別 / Type</label>
              <select
                className="input text-sm"
                value={filters.property_type || ''}
                onChange={e => updateFilter('property_type', e.target.value as PropertyType)}
              >
                <option value="">All types</option>
                <option value="akiya">🏚️ 空き家 (Akiya)</option>
                <option value="kominka">🏯 古民家 (Kominka)</option>
                <option value="noka">🌾 農家 (Noka)</option>
                <option value="vacant_land">🏞️ 空き地 (Vacant Land)</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="label">状態 / Condition</label>
              <select
                className="input text-sm"
                value={filters.condition || ''}
                onChange={e => updateFilter('condition', e.target.value as PropertyCondition)}
              >
                <option value="">All conditions</option>
                <option value="livable">居住可能 (Livable)</option>
                <option value="renovation_needed">要改修 (Renovation Needed)</option>
                <option value="major_renovation">大規模改修 (Major Renovation)</option>
                <option value="teardown">解体 (Teardown)</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="label">
                上限価格 / Max Price
                {filters.max_price ? ` — ¥${(filters.max_price / 10000).toLocaleString()}万` : ''}
              </label>
              <input
                type="range"
                min={0}
                max={20_000_000}
                step={500_000}
                value={filters.max_price ?? 20_000_000}
                onChange={e => {
                  const val = Number(e.target.value);
                  updateFilter('max_price', val < 20_000_000 ? val : undefined);
                }}
                className="w-full accent-indigo-900"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>¥0</span><span>¥1000万</span><span>¥2000万+</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={!!filters.free_only}
                  onChange={e => updateFilter('free_only', e.target.checked || undefined)}
                  className="accent-terracotta-400 w-4 h-4"
                />
                <span>無料のみ (Free only)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={!!filters.has_subsidy}
                  onChange={e => updateFilter('has_subsidy', e.target.checked || undefined)}
                  className="accent-terracotta-400 w-4 h-4"
                />
                <span>補助金あり (Has subsidy)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={!!filters.has_akiya_bank}
                  onChange={e => updateFilter('has_akiya_bank', e.target.checked || undefined)}
                  className="accent-terracotta-400 w-4 h-4"
                />
                <span>🏦 空き家バンク登録</span>
              </label>
            </div>

            {/* Sort */}
            <div>
              <label className="label">並び順 / Sort By</label>
              <select
                className="input text-sm"
                value={filters.sort_by || 'created_at'}
                onChange={e => updateFilter('sort_by', e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateFilter('sort_order', 'asc')}
                  className={`flex-1 text-xs py-1 rounded border ${filters.sort_order === 'asc' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-paper-300 text-gray-500'}`}
                >
                  ↑ Asc
                </button>
                <button
                  onClick={() => updateFilter('sort_order', 'desc')}
                  className={`flex-1 text-xs py-1 rounded border ${filters.sort_order !== 'asc' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-paper-300 text-gray-500'}`}
                >
                  ↓ Desc
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden btn-secondary text-xs py-1.5"
          >
            {sidebarOpen ? 'Hide Filters' : `Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
          </button>
          <div className="flex-1">
            <input
              type="text"
              placeholder="検索... (Search by title, prefecture, tags...)"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="input text-sm"
            />
          </div>
          <div className="text-sm text-gray-500 shrink-0">
            {loading ? 'Loading...' : `${filteredProperties.length} 件`}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-2 bg-paper-300" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-paper-200 rounded w-3/4" />
                  <div className="h-3 bg-paper-200 rounded w-1/2" />
                  <div className="h-6 bg-paper-200 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">家</div>
            <p className="text-lg">物件が見つかりませんでした</p>
            <p className="text-sm mt-1">No properties found matching your filters</p>
            <button onClick={clearFilters} className="btn-secondary mt-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProperties.map(p => (
              <PropertyCard key={p.id} property={p} onUpdate={loadProperties} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
