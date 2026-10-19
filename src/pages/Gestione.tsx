import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Globe, Calendar, HardDrive, Database as DbIcon, Mail, Inbox,
  Trash2, Edit3, Layers, Eye, EyeOff, Copy, Check,
  User, Lock, SortAsc, SortDesc, List, LayoutGrid, Filter, FileText, ChevronDown as ChevronDownIcon, Tag, RefreshCw,
  Ban, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';
import PanelForm from '../components/PanelForm';
import DomainForm from '../components/DomainForm';
import DatabaseForm from '../components/DatabaseForm';
import DatabaseSlots from '../components/DatabaseSlots';
import PecForm from '../components/PecForm';
import SubscriptionForm from '../components/SubscriptionForm';
import { useInfrastructure } from '../hooks/useInfrastructure';
import type { ArubaPanel, AssetRow, Database, DBSlot, Domain, PecEmail, Subscription } from '../types';
import { getErrorMessage } from '../utils/errors';

type TabType = 'panels' | 'domains' | 'databases' | 'pec' | 'subscriptions';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: false,
  background: 'transparent',
  customClass: {
    popup: 'ds-toast'
  }
});

const confirmDialog = async (type: string, name: string) => {
  return Swal.fire({
    html: `
      <div class="flex items-center gap-4 text-left">
        <div class="w-12 h-12 text-error rounded-card flex items-center justify-center shrink-0 border border-error/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-semibold text-error uppercase tracking-wider mb-0.5">ELIMINARE IL ${type}?</span>
          <span class="text-base font-semibold text-fg leading-tight truncate">${name}</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'sì',
    cancelButtonText: 'NO',
    reverseButtons: false,
    background: 'transparent',
    customClass: {
      popup: 'ds-popup',
      confirmButton: 'ds-danger-btn',
      cancelButton: 'ds-cancel-btn',
      actions: 'ds-actions',
    },
    buttonsStyling: false,
  });
};

const getExpiryColor = (date?: string | null) => {
  if (!date) return 'slate';
  const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'red';
  if (days < 15) return 'red';
  if (days < 45) return 'orange';
  return 'green';
};

const getDomainTypeLabel = (type: string = '') => {
  if (type === 'main') return 'Dominio Principale';
  if (type === 'third_level' || type === 'subdomain') return 'Terzo Livello';
  return type;
};

const Gestione: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('panels');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetRow | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'extended' | 'compact'>('compact');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedPanel, setSelectedPanel] = useState<string>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    loading,
    fetchPanels,
    addPanel, updatePanel, deletePanel,
    addDomain, updateDomain, deleteDomain,
    addDatabase, updateDatabase, deleteDatabase,
    fetchPecs, addPec, updatePec, deletePec,
    fetchSubscriptions, addSubscription, updateSubscription, deleteSubscription,
  } = useInfrastructure();

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

  const tabs = [
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

  const handleSave = async (data: Partial<AssetRow>) => {
    try {
      if (activeTab === 'panels') {
        if (editingItem) await updatePanel(editingItem.id, data as Partial<ArubaPanel>);
        else await addPanel(data as Partial<ArubaPanel>);
      } else if (activeTab === 'domains') {
        if (editingItem) await updateDomain(editingItem.id, data as Partial<Domain>);
        else await addDomain(data as Partial<Domain>);
      } else if (activeTab === 'databases') {
        if (editingItem) await updateDatabase(editingItem.id, data as Partial<Database>);
        else await addDatabase(data as Partial<Database>);
      } else if (activeTab === 'pec') {
        if (editingItem) await updatePec(editingItem.id, data as Partial<PecEmail>);
        else await addPec(data as Partial<PecEmail>);
      } else if (activeTab === 'subscriptions') {
        if (editingItem) await updateSubscription(editingItem.id, data as Partial<Subscription>);
        else await addSubscription(data as Partial<Subscription>);
      }

      Toast.fire({ title: 'Salvato!' });
      handleCloseModal();
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

  const handleDelete = async (item: AssetRow) => {
    const type = activeTab === 'panels' ? 'Pannello' : activeTab === 'domains' ? 'Dominio' : activeTab === 'databases' ? 'Database' : activeTab === 'pec' ? 'PEC' : 'Abbonamento';
    const name = item.title || item.name || item.sql_name || item.address || '';
    const result = await confirmDialog(type, name);

    if (result.isConfirmed) {
      try {
        if (activeTab === 'panels') await deletePanel(item.id);
        else if (activeTab === 'domains') await deleteDomain(item.id);
        else if (activeTab === 'databases') await deleteDatabase(item.id);
        else if (activeTab === 'pec') await deletePec(item.id);
        else if (activeTab === 'subscriptions') await deleteSubscription(item.id);

        Toast.fire({ title: 'Eliminato!' });
        loadData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Errore',
          text: getErrorMessage(err),
          customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
        });
      }
    }
  };

  const handleRenewSubscription = async (sub: AssetRow) => {
    try {
      const today = new Date();
      let baseDate = sub.expiry_date ? new Date(sub.expiry_date) : today;
      if (baseDate < today) {
        baseDate = today;
      }

      const monthsToAdd =
        sub.billing_cycle === '1m' ? 1 :
          sub.billing_cycle === '3m' ? 3 :
            sub.billing_cycle === '6m' ? 6 : 12;

      const newDate = new Date(baseDate);
      newDate.setMonth(newDate.getMonth() + monthsToAdd);
      const newExpiryDate = newDate.toISOString().split('T')[0];

      await updateSubscription(sub.id, { expiry_date: newExpiryDate });
      Toast.fire({ title: 'Abbonamento Rinnovato!' });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore durante il rinnovo',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

  const handleRenewDomain = async (domain: AssetRow) => {
    try {
      const today = new Date();
      let baseDate = domain.expiry_date ? new Date(domain.expiry_date) : today;
      if (baseDate < today) {
        baseDate = today;
      }

      const newDate = new Date(baseDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      const newExpiryDate = newDate.toISOString().split('T')[0];

      await updateDomain(domain.id, { expiry_date: newExpiryDate });
      Toast.fire({ title: 'Dominio Rinnovato!' });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore durante il rinnovo',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

  const handleRenewDatabase = async (db: AssetRow) => {
    try {
      const today = new Date();
      let baseDate = db.expiry_date ? new Date(db.expiry_date) : today;
      if (baseDate < today) {
        baseDate = today;
      }

      const newDate = new Date(baseDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      const newExpiryDate = newDate.toISOString().split('T')[0];

      await updateDatabase(db.id, { expiry_date: newExpiryDate });
      Toast.fire({ title: 'Database Rinnovato!' });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore durante il rinnovo',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

  const handleRenewPec = async (pec: AssetRow) => {
    try {
      const today = new Date();
      let baseDate = pec.expiry_date ? new Date(pec.expiry_date) : today;
      if (baseDate < today) {
        baseDate = today;
      }

      const newDate = new Date(baseDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      const newExpiryDate = newDate.toISOString().split('T')[0];

      await updatePec(pec.id, { expiry_date: newExpiryDate });
      Toast.fire({ title: 'PEC Rinnovata!' });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore durante il rinnovo',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

  const handleToggleDisablePec = async (pec: AssetRow) => {
    try {
      const nextDisabledState = !pec.is_disabled;
      await updatePec(pec.id, { is_disabled: nextDisabledState });
      Toast.fire({ title: nextDisabledState ? 'PEC Disabilitata!' : 'PEC Riabilitata!' });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: getErrorMessage(err),
        customClass: { popup: 'ds-popup', confirmButton: 'ds-confirm-btn' },
        buttonsStyling: false,
      });
    }
  };

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
          {/* Top Row: Navigation Tabs */}
          <div className="bg-surface p-2 sm:p-2.5 rounded-card border border-divider">
            <div className="flex p-1 bg-surface rounded-full w-full justify-between items-center overflow-x-auto no-scrollbar gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 xl:px-6 py-2.5 rounded-full text-xs sm:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-surface text-link'
                    : 'text-muted hover:text-muted'
                    }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span>{tab.label}</span>
                  <span className="px-1.5 py-0.5 rounded-lg bg-line/20 text-xs sm:text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Search Input (Left Column) + Contextual Controls (Right Column) */}
          <div className="bg-surface p-2 sm:p-3 rounded-card border border-divider flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left Column: Search Bar */}
            <div className="relative w-full md:flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-link transition-colors" size={18} />
              <input
                type="text"
                placeholder={`Cerca tra ${activeTab === 'panels' ? 'i pannelli' : activeTab === 'domains' ? 'i domini' : activeTab === 'databases' ? 'i database' : activeTab === 'pec' ? 'le PEC' : 'gli abbonamenti'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-transparent border-transparent rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider outline-none transition-all placeholder:text-muted"
              />
            </div>

            {/* Right Column: Contextual Controls (View Mode, Sorting, Panel Filter) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
              {/* View Mode Toggle - ONLY DOMAINS */}
              {activeTab === 'domains' && (
                <div className="flex p-1 bg-surface rounded-full shrink-0 h-10 items-center">
                  <button
                    onClick={() => setViewMode('extended')}
                    className={`h-full aspect-square flex items-center justify-center rounded-full transition-all ${viewMode === 'extended' ? 'bg-surface text-link' : 'text-muted'
                      }`}
                    title="Vista Estesa"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`h-full aspect-square flex items-center justify-center rounded-full transition-all ${viewMode === 'compact' ? 'bg-surface text-link' : 'text-muted'
                      }`}
                    title="Vista Compatta"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              )}

              {/* Contextual Sorting */}
              <div className="flex p-1 bg-surface rounded-full overflow-hidden shrink-0 h-10 items-center">
                <button
                  onClick={() => setSortBy('name')}
                  className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'name' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
                    }`}
                >
                  Nome
                </button>
                {activeTab !== 'panels' && (
                  <>
                    <button
                      onClick={() => setSortBy('expiry')}
                      className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'expiry' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
                        }`}
                    >
                      Data
                    </button>
                    <button
                      onClick={() => setSortBy('status')}
                      className={`h-full flex items-center justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'status' ? 'bg-surface text-link' : 'text-muted hover:text-muted'
                        }`}
                    >
                      Stato
                    </button>
                  </>
                )}
                <div className="w-px h-3 bg-line/20 self-center mx-1" />
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="h-full flex items-center justify-center px-2.5 text-muted hover:text-link transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </button>
              </div>

              {/* Panel Filter - Contextual */}
              {activeTab !== 'panels' && activeTab !== 'pec' && activeTab !== 'subscriptions' && (
                <div className="relative group min-w-0 max-w-full sm:max-w-[240px] h-10">
                  <select
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value)}
                    className="appearance-none w-full max-w-full text-ellipsis bg-surface text-muted text-xs font-semibold uppercase tracking-wider pl-8 pr-8 rounded-full outline-none border-none cursor-pointer hover:bg-line/20 transition-all min-w-[110px] h-full leading-none"
                  >
                    <option value="all">Tutti</option>
                    {panels.map(p => (
                      <option key={p.id} value={p.id}>{p.title || p.email}</option>
                    ))}
                  </select>
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <ChevronDownIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            <div className="bg-surface rounded-card border border-divider overflow-hidden">
              {/* Table Wrapper for Horizontal Scroll on Mid-Screens */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="lg:min-w-[900px]">
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 text-xs font-semibold text-muted uppercase tracking-wider border-b border-divider bg-surface">
                    {activeTab === 'panels' ? (
                      <>
                        <div className="col-span-4">Pannello</div>
                        <div className="col-span-6">Credenziali Accesso</div>
                        <div className="col-span-2 text-right">Azioni</div>
                      </>
                    ) : activeTab === 'domains' ? (
                      <>
                        <div className="col-span-8">Asset & Informazioni</div>
                        <div className="col-span-2 text-center">{viewMode === 'compact' ? '' : 'Scadenza'}</div>
                        <div className="col-span-2 text-right">{viewMode === 'compact' ? '' : 'Azioni'}</div>
                      </>
                    ) : activeTab === 'databases' ? (
                      <>
                        <div className="col-span-3">Database & Accesso</div>
                        <div className="col-span-3"> Pannello & Dominio</div>
                        <div className="col-span-2">Hostname & GB</div>
                        <div className="col-span-2">Scadenza</div>
                        <div className="col-span-2 text-right">Azioni</div>
                      </>
                    ) : activeTab === 'pec' ? (
                      <>
                        <div className="col-span-4">Indirizzo PEC</div>
                        <div className="col-span-4">Password Accesso</div>
                        <div className="col-span-2">Scadenza</div>
                        <div className="col-span-2 text-right">Azioni</div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-6">Nome Abbonamento</div>
                        <div className="col-span-4">Scadenza</div>
                        <div className="col-span-2 text-right">Azioni</div>
                      </>
                    )}
                  </div>

                  <div className="divide-y divide-divider">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        const renderRow = (rowItem: AssetRow, isChild = false) => {
                          const expiryColor = getExpiryColor(rowItem.expiry_date);
                          const formattedDate = rowItem.expiry_date ? new Date(rowItem.expiry_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

                          return (
                            <div key={rowItem.id} className="transition-all">
                              {/* --- MOBILE VIEW: Card Layout --- */}                              <div className={`lg:hidden p-6 space-y-4 ${isChild ? 'ml-4 border-l-2 border-divider pl-4' : ''} ${activeTab === 'pec' && rowItem.is_disabled ? 'opacity-60 bg-surface/[0.01]' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className={`flex items-center gap-3 min-w-0 flex-1 ${rowItem.isGroup ? 'cursor-pointer' : ''}`} onClick={() => rowItem.isGroup && toggleGroup(rowItem.id)}>
                                    <div className={`p-3 rounded-card ${activeTab === 'panels' ? 'bg-accent/10 text-link' : activeTab === 'pec' ? (rowItem.is_disabled ? 'bg-line/20 text-muted' : 'bg-accent/10 text-link') : activeTab === 'subscriptions' ? 'bg-success/10 text-success' : 'bg-surface text-muted'}`}>
                                      {activeTab === 'panels' ? <User size={18} /> : activeTab === 'pec' ? <Mail size={18} /> : activeTab === 'subscriptions' ? <Tag size={18} /> : (activeTab === 'domains' && rowItem.isGroup) ? <Layers size={18} /> : activeTab === 'domains' ? <Globe size={18} /> : <DbIcon size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${activeTab === 'pec' && rowItem.is_disabled ? 'line-through text-muted' : 'text-fg'}`}>
                                          {rowItem.title || rowItem.name || rowItem.sql_name || rowItem.address}
                                        </p>
                                        {!rowItem.isGroup && rowItem.notes && (
                                          <div className="flex-shrink-0 text-muted">
                                            <FileText size={12} />
                                          </div>
                                        )}
                                        {activeTab === 'domains' && rowItem.isGroup && (
                                          <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded-md bg-accent/20 text-link text-xs font-semibold uppercase tracking-normal whitespace-nowrap">
                                              {rowItem.subdomains?.length || 0} ASSET
                                            </span>
                                            <ChevronDownIcon size={14} className={`text-muted transition-transform duration-300 ${expandedGroups[rowItem.id] ? 'rotate-180' : ''}`} />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                        {rowItem.isGroup ? 'Contenitore Pannello' :
                                          activeTab === 'panels' ? 'Account' :
                                            activeTab === 'pec' ? (rowItem.is_disabled ? 'Casella PEC • Disabilitata' : 'Casella PEC') :
                                              activeTab === 'subscriptions' ? `Abbonamento ${rowItem.billing_cycle === '1m' ? '• Mensile' : rowItem.billing_cycle === '3m' ? '• Trimestrale' : rowItem.billing_cycle === '6m' ? '• Semestrale' : rowItem.billing_cycle === '1y' ? '• Annuale' : ''}` :
                                                activeTab === 'domains' ? `${rowItem.panelTitle && !isChild ? rowItem.panelTitle + ' • ' : ''}${getDomainTypeLabel(rowItem.type)}` :
                                                  (rowItem.panelTitle || `v${rowItem.sql_version}`)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Expiry Badge (Mobile) - Uniform to Desktop */}
                                  <div>
                                    {activeTab === 'panels' ? '' : (activeTab === 'pec' && rowItem.is_disabled) ? (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest bg-line/20 text-muted">
                                        <Ban size={12} className="opacity-70" />
                                        Disabilitata
                                      </div>
                                    ) : rowItem.expiry_date && (
                                      <div className={`
                                        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest
                                        ${expiryColor === 'red' ? 'bg-error/10 text-error' :
                                          expiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                            expiryColor === 'green' ? 'bg-success/10 text-success' :
                                              'bg-surface text-muted'}
                                      `}>
                                        <Calendar size={12} className="opacity-70" />
                                        {formattedDate}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Credentials / Details (Mobile) */}
                                {(!(activeTab === 'domains' && rowItem.isGroup)) && (
                                  <div className="bg-surface rounded-card p-4 space-y-3">
                                    {activeTab === 'pec' ? (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between group/mobcred" onClick={() => copyToClipboard(rowItem.address, `${rowItem.id}-user-mob`)}>
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <Mail size={12} className="text-link flex-shrink-0" />
                                            <span className="text-xs font-semibold text-muted truncate">{rowItem.address}</span>
                                          </div>
                                          {copiedField === `${rowItem.id}-user-mob` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted opacity-50" />}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-divider pt-2">
                                          <div className="flex items-center gap-2">
                                            <Lock size={12} className="text-muted" />
                                            <span className="text-xs font-semibold text-muted font-mono">{visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 text-muted">
                                              {visiblePasswords[rowItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass-mob`)} className="p-2 text-muted">
                                              {copiedField === `${rowItem.id}-pass-mob` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : activeTab === 'subscriptions' ? (
                                      <div className="flex items-center gap-2">
                                        <Tag size={12} className="text-success" />
                                        <span className="text-xs font-semibold text-muted truncate">{rowItem.name}</span>
                                      </div>
                                    ) : activeTab === 'domains' ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-muted uppercase">Pannello:</span>
                                        <span className="text-xs font-semibold text-muted uppercase tracking-widest">{rowItem.panelTitle}</span>
                                      </div>
                                    ) : activeTab === 'databases' ? (
                                      <div className="space-y-3">
                                        {/* User & Pass Row */}
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-center justify-between group/mobcred" onClick={() => copyToClipboard(rowItem.sql_name, `${rowItem.id}-user-mob`)}>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              <User size={12} className="text-muted" />
                                              <span className="text-xs font-semibold text-muted truncate">{rowItem.sql_name}</span>
                                            </div>
                                            {copiedField === `${rowItem.id}-user-mob` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted opacity-50" />}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <Lock size={12} className="text-muted" />
                                              <span className="text-xs font-semibold text-muted font-mono">{visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                              <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 text-muted">
                                                {visiblePasswords[rowItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                              </button>
                                              <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass-mob`)} className="p-2 text-muted">
                                                {copiedField === `${rowItem.id}-pass-mob` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Tech Specs Row (Simplified) */}
                                        <div className="pt-2 border-t border-divider space-y-2">
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <Globe size={12} className="text-muted" />
                                              <span className="text-xs font-semibold text-muted uppercase tracking-normal">Dominio:</span>
                                            </div>
                                            <span className="text-xs font-semibold text-muted truncate max-w-[140px] text-right">{rowItem.associated_domain}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <Mail size={12} className="text-muted" />
                                              <span className="text-xs font-semibold text-muted uppercase tracking-normal">Pannello:</span>
                                            </div>
                                            <span className="text-xs font-semibold text-muted truncate max-w-[140px] text-right">{rowItem.panelTitle}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <HardDrive size={12} className="text-muted" />
                                              <span className="text-xs font-semibold text-muted uppercase tracking-normal">Dimensione:</span>
                                            </div>
                                            <span className="text-xs font-semibold text-link uppercase">{rowItem.size_gb}GB</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center justify-between group/mobcred" onClick={() => copyToClipboard(rowItem.email, `${rowItem.id}-user-mob`)}>
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <User size={12} className="text-muted" />
                                            <span className="text-xs font-semibold text-muted truncate">{rowItem.email}</span>
                                          </div>
                                          {copiedField === `${rowItem.id}-user-mob` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted opacity-50" />}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-divider pt-2">
                                          <div className="flex items-center gap-2">
                                            <Lock size={12} className="text-muted" />
                                            <span className="text-xs font-semibold text-muted font-mono">{visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 text-muted">
                                              {visiblePasswords[rowItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass-mob`)} className="p-2 text-muted">
                                              {copiedField === `${rowItem.id}-pass-mob` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* Action Row (Mobile) - Uniform to Desktop Ghost Style */}
                                {!rowItem.isGroup && (
                                  <div className="flex gap-2 pt-3 border-t border-divider">
                                    {activeTab === 'databases' && (
                                      <>
                                        <button onClick={() => handleOpenSlots(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-link transition-all flex items-center justify-center gap-2">
                                          <Layers size={14} /> Slot
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                      </>
                                    )}
                                    {activeTab === 'domains' && (
                                      <>
                                        <button onClick={() => handleRenewDomain(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-success transition-all flex items-center justify-center gap-2">
                                          <RefreshCw size={14} /> Rinnova
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                      </>
                                    )}
                                    {activeTab === 'databases' && (
                                      <>
                                        <button onClick={() => handleRenewDatabase(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-success transition-all flex items-center justify-center gap-2">
                                          <RefreshCw size={14} /> Rinnova
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                      </>
                                    )}
                                    {activeTab === 'pec' && (
                                      <>
                                        <button onClick={() => handleToggleDisablePec(rowItem)} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${rowItem.is_disabled ? 'text-success hover:text-success' : 'text-muted hover:text-error'}`}>
                                          {rowItem.is_disabled ? <CheckCircle2 size={14} /> : <Ban size={14} />} {rowItem.is_disabled ? 'Abilita' : 'Disabilita'}
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                        <button onClick={() => handleRenewPec(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-success transition-all flex items-center justify-center gap-2">
                                          <RefreshCw size={14} /> Rinnova
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                      </>
                                    )}
                                    {activeTab === 'subscriptions' && (
                                      <>
                                        <button onClick={() => handleRenewSubscription(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-success transition-all flex items-center justify-center gap-2">
                                          <RefreshCw size={14} /> Rinnova
                                        </button>
                                        <div className="w-px h-4 bg-surface self-center" />
                                      </>
                                    )}
                                    <button onClick={() => handleOpenModal(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-link transition-all flex items-center justify-center gap-2">
                                      <Edit3 size={14} /> Modifica
                                    </button>
                                    <div className="w-px h-4 bg-surface self-center" />
                                    <button onClick={() => handleDelete(rowItem)} className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-error transition-all flex items-center justify-center gap-2">
                                      <Trash2 size={14} /> Elimina
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* --- DESKTOP VIEW: Grid Row --- */}
                              <div className={`hidden lg:grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-surface/[0.02] transition-colors group ${activeTab === 'pec' && rowItem.is_disabled ? 'opacity-60 bg-surface/[0.01]' : ''}`}>

                                {activeTab === 'panels' ? (
                                  <>
                                    {/* Panels Layout: 4 + 6 + 2 */}
                                    <div className="col-span-4 flex items-center gap-4">
                                      <div className="p-3 rounded-card bg-accent/10 text-link">
                                        <User size={18} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-fg truncate">{rowItem.title}</p>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Account</p>
                                      </div>
                                    </div>
                                    <div className="col-span-6 flex items-center gap-4">
                                      <div className="flex items-center bg-surface rounded-lg px-4 py-2 border border-transparent hover:border-accent/20 transition-all cursor-pointer group/cred w-[240px]"
                                        onClick={() => copyToClipboard(rowItem.email, `${rowItem.id}-user`)}>
                                        <User size={14} className="text-muted mr-2 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-muted truncate flex-1">
                                          {rowItem.email}
                                        </span>
                                        <div className="ml-2 opacity-0 group-hover/cred:opacity-100 transition-opacity flex-shrink-0">
                                          {copiedField === `${rowItem.id}-user` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted" />}
                                        </div>
                                      </div>
                                      <div className="flex items-center bg-surface rounded-lg px-4 py-2 border border-transparent hover:border-accent/20 transition-all w-[240px]">
                                        <Lock size={14} className="text-muted mr-2 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-muted font-mono truncate flex-1">
                                          {visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}
                                        </span>
                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                          <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 hover:text-link transition-colors text-muted">
                                            {visiblePasswords[rowItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                          </button>
                                          <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass`)} className="p-2 hover:text-link transition-colors text-muted">
                                            {copiedField === `${rowItem.id}-pass` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : activeTab === 'domains' ? (
                                  <>
                                    {/* Domains Layout: 3 + 3 + 2 + 3 + 1 */}
                                    <div className={`col-span-8 flex items-center gap-4 ${isChild ? 'pl-12' : ''}`}>
                                      <div className={`p-3 rounded-card ${rowItem.isGroup ? 'bg-surface text-muted cursor-pointer' : 'bg-surface text-muted'}`} onClick={() => rowItem.isGroup && toggleGroup(rowItem.id)}>
                                        {rowItem.isGroup ? <Layers size={18} /> : <Globe size={18} />}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <button onClick={() => rowItem.isGroup && toggleGroup(rowItem.id)} className="text-sm font-semibold truncate text-left py-1 hover:text-link transition-colors text-fg">
                                            {rowItem.name}
                                          </button>
                                          {rowItem.isGroup && (
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleGroup(rowItem.id)}>
                                              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-link text-xs font-semibold">
                                                {rowItem.subdomains?.length || 0} ASSET
                                              </span>
                                              <ChevronDownIcon size={14} className={`text-muted transition-transform ${expandedGroups[rowItem.id] ? 'rotate-180' : ''}`} />
                                            </div>
                                          )}
                                          {!rowItem.isGroup && rowItem.notes && (
                                            <div className="p-1 rounded-md bg-surface text-muted cursor-help" title={rowItem.notes}>
                                              <FileText size={12} />
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                          {rowItem.isGroup ? 'Contenitore Pannello' :
                                            (rowItem.panelTitle && !isChild ? rowItem.panelTitle + ' • ' : '') + getDomainTypeLabel(rowItem.type)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${expiryColor === 'red' ? 'bg-error/10 text-error' :
                                        expiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                          expiryColor === 'green' ? 'bg-success/10 text-success' : ''}`}>
                                        {formattedDate}
                                      </div>
                                    </div>

                                  </>
                                ) : activeTab === 'databases' ? (
                                  <>
                                    {/* Databases Layout: 3 + 4 + 2 + 2 + 1 */}
                                    <div className="col-span-3 flex items-center gap-4">
                                      <div className="p-3 rounded-card bg-surface text-muted cursor-pointer" onClick={() => toggleGroup(rowItem.id)}>
                                        <DbIcon size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <button onClick={() => toggleGroup(rowItem.id)} className="text-sm font-semibold text-fg truncate py-1 hover:text-link transition-colors">
                                            {rowItem.sql_name}
                                          </button>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copyToClipboard(rowItem.sql_name, `${rowItem.id}-user`)} className="p-2 text-muted hover:text-link">
                                              {copiedField === `${rowItem.id}-user` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 group/dbpass">
                                          <span className="text-xs font-semibold text-muted font-mono">
                                            {visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}
                                          </span>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 text-muted hover:text-link">
                                              {visiblePasswords[rowItem.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </button>
                                            <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass`)} className="p-2 text-muted hover:text-link">
                                              {copiedField === `${rowItem.id}-pass` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-3 flex flex-col gap-1 pr-4">
                                      <div className="flex items-center gap-2">
                                        <Mail size={12} className="text-link" />
                                        <span className="text-xs font-semibold text-fg truncate uppercase tracking-normal">
                                          {rowItem.panelTitle || 'Senza Pannello'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Globe size={10} className="text-muted" />
                                        <span className="text-xs font-semibold text-muted uppercase tracking-widest truncate">
                                          {rowItem.associated_domain || 'Nessun dominio'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <HardDrive size={12} className="text-muted" />
                                        <span className="text-xs font-semibold text-fg">{rowItem.size_gb} GB</span>
                                        <span className="text-xs font-semibold text-muted uppercase ml-1">v{rowItem.sql_version}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 group/host">
                                        <span className="text-xs font-mono text-muted truncate max-w-[120px]">{rowItem.hostname}</span>
                                        <button onClick={() => copyToClipboard(rowItem.hostname, `${rowItem.id}-host`)} className="opacity-0 group-hover/host:opacity-100 p-2 text-muted hover:text-link transition-all">
                                          {copiedField === `${rowItem.id}-host` ? <Check size={10} className="text-success" /> : <Copy size={10} />}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${expiryColor === 'red' ? 'bg-error/10 text-error' :
                                        expiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                          expiryColor === 'green' ? 'bg-success/10 text-success' : 'bg-surface text-muted'}`}>
                                        {formattedDate}
                                      </div>
                                    </div>
                                  </>
                                ) : activeTab === 'pec' ? (
                                  <>
                                    {/* PEC Layout: 4 + 4 + 2 + 2 */}
                                    <div className="col-span-4 flex items-center gap-4">
                                      <div className="p-3 rounded-card bg-accent/10 text-link">
                                        <Mail size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-fg truncate">
                                            {rowItem.address}
                                          </span>
                                          <button
                                            onClick={() => copyToClipboard(rowItem.address, `${rowItem.id}-pec`)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-link transition-all"
                                          >
                                            {copiedField === `${rowItem.id}-pec` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                          </button>
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Casella PEC</p>
                                      </div>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-4">
                                      <div className="flex items-center bg-surface rounded-lg px-4 py-2 border border-transparent hover:border-accent/40 transition-all w-[240px]">
                                        <Lock size={14} className="text-muted mr-2 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-muted font-mono truncate flex-1">
                                          {visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}
                                        </span>
                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                          <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="p-2 hover:text-link transition-colors text-muted">
                                            {visiblePasswords[rowItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                          </button>
                                          <button onClick={() => copyToClipboard(rowItem.password_encrypted, `${rowItem.id}-pass`)} className="p-2 hover:text-link transition-colors text-muted">
                                            {copiedField === `${rowItem.id}-pass` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      {rowItem.is_disabled ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-line/20 text-muted">
                                          <Ban size={12} className="opacity-70" />
                                          Disabilitata
                                        </div>
                                      ) : (
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${expiryColor === 'red' ? 'bg-error/10 text-error' :
                                          expiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                            expiryColor === 'green' ? 'bg-success/10 text-success' : 'bg-surface text-muted'}`}>
                                          <Calendar size={12} className="opacity-70" />
                                          {formattedDate || 'Non impostata'}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Subscriptions Layout: 6 + 4 + 2 */}
                                    <div className="col-span-6 flex items-center gap-4">
                                      <div className="p-3 rounded-card bg-success/10 text-success">
                                        <Tag size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-fg truncate">
                                            {rowItem.name}
                                          </span>
                                          <button
                                            onClick={() => copyToClipboard(rowItem.name, `${rowItem.id}-sub`)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-link transition-all"
                                          >
                                            {copiedField === `${rowItem.id}-sub` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                          </button>
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                          Abbonamento {rowItem.billing_cycle === '1m' ? '• Mensile' : rowItem.billing_cycle === '3m' ? '• Trimestrale' : rowItem.billing_cycle === '6m' ? '• Semestrale' : rowItem.billing_cycle === '1y' ? '• Annuale' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-span-4">
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${expiryColor === 'red' ? 'bg-error/10 text-error' :
                                        expiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                          expiryColor === 'green' ? 'bg-success/10 text-success' : 'bg-surface text-muted'}`}>
                                        <Calendar size={12} className="opacity-70" />
                                        {formattedDate || 'Non impostata'}
                                      </div>
                                    </div>
                                  </>
                                )}

                                <div className="col-span-2 flex justify-end gap-1">
                                  {!rowItem.isGroup && (
                                    <>
                                      {activeTab === 'databases' && (
                                        <button aria-label="Gestisci slot" onClick={() => handleOpenSlots(rowItem)} className="p-2 rounded-lg text-muted hover:text-link hover:bg-accent/10 transition-all" title="Gestisci Slot">
                                          <Layers size={18} />
                                        </button>
                                      )}
                                      {activeTab === 'domains' && (
                                        <button aria-label="Rinnova dominio" onClick={() => handleRenewDomain(rowItem)} className="p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Dominio">
                                          <RefreshCw size={18} />
                                        </button>
                                      )}
                                      {activeTab === 'databases' && (
                                        <button aria-label="Rinnova database" onClick={() => handleRenewDatabase(rowItem)} className="p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Database">
                                          <RefreshCw size={18} />
                                        </button>
                                      )}
                                      {activeTab === 'pec' && (
                                        <>
                                          <button
                                            onClick={() => handleToggleDisablePec(rowItem)}
                                            className={`p-2 rounded-lg transition-all ${rowItem.is_disabled ? 'text-success hover:bg-success/10' : 'text-muted hover:text-error hover:bg-error/10'}`}
                                            title={rowItem.is_disabled ? 'Abilita PEC' : 'Disabilita PEC (Congela Scadenza)'}
                                          >
                                            {rowItem.is_disabled ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                          </button>
                                          <button aria-label="Rinnova PEC" onClick={() => handleRenewPec(rowItem)} className="p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova PEC">
                                            <RefreshCw size={18} />
                                          </button>
                                        </>
                                      )}
                                      {activeTab === 'subscriptions' && (
                                        <button aria-label="Rinnova abbonamento" onClick={() => handleRenewSubscription(rowItem)} className="p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Abbonamento">
                                          <RefreshCw size={18} />
                                        </button>
                                      )}
                                      <button aria-label="Modifica" onClick={() => handleOpenModal(rowItem)} className="p-2 rounded-lg text-muted hover:text-link hover:bg-accent/10 transition-all" title="Modifica">
                                        <Edit3 size={18} />
                                      </button>
                                      <button aria-label="Elimina" onClick={() => handleDelete(rowItem)} className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all" title="Elimina">
                                        <Trash2 size={18} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        };

                        const renderChildCard = (sub: AssetRow) => {
                          const subExpiryColor = getExpiryColor(sub.expiry_date);
                          const subFormattedDate = sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

                          return (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-surface rounded-card p-5 border border-divider hover: transition-all group/card flex flex-col gap-4"
                            >
                              {/* Top Section: Name & Notes */}
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold text-fg truncate" title={sub.name}>{sub.name}</p>
                                    {sub.notes && (
                                      <div className="flex-shrink-0 cursor-help text-muted" title={sub.notes}>
                                        <FileText size={12} />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">{getDomainTypeLabel(sub.type)}</p>
                                </div>
                              </div>

                              {/* Middle Section: Expiry (THE STAR) */}
                              <div className="flex items-center justify-between">
                                {sub.expiry_date ? (
                                  <div className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest
                                    ${subExpiryColor === 'red' ? 'bg-error/10 text-error' :
                                      subExpiryColor === 'orange' ? 'bg-accent/10 text-link' :
                                        'bg-success/10 text-success'}
                                  `}>
                                    <Calendar size={14} className="opacity-70" />
                                    {subFormattedDate}
                                  </div>
                                ) : (
                                  <div className="h-9" /> // Spacer
                                )}
                              </div>

                              {/* Bottom Section: Subtle Actions */}
                              <div className="flex gap-2 pt-3 border-t border-divider">
                                <button
                                  onClick={() => handleRenewDomain(sub)}
                                  className="flex-1 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted hover:text-success transition-colors flex items-center justify-center gap-2"
                                >
                                  <RefreshCw size={12} /> Rinnova
                                </button>
                                <div className="w-px h-4 bg-surface self-center" />
                                <button
                                  onClick={() => handleOpenModal(sub)}
                                  className="flex-1 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted hover:text-link transition-colors flex items-center justify-center gap-2"
                                >
                                  <Edit3 size={12} /> Modifica
                                </button>
                                <div className="w-px h-4 bg-surface self-center" />
                                <button
                                  onClick={() => handleDelete(sub)}
                                  className="flex-1 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted hover:text-error transition-colors flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={12} /> Elimina
                                </button>
                              </div>
                            </motion.div>
                          );
                        };

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
                                <div className="hidden lg:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 bg-surface/[0.02] border-t border-divider">
                                  {(item.subdomains ?? []).map((child) => renderChildCard(child))}
                                </div>
                              </>
                            )}

                            {/* --- DATABASE SLOTS EXPANSION --- */}
                            {activeTab === 'databases' && expandedGroups[item.id] && (
                              <div className="bg-surface/[0.01] border-l-2 border-accent/40 ml-12 py-4 px-8 border-b border-divider">
                                <div className="grid grid-cols-5 gap-4">
                                  {[1, 2, 3, 4, 5].map((num) => {
                                    const slot = item.db_slots?.find((s: DBSlot) => s.slot_number === num);
                                    return (
                                      <div key={num} className="bg-surface p-3 rounded-card border border-divider flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-semibold text-muted uppercase tracking-widest">Slot #{num}</span>
                                          {slot?.content && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                                        </div>
                                        <span className={`text-xs font-semibold truncate ${slot?.content ? 'text-fg' : 'text-muted'}`}>
                                          {slot?.content || 'Libero'}
                                        </span>
                                        {slot?.notes && (
                                          <span className="text-xs font-semibold text-muted truncate ">"{slot.notes}"</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
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
