export const PROJECT_TYPES = {
  ProjectRepository: Symbol.for('ProjectRepository'),

  // Use Cases
  ListMerchantProjectsUseCase: Symbol.for('ListMerchantProjectsUseCase'),
  GetActiveProjectUseCase: Symbol.for('GetActiveProjectUseCase'),
  SelectActiveProjectUseCase: Symbol.for('SelectActiveProjectUseCase'),
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'),
  UpdateProjectUseCase: Symbol.for('UpdateProjectUseCase'),

  // Presenters
  ProjectsPresenter: Symbol.for('ProjectsPresenter'),
} as const;


