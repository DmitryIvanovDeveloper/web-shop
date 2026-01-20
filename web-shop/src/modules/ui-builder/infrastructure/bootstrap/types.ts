export const UI_BUILDER_TYPES = {
  
  ConfigStorage: Symbol.for('UIBuilder.ConfigStorage'),
  ConfigStoragePort: Symbol.for('UIBuilder.ConfigStoragePort'),

  ConfigValidator: Symbol.for('UIBuilder.ConfigValidator'),

  PreviewCommunication: Symbol.for('UIBuilder.PreviewCommunication'),

  LoadConfigUseCase: Symbol.for('UIBuilder.LoadConfigUseCase'),
  SaveConfigUseCase: Symbol.for('UIBuilder.SaveConfigUseCase'),
  ValidateConfigUseCase: Symbol.for('UIBuilder.ValidateConfigUseCase'),
  SaveDraftUseCase: Symbol.for('UIBuilder.SaveDraftUseCase'),
  LoadDraftUseCase: Symbol.for('UIBuilder.LoadDraftUseCase'),
  LoadDraftConfigUseCase: Symbol.for('UIBuilder.LoadDraftConfigUseCase'),
  LoadActiveConfigUseCase: Symbol.for('UIBuilder.LoadActiveConfigUseCase'),
  PublishDraftUseCase: Symbol.for('UIBuilder.PublishDraftUseCase'),
  UpdateOfferCardsUseCase: Symbol.for('UIBuilder.UpdateOfferCardsUseCase'),

  PageConfigStorage: Symbol.for('UIBuilder.PageConfigStorage'),
  LoadPageDraftUseCase: Symbol.for('UIBuilder.LoadPageDraftUseCase'),
  SavePageDraftUseCase: Symbol.for('UIBuilder.SavePageDraftUseCase'),
  PublishPageUseCase: Symbol.for('UIBuilder.PublishPageUseCase'),
  CreatePageUseCase: Symbol.for('UIBuilder.CreatePageUseCase'),
  ListPagesUseCase: Symbol.for('UIBuilder.ListPagesUseCase'),

  TemplateRepository: Symbol.for('UIBuilder.TemplateRepository'),
  CreateTemplateUseCase: Symbol.for('UIBuilder.CreateTemplateUseCase'),
  UpdateTemplateUseCase: Symbol.for('UIBuilder.UpdateTemplateUseCase'),
  DeleteTemplateUseCase: Symbol.for('UIBuilder.DeleteTemplateUseCase'),
  ListTemplatesUseCase: Symbol.for('UIBuilder.ListTemplatesUseCase'),
  GetTemplateDetailsUseCase: Symbol.for('UIBuilder.GetTemplateDetailsUseCase'),
  PublishTemplateUseCase: Symbol.for('UIBuilder.PublishTemplateUseCase'),

  UserAppConfigRepository: Symbol.for('UIBuilder.UserAppConfigRepository'),
  ListUserAppConfigsUseCase: Symbol.for('UIBuilder.ListUserAppConfigsUseCase'),
  ApplyUserAppConfigUseCase: Symbol.for('UIBuilder.ApplyUserAppConfigUseCase'),

  UIBuilderPresenter: Symbol.for('UIBuilder.UIBuilderPresenter'),
  PageConstructorPresenter: Symbol.for('UIBuilder.PageConstructorPresenter'),
  TemplatesPresenter: Symbol.for('UIBuilder.TemplatesPresenter'),
};

