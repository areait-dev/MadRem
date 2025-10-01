import { Edit2, Trash2, Globe, Mail, FileText, Smartphone, RefreshCw, Ban, Power, Euro, Calendar, User, Clock, Tag, Info, Zap, Repeat, Hash, ExternalLink, Server } from 'lucide-react';
import type { Deadline, ViewMode } from '../types';
import { getCategoryInfo, getPriorityInfo, getDaysUntilDeadline, formatDeadlineDate} from '../types';

interface DeadlineCardProps {
  deadline: Deadline;
  viewMode: ViewMode;
  onEdit: (deadline: Deadline) => void;
  onDelete: (deadline: Deadline) => void;
  onToggleComplete: (id: string) => void;
  onRenew: (deadline: Deadline) => void;
}

const DeadlineCard = ({ deadline, viewMode, onEdit, onDelete, onToggleComplete, onRenew }: DeadlineCardProps) => {
  const categoryInfo = getCategoryInfo(deadline.category);
  const priorityInfo = getPriorityInfo(deadline.priority);
  const daysUntil = getDaysUntilDeadline(deadline.due_date);
  
  // Parse specific fields from description based on category
  const getSpecificFields = () => {
    if (!deadline.description) return null;
    
    const fields = deadline.description.split('|');
    
    switch (deadline.category) {
      case 'dominio':
        return {
          url: fields[0] || '',
          cliente: fields[1] || '',
          rif_contratto: fields[2] || '',
          hosting: fields[3] || '',
          dominio: fields[4] || '',
          descrizione: fields[5] || ''
        };
      case 'powermail':
        return {
          mail: fields[0] || '',
          tipologia: fields[1] || '',
          cliente: fields[2] || '',
          rif_contratto: fields[3] || '',
          descrizione: fields[4] || ''
        };
      case 'contratti':
        return {
          cliente: fields[0] || '',
          tipo_contratto: fields[1] || '',
          rif_contratto: fields[2] || '',
          descrizione: fields[3] || ''
        };
      case 'social':
        return {
          piattaforma: fields[0] || '',
          cliente: fields[1] || '',
          rif_contratto: fields[2] || '',
          descrizione: fields[3] || ''
        };
      case 'abbonamenti':
        return {
          durata: fields[0] || '',
          start_date: fields[1] || '',
          costo: fields[2] || '',
          descrizione: fields[3] || ''
        };
      default:
        return null;
    }
  };

  const specificFields = getSpecificFields();
  
  // Determina se è un abbonamento una tantum
  const isUnaTantumAbbonamento = () => {
    return deadline.category === 'abbonamenti' && specificFields && !specificFields.durata;
  };
  
  // Funzione per mostrare tutti i campi in modo ordinato
  const renderAllFields = () => {
    if (!specificFields) return null;
    switch (deadline.category) {
      case 'dominio':
        return (
          <div className="space-y-2">
            {specificFields.url && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-md">
                  <ExternalLink size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">URL</div>
                  <a href={specificFields.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 truncate block">
                    {specificFields.url}
                  </a>
                </div>
              </div>
            )}
            {specificFields.cliente && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-md">
                  <User size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Cliente</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 truncate">{specificFields.cliente}</div>
                </div>
              </div>
            )}
            {specificFields.rif_contratto && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-800 rounded-md">
                  <Hash size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Rif. Contratto</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">{specificFields.rif_contratto}</div>
                </div>
              </div>
            )}
            {specificFields.hosting && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-800 rounded-md">
                  <Server size={14} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Hosting</div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300 truncate">{specificFields.hosting}</div>
                </div>
              </div>
            )}
            {specificFields.dominio && (
              <div className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                <div className="p-1.5 bg-cyan-100 dark:bg-cyan-800 rounded-md">
                  <Globe size={14} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">Dominio</div>
                  <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300 truncate">{specificFields.dominio}</div>
                </div>
              </div>
            )}
            {specificFields.descrizione && (
              <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Descrizione</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specificFields.descrizione}</div>
                </div>
              </div>
            )}
          </div>
        );
      case 'powermail':
        return (
          <div className="space-y-2">
            {specificFields.mail && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-md">
                  <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Mail</div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{specificFields.mail}</div>
                </div>
              </div>
            )}
            {specificFields.tipologia && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-800 rounded-md">
                  <Tag size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Tipologia</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">{specificFields.tipologia}</div>
                </div>
              </div>
            )}
            {specificFields.cliente && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-md">
                  <User size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Cliente</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 truncate">{specificFields.cliente}</div>
                </div>
              </div>
            )}
            {specificFields.rif_contratto && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-800 rounded-md">
                  <Hash size={14} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Rif. Contratto</div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300 truncate">{specificFields.rif_contratto}</div>
                </div>
              </div>
            )}
            {specificFields.descrizione && (
              <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Descrizione</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specificFields.descrizione}</div>
                </div>
              </div>
            )}
          </div>
        );
      case 'contratti':
        return (
          <div className="space-y-2">
            {specificFields.cliente && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-md">
                  <User size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Cliente</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 truncate">{specificFields.cliente}</div>
                </div>
              </div>
            )}
            {specificFields.tipo_contratto && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-md">
                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Tipo Contratto</div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{specificFields.tipo_contratto}</div>
                </div>
              </div>
            )}
            {specificFields.rif_contratto && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-800 rounded-md">
                  <Hash size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Rif. Contratto</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">{specificFields.rif_contratto}</div>
                </div>
              </div>
            )}
            {specificFields.descrizione && (
              <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Descrizione</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specificFields.descrizione}</div>
                </div>
              </div>
            )}
          </div>
        );
      case 'social':
        return (
          <div className="space-y-2">
            {specificFields.piattaforma && (
              <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-800 rounded-md">
                  <Smartphone size={14} className="text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-pink-600 dark:text-pink-400 font-semibold">Piattaforma</div>
                  <div className="text-sm font-medium text-pink-700 dark:text-pink-300 truncate">{specificFields.piattaforma}</div>
                </div>
              </div>
            )}
            {specificFields.cliente && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-md">
                  <User size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Cliente</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 truncate">{specificFields.cliente}</div>
                </div>
              </div>
            )}
            {specificFields.rif_contratto && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-800 rounded-md">
                  <Hash size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Rif. Contratto</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">{specificFields.rif_contratto}</div>
                </div>
              </div>
            )}
            {specificFields.descrizione && (
              <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Descrizione</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specificFields.descrizione}</div>
                </div>
              </div>
            )}
          </div>
        );
      case 'abbonamenti':
        const isUnaTantum = !specificFields.durata;
        return (
          <div className="space-y-2">
            {/* Tipologia Badge */}
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                isUnaTantum 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700' 
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
              }`}>
                {isUnaTantum ? <Zap size={12} /> : <Repeat size={12} />}
                {isUnaTantum ? 'Una Tantum' : 'Abbonamento'}
              </div>
            </div>

            {/* Informazioni principali */}
            <div className="space-y-2">
              {specificFields.costo && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-md">
                    <Euro size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Costo</div>
                    <div className="text-sm font-bold text-green-700 dark:text-green-300">€{specificFields.costo}</div>
                  </div>
                </div>
              )}

              {specificFields.start_date && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-md">
                    <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Data Inizio</div>
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">{formatDeadlineDate(specificFields.start_date)}</div>
                  </div>
                </div>
              )}

              {!isUnaTantum && specificFields.durata && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-800 rounded-md">
                    <Clock size={14} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Durata Rinnovo</div>
                    <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      {specificFields.durata === '1m' ? '1 mese' : 
                       specificFields.durata === '3m' ? '3 mesi' : 
                       specificFields.durata === '6m' ? '6 mesi' : 
                       specificFields.durata === '12m' ? '12 mesi' : 
                       specificFields.durata}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Descrizione */}
            {specificFields.descrizione && (
              <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Descrizione</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specificFields.descrizione}</div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Determine card colors based on urgency and status
  const getCardStyle = () => {
    if (deadline.status === 'completata') {
      return 'glass-card border-gray-300 dark:border-gray-700 bg-gray-200/50 dark:bg-gray-900/20';
    }
    
    // Per abbonamenti una tantum, sempre verde (attivo) tranne se completato
    if (isUnaTantumAbbonamento()) {
      return 'glass-card border-green-200 dark:border-green-800 bg-green-200/50 dark:bg-green-900/20';
    }
    
    if (deadline.status === 'scaduta') {
      return 'glass-card border-red-200 dark:border-red-800 bg-red-200/50 dark:bg-red-900/20';
    }
    if (daysUntil <= 1) {
      return 'glass-card border-yellow-200 dark:border-yellow-600 bg-yellow-200/50 dark:bg-yellow-900/20';
    }
    // Active default: green styling
    return 'glass-card border-green-200 dark:border-green-800 bg-green-200/50 dark:bg-green-900/20';
  };

  // Format days display
  const getDaysDisplay = () => {
    if (deadline.status === 'completata') return 'Chiusa';
    if (daysUntil < 0) {
      const days = Math.abs(daysUntil);
      return days === 1 ? '1 giorno fa' : `${days} giorni fa`;
    }
    if (daysUntil === 0) return 'Oggi';
    if (daysUntil === 1) return 'Domani';
    return daysUntil === 1 ? '1 giorno' : `${daysUntil} giorni`;
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (deadline.category) {
      case 'dominio':
        return Globe;
      case 'powermail':
        return Mail;
      case 'contratti':
        return FileText;
      case 'social':
        return Smartphone;
      case 'abbonamenti':
        return RefreshCw;
      default:
        return Globe;
    }
  };

  const CategoryIcon = getCategoryIcon();

  if (viewMode === 'list') {
    return (
      <div className={`${getCardStyle()} group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${deadline.status === 'completata' ? 'opacity-60' : ''}`} onClick={() => onEdit(deadline)}>
        {/* HEADER - Altezza fissa per allineamento */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 h-20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`${categoryInfo.color} rounded-full p-2 flex items-center justify-center shadow-lg flex-shrink-0`}>
              <CategoryIcon size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-blue-600 dark:text-yellow-400 uppercase tracking-wide">{categoryInfo.label}</div>
              <h3 className={`font-bold text-lg truncate ${deadline.status === 'completata' ? 'text-gray-700 dark:text-gray-300' : 'text-blue-900 dark:text-white'}`}>
                {deadline.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`${priorityInfo.color} ${priorityInfo.textColor} px-3 py-1 rounded-full text-xs font-bold`}>
              {priorityInfo.label}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {deadline.category === 'abbonamenti' && !isUnaTantumAbbonamento() ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRenew(deadline); }}
                    className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600 transition-colors"
                    title="Rinnova"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(deadline.id); }}
                    className={`p-2 rounded-full transition-colors ${deadline.status === 'completata' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600' : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'}`}
                    title={deadline.status === 'completata' ? 'Riattiva' : 'Archivia'}
                  >
                    {deadline.status === 'completata' ? <Power size={16} /> : <Ban size={16} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(deadline); }}
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-amber-900 text-amber-600 transition-colors"
                    title="Modifica"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(deadline); }}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(deadline.id); }}
                    className={`p-2 rounded-full transition-colors ${deadline.status === 'completata' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600' : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'}`}
                    title={deadline.status === 'completata' ? 'Riattiva' : 'Archivia'}
                  >
                    {deadline.status === 'completata' ? <Power size={16} /> : <Ban size={16} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(deadline); }}
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-amber-900 text-amber-600 transition-colors"
                    title="Modifica"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(deadline); }}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BODY - Contenuto naturale */}
        <div className="p-4">
          <div className={deadline.status === 'completata' ? 'opacity-70' : ''}>
            {renderAllFields()}
          </div>
        </div>

        {/* FOOTER - Solo per abbonamenti rinnovabili e altri tipi */}
        {!isUnaTantumAbbonamento() && (
          <div className="flex items-center justify-between p-4 border-t border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/5">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`font-bold text-sm ${deadline.status === 'completata' ? 'text-gray-700 dark:text-gray-300' : 'text-blue-600 dark:text-white'}`}>
                  {formatDeadlineDate(deadline.due_date)}
                </div>
                <div className={`font-semibold text-xs ${deadline.status === 'completata'
                  ? 'text-gray-600 dark:text-gray-300'
                  : daysUntil < 0
                  ? 'text-red-600'
                  : daysUntil <= 1
                  ? 'text-yellow-600'
                  : 'text-green-700 dark:text-green-300'}`}>
                  {getDaysDisplay()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className={`${getCardStyle()} group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col ${deadline.status === 'completata' ? 'opacity-60' : ''}`} onClick={() => onEdit(deadline)}>
      {/* HEADER - Altezza fissa per allineamento */}
      <div className="flex flex-col p-4 border-b border-white/20 dark:border-white/10 h-30">
  {/* Prima riga: Icona, Categoria e Azioni */}
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={`${categoryInfo.color} rounded-full p-2 flex items-center justify-center shadow-lg flex-shrink-0`}>
        <CategoryIcon size={18} className="text-white" />
      </div>
      <div className="text-xs font-semibold text-blue-600 dark:text-yellow-400 uppercase tracking-wide">
        {categoryInfo.label}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* <div className={`${priorityInfo.color} ${priorityInfo.textColor} px-3 py-1 rounded-full text-xs font-bold`}>
        {priorityInfo.label}
      </div> */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {deadline.category === 'abbonamenti' && !isUnaTantumAbbonamento() ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onRenew(deadline); }}
              className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600 transition-colors"
              title="Rinnova"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(deadline.id); }}
              className={`p-2 rounded-full transition-colors ${deadline.status === 'completata' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600' : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'}`}
              title={deadline.status === 'completata' ? 'Riattiva' : 'Archivia'}
            >
              {deadline.status === 'completata' ? <Power size={16} /> : <Ban size={16} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(deadline); }}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-amber-900 text-amber-600 transition-colors"
              title="Modifica"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(deadline); }}
              className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 transition-colors"
              title="Elimina"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(deadline.id); }}
              className={`p-2 rounded-full transition-colors ${deadline.status === 'completata' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-600' : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600'}`}
              title={deadline.status === 'completata' ? 'Riattiva' : 'Archivia'}
            >
              {deadline.status === 'completata' ? <Power size={16} /> : <Ban size={16} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(deadline); }}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-amber-900 text-amber-600 transition-colors"
              title="Modifica"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(deadline); }}
              className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 transition-colors"
              title="Elimina"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
  
  {/* Seconda riga: Titolo */}
  <div className="flex-1">
    <h3 className={`font-bold text-lg leading-tight ${deadline.status === 'completata' ? 'text-gray-700 dark:text-gray-300' : 'text-blue-900 dark:text-white'}`}>
      {deadline.title}
    </h3>
  </div>
</div>

      {/* BODY - Contenuto naturale */}
      <div className="p-4 flex-1">
        <div className={deadline.status === 'completata' ? 'opacity-70' : ''}>
          {renderAllFields()}
        </div>
      </div>

      {/* FOOTER - Solo per abbonamenti rinnovabili e altri tipi */}
      {!isUnaTantumAbbonamento() && (
        <div className="flex items-center justify-between p-4 border-t border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-start">
              <div className={`font-bold text-sm ${deadline.status === 'completata' ? 'text-gray-700 dark:text-gray-300' : 'text-blue-600 dark:text-white'}`}>
                {formatDeadlineDate(deadline.due_date)}
              </div>
              <div className={`font-semibold text-xs ${deadline.status === 'completata'
                ? 'text-gray-600 dark:text-gray-300'
                : daysUntil < 0
                ? 'text-red-600'
                : daysUntil <= 1
                ? 'text-yellow-600'
                : 'text-green-700 dark:text-green-300'}`}>
                {getDaysDisplay()}
              </div>
            </div>
          </div>
          <div className={`${priorityInfo.color} ${priorityInfo.textColor} px-3 py-1 rounded-full text-xs font-bold`}>
            {priorityInfo.label}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlineCard;