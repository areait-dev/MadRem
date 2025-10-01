export interface Deadline {
    id: string;
    title: string;
    description?: string;
    due_date: string; // ISO date string
    category: DeadlineCategory;
    priority: DeadlinePriority;
    status: DeadlineStatus;
    color: string;
    user_id?: string; // Add this field
    created_at: string;
    updated_at: string;
    // Campi specifici
    url?: string;
    cliente?: string;
    rif_contratto?: string;
    hosting?: string;
    dominio?: string;
    mail?: string;
    tipologia?: string;
    tipo_contratto?: string;
    piattaforma?: string;
    durata?: '1m' | '3m' | '6m' | '12m';
  }
  
  export type DeadlineCategory = 
    | 'dominio'
    | 'powermail' 
    | 'contratti'
    | 'social'  
    | 'abbonamenti'
  export type DeadlinePriority = 'bassa' | 'media' | 'alta';
  
  export type DeadlineStatus = 'attiva' | 'completata' | 'scaduta';
  
  export type ViewMode = 'grid' | 'list';
  
  // export type FilterType = 'all' | 'today' | 'week' | 'overdue' | DeadlineCategory | DeadlinePriority;
  
  export interface DeadlineFilters {
    category: DeadlineCategory | 'all';
    priority: DeadlinePriority | 'all';
    status: DeadlineStatus | 'all';
    // dateRange: 'all' | 'today' | 'week' | 'month';
    search: string;
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
    deadline_id: string;
    created_at: string;
    read: boolean;
  }
  
  // Utility types
  export interface CategoryInfo {
    value: DeadlineCategory;
    label: string;
    icon: string;
    color: string;
  }
  
  export interface PriorityInfo {
    value: DeadlinePriority;
    label: string;
    color: string;
    textColor: string;
  }
  
  // Constants
  export const CATEGORIES: CategoryInfo[] = [
    { value: 'dominio', label: 'Dominio', icon: '🔗', color: 'bg-yellow-500' },
    { value: 'powermail', label: 'PowerMail', icon: '✉️', color: 'bg-blue-500' },
    { value: 'contratti', label: 'Contratti', icon: '📝', color: 'bg-purple-500' },
    { value: 'social', label: 'Social', icon: '📱', color: 'bg-green-500' },
    { value: 'abbonamenti', label: 'Abbonamenti', icon: '🔁', color: 'bg-orange-500' },
  ];
  
  export const PRIORITIES: PriorityInfo[] = [
    { value: 'bassa', label: 'Bassa', color: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200' },
    { value: 'media', label: 'Media', color: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200' },
    { value: 'alta', label: 'Alta', color: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200' },
  ];
  
  // Helper functions
  export const getCategoryInfo = (category: DeadlineCategory): CategoryInfo => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };
  
  export const getPriorityInfo = (priority: DeadlinePriority): PriorityInfo => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[0];
  };
  
  export const getDaysUntilDeadline = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  export const formatDeadlineDate = (dueDate: string): string => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  export const getDeadlineStatus = (dueDate: string, currentStatus: DeadlineStatus): DeadlineStatus => {
    if (currentStatus === 'completata') return 'completata';
    
    const daysUntil = getDaysUntilDeadline(dueDate);
    return daysUntil < 0 ? 'scaduta' : 'attiva';
  };