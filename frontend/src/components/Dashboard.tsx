import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Stats, PrefectureInfo } from '../types';

function formatPrice(jpy: number): string {
  if (jpy === 0) return '無料 (Free)';
  if (jpy >= 100_000_000) return `¥${(jpy / 100_000_000).toFixed(1)}億`;
  if (jpy >= 10_000) return `¥${Math.round(jpy / 10_000).toLocaleString()}万`;
  return `¥${jpy.toLocaleString()}`;
}

function StatCard({
  value,
  label,
  labelJp,
  sub,
  color = 'indigo',
  icon,
}: {
  value: string | number;
  label: string;
  labelJp: string;
  sub?: string;
  color?: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-900 to-indigo-800',
    terracotta: 'from-terracotta-500 to-terracotta-400',
    matcha: 'from-matcha-600 to-matcha-400',
    gold: 'from-gold-500 to-gold-400',
    gray: 'from-gray-600 to-gray-500',
  };

  return (
    <div className={`card overflow-hidden`}>
      <div className={`bg-gradient-to-br ${colors[color] || colors.indigo} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-90 mt-1">{label}</p>
            <p className="text-xs opacity-70">{labelJp}</p>
          </div>
          <span className="text-3xl opacity-80">{icon}</span>
        </div>
        {sub && <p className="text-xs mt-2 opacity-70">{sub}</p>}
      </div>
    </div>
  );
}


export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [prefectures, setPrefectures] = useState<PrefectureInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStats(), api.getPrefectures()])
      .then(([s, p]) => {
        setStats(s);
        setPrefectures(p);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">家</div>
        <p className="text-gray-500">Loading akiya data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <p className="font-medium">API Connection Error</p>
      <p className="text-sm mt-1">{error}</p>
      <p className="text-sm mt-2 text-red-500">Make sure the backend is running: <code className="bg-red-100 px-1 rounded">uvicorn main:app --reload</code></p>
    </div>
  );

  if (!stats) return null;

  const typeIcons: Record<string, string> = {
    akiya: '🏚️',
    kominka: '🏯',
    noka: '🌾',
    vacant_land: '🏞️',
  };

  const typeLabels: Record<string, string> = {
    akiya: '空き家',
    kominka: '古民家',
    noka: '農家',
    vacant_land: '空き地',
  };

  const conditionLabels: Record<string, string> = {
    livable: '居住可能',
    renovation_needed: '要改修',
    major_renovation: '大規模改修',
    teardown: '解体',
  };

  const conditionColors: Record<string, string> = {
    livable: 'bg-green-100 text-green-800',
    renovation_needed: 'bg-yellow-100 text-yellow-800',
    major_renovation: 'bg-orange-100 text-orange-800',
    teardown: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-l-4 border-terracotta-400 pl-4">
        <h2 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          ダッシュボード
        </h2>
        <p className="text-gray-500 text-sm mt-1">Overview of Japan's akiya listings — 空き家市場の概況</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          value={stats.total}
          label="Total Listings"
          labelJp="総物件数"
          icon="🏘️"
          color="indigo"
        />
        <StatCard
          value={stats.available}
          label="Available"
          labelJp="利用可能"
          icon="✅"
          color="matcha"
        />
        <StatCard
          value={stats.free_properties}
          label="Free Properties"
          labelJp="無料物件"
          sub="¥0 — 無料"
          icon="🎁"
          color="terracotta"
        />
        <StatCard
          value={stats.negotiating}
          label="Negotiating"
          labelJp="交渉中"
          icon="🤝"
          color="gold"
        />
        <StatCard
          value={formatPrice(Math.round(stats.avg_price_jpy))}
          label="Avg. Price"
          labelJp="平均価格"
          icon="💴"
          color="gray"
        />
        <StatCard
          value={formatPrice(Math.round(stats.avg_subsidy_jpy))}
          label="Avg. Subsidy"
          labelJp="平均補助金"
          icon="🏛️"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Prefecture */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span>🗾</span> Listings by Prefecture — 都道府県別
          </h3>
          <div className="space-y-3">
            {prefectures.map(pref => {
              const pct = stats.total > 0 ? (pref.count / stats.total) * 100 : 0;
              return (
                <div key={pref.prefecture}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{pref.prefecture}</span>
                      <span className="badge bg-paper-200 text-gray-600">{pref.count}</span>
                      <span className="text-xs text-matcha-500">{pref.available_count} available</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {pref.avg_price_jpy > 0 ? `avg ${formatPrice(Math.round(pref.avg_price_jpy))}` : 'avg 無料'}
                    </span>
                  </div>
                  <div className="bg-paper-200 rounded-full h-2">
                    <div
                      className="bg-indigo-900 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* By Type */}
          <div className="card p-5">
            <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <span>🏷️</span> Property Types — 物件種別
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[type] || '🏠'}</span>
                    <span className="text-sm text-gray-700">{typeLabels[type] || type}</span>
                  </div>
                  <span className="badge bg-indigo-100 text-indigo-800">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Condition */}
          <div className="card p-5">
            <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <span>🔧</span> Condition — 物件状態
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.by_condition).map(([cond, count]) => (
                <div key={cond} className="flex items-center justify-between">
                  <span className={`badge ${conditionColors[cond] || 'bg-gray-100 text-gray-800'}`}>
                    {conditionLabels[cond] || cond}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card p-5 bg-indigo-950 text-paper-200">
        <div className="flex gap-4 items-start">
          <span className="text-4xl">限</span>
          <div>
            <h3 className="font-semibold text-paper-100 mb-1" style={{ fontFamily: 'Noto Serif JP, serif' }}>
              限界集落について — About Depopulated Villages
            </h3>
            <p className="text-sm text-paper-300 leading-relaxed">
              Japan has over <strong className="text-paper-100">8 million</strong> abandoned properties (空き家),
              with the number growing annually as rural depopulation accelerates.
              Municipalities in prefectures like Shimane, Kochi, and Akita offer generous subsidies
              (補助金) — sometimes up to ¥3,000,000 — to attract new residents (移住者) to revitalize
              their communities. Many properties are available for free (無料譲渡) to committed renovators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
