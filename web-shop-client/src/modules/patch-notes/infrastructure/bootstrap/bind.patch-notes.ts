import type { Container } from 'inversify';
import { PATCH_NOTES_TYPES } from './types';
import { SupabasePatchNoteRepository } from '../repositories/supabase-patch-note.repository';
import { PatchNoteSchedulerService } from '../repositories/patch-note-scheduler.service';
import { CreatePatchNoteUseCase } from '../../application/use-cases/create-patch-note.use-case';
import { PublishPatchNoteUseCase } from '../../application/use-cases/publish-patch-note.use-case';
import { GetPublishedPatchNotesUseCase } from '../../application/use-cases/get-published-patch-notes.use-case';
import { PatchNotesPublicPresenter } from '../../interface-adapters/presenters/patch-notes-public.presenter';
import { PatchNotesLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { PatchNotesLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';

export function bindPatchNotes(container: Container): void {
  // Repositories
  container
    .bind(PATCH_NOTES_TYPES.PatchNoteRepository)
    .to(SupabasePatchNoteRepository)
    .inSingletonScope();

  container
    .bind(PATCH_NOTES_TYPES.PatchNoteScheduler)
    .to(PatchNoteSchedulerService)
    .inSingletonScope();

  // Use Cases
  container
    .bind(PATCH_NOTES_TYPES.CreatePatchNoteUseCase)
    .to(CreatePatchNoteUseCase);

  container
    .bind(PATCH_NOTES_TYPES.PublishPatchNoteUseCase)
    .to(PublishPatchNoteUseCase);

  container
    .bind(PATCH_NOTES_TYPES.GetPublishedPatchNotesUseCase)
    .to(GetPublishedPatchNotesUseCase);

  // Presenters
  container
    .bind(PATCH_NOTES_TYPES.PatchNotesPublicPresenter)
    .to(PatchNotesPublicPresenter)
    .inSingletonScope();

  // Event Handlers (Interface Adapters) - автоматически подхватываются EventBus
  container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(PATCH_NOTES_TYPES.LocalizationLoadedEventHandler)
    .to(PatchNotesLocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(PATCH_NOTES_TYPES.LocalizationChangedEventHandler)
    .to(PatchNotesLocalizationChangedEventHandler)
    .inTransientScope();
}
