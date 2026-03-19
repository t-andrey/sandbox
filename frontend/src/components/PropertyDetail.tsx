import { useState } from 'react';
import type { Property } from '../types';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS, CONDITION_LABELS } from '../types';
import { watchlist, api } from '../api';

function formatPrice(jpy: number): string {
  if (jpy === 0) return '無料 (Free)';
  if (jpy >= 100_000_000) return `¥${(jpy / 100_000_000).toFixed(1)}億`;
  if (jpy >= 10_000) return `¥${Math.round(jpy / 10_000).toLocaleString()}万`;
  return `¥${jpy.toLocaleString()}`;
}

function formatJPY(n: number): string {
  return `¥${n.toLocaleString()}`;
}

export function PropertyDetail({
  property,
  onClose,
  onUpdate,
}: {
  property: Property;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const [watched, setWatched] = useState(watchlist.has(property.id));
  const [renovationBudget, setRenovationBudget] = useState(1_000_000);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeInfo = PROPERTY_TYPE_LABELS[property.property_type];
  const statusInfo = STATUS_LABELS[property.status];
  const condInfo = CONDITION_LABELS[property.condition];

  const totalCost = property.price_jpy + renovationBudget;
  const netCost = Math.max(0, totalCost - property.municipal_subsidy_jpy);

  const toggleWatch = () => {
    watchlist.toggle(property.id);
    setWatched(watchlist.has(property.id));
    onUpdate?.();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteProperty(property.id);
      onClose();
      onUpdate?.();
    } catch (e) {
      alert('Delete failed: ' + (e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 to-indigo-900 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-white/20 text-white">{typeInfo.icon} {typeInfo.jp}</span>
                <span className={`badge ${
                  statusInfo.color === 'green' ? 'bg-green-500' :
                  statusInfo.color === 'yellow' ? 'bg-yellow-500' :
                  statusInfo.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                } text-white`}>
                  {statusInfo.jp}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: 'Noto Serif JP, serif' }}>
                {property.title_jp}
              </h2>
              <p className="text-paper-300 text-sm mt-1">{property.title_en}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={toggleWatch}
                className={`text-2xl leading-none transition-transform hover:scale-110 ${watched ? 'text-yellow-400' : 'text-white/40 hover:text-yellow-300'}`}
              >
                ★
              </button>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mt-4 text-paper-300 text-sm">
            <span>📍</span>
            <span>{property.prefecture} {property.municipality}</span>
            {property.village_name && <span>· {property.village_name}</span>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Price block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-paper-100 rounded-lg p-4 text-center">
              {property.price_jpy === 0 ? (
                <div className="text-3xl font-bold text-matcha-500">無料</div>
              ) : (
                <div className="text-3xl font-bold text-indigo-900">{formatPrice(property.price_jpy)}</div>
              )}
              <div className="text-xs text-gray-500 mt-1">物件価格 / Purchase Price</div>
            </div>
            <div className="bg-terracotta-400/10 rounded-lg p-4 text-center border border-terracotta-400/20">
              <div className="text-2xl font-bold text-terracotta-500">
                {property.municipal_subsidy_jpy > 0 ? formatPrice(property.municipal_subsidy_jpy) : '−'}
              </div>
              <div className="text-xs text-gray-500 mt-1">市区町村補助金 / Municipal Subsidy</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              {property.building_area_m2 && property.price_jpy > 0 ? (
                <div className="text-2xl font-bold text-indigo-700">
                  {formatPrice(Math.round(property.price_jpy / property.building_area_m2))}
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-400">—</div>
              )}
              <div className="text-xs text-gray-500 mt-1">建物単価 / Price per m²</div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {property.land_area_m2 && (
              <div className="bg-paper-50 rounded p-3 text-center">
                <div className="text-lg font-semibold text-gray-800">{property.land_area_m2}m²</div>
                <div className="text-xs text-gray-500">敷地面積 Land</div>
              </div>
            )}
            {property.building_area_m2 && (
              <div className="bg-paper-50 rounded p-3 text-center">
                <div className="text-lg font-semibold text-gray-800">{property.building_area_m2}m²</div>
                <div className="text-xs text-gray-500">建物面積 Building</div>
              </div>
            )}
            {property.year_built && (
              <div className="bg-paper-50 rounded p-3 text-center">
                <div className="text-lg font-semibold text-gray-800">{property.year_built}年</div>
                <div className="text-xs text-gray-500">築年 ({new Date().getFullYear() - property.year_built}年経過)</div>
              </div>
            )}
            <div className="bg-paper-50 rounded p-3 text-center">
              <div className="text-lg font-semibold text-gray-800">{condInfo.jp}</div>
              <div className="text-xs text-gray-500">状態 Condition</div>
            </div>
          </div>

          {/* Access */}
          {(property.distance_to_station_km || property.distance_to_convenience_store_km) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">アクセス / Access</h4>
              <div className="grid grid-cols-2 gap-3">
                {property.distance_to_station_km && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🚉</span>
                    <span>最寄り駅まで {property.distance_to_station_km}km</span>
                  </div>
                )}
                {property.distance_to_convenience_store_km && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🏪</span>
                    <span>コンビニまで {property.distance_to_convenience_store_km}km</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Depopulation */}
          {property.population_decline_pct !== null && property.population_decline_pct !== undefined && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-800">人口減少率 / Population Decline (20yr)</h4>
                <span className="text-xl font-bold text-red-600">−{property.population_decline_pct.toFixed(1)}%</span>
              </div>
              <div className="bg-red-100 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(property.population_decline_pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-red-600 mt-2">
                {property.population_decline_pct > 70
                  ? '⚠️ 廃村リスク高 — Critical depopulation, village at risk of abandonment'
                  : property.population_decline_pct > 50
                  ? '⚠️ 限界集落 — Marginal village with severe population loss'
                  : '📉 過疎地域 — Depopulated rural area'}
              </p>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">物件説明 / Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-paper-50 rounded p-3">
                {property.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {property.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">備考 / Notes</h4>
              <p className="text-sm text-gray-500 italic bg-yellow-50 border border-yellow-100 rounded p-3">
                {property.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {property.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">タグ / Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {property.tags.map(tag => (
                  <span key={tag} className="badge bg-indigo-100 text-indigo-700">
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Akiya bank link */}
          {property.has_akiya_bank_listing && property.akiya_bank_url && (
            <div className="bg-indigo-50 border border-indigo-100 rounded p-3 flex items-center gap-3">
              <span className="text-xl">🏦</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900">空き家バンク登録物件</p>
                <p className="text-xs text-gray-500">Listed on official Akiya Bank</p>
              </div>
              <a
                href={property.akiya_bank_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs bg-indigo-900 text-white px-3 py-1.5 rounded hover:bg-indigo-800 transition-colors"
              >
                View →
              </a>
            </div>
          )}

          {/* Investment Calculator */}
          <div className="border border-paper-300 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              💰 投資計算機 / Investment Calculator
            </h4>
            <div className="mb-3">
              <label className="label text-xs">
                リノベーション予算 / Renovation Budget: {formatJPY(renovationBudget)}
              </label>
              <input
                type="range"
                min={0}
                max={10_000_000}
                step={100_000}
                value={renovationBudget}
                onChange={e => setRenovationBudget(Number(e.target.value))}
                className="w-full accent-terracotta-400"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>¥0</span><span>¥500万</span><span>¥1,000万</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-paper-50 rounded p-2 text-center">
                <div className="font-semibold text-gray-700">{formatPrice(property.price_jpy)}</div>
                <div className="text-xs text-gray-400">物件価格</div>
              </div>
              <div className="bg-paper-50 rounded p-2 text-center">
                <div className="font-semibold text-indigo-700">+{formatPrice(renovationBudget)}</div>
                <div className="text-xs text-gray-400">改修費用</div>
              </div>
              <div className="bg-paper-50 rounded p-2 text-center">
                <div className="font-semibold text-red-600">−{formatPrice(property.municipal_subsidy_jpy)}</div>
                <div className="text-xs text-gray-400">補助金</div>
              </div>
            </div>
            <div className="mt-3 bg-indigo-950 text-white rounded p-3 text-center">
              <div className="text-xs text-paper-300 mb-1">概算合計費用 / Estimated Net Cost</div>
              <div className="text-2xl font-bold">{formatPrice(netCost)}</div>
            </div>
          </div>

          {/* Delete */}
          <div className="border-t border-paper-200 pt-4">
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Delete this listing
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">本当に削除しますか？</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger text-xs py-1"
                >
                  {deleting ? '...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
