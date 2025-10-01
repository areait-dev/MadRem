import { useState, useEffect } from 'react';
import { X, Save, Smartphone } from 'lucide-react';
import type { Deadline, DeadlinePriority } from '../../types';
import { PRIORITIES } from '../../types';

interface SocialModalProps {
  deadline?: Deadline | null;
  onSave: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const SocialModal = ({ deadline, onSave, onClose }: SocialModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',          // Descrizione (facoltativa) mostrata in UI
    due_date: '',
    category: 'social' as const,
    priority: 'media' as DeadlinePriority,
    status: 'attiva' as const,
    color: '#10B981',
    // Campi specifici
    cliente: '',
    contract_ref: '',
    contract_date: ''
  });

  // Initialize form with deadline data if editing
  useEffect(() => {
    if (deadline) {
      // description packed as: cliente|contract_ref|contract_date|extraDescription?
      const [cliente = '', contract_ref = '', contract_date = '', extraDescription = ''] = (deadline.description || '').split('|');
      setFormData({
        title: deadline.title,
        description: extraDescription || '',   // UI description (optional)
        due_date: deadline.due_date,          // Data social
        category: 'social',
        priority: deadline.priority,
        status: 'attiva',
        color: deadline.color,
        cliente,
        contract_ref,
        contract_date
      });
    }
  }, [deadline]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Il titolo è obbligatorio';

    if (!formData.cliente.trim()) newErrors.cliente = 'Il cliente è obbligatorio';

    if (!formData.contract_ref.trim()) newErrors.contract_ref = 'Il riferimento contratto è obbligatorio';

    if (!formData.contract_date) newErrors.contract_date = 'La data contratto è obbligatoria';

    if (!formData.due_date) {
      newErrors.due_date = 'La data social è obbligatoria';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.due_date = 'La data non può essere nel passato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Descrizione composta: cliente | rif. contratto | data contratto | descrizione_opzionale
      const packedDescription = `${formData.cliente}|${formData.contract_ref}|${formData.contract_date}|${formData.description || ''}`;
      await onSave({
        ...formData,
        description: packedDescription
      });
    } catch (error) {
      console.error('Error saving deadline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="glass-modal rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-blue-100 dark:border-yellow-700">
          <h2 className="text-base font-semibold text-blue-900 dark:text-white flex items-center gap-2">
            <Smartphone size={20} />
            {deadline ? 'Modifica' : 'Nuova'} Scadenza Social
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
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Cliente */}
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.cliente}
              onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
              disabled={loading}
              required
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Cliente *
            </label>
            {errors.cliente && (
              <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>
            )}
          </div>

          {/* Rif. contratto */}
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.contract_ref}
              onChange={e => setFormData(prev => ({ ...prev, contract_ref: e.target.value }))}
              disabled={loading}
              required
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Rif. contratto *
            </label>
            {errors.contract_ref && (
              <p className="text-red-500 text-xs mt-1">{errors.contract_ref}</p>
            )}
          </div>

          {/* Data contratto */}
          <div className="relative">
            <input
              type="date"
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.contract_date}
              onChange={e => setFormData(prev => ({ ...prev, contract_date: e.target.value }))}
              disabled={loading}
              required
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Data contratto *
            </label>
            {errors.contract_date && (
              <p className="text-red-500 text-xs mt-1">{errors.contract_date}</p>
            )}
          </div>

          {/* Data social (scadenza) */}
          <div className="relative">
            <input
              type="date"
              required
              placeholder=" "
              min={getMinDate()}
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.due_date}
              onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Data social *
            </label>
            {errors.due_date && (
              <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
            )}
          </div>

          {/* Descrizione (facoltativa) */}
          <div className="relative">
            <textarea
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent min-h-[90px] resize-y"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Descrizione
            </label>
          </div>

          {/* Priorità */}
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

          {/* Azioni */}
          <div className="flex gap-3 pt-4 border-t border-blue-100 dark:border-yellow-700">
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

export default SocialModal;