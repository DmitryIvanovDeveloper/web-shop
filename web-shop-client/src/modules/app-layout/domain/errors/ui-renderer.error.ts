export class AppLayoutError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CONFIG' | 'COMPONENT_NOT_FOUND' | 'DATA_LOADING_FAILED'
  ) {
    super(message);
    this.name = 'AppLayoutError';
  }
}

export const UIRendererError = AppLayoutError;


