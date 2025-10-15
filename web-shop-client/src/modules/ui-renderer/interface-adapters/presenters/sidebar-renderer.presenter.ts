import { injectable, inject } from 'inversify';
import type { LoadPageConfigUseCase } from '../../application/use-cases/load-page-config.use-case';
import type { SidebarViewModel } from '../view-models/sidebar.view-model';
import { UI_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class SidebarRendererPresenter {
  constructor(
    @inject(UI_RENDERER_TYPES.LoadPageConfigUseCase)
    private readonly _loadConfigUseCase: LoadPageConfigUseCase
  ) {}

  public readonly labels = {
    loading: 'Loading...',
    error: 'Failed to load configuration',
    store: 'Store',
  } as const;

  public async loadSidebar(): Promise<SidebarViewModel> {
    const result = await this._loadConfigUseCase.execute({
      pageType: 'sidebar',
    });

    if (result.isFailure()) {
      return { status: 'error', error: result.error.message };
    }

    if (result.isSuccess()) {
      return { status: 'success', config: result.data };
    }

    return { status: 'error', error: 'Unknown error' };
  }
}

