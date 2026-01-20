'use client';

import React from 'react';
import { ProjectListItemViewModel } from '../../view-models/projects.view-model';

interface ProjectsListProps {
  projects: readonly ProjectListItemViewModel[];
  activeProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
  onProjectEdit?: (projectId: string) => void;
  isLoading?: boolean;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  activeProjectId,
  onProjectSelect,
  onProjectEdit,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No projects found. Create your first project to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`
            p-4 border rounded-lg transition-all duration-200
            ${project.id === activeProjectId
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {project.id === activeProjectId && (
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  App ID: {project.appId}
                </p>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${project.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }
              `}>
                {project.status}
              </span>

              <div className="flex gap-2">
                {onProjectSelect && project.id !== activeProjectId && (
                  <button
                    onClick={() => onProjectSelect(project.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Select
                  </button>
                )}

                {onProjectEdit && (
                  <button
                    onClick={() => onProjectEdit(project.id)}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Updated: {project.updatedAt.toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

