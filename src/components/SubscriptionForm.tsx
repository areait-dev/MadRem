import React, { useState } from 'react';
import { Tag, Calendar, Save, ChevronDown } from 'lucide-react';
import type { Subscription } from '../types';

interface SubscriptionFormProps {
  initialData?: Partial<Subscription>;
  onSubmit: (data: Partial<Subscription>) => Promise<void>;
  loading: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    expiry_date: initialData?.expiry_date || '',
    notes: initialData?.notes || '',
    billing_cycle: initialData?.billing_cycle || '1y' as Subscription['billing_cycle'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes || null,
      billing_cycle: formData.billing_cycle,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Subscription Name - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Nome Abbonamento
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="es. Adobe Creative Cloud"
              required
              className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="md:col-span-1 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Frequenza di Rinnovo
          </label>
          <div className="relative group">
            <select
              required
              className="input-glass w-full pl-5 pr-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03] appearance-none cursor-pointer"
              value={formData.billing_cycle || '1y'}
              onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as Subscription['billing_cycle'] })}
            >
              <option value="1m" className="dark:bg-[#1a1a1a]">1 Mese</option>
              <option value="3m" className="dark:bg-[#1a1a1a]">3 Mesi</option>
              <option value="6m" className="dark:bg-[#1a1a1a]">6 Mesi</option>
              <option value="1y" className="dark:bg-[#1a1a1a]">1 Anno</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Expiry Date */}
        <div className="md:col-span-1 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Data di Scadenza
          </label>
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
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Annotazioni
          </label>
          <textarea
            placeholder="Dettagli aggiuntivi..."
            rows={2}
            className="input-glass w-full py-4 px-5 text-base font-bold bg-slate-50 dark:bg-white/[0.03] resize-none"
            value={formData.notes}
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
          {loading ? 'Salvataggio...' : initialData?.id ? 'Modifica Abbonamento' : 'Salva Abbonamento'}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;
