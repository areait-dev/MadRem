import { useRef, useState, useEffect } from 'react';
import { Search, Settings, Bell, Grid3X3, List, ChevronDown, AlertCircle, CheckCircle, Trash2, Check } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { ViewMode, DeadlineFilters, Deadline, NotificationItem } from '../types';
import { CATEGORIES, PRIORITIES } from '../types';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: DeadlineFilters;
  setFilters: (filters: DeadlineFilters) => void;
  onAddClick: () => void;
  onSettingsClick: () => void;
  deadlines: Deadline[];
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onDeleteAllNotifications: () => void;
  onDeleteReadNotifications: () => void;
}

function Navbar({ 
  viewMode, 
  setViewMode, 
  filters, 
  setFilters, 
  onSettingsClick,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onDeleteAllNotifications,
}: NavbarProps) {
  // Refs for dropdowns
  const settingsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const { signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Auto-close dropdowns
  const useAutoClose = (
    ref: React.RefObject<HTMLDivElement | null>,
    isOpen: boolean,
    setOpen: (open: boolean) => void
  ) => {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Auto close after 5 seconds
        const timer = setTimeout(() => setOpen(false), 5000);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          clearTimeout(timer);
        };
      }
    }, [isOpen, ref, setOpen]);
  };

  useAutoClose(settingsRef, settingsOpen, setSettingsOpen);
  useAutoClose(notifRef, notifOpen, setNotifOpen);
  useAutoClose(categoryRef, categoryOpen, setCategoryOpen);
  useAutoClose(priorityRef, priorityOpen, setPriorityOpen);

  // Get active filter labels
  const getActiveFilterLabel = (type: 'category' | 'priority' | 'date') => {
    switch (type) {
      case 'category':
        if (filters.category === 'all') return 'Categorie';
        return CATEGORIES.find(c => c.value === filters.category)?.label || 'Categorie';
      case 'priority':
        if (filters.priority === 'all') return 'Priorità';
        return PRIORITIES.find(p => p.value === filters.priority)?.label || 'Priorità';
    }
  };

  return (
    <nav className="fixed sm:top-4 top-2 left-1/2 transform -translate-x-1/2 w-full max-w-screen-sm md:max-w-2xl lg:max-w-6xl z-50 flex flex-row justify-between items-center h-16 glass-navbar rounded-full px-1 sm:px-3 box-border">
      
      {/* Logo */}
      <div className="flex-shrink-0 p-3">
        <div
          className="h-6 w-6 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setShowLogoutConfirm(true)}
          title="Logout"
        >
          <img src="./reminder.png" alt="Logo" className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 flex justify-start min-w-0 mx-2 sm:mx-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900 dark:text-white pointer-events-none" size={18} />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            placeholder="Cerca scadenze..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-transparent text-blue-900 dark:text-white outline-none transition-all duration-300 placeholder:text-blue-900 dark:placeholder:text-white text-sm font-bold"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
        
        {/* Filters - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {/* Category Filter */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-blue-200/60 dark:hover:bg-yellow-600/40 transition-colors duration-200 text-sm font-bold text-blue-900 dark:text-white"
            >
              {getActiveFilterLabel('category')}
              <ChevronDown size={14} className={`transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute right-0 top-12 w-48 rounded-2xl border border-blue-100 dark:border-yellow-700 backdrop-blur-sm overflow-hidden transition-all duration-400 ${categoryOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto dropdown-glow' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
              <button
                onClick={() => { setFilters({ ...filters, category: 'all' }); setCategoryOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm font-bold transition-colors ${filters.category === 'all' ? 'bg-primary-100 dark:bg-accent-800 text-primary-900 dark:text-accent-100' : 'text-blue-800 dark:text-white hover:bg-blue-200/40 dark:hover:bg-yellow-800/40'}`}
              >
                Tutte le categorie
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category.value}
                  onClick={() => { setFilters({ ...filters, category: category.value }); setCategoryOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm font-bold flex items-center gap-2 transition-colors ${filters.category === category.value ? 'bg-primary-100 dark:bg-accent-800 text-primary-900 dark:text-accent-100' : 'text-blue-800 dark:text-white hover:bg-blue-200/40 dark:hover:bg-yellow-800/40'}`}
                >
                  <span className="text-base">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="relative" ref={priorityRef}>
            <button
              onClick={() => setPriorityOpen(!priorityOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-blue-200/60 dark:hover:bg-yellow-600/40 transition-colors duration-200 text-sm font-bold text-blue-900 dark:text-white"
            >
              {getActiveFilterLabel('priority')}
              <ChevronDown size={14} className={`transition-transform duration-200 ${priorityOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute right-0 top-12 w-40 rounded-2xl border border-blue-100 dark:border-yellow-700 backdrop-blur-sm overflow-hidden transition-all duration-400 ${priorityOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto dropdown-glow' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
              <button
                onClick={() => { setFilters({ ...filters, priority: 'all' }); setPriorityOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm font-bold transition-colors ${filters.priority === 'all' ? 'bg-primary-100 dark:bg-accent-800 text-primary-900 dark:text-accent-100' : 'text-blue-800 dark:text-white hover:bg-blue-200/40 dark:hover:bg-yellow-800/40'}`}
              >
                Tutte le priorità
              </button>
              {PRIORITIES.map(priority => (
                <button
                  key={priority.value}
                  onClick={() => { setFilters({ ...filters, priority: priority.value }); setPriorityOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm font-bold transition-colors ${filters.priority === priority.value ? 'bg-primary-100 dark:bg-accent-800 text-primary-900 dark:text-accent-100' : 'text-blue-800 dark:text-white hover:bg-blue-200/40 dark:hover:bg-yellow-800/40'}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priority.color}`}></span>
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Toggle - Hidden on small mobile */}
        <div className="hidden sm:flex">
          <div className="flex bg-blue-100/50 dark:bg-yellow-800/50 rounded-full p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-yellow-700' : 'hover:bg-white/50 dark:hover:bg-yellow-700/50'}`}
            >
              <Grid3X3 size={16} className="text-blue-900 dark:text-white" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-yellow-700' : 'hover:bg-white/50 dark:hover:bg-yellow-700/50'}`}
            >
              <List size={16} className="text-blue-900 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-blue-200/60 dark:hover:bg-yellow-600/40 transition-colors duration-200 outline-none"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-5 w-5 text-blue-900 dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 py-1 min-w-[20px] text-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className={`absolute right-0 top-12 w-80 max-h-96 rounded-2xl border border-blue-100 dark:border-yellow-700 backdrop-blur-md overflow-hidden transition-all duration-400 ${notifOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto dropdown-glow' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
            <div className="px-4 py-3 border-b border-blue-100 dark:border-yellow-700">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-800 dark:text-white font-semibold text-sm">Notifiche</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      title="Segna tutte come lette"
                    >
                      <Check size={12} />
                      Leggi tutte
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                      title="Elimina tutte le notifiche"
                    >
                      <Trash2 size={12} />
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-blue-600 dark:text-yellow-300 text-sm">
                  Nessuna notifica
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 border-b border-blue-50 dark:border-yellow-800 last:border-0 hover:bg-blue-50/50 dark:hover:bg-yellow-800/20 transition-colors ${
                      !notif.read ? 'bg-blue-50/50 dark:bg-yellow-800/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notif.type === 'overdue' && <AlertCircle size={16} className="flex-shrink-0 text-red-500 mt-0.5" />}
                      {notif.type === 'reminder' && <Bell size={16} className="flex-shrink-0 text-blue-500 dark:text-yellow-400 mt-0.5" />}
                      {notif.type === 'completed' && <CheckCircle size={16} className="flex-shrink-0 text-green-500 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-blue-900 dark:text-white font-bold text-sm truncate">{notif.title}</p>
                        <p className="text-blue-600 dark:text-yellow-300 text-xs mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleString('it-IT')}
                        </p>
                      </div>
                      <div className="flex flex-row gap-1">
                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                            title="Segna come letta"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(notif.id)}
                          className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                          title="Elimina notifica"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <button
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-blue-200/60 dark:hover:bg-yellow-600/40 transition-colors duration-200 outline-none"
          onClick={onSettingsClick}
        >
          <Settings className="h-5 w-5 text-blue-900 dark:text-white" />
        </button>
      </div>

      {/* Popup di conferma logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 top-20 z-50 flex items-center justify-center bg-black/10">
          <div
            className="
              rounded-2xl
              border border-blue-100 dark:border-yellow-700
              bg-white/60 dark:bg-yellow-800/40
              backdrop-blur-sm shadow-lg
              p-6 min-w-[220px]
              flex flex-col items-center
            "
          >
            <p className="text-center text-blue-900 dark:text-white mb-4 text-sm font-bold">
              Vuoi davvero uscire?
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-1 rounded-full bg-blue-500 dark:bg-yellow-500 text-white text-sm font-bold hover:bg-blue-600 dark:hover:bg-yellow-600 transition"
                onClick={async () => {
                  await signOut();
                  setShowLogoutConfirm(false);
                }}
              >
                Sì, esci
              </button>
              <button
                className="px-4 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-blue-900 dark:text-white text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup di conferma eliminazione tutte le notifiche */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 top-20 z-50 flex items-center justify-center bg-black/10">
          <div
            className="
              rounded-2xl
              border border-blue-100 dark:border-yellow-700
              bg-white/60 dark:bg-yellow-800/40
              backdrop-blur-sm shadow-lg
              p-6 min-w-[280px]
              flex flex-col items-center
            "
          >
            <p className="text-center text-blue-900 dark:text-white mb-4 text-sm font-bold">
              Eliminare tutte le notifiche?
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-1 rounded-full bg-red-500 dark:bg-red-600 text-white text-sm font-bold hover:bg-red-600 dark:hover:bg-red-700 transition"
                onClick={() => {
                  onDeleteAllNotifications();
                  setShowDeleteAllConfirm(false);
                }}
              >
                Elimina
              </button>
              <button
                className="px-4 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-blue-900 dark:text-white text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;