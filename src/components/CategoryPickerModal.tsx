import { CATEGORIES } from '../types';
import type { DeadlineCategory } from '../types';

interface Props {
  onSelect: (category: DeadlineCategory) => void;
  onClose: () => void;
}

const CategoryPickerModal = ({ onSelect, onClose }: Props) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className="glass-modal rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto animate-scale-in shadow-lg flex flex-col items-center p-6">
      <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-white">Scegli una categoria</h2>
      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`flex flex-col items-center justify-center p-4 rounded-xl shadow transition ${cat.color} text-white hover:scale-110`}
            onClick={() => onSelect(cat.value)}
            aria-label={cat.label}
          >
            <span className="text-3xl mb-2">{cat.icon}</span>
            <span className="text-xs">{cat.label}</span>
          </button>
        ))}
      </div>
      <button
        className="mt-6 text-blue-600 dark:text-yellow-300 underline text-sm"
        onClick={onClose}
      >
        Annulla
      </button>
    </div>
  </div>
);

export default CategoryPickerModal;
