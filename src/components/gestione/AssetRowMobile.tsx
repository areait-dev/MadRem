import { Globe, Calendar, HardDrive, Database as DbIcon, Mail, Trash2, Edit3, Layers, Eye, EyeOff, Copy, Check, User, Lock, FileText, ChevronDown as ChevronDownIcon, Tag, RefreshCw, Ban, CheckCircle2 } from 'lucide-react';
import type { AssetRow } from '../../types';
import { formatDate, getDomainTypeLabel, getExpiryColor } from './helpers';
import type { RowContext } from './types';

interface Props {
  row: AssetRow;
  isChild?: boolean;
  ctx: RowContext;
}

// Vista a card (sotto i 1024px)
export default function AssetRowMobile({ row: rowItem, isChild = false, ctx }: Props) {
  const {
    activeTab, expandedGroups, visiblePasswords, copiedField,
    toggleGroup, togglePassword, copyToClipboard,
    handleOpenModal, handleOpenSlots, handleDelete,
    handleRenewDomain, handleRenewDatabase, handleRenewPec, handleRenewSubscription, handleToggleDisablePec,
  } = ctx;
  const expiryColor = getExpiryColor(rowItem.expiry_date);
  const formattedDate = formatDate(rowItem.expiry_date);

  return (
    <div className={`lg:hidden p-6 space-y-4 ${isChild ? 'ml-4 border-l-2 border-divider pl-4' : ''} ${activeTab === 'pec' && rowItem.is_disabled ? 'opacity-60 bg-surface/1' : ''}`}>
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
                <div className="shrink-0 text-muted">
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
                  <Mail size={12} className="text-link shrink-0" />
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
                  <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted">
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
                    <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted">
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
                  <button aria-label="Mostra o nascondi password" onClick={() => togglePassword(rowItem.id)} className="min-h-8 min-w-8 inline-flex items-center justify-center p-2 text-muted">
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
  );
}
