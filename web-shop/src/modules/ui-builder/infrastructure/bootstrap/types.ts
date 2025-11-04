export const UI_BUILDER_TYPES = {
  // Storage
  ConfigStorage: Symbol.for('UIBuilder.ConfigStorage'),
  ConfigStoragePort: Symbol.for('UIBuilder.ConfigStoragePort'),

  // Validators
  ConfigValidator: Symbol.for('UIBuilder.ConfigValidator'),

  // Communication
  PreviewCommunication: Symbol.for('UIBuilder.PreviewCommunication'),

  // Use Cases
  LoadConfigUseCase: Symbol.for('UIBuilder.LoadConfigUseCase'),
  SaveConfigUseCase: Symbol.for('UIBuilder.SaveConfigUseCase'),
  ValidateConfigUseCase: Symbol.for('UIBuilder.ValidateConfigUseCase'),
  SaveDraftUseCase: Symbol.for('UIBuilder.SaveDraftUseCase'),
  LoadDraftUseCase: Symbol.for('UIBuilder.LoadDraftUseCase'),
  LoadDraftConfigUseCase: Symbol.for('UIBuilder.LoadDraftConfigUseCase'),
  LoadActiveConfigUseCase: Symbol.for('UIBuilder.LoadActiveConfigUseCase'),
  PublishDraftUseCase: Symbol.for('UIBuilder.PublishDraftUseCase'),
  
  // Page Config Storage & Use Cases
  PageConfigStorage: Symbol.for('UIBuilder.PageConfigStorage'),
  LoadPageDraftUseCase: Symbol.for('UIBuilder.LoadPageDraftUseCase'),
  SavePageDraftUseCase: Symbol.for('UIBuilder.SavePageDraftUseCase'),
  PublishPageUseCase: Symbol.for('UIBuilder.PublishPageUseCase'),

  // Presenters
  UIBuilderPresenter: Symbol.for('UIBuilder.UIBuilderPresenter'),
  PageConstructorPresenter: Symbol.for('UIBuilder.PageConstructorPresenter'),
};





