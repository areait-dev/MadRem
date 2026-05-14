import React, { useState } from 'react';
import { Database as DbIcon, Lock, User, Eye, EyeOff, Copy, Check, Save, HardDrive } from 'lucide-react';
import type { Database } from '../types';
import { useInfrastructure } from '../hooks/useInfrastructure';
import Swal from 'sweetalert2';

interface DatabaseSlotsProps {
  database: Database;
  onUpdate: () => void;
}

const DatabaseSlots: React.FC<DatabaseSlotsProps> = ({ database, onUpdate }) => {
  const { upsertDBSlots, loading: isBatchSaving } = useInfrastructure();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Local state to track each slot's input values
  const [localSlots, setLocalSlots] = useState<Record<number, { content: string, notes: string }>>(() => {
    const initial: Record<number, { content: string, notes: string }> = {};
    [1, 2, 3, 4, 5].forEach(num => {
      const slot = database.db_slots?.find(s => s.slot_number === num);
      initial[num] = { 
        content: slot?.content || '', 
        notes: slot?.notes || '' 
      };
    });
    return initial;
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
    background: 'transparent',
    customClass: {
      popup: 'cyber-pill-toast'
    }
  });

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    Toast.fire({ title: 'Copiato!' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAll = async () => {
    try {
      const payload = Object.entries(localSlots).map(([num, data]) => ({
        slot_number: parseInt(num),
        ...data
      }));
      
      await upsertDBSlots(database.id, payload);
      setIsSuccess(true);
      onUpdate();
      setTimeout(() => setIsSuccess(false), 3000);
      Toast.fire({ title: 'Allocazione aggiornata!' });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Errore', text: err.message });
    }
  };

  const anyChanged = () => {
    return [1, 2, 3, 4, 5].some(num => {
      const original = database.db_slots?.find(s => s.slot_number === num);
      return (localSlots[num].content !== (original?.content || '')) || 
             (localSlots[num].notes !== (original?.notes || ''));
    });
  };

  const hasChanges = anyChanged();

  return (
    <div className="space-y-4">
      {/* Compact Credentials Header */}
      <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-slate-900 shadow-lg shadow-primary/20">
              <DbIcon size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{database.sql_name}</h4>
              <p className="text-[9px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest truncate">{database.hostname}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-[8px] font-black text-slate-500 uppercase">{database.size_gb}GB</span>
            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase">v{database.sql_version}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-1.5 group/user cursor-pointer"
               onClick={() => copyToClipboard(database.sql_name, 'user')}>
            <User size={10} className="text-slate-400 mr-2" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-white/70 truncate flex-1">{database.sql_name}</span>
            <Copy size={10} className="text-slate-300 opacity-0 group-hover/user:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-1.5 group/pass">
            <Lock size={10} className="text-slate-400 mr-2" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-white/70 font-mono truncate flex-1">
              {showPassword ? database.password_encrypted : '••••••••'}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button onClick={() => setShowPassword(!showPassword)} className="p-1 text-slate-300 hover:text-primary transition-colors">
                {showPassword ? <EyeOff size={10} /> : <Eye size={10} />}
              </button>
              <button onClick={() => copyToClipboard(database.password_encrypted, 'pass')} className="p-1 text-slate-300 hover:text-primary transition-colors">
                {copiedField === 'pass' ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Management - Blade Layout */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-black text-slate-400 dark:text-text-muted uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <HardDrive size={10} /> Allocazione Database (5 Slot)
        </h4>

        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((num) => {
            const hasData = localSlots[num].content.length > 0;
            const original = database.db_slots?.find(s => s.slot_number === num);
            const changed = (localSlots[num].content !== (original?.content || '')) || 
                           (localSlots[num].notes !== (original?.notes || ''));

            return (
              <div key={num} className={`group flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-300 ${
                hasData 
                  ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5' 
                  : 'bg-slate-50/50 dark:bg-white/[0.01] border-dashed border-slate-200 dark:border-white/10 opacity-70 focus-within:opacity-100'
              } ${changed ? 'border-primary/40 ring-1 ring-primary/10' : ''}`}>
                {/* Slot Indicator */}
                <div className={`h-6 w-6 shrink-0 rounded-lg flex items-center justify-center font-black text-[9px] transition-all ${
                  hasData ? 'bg-primary text-slate-900 shadow-sm' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                }`}>
                  {num}
                </div>

                {/* Content Input */}
                <div className="flex-[2] min-w-0">
                  <input
                    type="text"
                    placeholder="Sito o contenuto..."
                    className="w-full bg-transparent border-none px-2 py-0.5 text-base font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-white/5"
                    value={localSlots[num].content}
                    onChange={(e) => setLocalSlots({ ...localSlots, [num]: { ...localSlots[num], content: e.target.value } })}
                  />
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />

                {/* Notes Input */}
                <div className="flex-[1.5] min-w-0">
                  <input
                    type="text"
                    placeholder="Note..."
                    className="w-full bg-transparent border-none px-2 py-0.5 text-base font-bold text-slate-400 dark:text-white/40 outline-none placeholder:text-slate-300 dark:placeholder:text-white/5 italic"
                    value={localSlots[num].notes}
                    onChange={(e) => setLocalSlots({ ...localSlots, [num]: { ...localSlots[num], notes: e.target.value } })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSaveAll}
          disabled={!hasChanges || isBatchSaving}
          className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 shadow-lg ${
            hasChanges 
              ? 'bg-primary text-slate-900 shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50 shadow-none'
          }`}
        >
          {isBatchSaving ? (
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : isSuccess ? (
            <>
              <Check size={14} />
              Aggiornato con Successo
            </>
          ) : (
            <>
              <Save size={14} />
              Aggiorna Allocazione
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DatabaseSlots;
