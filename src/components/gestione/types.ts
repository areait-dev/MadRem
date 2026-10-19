import type { AssetRow } from '../../types';
import type { TabType } from './helpers';

export type ViewMode = 'extended' | 'compact';
export type SortBy = 'name' | 'expiry' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface TabDef {
  id: TabType;
  label: string;
  icon: React.ElementType;
  count: number;
}

// Stato e azioni condivisi dalle righe (mobile e desktop) della lista
export interface RowContext {
  activeTab: TabType;
  viewMode: ViewMode;
  expandedGroups: Record<string, boolean>;
  visiblePasswords: Record<string, boolean>;
  copiedField: string | null;
  toggleGroup: (id: string) => void;
  togglePassword: (id: string) => void;
  copyToClipboard: (text: string | null | undefined, id: string) => void;
  handleOpenModal: (item: AssetRow | null) => void;
  handleOpenSlots: (db: AssetRow) => void;
  handleDelete: (item: AssetRow) => void;
  handleRenewDomain: (item: AssetRow) => void;
  handleRenewDatabase: (item: AssetRow) => void;
  handleRenewPec: (item: AssetRow) => void;
  handleRenewSubscription: (item: AssetRow) => void;
  handleToggleDisablePec: (item: AssetRow) => void;
}
