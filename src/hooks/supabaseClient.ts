import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkczjbzgpscfxjuvdnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY3pqYnpncHNjZnhqdXZkbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjI0MjIsImV4cCI6MjA2ODkzODQyMn0.ObDrXnQ87pfju5OBOl3OtMngnE0NNPAJ6ZF1NlbsWGU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);