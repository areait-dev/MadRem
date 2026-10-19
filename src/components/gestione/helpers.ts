import Swal from 'sweetalert2';

export type TabType = 'panels' | 'domains' | 'databases' | 'pec' | 'subscriptions';

export const Toast = Swal.mixin({
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

export const confirmDialog = async (type: string, name: string) => {
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

export const getExpiryColor = (date?: string | null) => {
  if (!date) return 'slate';
  const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'red';
  if (days < 15) return 'red';
  if (days < 45) return 'orange';
  return 'green';
};

export const getDomainTypeLabel = (type: string = '') => {
  if (type === 'main') return 'Dominio Principale';
  if (type === 'third_level' || type === 'subdomain') return 'Terzo Livello';
  return type;
};

export const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
