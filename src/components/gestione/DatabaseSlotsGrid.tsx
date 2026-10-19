import type { AssetRow, DBSlot } from '../../types';

interface Props {
  database: AssetRow;
}

// Riepilogo dei 5 slot di un database (riga espansa)
export default function DatabaseSlotsGrid({ database: item }: Props) {
  return (
    <div className="bg-surface/[0.01] border-l-2 border-accent/40 ml-12 py-4 px-8 border-b border-divider">
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((num) => {
          const slot = item.db_slots?.find((s: DBSlot) => s.slot_number === num);
          return (
            <div key={num} className="bg-surface p-3 rounded-card border border-divider flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-widest">Slot #{num}</span>
                {slot?.content && <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>}
              </div>
              <span className={`text-xs font-semibold truncate ${slot?.content ? 'text-fg' : 'text-muted'}`}>
                {slot?.content || 'Libero'}
              </span>
              {slot?.notes && (
                <span className="text-xs font-semibold text-muted truncate ">"{slot.notes}"</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
