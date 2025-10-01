import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Timer, 
  AlertCircle, 
  Archive, 
  Grid3X3,
} from 'lucide-react';

export type FilterType = 'all' | 'active' | 'urgent' | 'overdue' | 'closed';

interface FilterSidebarProps {
  deadlines: any[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterSidebar = ({ 
  deadlines, 
  activeFilter, 
  onFilterChange 
}: FilterSidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to check if a deadline is a "una tantum" subscription
  const isUnaTantumAbbonamento = (deadline: any): boolean => {
    if (deadline.category !== 'abbonamenti') return false;
    
    if (!deadline.description) return false;
    
    const fields = deadline.description.split('|');
    const durata = fields[0] || '';
    
    return !durata; // Se durata è vuota, è una tantum
  };

  // Calculate counts
  const getCounts = () => {
    const all = deadlines.length;

    // Filtra solo i deadline che NON sono abbonamenti una tantum per i conteggi di scadenza
    const deadlinesForExpiry = deadlines.filter(d => !isUnaTantumAbbonamento(d));
    
    const active = deadlinesForExpiry.filter(d => {
        if (d.status !== 'attiva') return false;
        const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 5;
      }).length;
      
      const urgent = deadlinesForExpiry.filter(d => {
        if (d.status !== 'attiva') return false;
        const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 5 && daysUntil >= 0;
      }).length;

    const overdue = deadlinesForExpiry.filter(d => d.status === 'scaduta').length;
    const closed = deadlines.filter(d => d.status === 'completata').length;

    return { all, active, urgent, overdue, closed };
  };

  const counts = getCounts();

  const filters = [
    {
      id: 'all' as FilterType,
      label: 'Tutte',
      icon: Grid3X3,
      count: counts.all,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    {
      id: 'active' as FilterType,
      label: 'Attive',
      icon: CheckCircle2,
      count: counts.active,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    {
      id: 'urgent' as FilterType,
      label: 'In scadenza',
      icon: Timer,
      count: counts.urgent,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
    },
    {
      id: 'overdue' as FilterType,
      label: 'Scadute',
      icon: AlertCircle,
      count: counts.overdue,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30'
    },
    {
      id: 'closed' as FilterType,
      label: 'Archiviate',
      icon: Archive,
      count: counts.closed,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-700',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-900/30'
    }
  ];

  // Mobile: Don't render sidebar, let FilterChips handle mobile filtering
  if (isMobile) {
    return null;
  }

  // Desktop sidebar layout
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-16">
      <div className="
        glass-card backdrop-blur-xl bg-white/10 dark:bg-gray-900/10
        border border-white/20 dark:border-gray-700/30
        rounded-full p-3
        hover:bg-white/15 dark:hover:bg-gray-900/15
        transition-all duration-300
        relative
      ">

        {/* Filter Items - Icon Only */}
        <div className="space-y-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <div key={filter.id} className="relative">               
                <button
                  onClick={() => onFilterChange(filter.id)}
                  className={`
                    w-8 h-8 flex items-center justify-center p-5 rounded-full
                    transition-all duration-300 ease-out
                    backdrop-blur-sm relative
                    ${isActive 
                      ? `${filter.bgColor} ${filter.borderColor} border-2 shadow-lg transform scale-110` 
                      : 'bg-white/5 dark:bg-gray-800/5 border border-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 hover:scale-105'
                    }
                    group
                  `}
                  title={filter.label}
                >
                  <div className="relative">
                    <Icon 
                      size={20} 
                      className={`
                        transition-all duration-300
                        ${isActive ? filter.color : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}
                      `} 
                    />
                    
                    {/* Count badge */}
                    {filter.count > 0 && (
                      <div className={`
                        absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs font-bold
                        transition-all duration-300
                        ${isActive 
                          ? 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200' 
                          : 'bg-gray-200/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        {filter.count}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Liquid glass effect overlay */}
        <div className="
          absolute inset-0 rounded-2xl pointer-events-none
          bg-gradient-to-br from-white/5 via-transparent to-white/5
          opacity-50
        " />
      </div>
    </div>
  );
};

export default FilterSidebar;
