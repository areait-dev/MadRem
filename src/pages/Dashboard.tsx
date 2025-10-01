import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import FilterChips from '../components/FilterChips';
import FilterSidebar, { type FilterType } from '../components/FilterSidebar';
import DeadlineCard from '../components/DeadlineCard';
import ViewToggle from '../components/ViewToggle';
import AddDeadlineModal from '../components/AddDeadlineModal';
import SettingsModal from '../components/SettingsModal';
import { useDeadlines } from '../hooks/useDeadlines';
import { useNotifications } from '../hooks/useNotifications';
import type { ViewMode, DeadlineFilters, Deadline, DeadlineCategory } from '../types';
import { CATEGORIES } from '../types';

const Dashboard = () => {
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<DeadlineFilters>({
    category: 'all',
    priority: 'all',
    status: 'all',
    // dateRange: 'all',
    search: ''
  });

  // Sidebar state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryActions, setShowCategoryActions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DeadlineCategory | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deadlineToDelete, setDeadlineToDelete] = useState<Deadline | null>(null);

  // Audio per il suono di eliminazione
  const [deleteAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/delete.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  const [renewAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/success.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  const [closeAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/close.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  const [reactivateAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/update.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  // Data
  const { 
    deadlines, 
    loading, 
    error, 
    filterDeadlines, 
    addDeadline, 
    updateDeadline, 
    deleteDeadline, 
    toggleComplete 
  } = useDeadlines();

  // Notifications from database
  const { 
    notifications: dbNotifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    deleteReadNotifications,
    generateNotificationsFromDeadlines,
  } = useNotifications();

  // Genera notifiche SOLO quando si aggiunge una nuova scadenza
  const handleSaveDeadline = async (deadlineData: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingDeadline) {
        await updateDeadline(editingDeadline.id, deadlineData);
        setEditingDeadline(null);
      } else {
        await addDeadline(deadlineData);
        // Genera notifiche solo per la nuova scadenza
        setTimeout(() => {
          generateNotificationsFromDeadlines([deadlineData]);
        }, 1000);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving deadline:', error);
    }
  };

  // Funzione per riprodurre il suono di eliminazione
  const playDeleteSound = () => {
    if (deleteAudio) {
      deleteAudio.currentTime = 0;
      deleteAudio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

  const playRenewSound = () => {
    if (renewAudio) {
      renewAudio.currentTime = 0;
      renewAudio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

  const playCloseSound = () => {
    if (closeAudio) {
      closeAudio.currentTime = 0;
      closeAudio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

  const playReactivateSound = () => {
    if (reactivateAudio) {
      reactivateAudio.currentTime = 0;
      reactivateAudio.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    }
  };

  // Helper function to check if a deadline is a "una tantum" subscription
const isUnaTantumAbbonamento = (deadline: Deadline): boolean => {
  if (deadline.category !== 'abbonamenti') return false;
  
  if (!deadline.description) return false;
  
  const fields = deadline.description.split('|');
  const durata = fields[0] || '';
  
  return !durata; // Se durata è vuota, è una tantum
};

  // Filter deadlines based on sidebar selection
  const getFilteredDeadlines = () => {
    let filtered = deadlines;
    
    // Apply sidebar filter
    switch (activeFilter) {
      case 'active':
        filtered = deadlines.filter(d => {
          // Escludi abbonamenti una tantum dai filtri di scadenza
          if (isUnaTantumAbbonamento(d)) return false;
          
          if (d.status !== 'attiva') return false;
          const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil > 5;
        });
        break;
      case 'urgent':
        filtered = deadlines.filter(d => {
          // Escludi abbonamenti una tantum dai filtri di scadenza
          if (isUnaTantumAbbonamento(d)) return false;
          
          if (d.status !== 'attiva') return false;
          const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 5 && daysUntil >= 0;
        });
        break;
      case 'overdue':
        filtered = deadlines.filter(d => {
          // Escludi abbonamenti una tantum dai filtri di scadenza
          if (isUnaTantumAbbonamento(d)) return false;
          
          return d.status === 'scaduta';
        });
        break;
      case 'closed':
        filtered = deadlines.filter(d => d.status === 'completata');
        break;
      default:
        filtered = deadlines;
    }
    
    // Apply other filters (category, priority, search)
    return filterDeadlines({ ...filters, status: 'all' }).filter(d => {
      if (activeFilter === 'all') return true;
      return filtered.includes(d);
    });
  };

  // Sort deadlines by urgency
  const sortedDeadlines = [...getFilteredDeadlines()].sort((a, b) => {
    // Completed items go to the end
    if (a.status === 'completata' && b.status !== 'completata') return 1;
    if (b.status === 'completata' && a.status !== 'completata') return -1;
    
    // Overdue items first
    const aOverdue = new Date(a.due_date) < new Date() && a.status !== 'completata';
    const bOverdue = new Date(b.due_date) < new Date() && b.status !== 'completata';
    if (aOverdue && !bOverdue) return -1;
    if (bOverdue && !aOverdue) return 1;
    
    // Then by priority
    const priorityOrder = { alta: 3, media: 2, bassa: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // Handle edit deadline
  const handleEditDeadline = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setShowAddModal(true);
  };

  // Rinnova abbonamenti: sposta la scadenza in avanti in base alla durata
  const addMonths = (dateStr: string, months: number) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const handleRenew = async (deadline: Deadline) => {
    try {
      const [durata = ''] = (deadline.description || '').split('|');
      const months = durata === '1m' ? 1 : durata === '3m' ? 3 : durata === '6m' ? 6 : durata === '12m' ? 12 : 0;
      if (months <= 0) return;
      const baseIsPast = new Date(deadline.due_date) < new Date();
      const base = baseIsPast ? new Date().toISOString().split('T')[0] : deadline.due_date;
      const nextDue = addMonths(base, months);
      await updateDeadline(deadline.id, { due_date: nextDue, status: 'attiva' });
      // Riproduci il suono di rinnovo
      playRenewSound();
    } catch (e) {
      console.error('Error renewing deadline:', e);
    }
  };

  // Handle delete deadline - mostra la finestra di conferma
  const handleDeleteDeadline = (deadline: Deadline) => {
    setDeadlineToDelete(deadline);
    setShowDeleteConfirm(true);
  };

  // Conferma eliminazione
  const confirmDelete = async () => {
    if (deadlineToDelete) {
      try {
        await deleteDeadline(deadlineToDelete.id);
        // Riproduci il suono di eliminazione
        playDeleteSound();
      } catch (error) {
        console.error('Error deleting deadline:', error);
      }
    }
    setShowDeleteConfirm(false);
    setDeadlineToDelete(null);
  };

  // Annulla eliminazione
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeadlineToDelete(null);
  };

  // Handle sidebar filter changes
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    
    // Update the main filters based on sidebar selection
    let newStatus = 'all';
    switch (filter) {
      case 'active':
        newStatus = 'attiva';
        break;
      case 'urgent':
        newStatus = 'attiva';
        break;
      case 'overdue':
        newStatus = 'scaduta';
        break;
      case 'closed':
        newStatus = 'completata';
        break;
      default:
        newStatus = 'all';
    }
    
    setFilters(prev => ({
      ...prev,
      status: newStatus as 'all' | 'attiva' | 'scaduta' | 'completata'
    }));
  };

  // Get empty state message
  const getEmptyStateMessage = () => {
    if (filters.search) {
      return `Nessuna scadenza trovata per "${filters.search}"`;
    }
    if (filters.category !== 'all' || filters.priority !== 'all') {
      return 'Nessuna scadenza corrisponde ai filtri selezionati';
    }
    return 'Nessuna scadenza presente';
  };

  // TIMER per auto-chiusura delle categorie dopo 3 secondi
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showCategoryActions) {
      timerRef.current = setTimeout(() => {
        setShowCategoryActions(false);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showCategoryActions]);

  // Aggiungiamo una funzione wrapper per toggleComplete dopo handleRenew
  const handleToggleComplete = async (id: string) => {
    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) return;

    const isClosing = deadline.status !== 'completata';
    
    await toggleComplete(id);
    
    // Riproduci il suono appropriato
    if (isClosing) {
      playCloseSound(); // Chiudendo la scadenza
    } else {
      playReactivateSound(); // Riattivando la scadenza
    }
  };

  return (
    <div className="min-h-screen pb-8 mt-10 flex flex-col">
      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        filters={filters}
        setFilters={setFilters}
        onAddClick={() => {
          setEditingDeadline(null);
          setShowCategoryActions(true);
        }}
        onSettingsClick={() => setShowSettingsModal(true)}
        deadlines={deadlines}
        notifications={dbNotifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
        onDeleteAllNotifications={deleteAllNotifications}
        onDeleteReadNotifications={deleteReadNotifications}
      />

      {/* Main Layout - Responsive Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 mt-20">
        {/* Filter Sidebar - Solo desktop */}
        <div className="hidden md:flex justify-center">
          <FilterSidebar
            deadlines={deadlines}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col w-full">
          {/* Filter Chips - Solo mobile/tablet */}
          <div className="md:hidden px-4 pt-2">
            <FilterChips
              filters={filters}
              setFilters={setFilters}
              deadlines={deadlines}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6 flex-1 w-full">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse-soft text-blue-600 dark:text-yellow-400 text-lg font-medium">
                  Caricamento scadenze...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="glass-card p-6 text-center text-red-600 dark:text-red-400 mb-6">
                <p className="font-medium">Errore nel caricamento delle scadenze</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            )}

            {/* Content */}
            {!loading && !error && (
              <>
                {/* Deadlines Grid/List */}
                {sortedDeadlines.length > 0 ? (
                  <div className={`
                    ${viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-stretch' 
                      : 'space-y-4'
                    }
                  `}>
                    {sortedDeadlines.map(deadline => (
                      <DeadlineCard
                        key={deadline.id}
                        deadline={deadline}
                        viewMode={viewMode}
                        onEdit={handleEditDeadline}
                        onDelete={handleDeleteDeadline}
                        onToggleComplete={handleToggleComplete}
                        onRenew={handleRenew}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="rounded-full p-5 mb-4">
                      <div className="text-6xl">
                        {/* Calendar SVG icon, fixed for React/TS */}
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#000000"
                          width="2em"
                          height="2em"
                        >
                          <g>
                            <path d="M5 4c-1.1046 0-2 .9-2 2v14c0 1.1.8954 2 2 2h14c1.105 0 2-.9 2-2V6c0-1.1-.895-2-2-2H5z" fill="#ecf0f1"/>
                            <rect x="3" y="8" width="18" height="2" fill="#e74c3c"/>
                            <circle cx="7" cy="6" r="1.5" fill="#c0392b"/>
                            <circle cx="17" cy="6" r="1.5" fill="#c0392b"/>
                            <rect x="6" y="2" width="2" height="4" rx="1" fill="#95a5a6"/>
                            <rect x="16" y="2" width="2" height="4" rx="1" fill="#95a5a6"/>
                            <g fill="#bdc3c7">
                              <rect x="5" y="11" width="2" height="2"/>
                              <rect x="8" y="11" width="2" height="2"/>
                              <rect x="11" y="11" width="2" height="2"/>
                              <rect x="14" y="11" width="2" height="2"/>
                              <rect x="17" y="11" width="2" height="2"/>
                              <rect x="5" y="14" width="2" height="2"/>
                              <rect x="8" y="14" width="2" height="2"/>
                              <rect x="11" y="14" width="2" height="2"/>
                              <rect x="14" y="14" width="2" height="2"/>
                              <rect x="17" y="14" width="2" height="2"/>
                              <rect x="5" y="17" width="2" height="2"/>
                              <rect x="8" y="17" width="2" height="2"/>
                              <rect x="11" y="17" width="2" height="2"/>
                              <rect x="14" y="17" width="2" height="2"/>
                              <rect x="17" y="17" width="2" height="2"/>
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900 dark:text-white mb-2">
                      {getEmptyStateMessage()}
                    </h3>
                    <p className="text-blue-600 dark:text-yellow-300 mb-8 max-w-md">
                      {deadlines.length === 0 
                        ? '' 
                        : 'Prova a modificare i filtri per vedere più risultati.'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {/* Floating Action Button + Category Speed Dial */}
      <div className="fixed bottom-20 sm:right-10 flex flex-col items-end z-30">
        {showCategoryActions && (
          <div
            className="relative right-4 z-20"
            onClick={() => setShowCategoryActions(false)}
            style={{ background: 'transparent' }}
          />
        )}
        <div className="relative left-4 z-20">
          {showCategoryActions && (
            <div className="flex flex-col items-end mb-2 space-y-2 transition-all duration-300">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`
                    flex items-center gap-2 px-2 py-2 rounded-full
                    border border-blue-100 dark:border-yellow-700
                    bg-white/60 dark:bg-yellow-800/40
                    backdrop-blur-sm shadow
                    text-blue-900 dark:text-white
                    hover:bg-blue-200/60 dark:hover:bg-yellow-600/40
                    hover:scale-110 transition
                  `}
                  style={{ minWidth: 44 }}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setShowAddModal(true);
                    setShowCategoryActions(false);
                    setEditingDeadline(null);
                  }}
                  aria-label={cat.label}
                  title={cat.label}
                >
                  <span className={`text-2xl`}>{cat.icon}</span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowCategoryActions(v => !v)}
            className={`w-14 h-14 bg-primary-500 hover:bg-primary-600 dark:bg-accent-500 dark:hover:bg-accent-600 text-white rounded-full shadow-2xl shadow-primary-500/40 dark:shadow-accent-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
            aria-label="Aggiungi scadenza"
            type="button"
          >
            <Plus size={24} className={`transition-transform duration-300 ${showCategoryActions ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDeadlineModal
          deadline={editingDeadline}
          onSave={handleSaveDeadline}
          onClose={() => {
            setShowAddModal(false);
            setEditingDeadline(null);
            setSelectedCategory(null);
          }}
          selectedCategory={selectedCategory}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Popup di conferma eliminazione */}
      {showDeleteConfirm && (
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
              Vuoi davvero eliminare la scadenza?
            </p>
            {deadlineToDelete && (
              <p className="text-center text-blue-600 dark:text-yellow-300 mb-4 text-md">
                {deadlineToDelete.title}
              </p>
            )}
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-1 rounded-full bg-red-500 dark:bg-red-600 text-white text-sm font-bold hover:bg-red-600 dark:hover:bg-red-700 transition"
                onClick={confirmDelete}
              >
                Elimina
              </button>
              <button
                className="px-4 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-blue-900 dark:text-white text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={cancelDelete}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;