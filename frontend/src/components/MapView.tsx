import { useEffect, useState } from 'react';
import { api } from '../api';
import type { PrefectureInfo } from '../types';

interface Props {
  onPrefectureClick?: (prefecture: string) => void;
}

// Prefecture data: positions on a simplified Japan grid map
// Using a grid-based layout to represent Japan's geography
const PREFECTURE_GRID: {
  name: string;
  jp: string;
  col: number;
  row: number;
  shape?: 'wide' | 'tall' | 'normal';
}[] = [
  // Hokkaido
  { name: 'Hokkaido', jp: '北海道', col: 9, row: 0, shape: 'wide' },
  // Tohoku
  { name: 'Aomori', jp: '青森県', col: 9, row: 2 },
  { name: 'Iwate', jp: '岩手県', col: 9, row: 3 },
  { name: 'Miyagi', jp: '宮城県', col: 8, row: 3 },
  { name: 'Akita', jp: '秋田県', col: 8, row: 2 },
  { name: 'Yamagata', jp: '山形県', col: 8, row: 4 },
  { name: 'Fukushima', jp: '福島県', col: 8, row: 5 },
  // Kanto
  { name: 'Ibaraki', jp: '茨城県', col: 8, row: 6 },
  { name: 'Tochigi', jp: '栃木県', col: 7, row: 5 },
  { name: 'Gunma', jp: '群馬県', col: 6, row: 5 },
  { name: 'Saitama', jp: '埼玉県', col: 7, row: 6 },
  { name: 'Chiba', jp: '千葉県', col: 8, row: 7 },
  { name: 'Tokyo', jp: '東京都', col: 7, row: 7 },
  { name: 'Kanagawa', jp: '神奈川県', col: 7, row: 8 },
  // Chubu
  { name: 'Niigata', jp: '新潟県', col: 6, row: 4 },
  { name: 'Toyama', jp: '富山県', col: 5, row: 5 },
  { name: 'Ishikawa', jp: '石川県', col: 4, row: 5 },
  { name: 'Fukui', jp: '福井県', col: 4, row: 6 },
  { name: 'Yamanashi', jp: '山梨県', col: 6, row: 6 },
  { name: 'Nagano', jp: '長野県', col: 6, row: 6 }, // overlap handled
  { name: 'Gifu', jp: '岐阜県', col: 5, row: 6 },
  { name: 'Shizuoka', jp: '静岡県', col: 6, row: 7 },
  { name: 'Aichi', jp: '愛知県', col: 5, row: 7 },
  // Kinki
  { name: 'Mie', jp: '三重県', col: 5, row: 8 },
  { name: 'Shiga', jp: '滋賀県', col: 4, row: 7 },
  { name: 'Kyoto', jp: '京都府', col: 4, row: 7 },
  { name: 'Osaka', jp: '大阪府', col: 4, row: 8 },
  { name: 'Hyogo', jp: '兵庫県', col: 3, row: 8 },
  { name: 'Nara', jp: '奈良県', col: 4, row: 8 },
  { name: 'Wakayama', jp: '和歌山県', col: 4, row: 9 },
  // Chugoku
  { name: 'Tottori', jp: '鳥取県', col: 3, row: 7 },
  { name: 'Shimane', jp: '島根県', col: 2, row: 7 },
  { name: 'Okayama', jp: '岡山県', col: 3, row: 8 },
  { name: 'Hiroshima', jp: '広島県', col: 2, row: 8 },
  { name: 'Yamaguchi', jp: '山口県', col: 1, row: 8 },
  // Shikoku
  { name: 'Tokushima', jp: '徳島県', col: 3, row: 9 },
  { name: 'Kagawa', jp: '香川県', col: 3, row: 9 },
  { name: 'Ehime', jp: '愛媛県', col: 2, row: 9 },
  { name: 'Kochi', jp: '高知県', col: 3, row: 10 },
  // Kyushu
  { name: 'Fukuoka', jp: '福岡県', col: 1, row: 9 },
  { name: 'Saga', jp: '佐賀県', col: 0, row: 9 },
  { name: 'Nagasaki', jp: '長崎県', col: 0, row: 10 },
  { name: 'Kumamoto', jp: '熊本県', col: 1, row: 10 },
  { name: 'Oita', jp: '大分県', col: 2, row: 10 },
  { name: 'Miyazaki', jp: '宮崎県', col: 2, row: 11 },
  { name: 'Kagoshima', jp: '鹿児島県', col: 1, row: 11 },
  { name: 'Okinawa', jp: '沖縄県', col: 0, row: 13 },
];

function getColor(count: number, maxCount: number): string {
  if (count === 0) return '#e5e7eb'; // gray-200
  const intensity = count / maxCount;
  if (intensity > 0.7) return '#1a1a6e'; // indigo-900
  if (intensity > 0.4) return '#2525a0'; // indigo-700
  if (intensity > 0.2) return '#C97D4E'; // terracotta
  return '#dfa07a'; // terracotta-light
}

export function MapView({ onPrefectureClick }: Props) {
  const [prefectures, setPrefectures] = useState<PrefectureInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPref, setHoveredPref] = useState<string | null>(null);
  const [selectedPref, setSelectedPref] = useState<PrefectureInfo | null>(null);

  useEffect(() => {
    api.getPrefectures()
      .then(setPrefectures)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-20 text-gray-400 animate-pulse">
      <div className="text-5xl mb-3">🗾</div>
      <p>Loading map data...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">{error}</div>
  );

  const prefMap: Record<string, PrefectureInfo> = {};
  prefectures.forEach(p => { prefMap[p.prefecture] = p; });

  const maxCount = Math.max(...prefectures.map(p => p.count), 1);

  const CELL = 52;
  const PAD = 8;
  const COLS = 11;
  const ROWS = 14;
  const WIDTH = COLS * CELL + PAD * 2;
  const HEIGHT = ROWS * CELL + PAD * 2;

  // Deduplicate by (col, row) — combine overlapping entries
  const gridMap: Record<string, typeof PREFECTURE_GRID[0] & { count: number; info?: PrefectureInfo }> = {};
  PREFECTURE_GRID.forEach(pref => {
    const key = `${pref.col},${pref.row}`;
    const info = prefMap[pref.jp];
    const count = info?.count || 0;
    if (!gridMap[key]) {
      gridMap[key] = { ...pref, count, info };
    } else {
      // Merge: keep higher count
      if (count > gridMap[key].count) {
        gridMap[key] = { ...pref, count, info };
      }
    }
  });

  // Build unique prefectures list for the grid
  const gridItems = Object.values(gridMap);

  function formatPrice(jpy: number): string {
    if (jpy === 0) return '—';
    if (jpy >= 10_000) return `¥${Math.round(jpy / 10_000).toLocaleString()}万`;
    return `¥${jpy.toLocaleString()}`;
  }

  return (
    <div>
      <div className="border-l-4 border-terracotta-400 pl-4 mb-6">
        <h2 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          地図 / Prefecture Map
        </h2>
        <p className="text-gray-500 text-sm mt-1">Akiya listings by prefecture — hover to view details, click to filter</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 card p-4">
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full max-w-2xl mx-auto"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {/* Background */}
              <rect width={WIDTH} height={HEIGHT} fill="#F5F0E8" rx="8" />

              {/* Grid cells */}
              {gridItems.map((item) => {
                const x = PAD + item.col * CELL;
                const y = PAD + item.row * CELL;
                const w = CELL - 3;
                const h = CELL - 3;
                const fill = getColor(item.count, maxCount);
                const isHovered = hoveredPref === item.jp;
                const isSelected = selectedPref?.prefecture === item.jp;

                return (
                  <g
                    key={`${item.col}-${item.row}`}
                    className="prefecture-path"
                    onClick={() => {
                      if (item.count > 0 && item.info) {
                        setSelectedPref(item.info);
                        onPrefectureClick?.(item.jp);
                      }
                    }}
                    onMouseEnter={() => setHoveredPref(item.jp)}
                    onMouseLeave={() => setHoveredPref(null)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={fill}
                      rx="4"
                      opacity={isHovered ? 0.85 : 1}
                      stroke={isSelected ? '#C97D4E' : isHovered ? '#1a1a6e' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    {/* Prefecture name */}
                    <text
                      x={x + w / 2}
                      y={y + h / 2 - (item.count > 0 ? 5 : 0)}
                      textAnchor="middle"
                      fontSize={item.jp.length > 3 ? 7 : 8}
                      fill={item.count > 0 ? (item.count / maxCount > 0.3 ? 'white' : '#1a1a6e') : '#9ca3af'}
                      fontWeight="600"
                    >
                      {item.jp.replace('県', '').replace('府', '').replace('都', '').replace('道', '')}
                    </text>
                    {/* Count badge */}
                    {item.count > 0 && (
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 8}
                        textAnchor="middle"
                        fontSize={9}
                        fill={item.count / maxCount > 0.3 ? 'rgba(255,255,255,0.9)' : '#374151'}
                        fontWeight="bold"
                      >
                        {item.count}件
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend */}
              <g transform={`translate(${PAD}, ${HEIGHT - 28})`}>
                <text fontSize={8} fill="#6b7280" y={8}>件数:</text>
                {[0, 1, 2, 3].map((level, i) => {
                  const colors = ['#e5e7eb', '#dfa07a', '#C97D4E', '#1a1a6e'];
                  const labels = ['0', '1-2', '2-3', '3+'];
                  return (
                    <g key={level} transform={`translate(${30 + i * 38}, 0)`}>
                      <rect width={14} height={14} fill={colors[i]} rx={2} y={0} />
                      <text fontSize={7} fill="#6b7280" x={17} y={10}>{labels[i]}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {/* Selected prefecture */}
          {selectedPref ? (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-indigo-900 text-lg" style={{ fontFamily: 'Noto Serif JP, serif' }}>
                  {selectedPref.prefecture}
                </h3>
                <button
                  onClick={() => setSelectedPref(null)}
                  className="text-gray-400 hover:text-gray-600"
                >×</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-100 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-900">{selectedPref.count}</div>
                  <div className="text-xs text-gray-500">総物件数</div>
                </div>
                <div className="bg-paper-100 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-matcha-500">{selectedPref.available_count}</div>
                  <div className="text-xs text-gray-500">利用可能</div>
                </div>
              </div>
              {selectedPref.avg_price_jpy > 0 && (
                <div className="mt-3 bg-indigo-50 rounded p-3 text-center">
                  <div className="text-lg font-bold text-indigo-800">{formatPrice(selectedPref.avg_price_jpy)}</div>
                  <div className="text-xs text-gray-500">平均価格 avg price</div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-4 text-center text-gray-400">
              <div className="text-3xl mb-2">🗾</div>
              <p className="text-sm">Click a prefecture to see details</p>
            </div>
          )}

          {/* Prefecture rankings */}
          <div className="card p-4">
            <h3 className="font-semibold text-indigo-900 mb-3 text-sm">都道府県ランキング</h3>
            <div className="space-y-2">
              {prefectures.slice(0, 8).map((pref, i) => (
                <div
                  key={pref.prefecture}
                  className="flex items-center gap-2 cursor-pointer hover:bg-paper-100 rounded px-1 py-0.5 transition-colors"
                  onClick={() => { setSelectedPref(pref); onPrefectureClick?.(pref.prefecture); }}
                >
                  <span className={`text-xs font-bold w-5 ${i < 3 ? 'text-terracotta-400' : 'text-gray-400'}`}>
                    {i + 1}.
                  </span>
                  <span className="text-sm flex-1 text-gray-700">{pref.prefecture}</span>
                  <span className="badge bg-indigo-100 text-indigo-800 text-xs">{pref.count}件</span>
                </div>
              ))}
            </div>
          </div>

          {/* Depopulation note */}
          <div className="card p-4 bg-indigo-950 text-paper-200">
            <h4 className="text-xs font-semibold text-paper-100 mb-2">🔴 最高危険度の県</h4>
            <p className="text-xs leading-relaxed">
              Shimane (島根), Kochi (高知), and Akita (秋田) have the highest rates of depopulation
              (過疎化) in Japan, with some villages losing 60-80% of their population over 20 years.
              These areas offer the most generous akiya subsidies (補助金).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
