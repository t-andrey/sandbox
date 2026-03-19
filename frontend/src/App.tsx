import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PropertyList } from './components/PropertyList';
import { AddPropertyForm } from './components/AddPropertyForm';
import { MapView } from './components/MapView';
import { WatchList } from './components/WatchList';

type Tab = 'dashboard' | 'listings' | 'map' | 'watchlist' | 'add';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  const tabs: { id: Tab; label: string; jp: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', jp: 'ダッシュボード', icon: '📊' },
    { id: 'listings', label: 'Listings', jp: '物件一覧', icon: '🏚️' },
    { id: 'map', label: 'Map', jp: '地図', icon: '🗾' },
    { id: 'watchlist', label: 'Watch List', jp: 'お気に入り', icon: '⭐' },
    { id: 'add', label: 'Add Property', jp: '物件登録', icon: '＋' },
  ];

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Header */}
      <header className="bg-indigo-900 text-paper-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-3xl">家</span>
              <div>
                <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: 'Noto Serif JP, serif' }}>
                  空き家トラッカー
                </h1>
                <p className="text-xs text-paper-300 leading-tight">Japan Akiya Property Tracker</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-paper-300">
              <span className="bg-indigo-800 px-2 py-1 rounded">限界集落</span>
              <span className="bg-indigo-800 px-2 py-1 rounded">空き家問題</span>
              <span className="bg-indigo-800 px-2 py-1 rounded">移住支援</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-paper-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-terracotta-400 text-terracotta-500'
                    : 'border-transparent text-gray-500 hover:text-indigo-900 hover:border-paper-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.jp}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
        {activeTab === 'listings' && <PropertyList key={refreshKey} />}
        {activeTab === 'map' && <MapView key={refreshKey} onPrefectureClick={(_pref) => { setActiveTab('listings'); }} />}
        {activeTab === 'watchlist' && <WatchList key={refreshKey} />}
        {activeTab === 'add' && (
          <AddPropertyForm
            onSuccess={() => {
              refresh();
              setActiveTab('listings');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-indigo-950 text-paper-300 text-center py-6 mt-12 text-sm">
        <p className="mb-1" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          空き家トラッカー — 日本の限界集落と空き家の記録
        </p>
        <p className="text-xs text-indigo-700">
          Japan Akiya Property Tracker · Data for informational purposes only
        </p>
      </footer>
    </div>
  );
}
