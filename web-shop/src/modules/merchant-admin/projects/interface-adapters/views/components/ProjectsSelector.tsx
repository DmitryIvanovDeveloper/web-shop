'use client';

import React from 'react';
import { ProjectListItemViewModel } from '../../view-models/projects.view-model';

interface ProjectsSelectorProps {
  projects: readonly ProjectListItemViewModel[];
  activeProject: ProjectListItemViewModel | null;
  onProjectSelect: (projectId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ProjectsSelector: React.FC<ProjectsSelectorProps> = ({
  projects,
  activeProject,
  onProjectSelect,
  isLoading = false,
  disabled = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <div>
          <label htmlFor="project-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Switch Active Project
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select which project should be active for your application
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          id="project-select"
          value={activeProject?.id || ''}
          onChange={(e) => onProjectSelect(e.target.value)}
          disabled={disabled || isLoading}
          className={`
            px-4 py-2.5 border rounded-lg shadow-sm transition-all duration-200
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            border-slate-300 dark:border-slate-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-slate-400 dark:hover:border-slate-500
            disabled:opacity-50 disabled:cursor-not-allowed
            min-w-[280px]
          `}
        >
          {isLoading ? (
            <option>Loading projects...</option>
          ) : projects.length === 0 ? (
            <option>No projects available</option>
          ) : (
            <>
              <option value="">Select a project to activate</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.appId})
                </option>
              ))}
            </>
          )}
        </select>

        {activeProject && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activeProject.appId}
          </div>
        )}
      </div>
    </div>
  );
};

