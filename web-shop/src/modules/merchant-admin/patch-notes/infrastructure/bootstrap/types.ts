export const MERCHANT_ADMIN_PATCH_NOTES_TYPES = {
  // Repositories
  PatchNoteRepository: Symbol.for('MerchantAdminPatchNoteRepository'),

  // Use Cases
  CreatePatchNoteUseCase: Symbol.for('MerchantAdminCreatePatchNoteUseCase'),
  UpdatePatchNoteUseCase: Symbol.for('MerchantAdminUpdatePatchNoteUseCase'),
  DeletePatchNoteUseCase: Symbol.for('MerchantAdminDeletePatchNoteUseCase'),
  GetPatchNotesUseCase: Symbol.for('MerchantAdminGetPatchNotesUseCase'),

  // Presenters
  PatchNotesAdminPresenter: Symbol.for('MerchantAdminPatchNotesPresenter')
} as const;
