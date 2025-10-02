import type { DeadlineFilters, Deadline } from '../types';
import { CATEGORIES } from '../types';
import { type FilterType } from './FilterSidebar';

interface FilterChipsProps {
  filters: DeadlineFilters;
  setFilters: (filters: DeadlineFilters) => void;
  deadlines: Deadline[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterChips = ({ filters, setFilters, deadlines, activeFilter, onFilterChange }: FilterChipsProps) => {
  // Get counts for sidebar filters
  const getSidebarCounts = () => {
    const all = deadlines.length;
    const active = deadlines.filter(d => {
      if (d.status !== 'attiva') return false;
      const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil > 5;
    }).length;
    const urgent = deadlines.filter(d => {
      if (d.status !== 'attiva') return false;
      const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 5 && daysUntil >= 0;
    }).length;
    const overdue = deadlines.filter(d => d.status === 'scaduta').length;
    const closed = deadlines.filter(d => d.status === 'completata').length;

    return { all, active, urgent, overdue, closed };
  };

  const counts = getSidebarCounts();

  // Main status filters (most important)
  const statusFilters = [
    { 
      key: 'all' as FilterType, 
      label: 'Tutte', 
      icon: '📋', 
      count: counts.all,
      isActive: activeFilter === 'all',
      onClick: () => onFilterChange('all')
    },
    { 
      key: 'active' as FilterType, 
      label: 'Attive', 
      icon: '✅', 
      count: counts.active,
      isActive: activeFilter === 'active',
      onClick: () => onFilterChange('active')
    },
    { 
      key: 'urgent' as FilterType, 
      label: 'Urgenti', 
      icon: '⏰', 
      count: counts.urgent,
      isActive: activeFilter === 'urgent',
      onClick: () => onFilterChange('urgent')
    },
    { 
      key: 'overdue' as FilterType, 
      label: 'Scadute', 
      icon: '⚠️', 
      count: counts.overdue,
      isActive: activeFilter === 'overdue',
      onClick: () => onFilterChange('overdue')
    },
    { 
      key: 'closed' as FilterType, 
      label: 'Archiviate', 
      icon: '📁', 
      count: counts.closed,
      isActive: activeFilter === 'closed',
      onClick: () => onFilterChange('closed')
    },
  ];

  // Category filters (secondary) - Mostriamo tutte le categorie
  const categoryFilters = CATEGORIES.map(category => {
    const count = deadlines.filter(d => d.category === category.value).length;
    return {
      key: category.value,
      label: category.label,
      icon: category.icon,
      count,
      isActive: filters.category === category.value,
      onClick: () => setFilters({ ...filters, category: category.value, priority: 'all' })
    };
  });

  const allChips = [...statusFilters, ...categoryFilters];

  return (
    <div className="block md:hidden px-4 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent pb-1">
        {allChips.map(chip => (
          <button
            key={chip.key}
            onClick={chip.onClick}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 min-w-fit
              ${chip.isActive 
                ? 'bg-primary-500 dark:bg-accent-500 text-white shadow-primary-500/30 dark:shadow-accent-500/30' 
                : 'glass hover:bg-white/80 dark:hover:bg-white/10 text-blue-900 dark:text-white'
              }
            `}
          >
            <span className="text-base leading-none">{chip.icon}</span>
            <span>{chip.label}</span>
            {chip.count > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-bold
                ${chip.isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-primary-100 dark:bg-accent-800 text-primary-700 dark:text-accent-200'
                }
              `}>
                {chip.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;