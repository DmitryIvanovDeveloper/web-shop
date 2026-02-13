export const UI_RENDERER_TYPES = {
  SidebarRendererPresenter: Symbol.for('UIRenderer.SidebarRendererPresenter'),
  ComponentRegistry: Symbol.for('UIRenderer.ComponentRegistry'),
  StyleBuilder: Symbol.for('UIRenderer.StyleBuilder'),
  ActionHandler: Symbol.for('UIRenderer.ActionHandler'),
  AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
  TranslationsConfigEventHandler: Symbol.for('IAsyncEventHandler<TranslationsConfigEvent>'),
  LanguageChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>'),
};


