import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { AppSettings } from '../types';

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    email: '',
    reminderDays: 1,
    reminderTime: '09:00',
    reminderFrequency: 'once',
    theme: 'system'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica le impostazioni dal database
  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw fetchError;
      }

      if (data) {
        setSettings({
          email: data.email || user.email || '',
          reminderDays: data.reminder_days || 1,
          reminderTime: data.reminder_time || '09:00',
          reminderFrequency: data.reminder_frequency || 'once',
          theme: data.theme || 'system'
        });
      } else {
        // Se non ci sono impostazioni salvate, usa i valori di default
        setSettings(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  // Salva le impostazioni nel database
  const saveSettings = async (newSettings: AppSettings) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const settingsData = {
        user_id: user.id,
        email: newSettings.email,
        reminder_days: newSettings.reminderDays,
        reminder_time: newSettings.reminderTime,
        reminder_frequency: newSettings.reminderFrequency,
        theme: newSettings.theme
      };

      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert(settingsData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        throw upsertError;
      }

      setSettings(newSettings);
      
      // Salva anche in localStorage come backup
      localStorage.setItem('madroomReminder-settings', JSON.stringify({
        email: newSettings.email,
        reminderDays: newSettings.reminderDays,
        reminderTime: newSettings.reminderTime,
        reminderFrequency: newSettings.reminderFrequency
      }));

      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio delle impostazioni');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carica le impostazioni quando l'utente cambia
  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      // Se non c'è utente, carica da localStorage
      const savedSettings = localStorage.getItem('madroomReminder-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading settings from localStorage:', error);
        }
      }
    }
  }, [user]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    loadSettings
  };
};
