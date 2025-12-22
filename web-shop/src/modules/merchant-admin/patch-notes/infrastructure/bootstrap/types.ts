export const MERCHANT_ADMIN_PATCH_NOTES_TYPES = {
  // Repositories
  PatchNoteRepository: Symbol.for('MerchantAdminPatchNoteRepository'),

  // Use Cases
  CreatePatchNoteUseCase: Symbol.for('MerchantAdminCreatePatchNoteUseCase'),
  GetPatchNotesUseCase: Symbol.for('MerchantAdminGetPatchNotesUseCase'),

  // Presenters
  PatchNotesAdminPresenter: Symbol.for('MerchantAdminPatchNotesPresenter')
} as const;
