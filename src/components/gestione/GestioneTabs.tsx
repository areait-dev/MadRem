import type { TabType } from './helpers';
import type { TabDef } from './types';

interface GestioneTabsProps {
  tabs: TabDef[];
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function GestioneTabs({ tabs, activeTab, onChange }: GestioneTabsProps) {
  return (
    <div className="bg-surface p-2 sm:p-2.5 rounded-card border border-divider">
      <div className="flex p-1 bg-surface rounded-full w-full justify-between items-center overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 xl:px-6 py-2.5 rounded-full text-xs sm:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-surface text-link'
              : 'text-muted hover:text-muted'
              }`}
          >
            <tab.icon size={16} className="shrink-0" />
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-lg bg-line/20 text-xs sm:text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
