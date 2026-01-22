export const APP_BUILDER_TYPES = {
  TemplateRepository: Symbol.for('AppBuilder.TemplateRepository'),
  AppConfigRepository: Symbol.for('AppBuilder.AppConfigRepository'),
  ListTemplatesUseCase: Symbol.for('AppBuilder.ListTemplatesUseCase'),
  GetTemplateDetailsUseCase: Symbol.for('AppBuilder.GetTemplateDetailsUseCase'),
  GetAppConfigUseCase: Symbol.for('AppBuilder.GetAppConfigUseCase'),
  SaveAppConfigUseCase: Symbol.for('AppBuilder.SaveAppConfigUseCase'),
  GetAppConfigsListUseCase: Symbol.for('AppBuilder.GetAppConfigsListUseCase'),
  DeleteAppConfigUseCase: Symbol.for('AppBuilder.DeleteAppConfigUseCase'),
  PublishAppConfigUseCase: Symbol.for('AppBuilder.PublishAppConfigUseCase'),
  TemplatesPresenter: Symbol.for('AppBuilder.TemplatesPresenter'),
  ConfigsPresenter: Symbol.for('AppBuilder.ConfigsPresenter'),
};
