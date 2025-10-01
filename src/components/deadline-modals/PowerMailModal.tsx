import { useState, useEffect } from 'react';
import { X, Save, Mail } from 'lucide-react';
import type { Deadline, DeadlinePriority } from '../../types';
import { PRIORITIES } from '../../types';

interface PowerMailModalProps {
  deadline?: Deadline | null;
  onSave: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const PowerMailModal = ({ deadline, onSave, onClose }: PowerMailModalProps) => {
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
    category: 'powermail' as const,
    priority: 'media' as DeadlinePriority,
    status: 'attiva' as const,
    color: '#3B82F6',
    // Campi specifici per PowerMail
    mail: '',
    tipologia: '',
    cliente: '',
    rif_contratto: '',
    descrizione: ''
  });

  // Initialize form with deadline data if editing
  useEffect(() => {
    if (deadline) {
      const [mail = '', tipologia = '', cliente = '', rif_contratto = '', descrizione = ''] = (deadline.description || '').split('|');
      setFormData({
        title: deadline.title,
        description: deadline.description || '',
        due_date: deadline.due_date,
        category: 'powermail',
        priority: deadline.priority,
        status: 'attiva',
        color: '#3B82F6',
        mail,
        tipologia,
        cliente,
        rif_contratto,
        descrizione
      });
    }
  }, [deadline]);

  // Funzione per riprodurre i suoni
  const playSound = (audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

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

    if (!formData.mail.trim()) {
      newErrors.mail = 'L\'indirizzo email è obbligatorio';
    }

    if (!formData.tipologia.trim()) {
      newErrors.tipologia = 'La tipologia è obbligatoria';
    }

    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Il cliente è obbligatorio';
    }

    if (!formData.rif_contratto.trim()) {
      newErrors.rif_contratto = 'Il riferimento contratto è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const description = `${formData.mail}|${formData.tipologia}|${formData.cliente}|${formData.rif_contratto}|${formData.descrizione}`;
      
      await onSave({
        title: formData.title,
        description,
        due_date: formData.due_date,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        color: formData.color,
        // Campi specifici per PowerMail
        mail: formData.mail,
        tipologia: formData.tipologia,
        cliente: formData.cliente,
        rif_contratto: formData.rif_contratto
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
            <Mail size={20} />
            {deadline ? 'Modifica' : 'Nuova'} Scadenza PowerMail
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

          {/* Mail */}
          <div className="relative">
            <input
              type="email"
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
              value={formData.mail}
              onChange={e => setFormData(prev => ({ ...prev, mail: e.target.value }))}
              disabled={loading}
            />
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:bg-transparent">
              Mail *
            </label>
            {errors.mail && (
              <p className="text-red-500 text-xs mt-1">{errors.mail}</p>
            )}
          </div>

          {/* Tipologia */}
          <div className="relative">
            <select
              value={formData.tipologia}
              onChange={e => setFormData(prev => ({ ...prev, tipologia: e.target.value }))}
              disabled={loading}
              required
              className="peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white"
            >
              <option value="">Seleziona tipologia *</option>
              <option value="2GB">2GB</option>
              <option value="10GB">10GB</option>
              <option value="50GB">50GB</option>
              {/* <option value="100GB">100GB</option>
              <option value="Altro">Altro</option> */}
            </select>
            <label className="absolute left-3 -top-2.5 text-sm text-slate-500 bg-white dark:bg-slate-800 px-1 pointer-events-none transition-all duration-200 peer-focus:text-blue-600 dark:peer-focus:text-yellow-500">
              Tipologia *
            </label>
            {errors.tipologia && (
              <p className="text-red-500 text-xs mt-1">{errors.tipologia}</p>
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

export default PowerMailModal;