import React, { useState } from 'react';
import { Mail, Calendar, Save, Lock, Eye, EyeOff, Copy, Check } from 'lucide-react';
import type { PecEmail } from '../types';

interface PecFormProps {
  initialData?: Partial<PecEmail>;
  onSubmit: (data: Partial<PecEmail>) => Promise<void>;
  loading: boolean;
}

const PecForm: React.FC<PecFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    password_encrypted: initialData?.password_encrypted || '',
    expiry_date: initialData?.expiry_date || '',
    notes: initialData?.notes || '',
    is_disabled: initialData?.is_disabled || false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      address: formData.address,
      password_encrypted: formData.password_encrypted || null,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes || null,
      is_disabled: formData.is_disabled,
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* PEC Address */}
        <div className="space-y-2">
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
              className="input-glass w-full pl-12 pr-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <button
              type="button"
              onClick={() => copyToClipboard(formData.address, 'address')}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-primary transition-colors"
            >
              {copiedField === 'address' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
            Password Accesso
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              className="input-glass w-full pl-12 pr-20 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.password_encrypted}
              onChange={(e) => setFormData({ ...formData, password_encrypted: e.target.value })}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(formData.password_encrypted, 'password')}
                className="p-2 text-slate-400 hover:text-primary transition-colors"
              >
                {copiedField === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
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
