import { inject, injectable } from 'inversify';
import { Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../infrastructure/ports/logger.port';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { GetPublishedPatchNotesUseCase } from '../../application/use-cases/get-published-patch-notes.use-case';
import type { PatchNoteOutput } from '../../application/types/patch-note.types';
import type { PatchNotesPublicViewModel } from '../view-models/patch-notes-public.view-model';

@injectable()
export class PatchNotesPublicPresenter {
  private _viewModel: PatchNotesPublicViewModel = {
    status: 'loading',
    patchNotes: [],
    selectedNoteId: null
  };

  private _onViewModelChanged?: () => void;

  constructor(
    @inject(PATCH_NOTES_TYPES.GetPublishedPatchNotesUseCase)
    private readonly _getPublishedPatchNotesUseCase: GetPublishedPatchNotesUseCase,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  getViewModel(): PatchNotesPublicViewModel {
    return { ...this._viewModel };
  }

  setOnViewModelChanged(callback: () => void): void {
    this._onViewModelChanged = callback;
  }

  private updateViewModel(update: Partial<PatchNotesPublicViewModel>): void {
    this._viewModel = { ...this._viewModel, ...update };
    this._onViewModelChanged?.();
  }

  async loadPublishedNotes(): Promise<void> {
    this._logger.info('[PatchNotesPublicPresenter] Loading published patch notes');

    this.updateViewModel({ status: 'loading' });

    try {
      const result = await this._getPublishedPatchNotesUseCase.execute();

      if (!result.isSuccess) {
        this._logger.error('[PatchNotesPublicPresenter] Failed to load published notes', result.error);
        this.updateViewModel({
          status: 'error',
          error: result.error.message
        });
        return;
      }

      const patchNotes = result.data;

      this._logger.info('[PatchNotesPublicPresenter] Published notes loaded successfully', {
        count: patchNotes.length
      });

      this.updateViewModel({
        status: patchNotes.length === 0 ? 'empty' : 'loaded',
        patchNotes,
        selectedNoteId: null,
        error: undefined
      });

    } catch (error) {
      this._logger.error('[PatchNotesPublicPresenter] Unexpected error loading published notes', error);
      this.updateViewModel({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  selectNote(noteId: string): void {
    this._logger.info('[PatchNotesPublicPresenter] Selecting patch note', { noteId });

    const note = this._viewModel.patchNotes.find(n => n.id === noteId);
    if (note) {
      this.updateViewModel({ selectedNoteId: noteId });
    } else {
      this._logger.warn('[PatchNotesPublicPresenter] Patch note not found', { noteId });
    }
  }

  clearSelection(): void {
    this._logger.info('[PatchNotesPublicPresenter] Clearing patch note selection');
    this.updateViewModel({ selectedNoteId: null });
  }

  getSelectedNote(): PatchNoteOutput | null {
    if (!this._viewModel.selectedNoteId) {
      return null;
    }

    return this._viewModel.patchNotes.find(note => note.id === this._viewModel.selectedNoteId) || null;
  }

  refresh(): Promise<void> {
    return this.loadPublishedNotes();
  }
}
