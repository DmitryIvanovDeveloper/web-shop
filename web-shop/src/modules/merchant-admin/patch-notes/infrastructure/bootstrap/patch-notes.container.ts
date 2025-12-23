import { Container } from 'inversify';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from './types';
import { SupabasePatchNoteRepository } from '../repositories/supabase-patch-note.repository';
import { CreatePatchNoteUseCase } from '../../application/use-cases/create-patch-note.use-case';
import { UpdatePatchNoteUseCase } from '../../application/use-cases/update-patch-note.use-case';
import { DeletePatchNoteUseCase } from '../../application/use-cases/delete-patch-note.use-case';
import { GetPatchNotesUseCase } from '../../application/use-cases/get-patch-notes.use-case';
import { PatchNotesAdminPresenter } from '../../interface-adapters/presenters/patch-notes-admin.presenter';

export function bindMerchantAdminPatchNotes(container: Container): void {
  // Repositories
  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    .to(SupabasePatchNoteRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.CreatePatchNoteUseCase)
    .to(CreatePatchNoteUseCase)
    .inSingletonScope();

  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.UpdatePatchNoteUseCase)
    .to(UpdatePatchNoteUseCase)
    .inSingletonScope();

  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.DeletePatchNoteUseCase)
    .to(DeletePatchNoteUseCase)
    .inSingletonScope();

  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.GetPatchNotesUseCase)
    .to(GetPatchNotesUseCase)
    .inSingletonScope();

  // Presenters
  container
    .bind(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNotesAdminPresenter)
    .to(PatchNotesAdminPresenter)
    .inSingletonScope();
}
