import type { ArubaPanel } from '../types';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Questo browser non supporta le notifiche desktop');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/madrem.circle.png',
      ...options
    });
  }
};

export const checkAndNotifyExpiringAssets = (panels: ArubaPanel[]) => {
  const allDomains = panels.flatMap(p => (p.domains || []).map(d => ({ ...d, panelTitle: p.title || p.email, assetType: 'Dominio' })));
  const allDatabases = panels.flatMap(p => (p.databases || []).map(db => ({ ...db, panelTitle: p.title || p.email, assetType: 'Database' })));

  const now = new Date();
  const criticalAssets = [...allDomains, ...allDatabases].filter(asset => {
    if (!asset.expiry_date) return false;
    const expiry = new Date(asset.expiry_date);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Include everything expired (diffDays <= 0) and expiring soon (up to 15 days)
    return diffDays <= 15;
  });

  if (criticalAssets.length > 0) {
    const expired = criticalAssets.filter(asset => {
      const diffDays = Math.ceil((new Date(asset.expiry_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 0;
    });

    const soon = criticalAssets.filter(asset => {
      const diffDays = Math.ceil((new Date(asset.expiry_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 15;
    });

    const expiredCount = expired.length;
    const soonCount = soon.length;

    const getNames = (list: any[]) => list.map(a => a.name || a.sql_name).slice(0, 3).join(', ') + (list.length > 3 ? '...' : '');

    let body = '';
    if (expiredCount > 0) {
      body += `🔴 SCADUTI: ${getNames(expired)}`;
    }
    
    if (soonCount > 0) {
      if (body) body += '\n';
      body += `⚠️ IN SCADENZA: ${getNames(soon)}`;
    }

    sendNotification(expiredCount > 0 ? 'MadRem: Allarme Critico' : 'MadRem: Alert Scadenze', {
      body: body || 'Controlla la dashboard per i dettagli.',
      tag: 'madrem-expiry-alert',
      requireInteraction: expiredCount > 0,
    });
  }
};
