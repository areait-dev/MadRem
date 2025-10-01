import { useState, useEffect } from 'react';
import { X, Save, Globe } from 'lucide-react';
import type { Deadline, DeadlinePriority, DeadlineStatus } from '../../types';
import { PRIORITIES } from '../../types';

interface DominioModalProps {
  deadline?: Deadline | null;
  onSave: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const DominioModal = ({ deadline, onSave, onClose }: DominioModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Audio per i suoni
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
    due_date: '',
    category: 'dominio' as const,
    priority: 'media' as DeadlinePriority,
    status: 'attiva' as DeadlineStatus, // Cambia qui
    color: '#EAB308',
    // Campi specifici per dominio
    url: '',
    cliente: '',
    rif_contratto: '',
    hosting: '',
    dominio: '',
    descrizione: ''
  });

  // Initialize form with deadline data if editing
  useEffect(() => {
    if (deadline) {
      const [url = '', cliente = '', rif_contratto = '', hosting = '', dominio = '', descrizione = ''] = (deadline.description || '').split('|');
      setFormData({
        title: deadline.title,
        description: deadline.description || '',
        due_date: deadline.due_date,
        category: 'dominio',
        priority: deadline.priority,
        status: deadline.status, // Ora funziona correttamente
        color: deadline.color,
        url,
        cliente,
        rif_contratto,
        hosting,
        dominio,
        descrizione
      });
    }
  }, [deadline]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'La data di scadenza è obbligatoria';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.due_date = 'La data non può essere nel passato';
      }
    }

    if (!formData.url.trim()) {
      newErrors.url = 'L\'URL è obbligatorio';
    }
    
    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Il cliente è obbligatorio';
    }

    if (!formData.rif_contratto.trim()) {
      newErrors.rif_contratto = 'Il riferimento contratto è obbligatorio';
    }

    if (!formData.hosting.trim()) {
      newErrors.hosting = 'L\'hosting è obbligatorio';
    }

    if (!formData.dominio.trim()) {
      newErrors.dominio = 'Il dominio è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funzione per riprodurre i suoni
  const playSound = (audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const description = `${formData.url}|${formData.cliente}|${formData.rif_contratto}|${formData.hosting}|${formData.dominio}|${formData.descrizione}`;
      
      await onSave({
        title: formData.title,
        description,
        due_date: formData.due_date,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        color: formData.color,
        // Campi specifici per dominio
        url: formData.url,
        cliente: formData.cliente,
        rif_contratto: formData.rif_contratto,
        hosting: formData.hosting,
        dominio: formData.dominio
      });

      // Riproduci il suono appropriato
      if (deadline) {
        // Modifica esistente
        playSound(updateAudio);
      } else {
        // Nuova scadenza
        playSound(successAudio);
      }
      
    } catch (error) {
      console.error('Error saving deadline:', error);
      // Riproduci suono di errore
      playSound(errorAudio);
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
            <Globe size={20} />
            {deadline ? 'Modifica' : 'Nuova'} Scadenza Dominio
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

          {/* URL */}
          <div className="relative">
            <input
              type="url"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              onFocus={e => {
                if (!formData.url) {
                  setFormData(prev => ({ ...prev, url: 'https://www.' }));
                  // Sposta il cursore alla fine dopo l'aggiornamento
                  setTimeout(() => {
                    if (e.target.setSelectionRange) {
                      e.target.setSelectionRange('https://www.'.length, 'https://www.'.length);
                    }
                  }, 0);
                }
              }}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              URL *
            </label>
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
            )}
          </div>

          {/* Cliente */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.cliente}
              onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Cliente *
            </label>
            {errors.cliente && (
              <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>
            )}
          </div>

          {/* Rif. Contratto */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.rif_contratto}
              onChange={e => setFormData(prev => ({ ...prev, rif_contratto: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Rif. Contratto *
            </label>
            {errors.rif_contratto && (
              <p className="text-red-500 text-xs mt-1">{errors.rif_contratto}</p>
            )}
          </div>

          {/* Hosting & Dominio (inline) */}
          <div className="flex gap-3">
            {/* Hosting */}
            <div className="relative flex-1">
              <select
                value={formData.hosting}
                onChange={e => setFormData(prev => ({ ...prev, hosting: e.target.value }))}
                disabled={loading}
                required
                className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white"
              >
                <option value="">Seleziona hosting *</option>
                <option value="Cliente">Cliente</option>
                <option value="Nostro">Nostro</option>
              </select>
              <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500">
                Hosting *
              </label>
              {errors.hosting && (
                <p className="text-red-500 text-xs mt-1">{errors.hosting}</p>
              )}
            </div>
            {/* Dominio */}
            <div className="relative flex-1">
              <select
                value={formData.dominio}
                onChange={e => setFormData(prev => ({ ...prev, dominio: e.target.value }))}
                disabled={loading}
                required
                className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white"
              >
                <option value="">Seleziona dominio *</option>
                <option value="Cliente">Cliente</option>
                <option value="Nostro">Nostro</option>
              </select>
              <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500">
                Dominio *
              </label>
              {errors.dominio && (
                <p className="text-red-500 text-xs mt-1">{errors.dominio}</p>
              )}
            </div>
          </div>

          {/* Scadenza */}
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
              Scadenza *
            </label>
            {errors.due_date && (
              <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
            )}
          </div>

          {/* Descrizione */}
          <div className="relative">
            <textarea
              placeholder=" "
              rows={3}
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent resize-none"
              value={formData.descrizione}
              onChange={e => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
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

export default DominioModal;