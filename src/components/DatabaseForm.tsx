import React, { useState } from 'react';
import { Database as DbIcon, Lock, Calendar, Save, HardDrive, Eye, EyeOff, Copy, Check, Globe, Server, ChevronDown } from 'lucide-react';
import type { Database } from '../types';

interface DatabaseFormProps {
  panels: { id: string, title: string | null, email: string }[];
  initialData?: Partial<Database>;
  onSubmit: (data: Partial<Database>) => Promise<void>;
  loading: boolean;
}

const DatabaseForm: React.FC<DatabaseFormProps> = ({ panels, initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    sql_name: initialData?.sql_name || '',
    password_encrypted: initialData?.password_encrypted || '',
    hostname: initialData?.hostname || '',
    associated_domain: initialData?.associated_domain || '',
    panel_id: initialData?.panel_id || (panels.length > 0 ? panels[0].id : ''),
    sql_version: initialData?.sql_version || '5.7',
    size_gb: initialData?.size_gb || 1,
    expiry_date: initialData?.expiry_date || '',
    notes: initialData?.notes || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.panel_id) return;
    await onSubmit(formData);
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

        {/* 1. Panel Selection - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Pannello Associato</label>
          <div className="relative group">
            <select
              required
              className="input-glass w-full pl-5 pr-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03] appearance-none cursor-pointer"
              value={formData.panel_id}
              onChange={(e) => setFormData({ ...formData, panel_id: e.target.value })}
            >
              <option value="" disabled>Seleziona un pannello...</option>
              {panels.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 dark:text-white">{p.title || p.email}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 2. Associated Domain - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Dominio Associato</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="es. miosito.it"
              className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.associated_domain}
              onChange={(e) => setFormData({ ...formData, associated_domain: e.target.value })}
            />
          </div>
        </div>

        {/* 3. Credentials Group - Full Width, 2 Columns */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Username SQL</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DbIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Sql11234567"
                required
                className="input-glass w-full pl-12 text-base font-bold bg-white dark:bg-black/20"
                value={formData.sql_name}
                onChange={(e) => setFormData({ ...formData, sql_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Password SQL</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="input-glass w-full pl-12 pr-20 text-base font-bold bg-white dark:bg-black/20"
                value={formData.password_encrypted}
                onChange={(e) => setFormData({ ...formData, password_encrypted: e.target.value })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button type="button" onClick={() => copyToClipboard(formData.password_encrypted, 'password')} className="p-2 text-slate-400 hover:text-primary transition-colors">
                  {copiedField === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Hostname (3/5), Versione (1/5), Spazio (1/5) - Proportional Row */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="sm:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Hostname / IP</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Server className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="89.46.111.58"
                className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              />
            </div>
          </div>
          <div className="sm:col-span-1 space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Versione</label>
            <input
              type="text"
              placeholder="5.7"
              className="input-glass w-full px-5 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
              value={formData.sql_version}
              onChange={(e) => setFormData({ ...formData, sql_version: e.target.value })}
            />
          </div>
          <div className="sm:col-span-1 space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">GB</label>
            <div className="relative group">
              <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="number"
                step="1"
                className="input-glass w-full pl-12 text-base font-bold bg-slate-50 dark:bg-white/[0.03]"
                value={formData.size_gb}
                onChange={(e) => setFormData({ ...formData, size_gb: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* 5. Data Scadenza - Full Width Row */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Data Scadenza</label>
          <div className="relative group w-full">
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
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary !py-5 flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
        >
          <Save size={18} />
          {loading ? 'Salvataggio...' : initialData?.id ? 'Modifica Database' : 'Salva Database'}
        </button>
      </div>
    </form>
  );
};

export default DatabaseForm;
