import { useEffect, useState } from 'react';
import { X, Save, Repeat } from 'lucide-react';
import type { Deadline, DeadlinePriority } from '../../types';
import { PRIORITIES } from '../../types';

interface AbbonamentiModalProps {
  deadline?: Deadline | null;
  onSave: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const AbbonamentiModal = ({ deadline, onSave, onClose }: AbbonamentiModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Audio per suoni
  const [successAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/success.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });
  const [updateAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/update.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });
  const [errorAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/error.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    category: 'abbonamenti' as const,
    priority: 'media' as DeadlinePriority,
    status: 'attiva' as const,
    color: '#F97316', // orange
    durata: '' as '' | '1m' | '3m' | '6m' | '12m',
    costo: '',
    isRinnovabile: true, // true = rinnovabile, false = una tantum
  });

  useEffect(() => {
    if (deadline) {
      const [durata = '', start = '', costo = '', extraDescription = ''] = (deadline.description || '').split('|');
      setFormData({
        title: deadline.title,
        description: extraDescription || '',
        start_date: start || '',
        due_date: deadline.due_date,
        category: 'abbonamenti',
        priority: deadline.priority,
        status: 'attiva',
        color: deadline.color || '#F97316',
        durata: (durata as '1m' | '3m' | '6m' | '12m') || '',
        costo: costo || '',
        isRinnovabile: durata !== '', // Se c'è una durata, è rinnovabile
      });
    }
  }, [deadline]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Il titolo è obbligatorio';
    if (!formData.start_date) {
      newErrors.start_date = 'La data iniziale è obbligatoria';
    }
    // Data di scadenza obbligatoria solo per abbonamenti rinnovabili
    if (formData.isRinnovabile && !formData.due_date) {
      newErrors.due_date = 'La data di scadenza è obbligatoria per abbonamenti rinnovabili';
    }
    if (formData.start_date && formData.due_date) {
      const start = new Date(formData.start_date);
      const due = new Date(formData.due_date);
      if (due < start) newErrors.due_date = 'La scadenza deve essere successiva alla data iniziale';
    }
    if (formData.isRinnovabile && !formData.durata) {
      newErrors.durata = 'La durata è obbligatoria per abbonamenti rinnovabili';
    }
    if (!formData.costo.trim()) newErrors.costo = 'Il costo è obbligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const monthsFromDurata = (d: string) => {
    switch (d) {
      case '1m': return 1;
      case '3m': return 3;
      case '6m': return 6;
      case '12m': return 12;
      default: return 0;
    }
  };

  const addMonths = (dateStr: string, months: number) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const handleRenew = async () => {
    if (!deadline || !formData.isRinnovabile) return;
    const [durataSaved = formData.durata, , costo = formData.costo] = (deadline.description || '').split('|');
    const months = monthsFromDurata(durataSaved || formData.durata);
    if (!formData.due_date || months <= 0) return;
    const baseIsPast = new Date(formData.due_date) < new Date();
    const base = baseIsPast ? new Date().toISOString().split('T')[0] : formData.due_date;
    const nextDue = addMonths(base, months);
    setLoading(true);
    try {
      const packedDescription = `${durataSaved || formData.durata}|${formData.start_date}|${costo || formData.costo}|${formData.description || ''}`;
      await onSave({
        title: formData.title,
        description: packedDescription,
        due_date: nextDue,
        category: formData.category,
        priority: formData.priority,
        status: 'attiva',
        color: formData.color,
      });
      if (updateAudio) { try { updateAudio.currentTime = 0; updateAudio.play(); } catch {} }
    } catch (err) {
      console.error('Error renewing abbonamento:', err);
      if (errorAudio) { try { errorAudio.currentTime = 0; errorAudio.play(); } catch {} }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const durataToSave = formData.isRinnovabile ? formData.durata : '';
      const packedDescription = `${durataToSave}|${formData.start_date}|${formData.costo}|${formData.description || ''}`;
      
      // Per abbonamenti una tantum, usiamo la data di inizio come data di scadenza
      const dueDateToSave = formData.isRinnovabile ? formData.due_date : formData.start_date;
      
      // Per abbonamenti una tantum, usiamo priorità media di default
      const priorityToSave = formData.isRinnovabile ? formData.priority : 'media';
      
      await onSave({
        title: formData.title,
        description: packedDescription,
        due_date: dueDateToSave,
        category: formData.category,
        priority: priorityToSave,
        status: formData.status,
        color: formData.color,
      });
      if (deadline) {
        if (updateAudio) { try { updateAudio.currentTime = 0; updateAudio.play(); } catch {} }
      } else {
        if (successAudio) { try { successAudio.currentTime = 0; successAudio.play(); } catch {} }
      }
    } catch (err) {
      console.error('Error saving abbonamento:', err);
      if (errorAudio) { try { errorAudio.currentTime = 0; errorAudio.play(); } catch {} }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="glass-modal rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-blue-100 dark:border-yellow-700">
          <h2 className="text-base font-semibold text-blue-900 dark:text-white flex items-center gap-2">
            <Repeat size={20} />
            {deadline ? 'Modifica' : 'Nuovo'} Abbonamento
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-yellow-800 text-blue-600 dark:text-yellow-300 transition-colors"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-4 space-y-6">
          {/* Titolo */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={loading}
              autoFocus
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Titolo *
            </label>
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Data iniziale */}
          <div className="relative">
            <input
              type="date"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent box-border"
              value={formData.start_date}
              onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              disabled={loading}
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                appearance: 'none'
              }}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Data di inizio *
            </label>
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          </div>

          {/* Tipo Abbonamento */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tipo Abbonamento
              </span>
            </div>
            <div className="relative bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              <div className="relative flex">
                {/* Background slider */}
                <div
                  className={`absolute top-1 bottom-1 w-1/2 bg-white dark:bg-slate-600 rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${
                    formData.isRinnovabile ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                {/* Una tantum button */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    isRinnovabile: false,
                    durata: '', // Reset durata se diventa una tantum
                    due_date: '', // Reset data scadenza se diventa una tantum
                    priority: 'media' // Reset priorità a media per abbonamenti una tantum
                  }))}
                  className={`relative flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 z-10 ${
                    !formData.isRinnovabile
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  disabled={loading}
                >
                  Una tantum
                </button>
                {/* Rinnovabile button */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    isRinnovabile: true
                  }))}
                  className={`relative flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 z-10 ${
                    formData.isRinnovabile
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  disabled={loading}
                >
                  Abbonamento
                </button>
              </div>
            </div>
          </div>

          {/* Data di scadenza - Solo per abbonamenti rinnovabili */}
          {formData.isRinnovabile && (
            <div className="relative">
              <input
                type="date"
                required
                placeholder=" "
                min={formData.start_date || undefined}
                className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent box-border"
                value={formData.due_date}
                onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                disabled={loading}
                style={{ 
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  appearance: 'none'
                }}
              />
              <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
                Data di scadenza *
              </label>
              {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
            </div>
          )}

          {/* Costo */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.costo}
              onChange={e => setFormData(prev => ({ ...prev, costo: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Costo *
            </label>
            {errors.costo && <p className="text-red-500 text-xs mt-1">{errors.costo}</p>}
          </div>

          {/* Durata - Solo per abbonamenti rinnovabili */}
          {formData.isRinnovabile && (
            <div className="relative">
              <select
                value={formData.durata}
                onChange={e => setFormData(prev => ({ ...prev, durata: e.target.value as '1m' | '3m' | '6m' | '12m' }))}
                disabled={loading}
                required
                className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white"
              >
                <option value="">Seleziona durata rinnovo *</option>
                <option value="1m">1 mese</option>
                <option value="3m">3 mesi</option>
                <option value="6m">6 mesi</option>
                <option value="12m">12 mesi</option>
              </select>
              <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500">
                Durata rinnovo *
              </label>
              {errors.durata && <p className="text-red-500 text-xs mt-1">{errors.durata}</p>}
            </div>
          )}

          {/* Descrizione */}
          <div className="relative">
            <textarea
              placeholder=" "
              rows={3}
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent resize-none"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Descrizione
            </label>
          </div>

          {/* Priorità - Solo per abbonamenti rinnovabili */}
          {formData.isRinnovabile && (
            <div>
              <div className="flex justify-between gap-2">
                {PRIORITIES.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`
                      flex-1 px-2 py-1 rounded-xl text-sm font-medium transition
                      ${formData.priority === priority.value
                        ? `${priority.color} ${priority.textColor} ring-2 ring-blue-500 dark:ring-orange-500`
                        : `${priority.color} ${priority.textColor} hover:ring-2 hover:ring-blue-300 dark:hover:ring-orange-300`
                      }
                    `}
                    disabled={loading}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Azioni */}
          <div className="flex gap-3 pt-4 border-t border-blue-100 dark:border-yellow-700">
            {deadline && formData.isRinnovabile && (
              <button
                type="button"
                onClick={handleRenew}
                className="flex-1 btn-glass rounded-full text-blue-900 dark:text-white font-medium text-sm py-2"
                disabled={loading}
                title="Rinnova"
              >
                Rinnova
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-glass rounded-full text-blue-900 dark:text-white font-medium text-sm py-2"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary rounded-full flex items-center justify-center gap-2 text-sm py-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  {deadline ? 'Aggiorna' : 'Salva'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbbonamentiModal;