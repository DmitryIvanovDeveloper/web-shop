export const PATCH_NOTES_TYPES = {
    PatchNoteRepository: Symbol.for('PatchNoteRepository'),
  PatchNoteScheduler: Symbol.for('PatchNoteScheduler'),

    CreatePatchNoteUseCase: Symbol.for('CreatePatchNoteUseCase'),
  PublishPatchNoteUseCase: Symbol.for('PublishPatchNoteUseCase'),
  GetPublishedPatchNotesUseCase: Symbol.for('GetPublishedPatchNotesUseCase'),

    PatchNotesAdminPresenter: Symbol.for('PatchNotesAdminPresenter'),
  PatchNotesPublicPresenter: Symbol.for('PatchNotesPublicPresenter'),

    LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>'),
} as const;








