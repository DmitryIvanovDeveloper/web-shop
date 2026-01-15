export const PAGE_RENDERER_TYPES = {
  PageConfigRepository: Symbol.for('PageRenderer.PageConfigRepository'),
  LoadPageConfigUseCase: Symbol.for('PageRenderer.LoadPageConfigUseCase'),
  LoadPageConfigFromMessageUseCase: Symbol.for('PageRenderer.LoadPageConfigFromMessageUseCase'),
  PageRendererPresenter: Symbol.for('PageRenderer.PageRendererPresenter'),
  PageConfigLoadedHandler: Symbol.for('PageRenderer.PageConfigLoadedHandler'),
  PageConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<PageConfigLoadedEvent>'),
  AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
};

