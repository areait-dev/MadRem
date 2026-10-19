import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit3, FileText, RefreshCw } from 'lucide-react';
import type { AssetRow } from '../../types';
import { formatDate, getDomainTypeLabel, getExpiryColor } from './helpers';
import type { RowContext } from './types';

interface Props {
  sub: AssetRow;
  ctx: Pick<RowContext, 'handleRenewDomain' | 'handleOpenModal' | 'handleDelete'>;
}

// Card di un dominio dentro il gruppo del suo pannello (vista desktop)
export default function DomainChildCard({ sub, ctx }: Props) {
  const { handleRenewDomain, handleOpenModal, handleDelete } = ctx;
  const subExpiryColor = getExpiryColor(sub.expiry_date);
  const subFormattedDate = formatDate(sub.expiry_date);

  return (
    <motion.div
      key={sub.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface rounded-card p-5 border border-divider transition-all group/card flex flex-col gap-4"
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
}
