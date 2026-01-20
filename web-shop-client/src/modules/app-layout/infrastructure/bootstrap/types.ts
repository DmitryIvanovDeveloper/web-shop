export const APP_LAYOUT_TYPES = {
  SidebarRendererPresenter: Symbol.for('AppLayout.SidebarRendererPresenter'),
  AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
  TranslationsConfigEventHandler: Symbol.for('IAsyncEventHandler<TranslationsConfigEvent>'),
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>'),
};

export const UI_RENDERER_TYPES = APP_LAYOUT_TYPES;


