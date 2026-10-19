import type { TabType } from './helpers';
import type { ViewMode } from './types';

interface TableHeaderProps {
  activeTab: TabType;
  viewMode: ViewMode;
}

export default function TableHeader({ activeTab, viewMode }: TableHeaderProps) {
  return (
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
  );
}
