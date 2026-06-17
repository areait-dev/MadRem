import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Database as DbIcon,
  User,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Calendar,
  Mail,
  Tag
} from 'lucide-react';
import { useInfrastructure } from '../hooks/useInfrastructure';
import type { ArubaPanel, PecEmail, Subscription } from '../types';

const Dashboard: React.FC = () => {
  const { fetchPanels, fetchPecs, fetchSubscriptions } = useInfrastructure();
  const [panels, setPanels] = useState<ArubaPanel[]>([]);
  const [pecs, setPecs] = useState<PecEmail[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [data, pecData, subData] = await Promise.all([
      fetchPanels(),
      fetchPecs(),
      fetchSubscriptions(),
    ]);
    setPanels(data);
    setPecs(pecData);
    setSubscriptions(subData);
    setLoading(false);
  }, [fetchPanels, fetchPecs, fetchSubscriptions]);

  useEffect(() => {
    loadData();
    // Request notification permission on load
    import('../utils/notifications').then(({ requestNotificationPermission }) => {
      requestNotificationPermission();
    });
  }, [loadData]);

  // Check for notifications once data is loaded
  useEffect(() => {
    if (panels.length > 0 && !loading) {
      import('../utils/notifications').then(({ checkAndNotifyExpiringAssets }) => {
        checkAndNotifyExpiringAssets(panels);
      });
    }
  }, [panels, loading]);

  // Calculate real stats
  const allDomains = panels.flatMap(p => (p.domains || []).map(d => ({ ...d, panelTitle: p.title || p.email, assetType: 'Dominio' })));
  const allDatabases = panels.flatMap(p => (p.databases || []).map(db => ({ ...db, panelTitle: p.title || p.email, assetType: 'Database' })));
  const allPecs = pecs.map(pec => ({ ...pec, name: pec.address, panelTitle: null, assetType: 'PEC' }));
  const allSubs = subscriptions.map(sub => ({ ...sub, panelTitle: null, assetType: 'Abbonamento' }));

  // Combine all expiring assets (within 30 days)
  const expiringAssets = [...allDomains, ...allDatabases, ...allPecs, ...allSubs]
    .filter(asset => {
      if (!asset.expiry_date) return false;
      const expiry = new Date(asset.expiry_date);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  const stats = {
    totalPanels: panels.length,
    totalDomains: allDomains.length,
    totalDatabases: allDatabases.length,
    totalPecs: pecs.length,
    totalSubscriptions: subscriptions.length,
    expiringAssets: expiringAssets.length
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getAssetIcon = (assetType: string) => {
    if (assetType === 'Dominio') return <Globe size={24} />;
    if (assetType === 'Database') return <DbIcon size={24} />;
    if (assetType === 'PEC') return <Mail size={24} />;
    return <Tag size={24} />;
  };

  const getAssetColor = (assetType: string) => {
    if (assetType === 'Dominio') return 'bg-blue-500/10 text-blue-500';
    if (assetType === 'Database') return 'bg-orange-500/10 text-orange-500';
    if (assetType === 'PEC') return 'bg-violet-500/10 text-violet-500';
    return 'bg-emerald-500/10 text-emerald-500';
  };

  const getAssetBadgeColor = (assetType: string) => {
    if (assetType === 'PEC') return 'text-violet-500';
    if (assetType === 'Abbonamento') return 'text-emerald-500';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <main className="pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter"
            >
              Dashboard <span className="text-primary italic">Infrastruttura</span>
            </motion.h1>
            <p className="text-slate-500 dark:text-text-muted font-bold text-sm tracking-widest uppercase opacity-70">
              Stato globale e monitoraggio scadenze
            </p>
          </div>
        </header>

        {/* Essential Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {[
            { label: 'Pannelli', value: stats.totalPanels, icon: User, color: 'text-primary' },
            { label: 'Domini', value: stats.totalDomains, icon: Globe, color: 'text-blue-500' },
            { label: 'Database', value: stats.totalDatabases, icon: DbIcon, color: 'text-orange-500' },
            { label: 'Caselle PEC', value: stats.totalPecs, icon: Mail, color: 'text-violet-500' },
            { label: 'Abbonamenti', value: stats.totalSubscriptions, icon: Tag, color: 'text-emerald-500' },
            { label: 'In Scadenza', value: stats.expiringAssets, icon: Clock, color: 'text-red-500' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="glass-card p-5 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-start">
                <p className="text-[9px] font-black text-slate-400 dark:text-text-muted uppercase tracking-widest leading-tight">{stat.label}</p>
                <div className={`${stat.color} opacity-80`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                  {loading ? '...' : stat.value}
                </p>
                <ArrowUpRight size={14} className="text-slate-300 dark:text-white/20" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ALERTS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className={expiringAssets.length > 0 ? "text-red-500 animate-pulse" : "text-primary"} size={20} />
              Alert <span className={expiringAssets.length > 0 ? "text-red-500" : "text-primary"}>Scadenze Imminenti</span>
            </h3>
            {expiringAssets.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
                {expiringAssets.length} {expiringAssets.length === 1 ? 'Elemento Critico' : 'Elementi Critici'}
              </span>
            )}
          </div>

          <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/5">
            {expiringAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-white/5">
                {expiringAssets.map((asset: any) => {
                  const diffDays = Math.ceil((new Date(asset.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays < 0;

                  return (
                    <div key={asset.id} className="p-8 flex items-center justify-between gap-6 bg-white dark:bg-white/5">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${getAssetColor(asset.assetType)}`}>
                          {getAssetIcon(asset.assetType)}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                            {asset.name || asset.sql_name || asset.address}
                          </h4>
                          <div className="flex items-center gap-2">
                            {asset.panelTitle && (
                              <>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest">{asset.panelTitle}</span>
                                <ChevronRight size={10} className="text-slate-300" />
                              </>
                            )}
                            <span className={`text-[10px] font-black uppercase ${getAssetBadgeColor(asset.assetType)}`}>
                              {asset.assetType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`flex items-center justify-end gap-2 text-[13px] font-black uppercase tracking-wider ${isExpired ? 'text-red-500' : diffDays < 10 ? 'text-red-400' : 'text-orange-500'}`}>
                          <Calendar size={14} />
                          {new Date(asset.expiry_date!).toLocaleDateString('it-IT')}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {isExpired ? `Scaduto da ${Math.abs(diffDays)} giorni` : `Mancano ${diffDays} giorni`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-24 text-center">
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                    Infrastruttura <span className="text-primary italic">Aggiornata</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">
                    Nessun elemento richiede attenzione nei prossimi 30 giorni
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;