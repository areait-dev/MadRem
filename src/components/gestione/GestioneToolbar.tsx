import { Search, SortAsc, SortDesc, List, LayoutGrid, Filter, ChevronDown as ChevronDownIcon } from 'lucide-react';
import type { ArubaPanel } from '../../types';
import type { TabType } from './helpers';
import type { SortBy, SortOrder, ViewMode } from './types';

interface GestioneToolbarProps {
  activeTab: TabType;
  panels: ArubaPanel[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (updater: (prev: SortOrder) => SortOrder) => void;
  selectedPanel: string;
  setSelectedPanel: (value: string) => void;
}

export default function GestioneToolbar({
  activeTab, panels, searchQuery, setSearchQuery, viewMode, setViewMode,
  sortBy, setSortBy, sortOrder, setSortOrder, selectedPanel, setSelectedPanel,
}: GestioneToolbarProps) {
  return (
    <div className="bg-surface p-2 sm:p-3 rounded-card border border-divider flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Left Column: Search Bar */}
      <div className="relative w-full md:flex-1 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-link transition-colors" size={18} />
        <input
          type="text"
          placeholder={`Cerca tra ${activeTab === 'panels' ? 'i pannelli' : activeTab === 'domains' ? 'i domini' : activeTab === 'databases' ? 'i database' : activeTab === 'pec' ? 'le PEC' : 'gli abbonamenti'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-transparent border-transparent rounded-full text-xs sm:text-sm leading-4 sm:leading-5 font-semibold uppercase tracking-wider outline-hidden transition-all placeholder:text-muted"
        />
      </div>

      {/* Right Column: Contextual Controls (View Mode, Sorting, Panel Filter) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
        {/* View Mode Toggle - ONLY DOMAINS */}
        {activeTab === 'domains' && (
          <div className="flex p-1 bg-surface rounded-full shrink-0 h-10 items-center">
            <button
              onClick={() => setViewMode('extended')}
              className={`h-full aspect-square flex items-center justify-center rounded-full transition-all ${viewMode === 'extended' ? 'bg-surface text-link' : 'text-muted'
                }`}
              title="Vista Estesa"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`h-full aspect-square flex items-center justify-center rounded-full transition-all ${viewMode === 'compact' ? 'bg-surface text-link' : 'text-muted'
                }`}
              title="Vista Compatta"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        )}

        {/* Contextual Sorting */}
        <div className="flex p-1 bg-surface rounded-full overflow-hidden shrink-0 h-10 items-center">
          <button
            onClick={() => setSortBy('name')}
            className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'name' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
              }`}
          >
            Nome
          </button>
          {activeTab !== 'panels' && (
            <>
              <button
                onClick={() => setSortBy('expiry')}
                className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'expiry' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
                  }`}
              >
                Data
              </button>
              <button
                onClick={() => setSortBy('status')}
                className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'status' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
                  }`}
              >
                Stato
              </button>
            </>
          )}
          <div className="w-px h-3 bg-line/20 self-center mx-1" />
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="h-full flex items-center justify-center px-2.5 text-muted hover:text-link transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

        {/* Panel Filter - Contextual */}
        {activeTab !== 'panels' && activeTab !== 'pec' && activeTab !== 'subscriptions' && (
          <div className="relative group min-w-0 max-w-full sm:max-w-[240px] h-10">
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              className="appearance-none w-full max-w-full text-ellipsis bg-surface text-muted text-xs leading-4 font-semibold uppercase tracking-wider pl-8 pr-8 rounded-full outline-hidden border-none cursor-pointer hover:bg-line/20 transition-all min-w-[110px] h-full leading-none"
            >
              <option value="all">Tutti</option>
              {panels.map(p => (
                <option key={p.id} value={p.id}>{p.title || p.email}</option>
              ))}
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <ChevronDownIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}
