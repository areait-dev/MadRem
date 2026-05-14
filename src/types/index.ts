// --- Aruba Infrastructure Types ---

export type DomainType = 'main' | 'third_level';

export interface ArubaPanel {
  id: string;
  user_id: string;
  title: string | null;
  email: string;
  password_encrypted: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  domains?: Domain[];
  databases?: Database[];
}

export interface Domain {
  id: string;
  panel_id: string;
  user_id: string;
  name: string;
  type: DomainType;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Database {
  id: string;
  panel_id: string;
  user_id: string;
  sql_name: string;
  password_encrypted: string;
  hostname: string | null;
  associated_domain: string | null;
  sql_version: string | null;
  size_gb: number | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  db_slots?: DBSlot[];
}

export interface DBSlot {
  id: string;
  database_id: string;
  user_id: string;
  slot_number: number;
  content: string | null;
  notes: string | null;
  created_at: string;
}

export interface AppSettings {
  email: string;
  reminderDays: number;
  reminderTime: string; // HH:mm format
  reminderFrequency: 'once' | 'daily';
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'overdue' | 'completed';
  deadline_id?: string;
  created_at: string;
  read: boolean;
}