import React, { useState } from 'react';
import { Globe, Calendar, Save, ChevronDown } from 'lucide-react';
import type { Domain, DomainType } from '../types';

interface DomainFormProps {
  panels: { id: string, title: string | null, email: string }[];
  initialData?: Partial<Domain>;
  onSubmit: (data: Partial<Domain>) => Promise<void>;
  loading: boolean;
}

const DomainForm: React.FC<DomainFormProps> = ({ panels, initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'main' as DomainType,
    panel_id: initialData?.panel_id || (panels.length > 0 ? panels[0].id : ''),
    expiry_date: initialData?.expiry_date || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.panel_id) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Panel Selection - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Pannello Aruba Associato</label>
          <div className="relative group">
            <select
              required
              className="input-glass w-full pl-5 pr-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03] appearance-none cursor-pointer"
              value={formData.panel_id}
              onChange={(e) => setFormData({ ...formData, panel_id: e.target.value })}
            >
              <option value="" disabled>Seleziona un pannello...</option>
              {panels.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-[#1a1a1a]">{p.title || p.email}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Domain Name - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Indirizzo Dominio</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="es. miosito.it"
              required
              className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Type Choice */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Tipologia Dominio</label>
          <div className="flex p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-2xl gap-2">
            {[
              { id: 'main', label: 'Dominio Principale' },
              { id: 'third_level', label: 'Terzo Livello' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: option.id as any })}
                className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === option.id
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Scadenza</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
            <input
              type="date"
              required
              className="input-glass appearance-none w-full min-w-0 max-w-full pl-12 pr-4 text-base font-bold bg-slate-50 dark:bg-white/[0.03] [color-scheme:light] dark:[color-scheme:dark] min-h-[50px]"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>
        </div>

        {/* Notes - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Annotazioni</label>
          <textarea
            placeholder="Dettagli aggiuntivi..."
            rows={2}
            className="input-glass w-full py-4 px-5 text-base font-bold bg-slate-50 dark:bg-white/[0.03] resize-none"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary !py-5 flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
        >
          <Save size={18} />
          {loading ? 'Salvataggio...' : initialData?.id ? 'Modifica Dominio' : 'Salva Dominio'}
        </button>
      </div>
    </form>
  );
};

export default DomainForm;
