import type { PatchNoteOutput } from '../../application/types/patch-note.types';

export interface PatchNotesAdminViewModel {
  status: 'loading' | 'loaded' | 'error' | 'creating' | 'updating' | 'deleting';
  patchNotes: PatchNoteOutput[];
  selectedNote: PatchNoteOutput | null;
  error?: string;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
}
