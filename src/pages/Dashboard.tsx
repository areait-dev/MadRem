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
import type { ArubaPanel, AssetRow, PecEmail, Subscription } from '../types';

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
  type DashboardAsset = AssetRow & { assetType: string };
  const allDomains: DashboardAsset[] = panels.flatMap(p => (p.domains || []).map(d => ({ ...d, panelTitle: p.title || p.email, assetType: 'Dominio' })));
  const allDatabases: DashboardAsset[] = panels.flatMap(p => (p.databases || []).map(db => ({ ...db, panelTitle: p.title || p.email, assetType: 'Database' })));
  const allPecs: DashboardAsset[] = pecs.map(pec => ({ ...pec, name: pec.address, panelTitle: null, assetType: 'PEC' }));
  const allSubs: DashboardAsset[] = subscriptions.map(sub => ({ ...sub, panelTitle: null, assetType: 'Abbonamento' }));

  // Combine all expiring assets (within 30 days)
  const expiringAssets = [...allDomains, ...allDatabases, ...allPecs, ...allSubs]
    .filter(asset => {
      if (asset.is_disabled) return false;
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
    if (assetType === 'Dominio') return 'bg-accent/10 text-link';
    if (assetType === 'Database') return 'bg-accent/10 text-link';
    if (assetType === 'PEC') return 'bg-accent/10 text-link';
    return 'bg-success/10 text-success';
  };

  const getAssetBadgeColor = (assetType: string) => {
    if (assetType === 'PEC') return 'text-link';
    if (assetType === 'Abbonamento') return 'text-success';
    return 'text-link';
  };

  return (
    <div className="min-h-screen bg-page transition-colors duration-500">
      <main className="pt-10 pb-32 px-gutter">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-fg"
            >
              Dashboard <span className="text-accent ">Infrastruttura</span>
            </motion.h2>
            <p className="text-muted font-semibold text-sm tracking-widest uppercase">
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
            { label: 'Pannelli', value: stats.totalPanels, icon: User, color: 'text-link' },
            { label: 'Domini', value: stats.totalDomains, icon: Globe, color: 'text-link' },
            { label: 'Database', value: stats.totalDatabases, icon: DbIcon, color: 'text-link' },
            { label: 'Caselle PEC', value: stats.totalPecs, icon: Mail, color: 'text-link' },
            { label: 'Abbonamenti', value: stats.totalSubscriptions, icon: Tag, color: 'text-link' },
            { label: 'In Scadenza', value: stats.expiringAssets, icon: Clock, color: 'text-error' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="card p-5 border border-divider flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest leading-tight">{stat.label}</p>
                <div className={`${stat.color} opacity-80`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-fg leading-none">
                  {loading ? '...' : stat.value}
                </p>
                <ArrowUpRight size={14} className="text-muted" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ALERTS SECTION */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-fg flex items-center gap-3">
              <AlertTriangle className={expiringAssets.length > 0 ? "text-error animate-pulse" : "text-accent"} size={20} />
              Alert <span className={expiringAssets.length > 0 ? "text-error" : "text-link"}>Scadenze Imminenti</span>
            </h4>
            {expiringAssets.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-error/10 text-error text-xs font-semibold uppercase tracking-wider">
                {expiringAssets.length} {expiringAssets.length === 1 ? 'Elemento Critico' : 'Elementi Critici'}
              </span>
            )}
          </div>

          <div className="card overflow-hidden border border-divider">
            {expiringAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-divider">
                {expiringAssets.map((asset) => {
                  const diffDays = Math.ceil((new Date(asset.expiry_date ?? '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays < 0;

                  return (
                    <div key={asset.id} className="p-5 sm:p-8 flex flex-wrap items-center justify-between gap-4 sm:gap-6 bg-surface">
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        <div className={`shrink-0 p-4 rounded-card ${getAssetColor(asset.assetType)}`}>
                          {getAssetIcon(asset.assetType)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-fg mb-1 break-all">
                            {asset.name || asset.sql_name || asset.address}
                          </p>
                          <div className="flex items-center gap-2">
                            {asset.panelTitle && (
                              <>
                                <span className="text-xs font-semibold text-muted uppercase tracking-widest">{asset.panelTitle}</span>
                                <ChevronRight size={10} className="text-muted" />
                              </>
                            )}
                            <span className={`text-xs font-semibold uppercase ${getAssetBadgeColor(asset.assetType)}`}>
                              {asset.assetType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-wider ${isExpired ? 'text-error' : diffDays < 10 ? 'text-error' : 'text-link'}`}>
                          <Calendar size={14} />
                          {new Date(asset.expiry_date!).toLocaleDateString('it-IT')}
                        </div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-widest mt-1">
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
                  <h5 className="text-fg">
                    Infrastruttura <span className="text-accent ">Aggiornata</span>
                  </h5>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider">
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