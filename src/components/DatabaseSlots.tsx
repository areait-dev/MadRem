import React, { useState } from 'react';
import { Database as DbIcon, Lock, User, Eye, EyeOff, Copy, Check, Save, HardDrive } from 'lucide-react';
import type { Database } from '../types';
import { useInfrastructure } from '../hooks/useInfrastructure';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../utils/errors';

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
      popup: 'ds-toast'
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
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Errore', text: getErrorMessage(err) });
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
      <div className="p-4 rounded-card bg-surface border border-divider space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent text-white">
              <DbIcon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate">{database.sql_name}</p>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest truncate">{database.hostname}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-line/20 text-xs font-semibold text-muted uppercase">{database.size_gb}GB</span>
            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-link text-xs font-semibold uppercase">v{database.sql_version}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-surface border border-divider rounded-lg px-3 py-1.5 group/user cursor-pointer"
               onClick={() => copyToClipboard(database.sql_name, 'user')}>
            <User size={10} className="text-muted mr-2" />
            <span className="text-xs font-semibold text-muted truncate flex-1">{database.sql_name}</span>
            <Copy size={10} className="text-muted opacity-0 group-hover/user:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center bg-surface border border-divider rounded-lg px-3 py-1.5 group/pass">
            <Lock size={10} className="text-muted mr-2" />
            <span className="text-xs font-semibold text-muted font-mono truncate flex-1">
              {showPassword ? database.password_encrypted : '••••••••'}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button aria-label="Mostra o nascondi password" onClick={() => setShowPassword(!showPassword)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted hover:text-link transition-colors">
                {showPassword ? <EyeOff size={10} /> : <Eye size={10} />}
              </button>
              <button aria-label="Copia" onClick={() => copyToClipboard(database.password_encrypted, 'pass')} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted hover:text-link transition-colors">
                {copiedField === 'pass' ? <Check size={10} className="text-success" /> : <Copy size={10} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Management - Blade Layout */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 flex items-center gap-2">
          <HardDrive size={10} /> Allocazione Database (5 Slot)
        </p>

        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((num) => {
            const hasData = localSlots[num].content.length > 0;
            const original = database.db_slots?.find(s => s.slot_number === num);
            const changed = (localSlots[num].content !== (original?.content || '')) || 
                           (localSlots[num].notes !== (original?.notes || ''));

            return (
              <div key={num} className={`group flex items-center gap-2 p-1.5 rounded-lg border transition-all duration-300 ${
                hasData 
                  ? 'bg-surface border-divider' 
                  : 'bg-surface/[0.01] border-dashed border-divider opacity-70 focus-within:opacity-100'
              } ${changed ? 'border-accent/40 ring-1 ring-accent' : ''}`}>
                {/* Slot Indicator */}
                <div className={`h-6 w-6 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs transition-all ${
                  hasData ? 'bg-accent text-fg' : 'bg-line/20 text-muted'
                }`}>
                  {num}
                </div>

                {/* Content Input */}
                <div className="flex-[2] min-w-0">
                  <input
                    type="text"
                    placeholder="Sito o contenuto..."
                    className="w-full bg-transparent border-none px-2 py-0.5 text-base font-semibold text-fg outline-none placeholder:text-muted"
                    value={localSlots[num].content}
                    onChange={(e) => setLocalSlots({ ...localSlots, [num]: { ...localSlots[num], content: e.target.value } })}
                  />
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-line/20" />

                {/* Notes Input */}
                <div className="flex-[1.5] min-w-0">
                  <input
                    type="text"
                    placeholder="Note..."
                    className="w-full bg-transparent border-none px-2 py-0.5 text-base font-semibold text-muted outline-none placeholder:text-muted "
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
          className={`w-full py-3.5 rounded-card font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-500 ${
            hasChanges 
              ? 'bg-accent text-fg hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-surface text-muted cursor-not-allowed opacity-50'
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
