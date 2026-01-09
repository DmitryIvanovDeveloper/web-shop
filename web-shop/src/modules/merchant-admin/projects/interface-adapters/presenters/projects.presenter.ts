import { inject, injectable } from 'inversify';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import {
  ProjectsPageViewModel,
  initialProjectsPageViewModel,
  mapProjectToViewModel
} from '../view-models/projects.view-model';
import {
  ListMerchantProjectsUseCase,
  GetActiveProjectUseCase,
  SelectActiveProjectUseCase,
  CreateProjectUseCase,
  UpdateProjectUseCase,
  ListMerchantProjectsRequest,
  GetActiveProjectRequest,
  SelectActiveProjectRequest,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../../application';

interface Subscriber {
  (viewModel: ProjectsPageViewModel): void;
}

@injectable()
export class ProjectsPresenter {
  private _viewModel: ProjectsPageViewModel = { ...initialProjectsPageViewModel };
  private _subscribers: Subscriber[] = [];
  private _currentMerchantId: string | null = null;

  constructor(
    @inject(PROJECT_TYPES.ListMerchantProjectsUseCase)
    private readonly _listProjectsUseCase: ListMerchantProjectsUseCase,
    @inject(PROJECT_TYPES.GetActiveProjectUseCase)
    private readonly _getActiveProjectUseCase: GetActiveProjectUseCase,
    @inject(PROJECT_TYPES.SelectActiveProjectUseCase)
    private readonly _selectProjectUseCase: SelectActiveProjectUseCase,
    @inject(PROJECT_TYPES.CreateProjectUseCase)
    private readonly _createProjectUseCase: CreateProjectUseCase,
    @inject(PROJECT_TYPES.UpdateProjectUseCase)
    private readonly _updateProjectUseCase: UpdateProjectUseCase,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  get viewModel(): ProjectsPageViewModel {
    return { ...this._viewModel };
  }

  subscribe(callback: Subscriber): () => void {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach(callback => callback(this.viewModel));
  }

  private _updateViewModel(updates: Partial<ProjectsPageViewModel>): void {
    this._viewModel = { ...this._viewModel, ...updates };
    this._notifySubscribers();
  }

  async initializeForMerchant(merchantId: string): Promise<void> {
    this._currentMerchantId = merchantId;
    await this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    if (!this._currentMerchantId) {
      this._logger.warn('[ProjectsPresenter] No merchant ID set for loading projects');
      return;
    }

    this._updateViewModel({ isLoading: true, error: null });

    try {
      // Load all projects for the merchant
      const listResult = await this._listProjectsUseCase.execute({
        merchantId: this._currentMerchantId
      } as ListMerchantProjectsRequest);

      if (listResult.isFailure) {
        this._logger.error('[ProjectsPresenter] Failed to load projects', listResult.error);
        this._updateViewModel({
          isLoading: false,
          error: listResult.error?.message || 'Failed to load projects'
        });
        return;
      }

      // Load active project
      const activeResult = await this._getActiveProjectUseCase.execute({
        merchantId: this._currentMerchantId
      } as GetActiveProjectRequest);

      if (activeResult.isFailure) {
        this._logger.error('[ProjectsPresenter] Failed to load active project', activeResult.error);
        this._updateViewModel({
          isLoading: false,
          error: activeResult.error?.message || 'Failed to load active project'
        });
        return;
      }

      const projects = listResult.value!.projects.map(mapProjectToViewModel);
      const activeProject = activeResult.value!.project ? mapProjectToViewModel(activeResult.value!.project) : null;

      this._updateViewModel({
        projects,
        activeProject,
        isLoading: false,
        error: null
      });

      this._logger.info('[ProjectsPresenter] Projects loaded successfully', {
        projectCount: projects.length,
        activeProjectId: activeProject?.id
      });
    } catch (error) {
      this._logger.error('[ProjectsPresenter] Unexpected error loading projects', error);
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async selectProject(projectId: string): Promise<Project | null> {
    if (!this._currentMerchantId) {
      this._logger.warn('[ProjectsPresenter] No merchant ID set for project selection');
      return null;
    }

    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._selectProjectUseCase.execute({
        merchantId: this._currentMerchantId,
        projectId
      } as SelectActiveProjectRequest);

      if (result.isFailure) {
        this._logger.error('[ProjectsPresenter] Failed to select project', result.error);
        this._updateViewModel({
          isLoading: false,
          error: result.error?.message || 'Failed to select project'
        });
        return null;
      }

      // Reload projects to get updated state
      await this.loadProjects();

      this._logger.info('[ProjectsPresenter] Project selected successfully', { projectId });

      // Return the selected project so the view can get appId
      return result.value!.project;
    } catch (error) {
      this._logger.error('[ProjectsPresenter] Unexpected error selecting project', error);
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createProject(name: string, appId: string, description?: string): Promise<void> {
    if (!this._currentMerchantId) {
      this._logger.warn('[ProjectsPresenter] No merchant ID set for project creation');
      return;
    }

    this._updateViewModel({ isCreating: true, error: null });

    try {
      const result = await this._createProjectUseCase.execute({
        merchantId: this._currentMerchantId,
        name,
        appId,
        description
      } as CreateProjectRequest);

      if (result.isFailure) {
        this._logger.error('[ProjectsPresenter] Failed to create project', result.error);
        this._updateViewModel({
          isCreating: false,
          error: result.error?.message || 'Failed to create project'
        });
        return;
      }

      // Reload projects to include the new one
      await this.loadProjects();

      this._logger.info('[ProjectsPresenter] Project created successfully', {
        projectId: result.value!.project.id.value,
        appId
      });
    } catch (error) {
      this._logger.error('[ProjectsPresenter] Unexpected error creating project', error);
      this._updateViewModel({
        isCreating: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateProject(projectId: string, name?: string, description?: string): Promise<void> {
    this._updateViewModel({ isUpdating: true, error: null });

    try {
      const result = await this._updateProjectUseCase.execute({
        projectId,
        name,
        description
      } as UpdateProjectRequest);

      if (result.isFailure) {
        this._logger.error('[ProjectsPresenter] Failed to update project', result.error);
        this._updateViewModel({
          isUpdating: false,
          error: result.error?.message || 'Failed to update project'
        });
        return;
      }

      // Reload projects to get updated data
      await this.loadProjects();

      this._logger.info('[ProjectsPresenter] Project updated successfully', { projectId });
    } catch (error) {
      this._logger.error('[ProjectsPresenter] Unexpected error updating project', error);
      this._updateViewModel({
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  clearError(): void {
    this._updateViewModel({ error: null });
  }
}
