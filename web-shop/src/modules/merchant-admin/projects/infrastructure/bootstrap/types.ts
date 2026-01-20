export const PROJECT_TYPES = {
  ProjectRepository: Symbol.for('ProjectRepository'),

  ListMerchantProjectsUseCase: Symbol.for('ListMerchantProjectsUseCase'),
  GetActiveProjectUseCase: Symbol.for('GetActiveProjectUseCase'),
  SelectActiveProjectUseCase: Symbol.for('SelectActiveProjectUseCase'),
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'),
  UpdateProjectUseCase: Symbol.for('UpdateProjectUseCase'),

  ProjectsPresenter: Symbol.for('ProjectsPresenter'),
} as const;

