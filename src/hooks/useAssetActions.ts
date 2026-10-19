import Swal from 'sweetalert2';
import type { ArubaPanel, AssetRow, Database, Domain, PecEmail, Subscription } from '../types';
import { confirmDialog, Toast } from '../components/gestione/helpers';
import type { TabType } from '../components/gestione/helpers';
import { getErrorMessage } from '../utils/errors';
import type { useInfrastructure } from './useInfrastructure';

type Api = ReturnType<typeof useInfrastructure>;

interface UseAssetActionsParams {
  api: Api;
  activeTab: TabType;
  editingItem: AssetRow | null;
  closeModal: () => void;
  reload: () => void;
}

// Salvataggio, eliminazione e rinnovo degli asset, con le relative conferme e notifiche
export function useAssetActions({ api, activeTab, editingItem, closeModal, reload }: UseAssetActionsParams) {
  const {
    addPanel, updatePanel, deletePanel,
    addDomain, updateDomain, deleteDomain,
    addDatabase, updateDatabase, deleteDatabase,
    addPec, updatePec, deletePec,
    addSubscription, updateSubscription, deleteSubscription,
  } = api;
  const handleCloseModal = closeModal;
  const loadData = reload;

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

  return {
    handleSave,
    handleDelete,
    handleRenewSubscription,
    handleRenewDomain,
    handleRenewDatabase,
    handleRenewPec,
    handleToggleDisablePec,
  };
}
