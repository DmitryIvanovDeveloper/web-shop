import { Container } from 'inversify';
import { PROJECT_TYPES } from './types';

// Repositories
import { SupabaseProjectRepository } from '../repositories/supabase-project.repository';

// Use Cases
import {
  ListMerchantProjectsUseCase,
  GetActiveProjectUseCase,
  SelectActiveProjectUseCase,
  CreateProjectUseCase,
  UpdateProjectUseCase
} from '../../application';

// Presenters
import { ProjectsPresenter } from '../../interface-adapters/presenters/projects.presenter';

export function bindMerchantAdminProjects(container: Container): void {
  // Repositories
  container
    .bind(PROJECT_TYPES.ProjectRepository)
    .to(SupabaseProjectRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(PROJECT_TYPES.ListMerchantProjectsUseCase)
    .to(ListMerchantProjectsUseCase)
    .inSingletonScope();

  container
    .bind(PROJECT_TYPES.GetActiveProjectUseCase)
    .to(GetActiveProjectUseCase)
    .inSingletonScope();

  container
    .bind(PROJECT_TYPES.SelectActiveProjectUseCase)
    .to(SelectActiveProjectUseCase)
    .inSingletonScope();

  container
    .bind(PROJECT_TYPES.CreateProjectUseCase)
    .to(CreateProjectUseCase)
    .inSingletonScope();

  container
    .bind(PROJECT_TYPES.UpdateProjectUseCase)
    .to(UpdateProjectUseCase)
    .inSingletonScope();

  // Presenters
  container
    .bind(PROJECT_TYPES.ProjectsPresenter)
    .to(ProjectsPresenter)
    .inSingletonScope();
}