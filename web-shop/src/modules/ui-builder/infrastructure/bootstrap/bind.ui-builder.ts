import { Container } from 'inversify';
import { UI_BUILDER_TYPES } from './types';

// Ports
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import type { ConfigValidatorPort } from '../../application/ports/config-validator.port';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import type { PageConfigStoragePort } from '../../application/ports/page-config-storage.port';

// Implementations
import { SupabaseConfigStorage } from '../storage/supabase-config.storage';
import { JsonSchemaValidator } from '../storage/json-schema-validator';
import { PostMessagePreviewAdapter } from '../messaging/postmessage-preview.adapter';
import { SupabasePageConfigStorage } from '../storage/supabase-page-config.storage';

// Use Cases
import { LoadConfigUseCase } from '../../application/use-cases/load-config.use-case';
import { SaveConfigUseCase } from '../../application/use-cases/save-config.use-case';
import { ValidateConfigUseCase } from '../../application/use-cases/validate-config.use-case';
import { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import { LoadDraftUseCase } from '../../application/use-cases/load-draft.use-case';
import { LoadDraftConfigUseCase } from '../../application/use-cases/load-draft-config.use-case';
import { LoadActiveConfigUseCase } from '../../application/use-cases/load-active-config.use-case';
import { PublishDraftUseCase } from '../../application/use-cases/publish-draft.use-case';
import { UpdateOfferCardsUseCase } from '../../application/use-cases/update-offer-cards.use-case';
import { LoadPageDraftUseCase } from '../../application/use-cases/load-page-draft.use-case';
import { SavePageDraftUseCase } from '../../application/use-cases/save-page-draft.use-case';
import { PublishPageUseCase } from '../../application/use-cases/publish-page.use-case';
import { CreatePageUseCase } from '../../application/use-cases/create-page.use-case';
import { ListPagesUseCase } from '../../application/use-cases/list-pages.use-case';

// Presenters
import { UIBuilderPresenter } from '../../interface-adapters/presenters/ui-builder.presenter';
import { PageConstructorPresenter } from '../../interface-adapters/presenters/page-constructor.presenter';

export function bindUIBuilder(container: Container): void {
  // Storage
  container
    .bind<ConfigStoragePort>(UI_BUILDER_TYPES.ConfigStorage)
    .to(SupabaseConfigStorage)
    .inSingletonScope();

  container
    .bind<ConfigStoragePort>(UI_BUILDER_TYPES.ConfigStoragePort)
    .to(SupabaseConfigStorage)
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

  // Page Config Storage
  container
    .bind<PageConfigStoragePort>(UI_BUILDER_TYPES.PageConfigStorage)
    .to(SupabasePageConfigStorage)
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
    .bind<LoadDraftConfigUseCase>(UI_BUILDER_TYPES.LoadDraftConfigUseCase)
    .to(LoadDraftConfigUseCase)
    .inSingletonScope();

  container
    .bind<LoadActiveConfigUseCase>(UI_BUILDER_TYPES.LoadActiveConfigUseCase)
    .to(LoadActiveConfigUseCase)
    .inSingletonScope();

  container
    .bind<PublishDraftUseCase>(UI_BUILDER_TYPES.PublishDraftUseCase)
    .to(PublishDraftUseCase)
    .inSingletonScope();

  container
    .bind<UpdateOfferCardsUseCase>(UI_BUILDER_TYPES.UpdateOfferCardsUseCase)
    .to(UpdateOfferCardsUseCase)
    .inSingletonScope();

  // Page Config Use Cases
  container
    .bind<LoadPageDraftUseCase>(UI_BUILDER_TYPES.LoadPageDraftUseCase)
    .to(LoadPageDraftUseCase)
    .inSingletonScope();

  container
    .bind<SavePageDraftUseCase>(UI_BUILDER_TYPES.SavePageDraftUseCase)
    .to(SavePageDraftUseCase)
    .inSingletonScope();

  container
    .bind<PublishPageUseCase>(UI_BUILDER_TYPES.PublishPageUseCase)
    .to(PublishPageUseCase)
    .inSingletonScope();

  container
    .bind<CreatePageUseCase>(UI_BUILDER_TYPES.CreatePageUseCase)
    .to(CreatePageUseCase)
    .inSingletonScope();

  container
    .bind<ListPagesUseCase>(UI_BUILDER_TYPES.ListPagesUseCase)
    .to(ListPagesUseCase)
    .inSingletonScope();

  // Presenters
  container
    .bind<UIBuilderPresenter>(UI_BUILDER_TYPES.UIBuilderPresenter)
    .to(UIBuilderPresenter)
    .inSingletonScope();

  container
    .bind<PageConstructorPresenter>(UI_BUILDER_TYPES.PageConstructorPresenter)
    .to(PageConstructorPresenter)
    .inSingletonScope();
}





