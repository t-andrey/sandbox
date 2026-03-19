import { useState } from 'react';
import { api } from '../api';
import type { PropertyCreate, PropertyType, PropertyStatus, PropertyCondition } from '../types';
import { JAPANESE_PREFECTURES } from '../types';

interface Props {
  onSuccess: () => void;
}

const DEFAULT_FORM: PropertyCreate = {
  title_jp: '',
  title_en: '',
  prefecture: '島根県',
  municipality: '',
  village_name: '',
  property_type: 'akiya',
  status: 'available',
  price_jpy: 0,
  land_area_m2: undefined,
  building_area_m2: undefined,
  year_built: undefined,
  condition: 'renovation_needed',
  distance_to_station_km: undefined,
  distance_to_convenience_store_km: undefined,
  has_akiya_bank_listing: false,
  akiya_bank_url: '',
  municipal_subsidy_jpy: 0,
  tags: [],
  description: '',
  notes: '',
  latitude: undefined,
  longitude: undefined,
  population_decline_pct: undefined,
};

const COMMON_TAGS = [
  'mountain_view', 'sea_view', 'rice_fields', 'terraced_rice_fields',
  'river_nearby', 'thatched_roof', 'traditional_irori', 'engawa',
  'kominka', 'gassho_zukuri', 'onsen_nearby', 'ski_resort_nearby',
  'remote', 'depopulated', 'free_property', 'large_land',
  'storehouse', 'sake_brewery', 'commercial_potential', 'off_grid_potential',
  'fishing_village', 'mountain_village', 'snow_country', 'solar_potential',
];

export function AddPropertyForm({ onSuccess }: Props) {
  const [form, setForm] = useState<PropertyCreate>(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof PropertyCreate, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    const t = tag.trim().replace(/\s+/g, '_').toLowerCase();
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    set('tags', form.tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: PropertyCreate = {
        ...form,
        village_name: form.village_name || undefined,
        akiya_bank_url: form.akiya_bank_url || undefined,
        description: form.description || undefined,
        notes: form.notes || undefined,
      };
      await api.createProperty(payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-matcha-500" style={{ fontFamily: 'Noto Serif JP, serif' }}>
            物件を登録しました
          </h2>
          <p className="text-gray-500 mt-2">Property added successfully! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-l-4 border-terracotta-400 pl-4 mb-6">
        <h2 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          物件登録
        </h2>
        <p className="text-gray-500 text-sm mt-1">Add a new akiya / kominka listing</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">物件名（日本語）*</label>
            <input
              required
              className="input"
              value={form.title_jp}
              onChange={e => set('title_jp', e.target.value)}
              placeholder="例：茅葺き屋根の古民家"
            />
          </div>
          <div>
            <label className="label">Property Title (English)*</label>
            <input
              required
              className="input"
              value={form.title_en}
              onChange={e => set('title_en', e.target.value)}
              placeholder="e.g., Thatched Roof Kominka"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">都道府県*</label>
            <select
              required
              className="input"
              value={form.prefecture}
              onChange={e => set('prefecture', e.target.value)}
            >
              {JAPANESE_PREFECTURES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">市区町村*</label>
            <input
              required
              className="input"
              value={form.municipality}
              onChange={e => set('municipality', e.target.value)}
              placeholder="例：奥出雲町"
            />
          </div>
          <div>
            <label className="label">集落名</label>
            <input
              className="input"
              value={form.village_name || ''}
              onChange={e => set('village_name', e.target.value)}
              placeholder="例：仁多"
            />
          </div>
        </div>

        {/* Type, Status, Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">物件種別*</label>
            <select
              className="input"
              value={form.property_type}
              onChange={e => set('property_type', e.target.value as PropertyType)}
            >
              <option value="akiya">🏚️ 空き家 (Akiya)</option>
              <option value="kominka">🏯 古民家 (Kominka)</option>
              <option value="noka">🌾 農家 (Noka)</option>
              <option value="vacant_land">🏞️ 空き地 (Vacant Land)</option>
            </select>
          </div>
          <div>
            <label className="label">ステータス*</label>
            <select
              className="input"
              value={form.status}
              onChange={e => set('status', e.target.value as PropertyStatus)}
            >
              <option value="available">空き (Available)</option>
              <option value="negotiating">交渉中 (Negotiating)</option>
              <option value="reserved">予約済 (Reserved)</option>
              <option value="sold">成約済 (Sold)</option>
            </select>
          </div>
          <div>
            <label className="label">状態*</label>
            <select
              className="input"
              value={form.condition}
              onChange={e => set('condition', e.target.value as PropertyCondition)}
            >
              <option value="livable">居住可能</option>
              <option value="renovation_needed">要改修</option>
              <option value="major_renovation">大規模改修</option>
              <option value="teardown">解体・建替え</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">価格 (円) — 0 = 無料</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.price_jpy}
              onChange={e => set('price_jpy', Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">市区町村補助金 (円)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.municipal_subsidy_jpy}
              onChange={e => set('municipal_subsidy_jpy', Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Areas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">建物面積 (m²)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.building_area_m2 ?? ''}
              onChange={e => set('building_area_m2', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="label">敷地面積 (m²)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.land_area_m2 ?? ''}
              onChange={e => set('land_area_m2', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="label">築年 (西暦)</label>
            <input
              type="number"
              min={1800}
              max={2024}
              className="input"
              value={form.year_built ?? ''}
              onChange={e => set('year_built', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="1950"
            />
          </div>
          <div>
            <label className="label">人口減少率 (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              className="input"
              value={form.population_decline_pct ?? ''}
              onChange={e => set('population_decline_pct', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="35.0"
            />
          </div>
        </div>

        {/* Distance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">最寄り駅まで (km)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className="input"
              value={form.distance_to_station_km ?? ''}
              onChange={e => set('distance_to_station_km', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="label">コンビニまで (km)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className="input"
              value={form.distance_to_convenience_store_km ?? ''}
              onChange={e => set('distance_to_convenience_store_km', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Akiya Bank */}
        <div className="flex items-start gap-4">
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input
              type="checkbox"
              checked={form.has_akiya_bank_listing}
              onChange={e => set('has_akiya_bank_listing', e.target.checked)}
              className="w-4 h-4 accent-indigo-900"
            />
            <span className="text-sm">空き家バンク登録</span>
          </label>
          {form.has_akiya_bank_listing && (
            <div className="flex-1">
              <label className="label">空き家バンク URL</label>
              <input
                type="url"
                className="input text-sm"
                value={form.akiya_bank_url || ''}
                onChange={e => set('akiya_bank_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="label">タグ / Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className={`badge text-xs cursor-pointer transition-colors ${
                  form.tags.includes(tag)
                    ? 'bg-indigo-900 text-white'
                    : 'bg-paper-200 text-gray-600 hover:bg-paper-300'
                }`}
              >
                {tag.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input text-sm flex-1"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
              }}
              placeholder="Custom tag (press Enter)"
            />
            <button type="button" onClick={() => addTag(tagInput)} className="btn-secondary text-xs">
              Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="badge bg-indigo-100 text-indigo-700">
                  {tag.replace(/_/g, ' ')}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-indigo-400 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">物件説明 / Description</label>
          <textarea
            rows={4}
            className="input resize-none"
            value={form.description || ''}
            onChange={e => set('description', e.target.value)}
            placeholder="物件の詳細説明を入力..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="label">備考 / Notes</label>
          <textarea
            rows={2}
            className="input resize-none"
            value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="注意事項など..."
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">緯度 / Latitude</label>
            <input
              type="number"
              step="any"
              className="input text-sm"
              value={form.latitude ?? ''}
              onChange={e => set('latitude', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="35.6762"
            />
          </div>
          <div>
            <label className="label">経度 / Longitude</label>
            <input
              type="number"
              step="any"
              className="input text-sm"
              value={form.longitude ?? ''}
              onChange={e => set('longitude', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="139.6503"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {submitting ? '登録中...' : '物件を登録する / Add Property'}
          </button>
          <button
            type="button"
            onClick={() => setForm(DEFAULT_FORM)}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
