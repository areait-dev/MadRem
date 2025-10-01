// import { useState, useEffect } from 'react';
import type { Deadline, DeadlineCategory } from '../types';
import DominioModal from './deadline-modals/DominioModal';
import PowerMailModal from './deadline-modals/PowerMailModal';
import ContrattiModal from './deadline-modals/ContrattiModal';
import SocialModal from './deadline-modals/SocialModal';
import AbbonamentiModal from './deadline-modals/AbbonamentiModal';

interface AddDeadlineModalProps {
  deadline?: Deadline | null;
  onSave: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
  selectedCategory?: DeadlineCategory | null;
}

const AddDeadlineModal = ({ deadline, onSave, onClose, selectedCategory }: AddDeadlineModalProps) => {
  // Determina quale categoria usare
  const category = selectedCategory || deadline?.category || 'dominio';

  // Renderizza il modale appropriato in base alla categoria
  switch (category) {
    case 'dominio':
      return (
        <DominioModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
    
    case 'powermail':
      return (
        <PowerMailModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
    
    case 'contratti':
      return (
        <ContrattiModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
    
    case 'social':
      return (
        <SocialModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
    
    case 'abbonamenti':
      return (
        <AbbonamentiModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
    
    default:
      return (
        <DominioModal
          deadline={deadline}
          onSave={onSave}
          onClose={onClose}
        />
      );
  }
};

export default AddDeadlineModal;