import { Grid3X3, List } from 'lucide-react';
import type { ViewMode } from '../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 md:hidden">
      {/* Nascondi completamente su mobile, mostra solo su desktop */}
      <div className="hidden md:flex">
        <div className="flex bg-blue-100/50 dark:bg-yellow-800/50 rounded-full p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-yellow-700' : 'hover:bg-white/50 dark:hover:bg-yellow-700/50'}`}
          >
            <Grid3X3 size={16} className="text-blue-900 dark:text-white" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-yellow-700' : 'hover:bg-white/50 dark:hover:bg-yellow-700/50'}`}
          >
            <List size={16} className="text-blue-900 dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewToggle;