import { useEffect, useState } from 'react';
import { api, watchlist } from '../api';
import type { Property } from '../types';
import { PropertyCard } from './PropertyCard';

export function WatchList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const currentIds = watchlist.get();
      if (currentIds.length === 0) {
        setProperties([]);
        return;
      }
      const all = await api.getProperties();
      setProperties(all.filter(p => currentIds.includes(p.id)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3 animate-pulse">⭐</div>
      <p>Loading watch list...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">{error}</div>
  );

  return (
    <div>
      <div className="border-l-4 border-yellow-400 pl-4 mb-6">
        <h2 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          お気に入り
        </h2>
        <p className="text-gray-500 text-sm mt-1">Your watched akiya properties — Watch List ({properties.length} 件)</p>
      </div>

      {watchlist.get().length === 0 || properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-medium text-gray-500">お気に入りがありません</h3>
          <p className="text-sm mt-2">
            Click the ★ on any property card to add it to your watch list.
            <br />
            <span className="text-xs text-gray-400">Saved locally in your browser.</span>
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{properties.length} properties saved</span>
            <button
              onClick={() => {
                localStorage.removeItem('akiya_watchlist');
                setProperties([]);
              }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onUpdate={loadProperties} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
