import { ContainerModule } from 'inversify';
import { PATCH_NOTES_TYPES } from './types';
import { SupabasePatchNoteRepository } from '../repositories/supabase-patch-note.repository';
import { PatchNoteSchedulerService } from '../repositories/patch-note-scheduler.service';
import { CreatePatchNoteUseCase } from '../../application/use-cases/create-patch-note.use-case';
import { PublishPatchNoteUseCase } from '../../application/use-cases/publish-patch-note.use-case';
import { GetPublishedPatchNotesUseCase } from '../../application/use-cases/get-published-patch-notes.use-case';
import { PatchNotesPublicPresenter } from '../../interface-adapters/presenters/patch-notes-public.presenter';

export const patchNotesModule = new ContainerModule((bind) => {
  // Repositories
  bind(PATCH_NOTES_TYPES.PatchNoteRepository)
    .to(SupabasePatchNoteRepository)
    .inSingletonScope();

  bind(PATCH_NOTES_TYPES.PatchNoteScheduler)
    .to(PatchNoteSchedulerService)
    .inSingletonScope();

  // Use Cases
  bind(PATCH_NOTES_TYPES.CreatePatchNoteUseCase)
    .to(CreatePatchNoteUseCase);

  bind(PATCH_NOTES_TYPES.PublishPatchNoteUseCase)
    .to(PublishPatchNoteUseCase);

  bind(PATCH_NOTES_TYPES.GetPublishedPatchNotesUseCase)
    .to(GetPublishedPatchNotesUseCase);

  // Presenters
  bind(PATCH_NOTES_TYPES.PatchNotesPublicPresenter)
    .to(PatchNotesPublicPresenter);
});
