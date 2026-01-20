import { Container } from 'inversify';
import { UI_BUILDER_TYPES } from './types';

import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import type { ConfigValidatorPort } from '../../application/ports/config-validator.port';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import type { PageConfigStoragePort } from '../../application/ports/page-config-storage.port';

import { SupabaseConfigStorage } from '../storage/supabase-config.storage';
import { JsonSchemaValidator } from '../storage/json-schema-validator';
import { PostMessagePreviewAdapter } from '../messaging/postmessage-preview.adapter';
import { SupabasePageConfigStorage } from '../storage/supabase-page-config.storage';
import { SupabaseTemplateRepository } from '../storage/supabase-template.repository';
import { SupabaseUserAppConfigRepository } from '../storage/supabase-user-app-config.repository';
import { UiBuilderConfigApiRepository } from '../storage/ui-builder-config-api.repository';

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
import { CreateTemplateUseCase } from '../../application/use-cases/create-template.use-case';
import { UpdateTemplateUseCase } from '../../application/use-cases/update-template.use-case';
import { DeleteTemplateUseCase } from '../../application/use-cases/delete-template.use-case';
import { ListTemplatesUseCase } from '../../application/use-cases/list-templates.use-case';
import { GetTemplateDetailsUseCase } from '../../application/use-cases/get-template-details.use-case';
import { PublishTemplateUseCase } from '../../application/use-cases/publish-template.use-case';
import { ListUserAppConfigsUseCase } from '../../application/use-cases/list-user-app-configs.use-case';
import { ApplyUserAppConfigUseCase } from '../../application/use-cases/apply-user-app-config.use-case';

import { UIBuilderPresenter } from '../../interface-adapters/presenters/ui-builder.presenter';
import { PageConstructorPresenter } from '../../interface-adapters/presenters/page-constructor.presenter';
import { TemplatesPresenter } from '../../interface-adapters/presenters/templates.presenter';

export function bindUIBuilder(container: Container): void {
  
  container
    .bind<ConfigStoragePort>(UI_BUILDER_TYPES.ConfigStorage)
    .to(UiBuilderConfigApiRepository)
    .inSingletonScope();

  container
    .bind<ConfigStoragePort>(UI_BUILDER_TYPES.ConfigStoragePort)
    .to(UiBuilderConfigApiRepository)
    .inSingletonScope();

  container
    .bind<ConfigValidatorPort>(UI_BUILDER_TYPES.ConfigValidator)
    .to(JsonSchemaValidator)
    .inSingletonScope();

  container
    .bind<PreviewCommunicationPort>(UI_BUILDER_TYPES.PreviewCommunication)
    .to(PostMessagePreviewAdapter)
    .inSingletonScope();

  container
    .bind<PageConfigStoragePort>(UI_BUILDER_TYPES.PageConfigStorage)
    .to(SupabasePageConfigStorage)
    .inSingletonScope();

  container
    .bind<import('../../application/ports/template-repository.port').TemplateRepositoryPort>(
      UI_BUILDER_TYPES.TemplateRepository
    )
    .to(SupabaseTemplateRepository)
    .inSingletonScope();

  container
    .bind<import('../../application/ports/user-app-config-repository.port').UserAppConfigRepositoryPort>(
      UI_BUILDER_TYPES.UserAppConfigRepository
    )
    .to(SupabaseUserAppConfigRepository)
    .inSingletonScope();

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

  container
    .bind<CreateTemplateUseCase>(UI_BUILDER_TYPES.CreateTemplateUseCase)
    .to(CreateTemplateUseCase)
    .inSingletonScope();

  container
    .bind<UpdateTemplateUseCase>(UI_BUILDER_TYPES.UpdateTemplateUseCase)
    .to(UpdateTemplateUseCase)
    .inSingletonScope();

  container
    .bind<DeleteTemplateUseCase>(UI_BUILDER_TYPES.DeleteTemplateUseCase)
    .to(DeleteTemplateUseCase)
    .inSingletonScope();

  container
    .bind<ListTemplatesUseCase>(UI_BUILDER_TYPES.ListTemplatesUseCase)
    .to(ListTemplatesUseCase)
    .inSingletonScope();

  container
    .bind<GetTemplateDetailsUseCase>(UI_BUILDER_TYPES.GetTemplateDetailsUseCase)
    .to(GetTemplateDetailsUseCase)
    .inSingletonScope();

  container
    .bind<PublishTemplateUseCase>(UI_BUILDER_TYPES.PublishTemplateUseCase)
    .to(PublishTemplateUseCase)
    .inSingletonScope();

  container
    .bind<ListUserAppConfigsUseCase>(UI_BUILDER_TYPES.ListUserAppConfigsUseCase)
    .to(ListUserAppConfigsUseCase)
    .inSingletonScope();

  container
    .bind<ApplyUserAppConfigUseCase>(UI_BUILDER_TYPES.ApplyUserAppConfigUseCase)
    .to(ApplyUserAppConfigUseCase)
    .inSingletonScope();

  container
    .bind<UIBuilderPresenter>(UI_BUILDER_TYPES.UIBuilderPresenter)
    .to(UIBuilderPresenter)
    .inSingletonScope();

  container
    .bind<PageConstructorPresenter>(UI_BUILDER_TYPES.PageConstructorPresenter)
    .to(PageConstructorPresenter)
    .inSingletonScope();

  container
    .bind<TemplatesPresenter>(UI_BUILDER_TYPES.TemplatesPresenter)
    .to(TemplatesPresenter)
    .inSingletonScope();
}

