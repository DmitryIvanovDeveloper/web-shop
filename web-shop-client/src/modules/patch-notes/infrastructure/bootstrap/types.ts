export const PATCH_NOTES_TYPES = {
  // Repositories
  PatchNoteRepository: Symbol.for('PatchNoteRepository'),
  PatchNoteScheduler: Symbol.for('PatchNoteScheduler'),

  // Use Cases
  CreatePatchNoteUseCase: Symbol.for('CreatePatchNoteUseCase'),
  PublishPatchNoteUseCase: Symbol.for('PublishPatchNoteUseCase'),
  GetPublishedPatchNotesUseCase: Symbol.for('GetPublishedPatchNotesUseCase'),

  // Presenters
  PatchNotesAdminPresenter: Symbol.for('PatchNotesAdminPresenter'),
  PatchNotesPublicPresenter: Symbol.for('PatchNotesPublicPresenter')
} as const;

