import { inject, injectable } from 'inversify';

import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { CreatePatchNoteUseCase, UpdatePatchNoteUseCase, DeletePatchNoteUseCase, GetPatchNotesUseCase } from '../../application';
import type { CreatePatchNoteInput, UpdatePatchNoteInput, PatchNoteOutput } from '../../application/types/patch-note.types';
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
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.UpdatePatchNoteUseCase)
    private readonly _updatePatchNoteUseCase: UpdatePatchNoteUseCase,
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.DeletePatchNoteUseCase)
    private readonly _deletePatchNoteUseCase: DeletePatchNoteUseCase,
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
        this.updateViewModel({ status: 'loading' });

    try {
      const result = await this._getPatchNotesUseCase.execute({ appId });

      if (!result.isSuccess) {
                this.updateViewModel({
          status: 'error',
          error: result.error.message
        });
        return;
      }

      const patchNotes = result.value || [];

            this.updateViewModel({
        status: 'loaded',
        patchNotes,
        selectedNote: null,
        error: undefined
      });

    } catch (error) {
            this.updateViewModel({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createPatchNote(input: CreatePatchNoteInput): Promise<boolean> {
        this.updateViewModel({ status: 'creating' });

    try {
      const result = await this._createPatchNoteUseCase.execute(input);

      if (!result.isSuccess) {
                let errorMessage = result.error.message;
        if (result.error.message.includes('Version must follow semantic versioning format')) {
          errorMessage = 'Version must be in format x.y.z (e.g., 1.0.0, 2.5.3)';
        } else if (result.error.message.includes('already exists')) {
          errorMessage = 'A patch note with this version already exists';
        }

        this.updateViewModel({
          status: 'loaded'
        });
        this.showError(errorMessage);
        return false;
      }

            await this.loadPatchNotes(input.appId);

      return true;

    } catch (error) {
            this.updateViewModel({
        status: 'loaded',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  selectNote(note: PatchNoteOutput | null): void {
        this.updateViewModel({ selectedNote: note });
  }

  openCreateModal(): void {
        this.updateViewModel({
      isCreateModalOpen: true,
      selectedNote: null
    });
  }

  closeCreateModal(): void {
        this.updateViewModel({ isCreateModalOpen: false });
  }

  openEditModal(note: PatchNoteOutput): void {
        this.updateViewModel({
      isEditModalOpen: true,
      selectedNote: note
    });
  }

  closeEditModal(): void {
        this.updateViewModel({
      isEditModalOpen: false,
      selectedNote: null
    });
  }

  openDeleteModal(note: PatchNoteOutput): void {
        this.updateViewModel({
      isDeleteModalOpen: true,
      selectedNote: note
    });
  }

  closeDeleteModal(): void {
        this.updateViewModel({
      isDeleteModalOpen: false,
      selectedNote: null
    });
  }

  async updatePatchNote(input: UpdatePatchNoteInput): Promise<boolean> {
    this.clearError();
    this.updateViewModel({ status: 'updating' });

    try {
      const result = await this._updatePatchNoteUseCase.execute(input);

      if (!result.isSuccess) {
                this.updateViewModel({ status: 'error', error: result.error.message });
        return false;
      }

            this.updateViewModel({ status: 'loaded' });
      this.closeEditModal();
      
      await this.loadPatchNotes(input.appId);
      return true;
    } catch (error) {
            this.updateViewModel({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async deletePatchNote(id: string, appId: string): Promise<boolean> {
    this.clearError();

    try {
      const result = await this._deletePatchNoteUseCase.execute({ id, appId });

      if (!result.isSuccess) {
                this.updateViewModel({ error: result.error.message });
        return false;
    }

            this.closeDeleteModal();
      
      await this.loadPatchNotes(appId);
      return true;
    } catch (error) {
            this.updateViewModel({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  clearError(): void {
    this.updateViewModel({ error: undefined });
  }

  showError(error: string): void {
    this.updateViewModel({ error });
  }
}
