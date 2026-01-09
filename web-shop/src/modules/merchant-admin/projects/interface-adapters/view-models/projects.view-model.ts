import { Project } from '../../domain';

export interface ProjectListItemViewModel {
  readonly id: string;
  readonly appId: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProjectsPageViewModel {
  readonly projects: readonly ProjectListItemViewModel[];
  readonly activeProject: ProjectListItemViewModel | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isCreating: boolean;
  readonly isUpdating: boolean;
}

export const initialProjectsPageViewModel: ProjectsPageViewModel = {
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false
};

export function mapProjectToViewModel(project: Project): ProjectListItemViewModel {
  return {
    id: project.id.value,
    appId: project.appId.value,
    name: project.name,
    description: project.description,
    status: project.status.value,
    isActive: project.isActive(),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

