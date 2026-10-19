import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Globe, Database as DbIcon, Mail, Inbox, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import PanelForm from '../components/PanelForm';
import DomainForm from '../components/DomainForm';
import DatabaseForm from '../components/DatabaseForm';
import DatabaseSlots from '../components/DatabaseSlots';
import PecForm from '../components/PecForm';
import SubscriptionForm from '../components/SubscriptionForm';
import AssetRowDesktop from '../components/gestione/AssetRowDesktop';
import AssetRowMobile from '../components/gestione/AssetRowMobile';
import DatabaseSlotsGrid from '../components/gestione/DatabaseSlotsGrid';
import DomainChildCard from '../components/gestione/DomainChildCard';
import GestioneTabs from '../components/gestione/GestioneTabs';
import GestioneToolbar from '../components/gestione/GestioneToolbar';
import TableHeader from '../components/gestione/TableHeader';
import { Toast } from '../components/gestione/helpers';
import type { TabType } from '../components/gestione/helpers';
import type { RowContext, SortBy, SortOrder, TabDef, ViewMode } from '../components/gestione/types';
import { useAssetActions } from '../hooks/useAssetActions';
import { useInfrastructure } from '../hooks/useInfrastructure';
import type { ArubaPanel, AssetRow, Database, Domain, PecEmail, Subscription } from '../types';

const Gestione: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('panels');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetRow | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedPanel, setSelectedPanel] = useState<string>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const api = useInfrastructure();
  const { loading, fetchPanels, fetchPecs, fetchSubscriptions } = api;

  const [panels, setPanels] = useState<ArubaPanel[]>([]);
  const [pecs, setPecs] = useState<PecEmail[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadData = useCallback(async () => {
    const data = await fetchPanels();
    setPanels(data);
    const pecData = await fetchPecs();
    setPecs(pecData);
    const subData = await fetchSubscriptions();
    setSubscriptions(subData);
  }, [fetchPanels, fetchPecs, fetchSubscriptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived data
  const allDomains = panels.flatMap(p => (p.domains || []).map(d => ({ ...d, panelTitle: p.title || p.email })));
  const allDatabases = panels.flatMap(p => (p.databases || []).map(db => ({ ...db, panelTitle: p.title || p.email })));

  const tabs: TabDef[] = [
    { id: 'panels', label: 'Account', icon: User, count: panels.length },
    { id: 'domains', label: 'Domini', icon: Globe, count: allDomains.length },
    { id: 'databases', label: 'Database', icon: DbIcon, count: allDatabases.length },
    { id: 'pec', label: 'PEC', icon: Mail, count: pecs.length },
    { id: 'subscriptions', label: 'Abbonamenti', icon: Tag, count: subscriptions.length },
  ];

  const handleOpenModal = (item: AssetRow | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleOpenSlots = (db: AssetRow) => {
    setSelectedDatabase(db as Database);
    setIsSlotsModalOpen(true);
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string | null | undefined, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    Toast.fire({ title: 'Copiato!' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const {
    handleSave, handleDelete, handleToggleDisablePec,
    handleRenewDomain, handleRenewDatabase, handleRenewPec, handleRenewSubscription,
  } = useAssetActions({ api, activeTab, editingItem, closeModal: handleCloseModal, reload: loadData });

  const filteredItems = useMemo(() => {
    let items: AssetRow[] = activeTab === 'panels' ? panels
      : activeTab === 'domains' ? allDomains
        : activeTab === 'databases' ? allDatabases
          : activeTab === 'pec' ? pecs
            : subscriptions;

    // Apply Panel Filter (not for pec, subscriptions or panels tabs)
    if (selectedPanel !== 'all' && activeTab !== 'panels' && activeTab !== 'pec' && activeTab !== 'subscriptions') {
      items = items.filter((item) => item.panel_id === selectedPanel);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        (item.title || item.name || item.sql_name || item.address || '').toLowerCase().includes(query) ||
        (item.email || item.hostname || '').toLowerCase().includes(query) ||
        (item.panelTitle || '').toLowerCase().includes(query) ||
        (item.associated_domain || '').toLowerCase().includes(query)
      );
    }

    // Grouping logic for Domains (Compact Mode)
    if (activeTab === 'domains' && viewMode === 'compact') {
      const groups: Record<string, AssetRow> = {};

      items.forEach((item) => {
        const key = item.panel_id || 'unassociated';
        if (!groups[key]) {
          groups[key] = {
            ...item,
            id: `group-${key}`,
            name: item.panelTitle || 'Senza Pannello',
            isGroup: true,
            subdomains: [item],
            type: 'Contenitore Pannello',
            expiry_date: null
          };
        } else {
          groups[key].subdomains?.push(item);
        }
      });
      items = Object.values(groups);
    }

    return [...items].sort((a, b) => {
      let valA, valB;

      if (sortBy === 'name') {
        valA = (a.title || a.name || a.sql_name || '').toLowerCase();
        valB = (b.title || b.name || b.sql_name || '').toLowerCase();
      } else if (sortBy === 'expiry') {
        valA = a.expiry_date ? new Date(a.expiry_date).getTime() : 9999999999999;
        valB = b.expiry_date ? new Date(b.expiry_date).getTime() : 9999999999999;
      } else {
        const getDays = (date?: string | null) => date ? Math.ceil((new Date(date).getTime() - new Date().getTime()) / 86400000) : 9999;
        valA = getDays(a.expiry_date);
        valB = getDays(b.expiry_date);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, panels, allDomains, allDatabases, pecs, subscriptions, selectedPanel, searchQuery, viewMode, sortBy, sortOrder]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rowCtx: RowContext = {
    activeTab, viewMode, expandedGroups, visiblePasswords, copiedField,
    toggleGroup, togglePassword, copyToClipboard,
    handleOpenModal, handleOpenSlots, handleDelete,
    handleRenewDomain, handleRenewDatabase, handleRenewPec, handleRenewSubscription, handleToggleDisablePec,
  };

  const buttonLabel = activeTab === 'panels' ? 'Pannello' : activeTab === 'domains' ? 'Dominio' : activeTab === 'databases' ? 'Database' : activeTab === 'pec' ? 'PEC' : 'Abbonamento';

  return (
    <div className="min-h-screen bg-page pt-10 pb-32 px-gutter transition-colors duration-500">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-1">
            <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-fg">
              Gestione <span className="text-accent ">Asset</span>
            </motion.h2>
            <p className="text-muted font-semibold text-sm tracking-widest uppercase">Controllo centralizzato dell'infrastruttura</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={18} /> {buttonLabel === "PEC" ? "Nuova PEC" : "Nuovo " + buttonLabel}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <GestioneTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <GestioneToolbar
            activeTab={activeTab}
            panels={panels}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedPanel={selectedPanel}
            setSelectedPanel={setSelectedPanel}
          />
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            <div className="bg-surface rounded-card border border-divider overflow-hidden">
              {/* Table Wrapper for Horizontal Scroll on Mid-Screens */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="lg:min-w-[900px]">
                  <TableHeader activeTab={activeTab} viewMode={viewMode} />

                  <div className="divide-y divide-divider">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        const renderRow = (rowItem: AssetRow, isChild = false) => (
                          <div key={rowItem.id} className="transition-all">
                            <AssetRowMobile row={rowItem} isChild={isChild} ctx={rowCtx} />
                            <AssetRowDesktop row={rowItem} ctx={rowCtx} />
                          </div>
                        );

                        return (
                          <React.Fragment key={item.id}>
                            {renderRow(item)}
                            {item.isGroup && expandedGroups[item.id] && (
                              <>
                                {/* Mobile & Tablet: Standard List */}
                                <div className="lg:hidden">
                                  {(item.subdomains ?? []).map((child) => renderRow(child, true))}
                                </div>
                                {/* Desktop: Modern Grid */}
                                <div className="hidden lg:grid grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-surface/2 border-t border-divider">
                                  {(item.subdomains ?? []).map((child) => <DomainChildCard key={child.id} sub={child} ctx={rowCtx} />)}
                                </div>
                              </>
                            )}

                            {/* --- DATABASE SLOTS EXPANSION --- */}
                            {activeTab === 'databases' && expandedGroups[item.id] && (
                              <DatabaseSlotsGrid database={item} />
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Inbox className="text-muted" size={48} />
                        <p className="text-sm font-semibold text-muted uppercase tracking-widest">Nessun elemento trovato</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Main CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Modifica Asset' : `Nuovo ${buttonLabel}`}
      >
        {activeTab === 'panels' && (
          <PanelForm initialData={(editingItem ?? undefined) as Partial<ArubaPanel> | undefined} onSubmit={handleSave} loading={loading} />
        )}
        {activeTab === 'domains' && (
          <DomainForm panels={panels} initialData={(editingItem ?? undefined) as Partial<Domain> | undefined} onSubmit={handleSave} loading={loading} />
        )}
        {activeTab === 'databases' && (
          <DatabaseForm panels={panels} initialData={(editingItem ?? undefined) as Partial<Database> | undefined} onSubmit={handleSave} loading={loading} />
        )}
        {activeTab === 'pec' && (
          <PecForm initialData={(editingItem ?? undefined) as Partial<PecEmail> | undefined} onSubmit={handleSave} loading={loading} />
        )}
        {activeTab === 'subscriptions' && (
          <SubscriptionForm initialData={(editingItem ?? undefined) as Partial<Subscription> | undefined} onSubmit={handleSave} loading={loading} />
        )}
      </Modal>

      {/* Database Slots Modal */}
      <Modal
        isOpen={isSlotsModalOpen}
        onClose={() => setIsSlotsModalOpen(false)}
        title="Gestione Slot Database"
        maxWidth="max-w-2xl"
      >
        {selectedDatabase && (
          <DatabaseSlots database={selectedDatabase} onUpdate={loadData} />
        )}
      </Modal>
    </div>
  );
};

export default Gestione;
