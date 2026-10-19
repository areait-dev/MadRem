import { Globe, Calendar, HardDrive, Database as DbIcon, Mail, Trash2, Edit3, Layers, Eye, EyeOff, Copy, Check, User, Lock, FileText, ChevronDown as ChevronDownIcon, Tag, RefreshCw, Ban, CheckCircle2 } from 'lucide-react';
import type { AssetRow } from '../../types';
import { formatDate, getDomainTypeLabel, getExpiryColor } from './helpers';
import type { RowContext } from './types';

interface Props {
  row: AssetRow;
  isChild?: boolean;
  ctx: RowContext;
}

// Riga della tabella (da 1024px in su)
export default function AssetRowDesktop({ row: rowItem, isChild = false, ctx }: Props) {
  const {
    activeTab, expandedGroups, visiblePasswords, copiedField,
    toggleGroup, togglePassword, copyToClipboard,
    handleOpenModal, handleOpenSlots, handleDelete,
    handleRenewDomain, handleRenewDatabase, handleRenewPec, handleRenewSubscription, handleToggleDisablePec,
  } = ctx;
  const expiryColor = getExpiryColor(rowItem.expiry_date);
  const formattedDate = formatDate(rowItem.expiry_date);

  return (
    <div className={`hidden lg:grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-surface/2 transition-colors group ${activeTab === 'pec' && rowItem.is_disabled ? 'opacity-60 bg-surface/1' : ''}`}>

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
              <User size={14} className="text-muted mr-2 shrink-0" />
              <span className="text-xs font-semibold text-muted truncate flex-1">
                {rowItem.email}
              </span>
              <div className="ml-2 opacity-0 group-hover/cred:opacity-100 transition-opacity shrink-0">
                {copiedField === `${rowItem.id}-user` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted" />}
              </div>
            </div>
            <div className="flex items-center bg-surface rounded-lg px-4 py-2 border border-transparent hover:border-accent/20 transition-all w-[240px]">
              <Lock size={14} className="text-muted mr-2 shrink-0" />
              <span className="text-xs font-semibold text-muted font-mono truncate flex-1">
                {visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}
              </span>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 hover:text-link transition-colors text-muted">
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
                  <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted hover:text-link">
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
              <Lock size={14} className="text-muted mr-2 shrink-0" />
              <span className="text-xs font-semibold text-muted font-mono truncate flex-1">
                {visiblePasswords[rowItem.id] ? rowItem.password_encrypted : '••••••••'}
              </span>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 hover:text-link transition-colors text-muted">
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
              <button aria-label="Gestisci slot" onClick={() => handleOpenSlots(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-link hover:bg-accent/10 transition-all" title="Gestisci Slot">
                <Layers size={18} />
              </button>
            )}
            {activeTab === 'domains' && (
              <button aria-label="Rinnova dominio" onClick={() => handleRenewDomain(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Dominio">
                <RefreshCw size={18} />
              </button>
            )}
            {activeTab === 'databases' && (
              <button aria-label="Rinnova database" onClick={() => handleRenewDatabase(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Database">
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
                <button aria-label="Rinnova PEC" onClick={() => handleRenewPec(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova PEC">
                  <RefreshCw size={18} />
                </button>
              </>
            )}
            {activeTab === 'subscriptions' && (
              <button aria-label="Rinnova abbonamento" onClick={() => handleRenewSubscription(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all" title="Rinnova Abbonamento">
                <RefreshCw size={18} />
              </button>
            )}
            <button aria-label="Modifica" onClick={() => handleOpenModal(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-link hover:bg-accent/10 transition-all" title="Modifica">
              <Edit3 size={18} />
            </button>
            <button aria-label="Elimina" onClick={() => handleDelete(rowItem)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all" title="Elimina">
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
