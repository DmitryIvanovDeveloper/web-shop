import { Container } from 'inversify';
import { APP_BUILDER_TYPES } from './types';
import { ListTemplatesUseCase } from '../../application/use-cases/list-templates.use-case';
import { GetTemplateDetailsUseCase } from '../../application/use-cases/get-template-details.use-case';
import { GetAppConfigUseCase } from '../../application/use-cases/get-app-config.use-case';
import { SaveAppConfigUseCase } from '../../application/use-cases/save-app-config.use-case';
import { GetAppConfigsListUseCase } from '../../application/use-cases/get-app-configs-list.use-case';
import { DeleteAppConfigUseCase } from '../../application/use-cases/delete-app-config.use-case';
import { PublishAppConfigUseCase } from '../../application/use-cases/publish-app-config.use-case';
import { TemplatesPresenter } from '../../interface-adapters/presenters/templates.presenter';
import { ConfigsPresenter } from '../../interface-adapters/presenters/configs.presenter';
import { AppConfigRepository } from '../repository/app-config.repository';
import { TemplateRepository } from '../repository/template.repository';

export function bindAppBuilder(container: Container): void {
  container
    .bind<import('../../application/ports/template-repository.port').TemplateRepositoryPort>(
      APP_BUILDER_TYPES.TemplateRepository
    )
    .to(TemplateRepository)
    .inSingletonScope();

  container
    .bind<import('../../application/ports/app-config-repository.port').AppConfigRepositoryPort>(
      APP_BUILDER_TYPES.AppConfigRepository
    )
    .to(AppConfigRepository)
    .inSingletonScope();

  container
    .bind<ListTemplatesUseCase>(APP_BUILDER_TYPES.ListTemplatesUseCase)
    .to(ListTemplatesUseCase)
    .inSingletonScope();

  container
    .bind<GetTemplateDetailsUseCase>(APP_BUILDER_TYPES.GetTemplateDetailsUseCase)
    .to(GetTemplateDetailsUseCase)
    .inSingletonScope();

  container
    .bind<GetAppConfigUseCase>(APP_BUILDER_TYPES.GetAppConfigUseCase)
    .to(GetAppConfigUseCase)
    .inSingletonScope();

  container
    .bind<SaveAppConfigUseCase>(APP_BUILDER_TYPES.SaveAppConfigUseCase)
    .to(SaveAppConfigUseCase)
    .inSingletonScope();

  container
    .bind<GetAppConfigsListUseCase>(APP_BUILDER_TYPES.GetAppConfigsListUseCase)
    .to(GetAppConfigsListUseCase)
    .inSingletonScope();

  container
    .bind<DeleteAppConfigUseCase>(APP_BUILDER_TYPES.DeleteAppConfigUseCase)
    .to(DeleteAppConfigUseCase)
    .inSingletonScope();

  container
    .bind<PublishAppConfigUseCase>(APP_BUILDER_TYPES.PublishAppConfigUseCase)
    .to(PublishAppConfigUseCase)
    .inSingletonScope();

  container
    .bind<TemplatesPresenter>(APP_BUILDER_TYPES.TemplatesPresenter)
    .to(TemplatesPresenter)
    .inSingletonScope();

  container
    .bind<ConfigsPresenter>(APP_BUILDER_TYPES.ConfigsPresenter)
    .to(ConfigsPresenter)
    .inSingletonScope();
}
