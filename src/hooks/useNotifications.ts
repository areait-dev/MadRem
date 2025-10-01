import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { NotificationItem } from '../types';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica le notifiche dal database
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle notifiche');
    } finally {
      setLoading(false);
    }
  };

  // Crea una nuova notifica
  const createNotification = async (notification: Omit<NotificationItem, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          deadline_id: notification.deadline_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err instanceof Error ? err.message : 'Errore nella creazione della notifica');
      throw err;
    }
  };

  // Marca una notifica come letta
  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Notification marked as read in database:', data);
      
      // Aggiorna lo stato locale
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Errore nel marcare la notifica come letta');
    }
  };

  // Marca tutte le notifiche come lette
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      console.log('Marking all notifications as read');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('All notifications marked as read in database:', data);
      
      // Aggiorna lo stato locale
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Errore nel marcare tutte le notifiche come lette');
    }
  };

  // Elimina una notifica singola
  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('Deleting notification:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Notification deleted from database');
      
      // Aggiorna lo stato locale
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della notifica');
    }
  };

  // Elimina tutte le notifiche
  const deleteAllNotifications = async () => {
    if (!user) return;

    try {
      console.log('Deleting all notifications');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('All notifications deleted from database');
      
      // Aggiorna lo stato locale
      setNotifications([]);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione di tutte le notifiche');
    }
  };

  // Elimina solo le notifiche lette
  const deleteReadNotifications = async () => {
    if (!user) return;

    try {
      console.log('Deleting read notifications');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Read notifications deleted from database');
      
      // Aggiorna lo stato locale
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione delle notifiche lette');
    }
  };

  // Carica le notifiche quando l'utente cambia
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // RIMUOVI il real-time subscription per evitare conflitti
  // useEffect(() => {
  //   if (!user) return;
  //   const channel = supabase.channel('notifications')...
  // }, [user]);

  // Genera notifiche basate sulle scadenze e impostazioni utente
  const generateNotificationsFromDeadlines = async (deadlines: any[]) => {
    if (!user || deadlines.length === 0) return;

    try {
      // Ottieni le impostazioni utente per i giorni di promemoria
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('reminder_days')
        .eq('user_id', user.id)
        .single();

      const reminderDays = userSettings?.reminder_days || 7; // Default 7 giorni
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newNotifications: Omit<NotificationItem, 'id' | 'created_at'>[] = [];

      deadlines.forEach((deadline: any) => {
        // Escludi abbonamenti una tantum dalle notifiche
        if (deadline.category === 'abbonamenti' && !deadline.description?.split('|')[0]) {
          return;
        }

        const dueDate = new Date(deadline.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let shouldCreateNotification = false;
        let notificationType: 'reminder' | 'overdue' = 'reminder';
        let message = '';

        // Scadute
        if (daysUntil < 0 && deadline.status === 'scaduta') {
          shouldCreateNotification = true;
          notificationType = 'overdue';
          const giorni = Math.abs(daysUntil);
          message = `Scaduta ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'} fa`;
        }
        // Scade oggi
        else if (daysUntil === 0 && deadline.status === 'attiva') {
          shouldCreateNotification = true;
          message = 'Scade oggi!';
        }
        // Scade domani
        else if (daysUntil === 1 && deadline.status === 'attiva') {
          shouldCreateNotification = true;
          message = 'Scade domani';
        }
        // Entro i giorni di promemoria configurati
        else if (daysUntil >= 2 && daysUntil <= reminderDays && deadline.status === 'attiva') {
          shouldCreateNotification = true;
          message = `Scade tra ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'}`;
        }

        if (shouldCreateNotification) {
          newNotifications.push({
            title: deadline.title,
            message,
            type: notificationType,
            deadline_id: deadline.id,
            read: false
          });
        }
      });

      // Salva le nuove notifiche nel database (evita duplicati)
      if (newNotifications.length > 0) {
        for (const notif of newNotifications) {
          // Controlla se esiste già una notifica simile (più specifico)
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('deadline_id', notif.deadline_id)
            .eq('type', notif.type)
            .eq('title', notif.title)
            .eq('message', notif.message)
            .single();

          // Se non esiste, creala
          if (!existing) {
            console.log('Creating new notification:', notif);
            await createNotification(notif);
          } else {
            console.log('Notification already exists, skipping:', notif.title);
          }
        }
      }
    } catch (err) {
      console.error('Error generating notifications from deadlines:', err);
    }
  };

  // Calcola il numero di notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    deleteReadNotifications,
    generateNotificationsFromDeadlines
  };
};


