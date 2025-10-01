import { useState, useEffect, useMemo } from 'react';
import type { Deadline, DeadlineFilters, NotificationItem } from '../types';
import { getDaysUntilDeadline } from '../types';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';

export const useDeadlines = () => {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if a deadline is a "una tantum" subscription
  const isUnaTantumAbbonamento = (deadline: Deadline): boolean => {
    if (deadline.category !== 'abbonamenti') return false;
    
    if (!deadline.description) return false;
    
    const fields = deadline.description.split('|');
    const durata = fields[0] || '';
    
    return !durata; // Se durata è vuota, è una tantum
  };
  
  // Fetch deadlines from Supabase
  const fetchDeadlines = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDeadlines(data || []);
    } catch (err) {
      console.error('Error fetching deadlines:', err);
      setError('Errore nel caricamento delle scadenze');
    } finally {
      setLoading(false);
    }
  };

  // Load deadlines on mount and when user changes
  useEffect(() => {
    fetchDeadlines();
  }, [user]);

  // Update deadline statuses based on current date
  useEffect(() => {
    const updateStatuses = async () => {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueDeadlines = deadlines.filter(deadline => {
        // Escludi abbonamenti una tantum dall'aggiornamento automatico dello status
        if (isUnaTantumAbbonamento(deadline)) return false;
        
        const daysUntil = getDaysUntilDeadline(deadline.due_date);
        return daysUntil < 0 && deadline.status === 'attiva';
      });

      if (overdueDeadlines.length > 0) {
        const { error } = await supabase
          .from('deadlines')
          .update({ status: 'scaduta' })
          .in('id', overdueDeadlines.map(d => d.id));

        if (!error) {
          fetchDeadlines(); // Refresh data
        }
      }
    };

    updateStatuses();
    
    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      updateStatuses();
      // Then set daily interval
      const interval = setInterval(updateStatuses, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timeout);
  }, [deadlines, user]);

  // Generate notifications based on deadlines (for display purposes)
  const notifications = useMemo((): NotificationItem[] => {
    const notifs: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    deadlines.forEach(deadline => {
      // Escludi abbonamenti una tantum dalle notifiche
      if (isUnaTantumAbbonamento(deadline)) return;
      
      const daysUntil = getDaysUntilDeadline(deadline.due_date);
      
      // Overdue notifications
      if (daysUntil < 0 && deadline.status === 'scaduta') {
        const giorni = Math.abs(daysUntil);
        notifs.push({
          id: `overdue-${deadline.id}`,
          title: deadline.title,
          message: `Scaduta ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'} fa`,
          type: 'overdue',
          deadline_id: deadline.id,
          created_at: new Date().toISOString(),
          read: false
        });
      }
      
      // Due today notifications
      if (daysUntil === 0 && deadline.status === 'attiva') {
        notifs.push({
          id: `today-${deadline.id}`,
          title: deadline.title,
          message: 'Scade oggi!',
          type: 'reminder',
          deadline_id: deadline.id,
          created_at: new Date().toISOString(),
          read: false
        });
      }
      
      // Due in 2-5 days notifications
      if (daysUntil >= 2 && daysUntil <= 5 && deadline.status === 'attiva') {
        notifs.push({
          id: `urgent-${deadline.id}`,
          title: deadline.title,
          message: `Scade tra ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'}`,
          type: 'reminder',
          deadline_id: deadline.id,
          created_at: new Date().toISOString(),
          read: false
        });
      }
      
      // Due tomorrow notifications
      if (daysUntil === 1 && deadline.status === 'attiva') {
        notifs.push({
          id: `tomorrow-${deadline.id}`,
          title: deadline.title,
          message: 'Scade domani',
          type: 'reminder',
          deadline_id: deadline.id,
          created_at: new Date().toISOString(),
          read: false
        });
      }
    });

    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deadlines]);

  // Filter deadlines
  const filterDeadlines = (filters: DeadlineFilters): Deadline[] => {
    return deadlines.filter(deadline => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!deadline.title.toLowerCase().includes(searchTerm) && 
            !deadline.description?.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && deadline.category !== filters.category) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && deadline.priority !== filters.priority) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && deadline.status !== filters.status) {
        return false;
      }

      return true;
    });
  };

  // CRUD operations
  const addDeadline = async (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'> & {
    url?: string;
    cliente?: string;
    rif_contratto?: string;
    hosting?: string;
    dominio?: string;
    mail?: string;
    tipologia?: string;
    tipo_contratto?: string;
    piattaforma?: string;
  }) => {
    if (!user) throw new Error('Utente non autenticato');
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .insert({
          title: deadline.title,
          description: deadline.description,
          due_date: deadline.due_date,
          category: deadline.category,
          priority: deadline.priority,
          status: deadline.status,
          color: deadline.color,
          user_id: user.id,
          // Campi specifici
          url: deadline.url || null,
          cliente: deadline.cliente || null,
          rif_contratto: deadline.rif_contratto || null,
          hosting: deadline.hosting || null,
          dominio: deadline.dominio || null,
          mail: deadline.mail || null,
          tipologia: deadline.tipologia || null,
          tipo_contratto: deadline.tipo_contratto || null,
          piattaforma: deadline.piattaforma || null
        })
        .select()
        .single();

      if (error) throw error;
      
      setDeadlines(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding deadline:', err);
      setError('Errore durante l\'aggiunta della scadenza');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDeadline = async (id: string, updates: Partial<Deadline> & {
    url?: string;
    cliente?: string;
    rif_contratto?: string;
    hosting?: string;
    dominio?: string;
    mail?: string;
    tipologia?: string;
    tipo_contratto?: string;
    piattaforma?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .update({
          ...updates,
          // Campi specifici
          url: updates.url || null,
          cliente: updates.cliente || null,
          rif_contratto: updates.rif_contratto || null,
          hosting: updates.hosting || null,
          dominio: updates.dominio || null,
          mail: updates.mail || null,
          tipologia: updates.tipologia || null,
          tipo_contratto: updates.tipo_contratto || null,
          piattaforma: updates.piattaforma || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDeadlines(prev => prev.map(deadline => 
        deadline.id === id ? data : deadline
      ));
      
      return data;
    } catch (err) {
      console.error('Error updating deadline:', err);
      setError('Errore durante l\'aggiornamento della scadenza');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeadline = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('deadlines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDeadlines(prev => prev.filter(deadline => deadline.id !== id));
    } catch (err) {
      console.error('Error deleting deadline:', err);
      setError('Errore durante l\'eliminazione della scadenza');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string) => {
    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) return;

    const newStatus = deadline.status === 'completata' ? 'attiva' : 'completata';
    await updateDeadline(id, { status: newStatus });
  };

  return {
    deadlines,
    notifications,
    loading,
    error,
    filterDeadlines,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    toggleComplete,
    setError,
    fetchDeadlines // Export for manual refresh
  };
};