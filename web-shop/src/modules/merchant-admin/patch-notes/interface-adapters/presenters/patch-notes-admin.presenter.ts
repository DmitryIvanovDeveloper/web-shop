import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { CreatePatchNoteUseCase, GetPatchNotesUseCase } from '../../application';
import type { CreatePatchNoteInput, PatchNoteOutput } from '../../application/types/patch-note.types';
import type { PatchNotesAdminViewModel } from '../view-models/patch-notes-admin.view-model';

@injectable()
export class PatchNotesAdminPresenter {
  private _viewModel: PatchNotesAdminViewModel = {
    status: 'loading',
    patchNotes: [],
    selectedNote: null,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false
  };

  private _onViewModelChanged?: () => void;

  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.CreatePatchNoteUseCase)
    private readonly _createPatchNoteUseCase: CreatePatchNoteUseCase,
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.GetPatchNotesUseCase)
    private readonly _getPatchNotesUseCase: GetPatchNotesUseCase,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  getViewModel(): PatchNotesAdminViewModel {
    return { ...this._viewModel };
  }

  setOnViewModelChanged(callback: () => void): void {
    this._onViewModelChanged = callback;
  }

  private updateViewModel(update: Partial<PatchNotesAdminViewModel>): void {
    this._viewModel = { ...this._viewModel, ...update };
    this._onViewModelChanged?.();
  }

  async loadPatchNotes(appId: string): Promise<void> {
    this._logger.info('[PatchNotesAdminPresenter] Loading patch notes', { appId });

    this.updateViewModel({ status: 'loading' });

    try {
      const result = await this._getPatchNotesUseCase.execute({ appId });

      if (!result.isSuccess) {
        this._logger.error('[PatchNotesAdminPresenter] Failed to load patch notes', result.error);
        this.updateViewModel({
          status: 'error',
          error: result.error.message
        });
        return;
      }

      const patchNotes = result.data || [];

      this._logger.info('[PatchNotesAdminPresenter] Patch notes loaded successfully', {
        count: patchNotes.length
      });

      this.updateViewModel({
        status: 'loaded',
        patchNotes,
        selectedNote: null,
        error: undefined
      });

    } catch (error) {
      this._logger.error('[PatchNotesAdminPresenter] Unexpected error loading patch notes', error);
      this.updateViewModel({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createPatchNote(input: CreatePatchNoteInput): Promise<boolean> {
    this._logger.info('[PatchNotesAdminPresenter] Creating patch note', {
      version: input.version,
      appId: input.appId
    });

    this.updateViewModel({ status: 'creating' });

    try {
      const result = await this._createPatchNoteUseCase.execute(input);

      if (!result.isSuccess) {
        this._logger.error('[PatchNotesAdminPresenter] Failed to create patch note', result.error);

        // Provide more user-friendly error messages
        let errorMessage = result.error.message;
        if (result.error.message.includes('Version must follow semantic versioning format')) {
          errorMessage = 'Version must be in format x.y.z (e.g., 1.0.0, 2.5.3)';
        } else if (result.error.message.includes('already exists')) {
          errorMessage = 'A patch note with this version already exists';
        }

        this.updateViewModel({
          status: 'loaded',
          error: errorMessage
        });
        return false;
      }

      this._logger.info('[PatchNotesAdminPresenter] Patch note created successfully');

      // Reload the list
      await this.loadPatchNotes(input.appId);

      return true;

    } catch (error) {
      this._logger.error('[PatchNotesAdminPresenter] Unexpected error creating patch note', error);
      this.updateViewModel({
        status: 'loaded',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  selectNote(note: PatchNoteOutput | null): void {
    this._logger.info('[PatchNotesAdminPresenter] Selecting patch note', { noteId: note?.id });
    this.updateViewModel({ selectedNote: note });
  }

  openCreateModal(): void {
    this._logger.info('[PatchNotesAdminPresenter] Opening create modal');
    this.updateViewModel({
      isCreateModalOpen: true,
      selectedNote: null
    });
  }

  closeCreateModal(): void {
    this._logger.info('[PatchNotesAdminPresenter] Closing create modal');
    this.updateViewModel({ isCreateModalOpen: false });
  }

  openEditModal(note: PatchNoteOutput): void {
    this._logger.info('[PatchNotesAdminPresenter] Opening edit modal', { noteId: note.id });
    this.updateViewModel({
      isEditModalOpen: true,
      selectedNote: note
    });
  }

  closeEditModal(): void {
    this._logger.info('[PatchNotesAdminPresenter] Closing edit modal');
    this.updateViewModel({
      isEditModalOpen: false,
      selectedNote: null
    });
  }

  openDeleteModal(note: PatchNoteOutput): void {
    this._logger.info('[PatchNotesAdminPresenter] Opening delete modal', { noteId: note.id });
    this.updateViewModel({
      isDeleteModalOpen: true,
      selectedNote: note
    });
  }

  closeDeleteModal(): void {
    this._logger.info('[PatchNotesAdminPresenter] Closing delete modal');
    this.updateViewModel({
      isDeleteModalOpen: false,
      selectedNote: null
    });
  }

  clearError(): void {
    this.updateViewModel({ error: undefined });
  }
}
