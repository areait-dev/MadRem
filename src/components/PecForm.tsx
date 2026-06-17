import React, { useState } from 'react';
import { Mail, Calendar, Save } from 'lucide-react';
import type { PecEmail } from '../types';

interface PecFormProps {
  initialData?: Partial<PecEmail>;
  onSubmit: (data: Partial<PecEmail>) => Promise<void>;
  loading: boolean;
}

const PecForm: React.FC<PecFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    expiry_date: initialData?.expiry_date || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      address: formData.address,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* PEC Address - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Indirizzo PEC
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="email"
              placeholder="es. nome@pec.it"
              required
              className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Expiry Date - Full Width */}
        <div className="md:col-span-2 space-y-2">
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
          {loading ? 'Salvataggio...' : initialData?.id ? 'Modifica PEC' : 'Salva PEC'}
        </button>
      </div>
    </form>
  );
};

export default PecForm;
