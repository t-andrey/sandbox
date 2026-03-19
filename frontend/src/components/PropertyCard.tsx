import { useState } from 'react';
import type { Property } from '../types';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS, CONDITION_LABELS } from '../types';
import { watchlist } from '../api';
import { PropertyDetail } from './PropertyDetail';

function formatPrice(jpy: number): string {
  if (jpy === 0) return '無料';
  if (jpy >= 100_000_000) return `¥${(jpy / 100_000_000).toFixed(1)}億`;
  if (jpy >= 10_000) return `¥${Math.round(jpy / 10_000).toLocaleString()}万`;
  return `¥${jpy.toLocaleString()}`;
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const info = STATUS_LABELS[status];
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-800 border border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    gray: 'bg-gray-100 text-gray-600 border border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
  };
  return (
    <span className={`badge ${colors[info.color]} font-medium`}>
      {info.jp}
    </span>
  );
}

function ConditionDots({ condition }: { condition: Property['condition'] }) {
  const info = CONDITION_LABELS[condition];
  return (
    <div className="flex items-center gap-1" title={`${info.jp} (${info.en})`}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= info.severity
              ? i <= 1 ? 'bg-green-500' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-orange-400' : 'bg-red-500'
              : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{info.jp}</span>
    </div>
  );
}

export function PropertyCard({ property, onUpdate }: { property: Property; onUpdate?: () => void }) {
  const [watched, setWatched] = useState(watchlist.has(property.id));
  const [showDetail, setShowDetail] = useState(false);

  const typeInfo = PROPERTY_TYPE_LABELS[property.property_type];
  const pricePerM2 = property.building_area_m2 && property.price_jpy > 0
    ? Math.round(property.price_jpy / property.building_area_m2)
    : null;

  const toggleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    watchlist.toggle(property.id);
    setWatched(watchlist.has(property.id));
    onUpdate?.();
  };

  const ageDays = Math.floor(
    (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <div
        className="card cursor-pointer hover:shadow-md transition-shadow group"
        onClick={() => setShowDetail(true)}
      >
        {/* Header stripe */}
        <div className="h-2 bg-gradient-to-r from-indigo-900 to-terracotta-400" />

        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="badge bg-indigo-100 text-indigo-800 text-xs">
                {typeInfo.icon} {typeInfo.jp}
              </span>
              <StatusBadge status={property.status} />
              {property.price_jpy === 0 && (
                <span className="badge bg-terracotta-400 text-white text-xs font-bold">無料</span>
              )}
            </div>
            <button
              onClick={toggleWatch}
              className={`text-xl leading-none transition-transform hover:scale-110 ${watched ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
              title={watched ? 'Remove from watch list' : 'Add to watch list'}
            >
              ★
            </button>
          </div>

          {/* Title */}
          <h3 className="font-bold text-indigo-900 text-sm leading-snug mb-0.5 group-hover:text-terracotta-500 transition-colors"
            style={{ fontFamily: 'Noto Serif JP, serif' }}>
            {property.title_jp}
          </h3>
          <p className="text-xs text-gray-400 mb-3">{property.title_en}</p>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <span>📍</span>
            <span>{property.prefecture} / {property.municipality}</span>
            {property.village_name && <span className="text-gray-400">· {property.village_name}</span>}
          </div>

          {/* Price */}
          <div className="mb-3">
            {property.price_jpy === 0 ? (
              <span className="text-2xl font-bold text-matcha-500">無料 <span className="text-sm font-normal text-matcha-400">(Free)</span></span>
            ) : (
              <div>
                <span className="text-2xl font-bold text-indigo-900">{formatPrice(property.price_jpy)}</span>
                {pricePerM2 && (
                  <span className="text-xs text-gray-400 ml-2">({formatPrice(pricePerM2)}/m²)</span>
                )}
              </div>
            )}
            {property.municipal_subsidy_jpy > 0 && (
              <div className="text-xs text-terracotta-500 mt-0.5">
                🏛️ 補助金 {formatPrice(property.municipal_subsidy_jpy)} available
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
            {property.building_area_m2 && (
              <div className="flex items-center gap-1">
                <span>🏠</span> {property.building_area_m2}m²
              </div>
            )}
            {property.land_area_m2 && (
              <div className="flex items-center gap-1">
                <span>🌳</span> {property.land_area_m2}m²
              </div>
            )}
            {property.year_built && (
              <div className="flex items-center gap-1">
                <span>📅</span> {property.year_built}年
                <span className="text-gray-400">({new Date().getFullYear() - property.year_built}y)</span>
              </div>
            )}
            {property.distance_to_station_km && (
              <div className="flex items-center gap-1">
                <span>🚉</span> {property.distance_to_station_km}km
              </div>
            )}
          </div>

          {/* Condition */}
          <div className="mb-3">
            <ConditionDots condition={property.condition} />
          </div>

          {/* Depopulation */}
          {property.population_decline_pct !== null && property.population_decline_pct !== undefined && (
            <div className="mb-3 bg-paper-100 rounded p-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">人口減少率 Population Decline</span>
                <span className={`font-bold ${property.population_decline_pct > 60 ? 'text-red-600' : property.population_decline_pct > 40 ? 'text-orange-500' : 'text-yellow-600'}`}>
                  −{property.population_decline_pct.toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${property.population_decline_pct > 60 ? 'bg-red-500' : property.population_decline_pct > 40 ? 'bg-orange-400' : 'bg-yellow-400'}`}
                  style={{ width: `${Math.min(property.population_decline_pct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {property.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.tags.slice(0, 3).map(tag => (
                <span key={tag} className="badge bg-paper-200 text-gray-600 text-xs">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
              {property.tags.length > 3 && (
                <span className="badge bg-paper-200 text-gray-400 text-xs">+{property.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-paper-50 border-t border-paper-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.has_akiya_bank_listing && (
              <span className="text-xs text-indigo-600 flex items-center gap-0.5">
                🏦 空き家バンク
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {ageDays === 0 ? 'Today' : `${ageDays}d ago`}
          </span>
        </div>
      </div>

      {showDetail && (
        <PropertyDetail
          property={property}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
