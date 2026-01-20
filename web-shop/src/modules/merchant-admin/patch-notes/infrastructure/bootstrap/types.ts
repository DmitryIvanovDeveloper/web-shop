export const MERCHANT_ADMIN_PATCH_NOTES_TYPES = {
  
  PatchNoteRepository: Symbol.for('MerchantAdminPatchNoteRepository'),

  CreatePatchNoteUseCase: Symbol.for('MerchantAdminCreatePatchNoteUseCase'),
  UpdatePatchNoteUseCase: Symbol.for('MerchantAdminUpdatePatchNoteUseCase'),
  DeletePatchNoteUseCase: Symbol.for('MerchantAdminDeletePatchNoteUseCase'),
  GetPatchNotesUseCase: Symbol.for('MerchantAdminGetPatchNotesUseCase'),

  PatchNotesAdminPresenter: Symbol.for('MerchantAdminPatchNotesPresenter')
} as const;
