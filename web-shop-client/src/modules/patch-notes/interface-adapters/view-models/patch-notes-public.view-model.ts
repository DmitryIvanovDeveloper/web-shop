import type { PatchNoteOutput } from '../../application/types/patch-note.types';

export interface PatchNotesPublicViewModel {
  status: 'loading' | 'loaded' | 'error' | 'empty';
  patchNotes: PatchNoteOutput[];
  selectedNoteId: string | null;
  error?: string;
}
