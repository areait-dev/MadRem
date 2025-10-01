import { useState, useEffect } from 'react';
import { X, Mail, Clock, Calendar, Save, Bell, Sun, Moon, Monitor, User } from 'lucide-react';
import type { AppSettings } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useUserSettings } from '../hooks/useUserSettings';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { settings, loading, error, saveSettings } = useUserSettings();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Sincronizza le impostazioni locali con quelle del database
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Clear validation errors when settings change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [localSettings]);

  // Validation
  const validateSettings = () => {
    const newErrors: Record<string, string> = {};
    
    if (localSettings.reminderDays < 0 || localSettings.reminderDays > 30) {
      newErrors.reminderDays = 'I giorni devono essere tra 0 e 30';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!validateSettings()) return;
    
    const success = await saveSettings(localSettings);
    
    if (success) {
      // Apply theme
      setTheme(localSettings.theme);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Chiaro', icon: Sun },
    { value: 'dark', label: 'Scuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ] as const;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-modal rounded-3xl w-full max-w-lg max-h-[80vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-blue-100 dark:border-yellow-700">
          <h2 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-white">
            Impostazioni
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-yellow-800 text-blue-600 dark:text-yellow-300 transition-colors"
          >
            <X size={18} className="sm:size-20" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-8">
          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-3 sm:p-4 text-green-800 dark:text-green-200 text-center font-medium animate-fade-in text-sm sm:text-base">
              Impostazioni salvate con successo!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-3 sm:p-4 text-red-800 dark:text-red-200 text-center font-medium animate-fade-in text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-3 sm:p-4 text-red-800 dark:text-red-200 animate-fade-in text-sm sm:text-base">
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="font-medium">{field}:</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Notifications */}
          <section>
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-900 dark:text-white mb-2 sm:mb-4">
              <Bell size={18} />
              Notifiche Email
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Email Address - Ora read-only e automatica */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-900 dark:text-white mb-1 sm:mb-2">
                  <User size={14} />
                  Indirizzo Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || 'Nessun utente loggato'}
                    readOnly
                    className="input-glass w-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed text-xs sm:text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Reminder Days */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-900 dark:text-white mb-2">
                  <Calendar size={14} />
                  Quando vuoi ricevere il promemoria?
                </label>
                <div className="flex flex-row gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, reminderDays: 30 }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.reminderDays === 30
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.reminderDays === 30}
                  >
                    <Calendar size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">1 mese</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, reminderDays: 14 }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.reminderDays === 14
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.reminderDays === 14}
                  >
                    <Calendar size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">2 settimane</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, reminderDays: 7 }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.reminderDays === 7
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.reminderDays === 7}
                  >
                    <Calendar size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">1 settimana</span>
                  </button>
                </div>
              </div>

              {/* Reminder Time */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-900 dark:text-white mb-2">
                  <Clock size={14} />
                  Orario di invio del promemoria
                </label>
                <input
                  type="time"
                  value={localSettings.reminderTime}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                  className="input-glass w-full text-xs sm:text-sm h-10 sm:h-12 text-blue-900 dark:text-white"
                />
              </div>

              {/* Reminder Frequency */}
              <div className="mb-4">
                <label className="text-xs sm:text-sm font-medium text-blue-900 dark:text-white mb-2 block">
                  Frequenza promemoria
                </label>
                <div className="flex flex-row gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, reminderFrequency: 'once' }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.reminderFrequency === 'once'
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.reminderFrequency === 'once'}
                  >
                    <Bell size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">Una volta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, reminderFrequency: 'daily' }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.reminderFrequency === 'daily'
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.reminderFrequency === 'daily'}
                  >
                    <Bell size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">Giornaliero</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Theme */}
          <section>
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-white mb-2">
              Tema
            </h3>
            <div className="flex flex-row gap-2 w-full">
              {themeOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: option.value }))}
                    className={`flex-1 glass-card flex flex-col items-center justify-center px-1.5 py-2 rounded-xl border transition-all duration-200
                      ${localSettings.theme === option.value
                        ? 'border-primary-600 dark:border-accent-400 ring-2 ring-primary-400 dark:ring-accent-400 text-primary-900 dark:text-yellow-100 bg-primary-100/80 dark:bg-accent-900/40'
                        : 'border-blue-100 dark:border-yellow-700 text-blue-900 dark:text-white'
                      }`}
                    aria-pressed={localSettings.theme === option.value}
                  >
                    <IconComponent size={18} className="mb-0.5" />
                    <span className="font-semibold text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-blue-100 dark:border-yellow-700">
            <button
              onClick={onClose}
              className="flex-1 btn-glass rounded-full text-blue-900 dark:text-white font-medium text-xs sm:text-base"
            >
              Annulla
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 btn-primary rounded-full flex items-center justify-center gap-2 text-xs sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  Salva
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;