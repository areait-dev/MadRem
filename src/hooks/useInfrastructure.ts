import { useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type { ArubaPanel, Domain, Database } from '../types';
import { useAuth } from './useAuth';

export function useInfrastructure() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Panels ---
  const fetchPanels = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    const { data, error } = await supabase
      .from('aruba_panels')
      .select('*, domains(*), databases(*, db_slots(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setLoading(false);
    if (error) {
      setError(error.message);
      return [];
    }
    return data as ArubaPanel[];
  }, [user]);

  const addPanel = async (panel: Partial<ArubaPanel>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('aruba_panels')
      .insert([{ ...panel, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ArubaPanel;
  };

  const updatePanel = async (id: string, updates: Partial<ArubaPanel>) => {
    const { data, error } = await supabase
      .from('aruba_panels')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ArubaPanel;
  };

  const deletePanel = async (id: string) => {
    const { error } = await supabase
      .from('aruba_panels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  };

  // --- Domains ---
  const addDomain = async (domain: Partial<Domain>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('domains')
      .insert([{ ...domain, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Domain;
  };

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    const { data, error } = await supabase
      .from('domains')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as Domain;
  };

  const deleteDomain = async (id: string) => {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  };

  // --- Databases ---
  const addDatabase = async (db: Partial<Database>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('databases')
      .insert([{ ...db, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Database;
  };

  const updateDatabase = async (id: string, updates: Partial<Database>) => {
    const { data, error } = await supabase
      .from('databases')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as Database;
  };

  const deleteDatabase = async (id: string) => {
    const { error } = await supabase
      .from('databases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  };

  // --- Slots ---
  const upsertDBSlots = async (databaseId: string, slots: { slot_number: number, content: string | null, notes: string | null }[]) => {
    if (!user) return null;
    
    const upsertData = slots.map(slot => ({
      ...slot,
      database_id: databaseId,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('db_slots')
      .upsert(upsertData, {
        onConflict: 'database_id,slot_number'
      })
      .select();
    
    if (error) throw error;
    return data;
  };

  return {
    loading,
    error,
    fetchPanels,
    addPanel,
    updatePanel,
    deletePanel,
    addDomain,
    updateDomain,
    deleteDomain,
    addDatabase,
    updateDatabase,
    deleteDatabase,
    upsertDBSlots
  };
}
