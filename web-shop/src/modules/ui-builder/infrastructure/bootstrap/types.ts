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

  // Presenters
  UIBuilderPresenter: Symbol.for('UIBuilder.UIBuilderPresenter'),
};





