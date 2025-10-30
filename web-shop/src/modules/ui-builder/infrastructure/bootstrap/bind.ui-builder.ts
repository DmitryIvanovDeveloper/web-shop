import { Container } from 'inversify';
import { UI_BUILDER_TYPES } from './types';

// Ports
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import type { ConfigValidatorPort } from '../../application/ports/config-validator.port';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import type { LocalDraftStoragePort } from '../../application/ports/local-draft-storage.port';

// Implementations
import { SupabaseConfigStorage } from '../storage/supabase-config.storage';
import { JsonSchemaValidator } from '../storage/json-schema-validator';
import { PostMessagePreviewAdapter } from '../messaging/postmessage-preview.adapter';
import { LocalStorageDraftAdapter } from '../storage/localstorage-draft.adapter';

// Use Cases
import { LoadConfigUseCase } from '../../application/use-cases/load-config.use-case';
import { SaveConfigUseCase } from '../../application/use-cases/save-config.use-case';
import { ValidateConfigUseCase } from '../../application/use-cases/validate-config.use-case';
import { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import { LoadDraftUseCase } from '../../application/use-cases/load-draft.use-case';
import { PublishDraftUseCase } from '../../application/use-cases/publish-draft.use-case';

// Presenters
import { UIBuilderPresenter } from '../../interface-adapters/presenters/ui-builder.presenter';

export function bindUIBuilder(container: Container): void {
  // Storage
  container
    .bind<ConfigStoragePort>(UI_BUILDER_TYPES.ConfigStorage)
    .to(SupabaseConfigStorage)
    .inSingletonScope();

  container
    .bind<LocalDraftStoragePort>(UI_BUILDER_TYPES.LocalDraftStorage)
    .to(LocalStorageDraftAdapter)
    .inSingletonScope();

  // Validators
  container
    .bind<ConfigValidatorPort>(UI_BUILDER_TYPES.ConfigValidator)
    .to(JsonSchemaValidator)
    .inSingletonScope();

  // Communication
  container
    .bind<PreviewCommunicationPort>(UI_BUILDER_TYPES.PreviewCommunication)
    .to(PostMessagePreviewAdapter)
    .inSingletonScope();

  // Use Cases
  container
    .bind<LoadConfigUseCase>(UI_BUILDER_TYPES.LoadConfigUseCase)
    .to(LoadConfigUseCase)
    .inSingletonScope();

  container
    .bind<SaveConfigUseCase>(UI_BUILDER_TYPES.SaveConfigUseCase)
    .to(SaveConfigUseCase)
    .inSingletonScope();

  container
    .bind<ValidateConfigUseCase>(UI_BUILDER_TYPES.ValidateConfigUseCase)
    .to(ValidateConfigUseCase)
    .inSingletonScope();

  container
    .bind<SaveDraftUseCase>(UI_BUILDER_TYPES.SaveDraftUseCase)
    .to(SaveDraftUseCase)
    .inSingletonScope();

  container
    .bind<LoadDraftUseCase>(UI_BUILDER_TYPES.LoadDraftUseCase)
    .to(LoadDraftUseCase)
    .inSingletonScope();

  container
    .bind<PublishDraftUseCase>(UI_BUILDER_TYPES.PublishDraftUseCase)
    .to(PublishDraftUseCase)
    .inSingletonScope();

  // Presenters
  container
    .bind<UIBuilderPresenter>(UI_BUILDER_TYPES.UIBuilderPresenter)
    .to(UIBuilderPresenter)
    .inSingletonScope();
}



