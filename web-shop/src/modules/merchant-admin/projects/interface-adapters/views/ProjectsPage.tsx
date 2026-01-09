'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PROJECT_TYPES } from '../../infrastructure/bootstrap/types';
import { ProjectsPresenter } from '../presenters/projects.presenter';
import { ProjectsPageViewModel } from '../view-models/projects.view-model';
import { ProjectsSelector } from './components/ProjectsSelector';
import { ProjectsList } from './components/ProjectsList';
import { ProjectForm } from './components/ProjectForm';

interface ProjectsPageProps {
  merchantId: string;
}

export default function ProjectsPage({ merchantId }: ProjectsPageProps) {
  const router = useRouter();

  const presenter = useMemo(() => {
    const presenter = container.get<ProjectsPresenter>(PROJECT_TYPES.ProjectsPresenter);
    presenter.initializeForMerchant(merchantId);
    return presenter;
  }, [merchantId]);

  const [viewModel, setViewModel] = useState<ProjectsPageViewModel>(presenter.viewModel);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [isSelectingProject, setIsSelectingProject] = useState(false);

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setViewModel);
    return unsubscribe;
  }, [presenter]);

  const handleProjectSelect = async (projectId: string) => {
    // Показать loading
    setIsSelectingProject(true);

    try {
      const selectedProject = await presenter.selectProject(projectId);

      if (selectedProject) {
        // Перенаправить в Analytics с appId в query
        // Не сбрасываем loading - компонент размонтируется при навигации
        router.push(`/merchant-admin/analytics/dashboard?appId=${selectedProject.appId.value}`);
      } else {
        // Если проект не найден, сбросить loading
        setIsSelectingProject(false);
      }
    } catch (error) {
      console.error('Failed to select project:', error);
      // В случае ошибки сбросить loading
      setIsSelectingProject(false);
    }
  };

  const handleCreateProject = async (formData: { name: string; description: string }) => {
    // Generate App ID automatically from project name
    const generatedAppId = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_') // Replace non-alphanumeric with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

    await presenter.createProject(formData.name, generatedAppId, formData.description);
    setShowCreateForm(false);
  };

  const handleUpdateProject = async (formData: { name: string; description: string }) => {
    if (editingProject) {
      await presenter.updateProject(editingProject, formData.name, formData.description);
      setEditingProject(null);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProject(null);
  };

  const editingProjectData = editingProject
    ? viewModel.projects.find(p => p.id === editingProject)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                Projects
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Manage your applications and switch between active projects
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                text-white font-medium rounded-lg shadow-sm transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                hover:shadow-md hover:scale-105
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{viewModel.projects.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Project</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {viewModel.activeProject?.name || 'None selected'}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quick Actions</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create, edit, or switch projects</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {viewModel.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Error loading projects
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {viewModel.error}
                </p>
              </div>
              <button
                onClick={() => presenter.clearError()}
                className="ml-3 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showCreateForm || editingProject ? (
          /* Create/Edit Form */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {editingProject ? 'Update project details' : 'Set up a new application project'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ProjectForm
                project={editingProjectData}
                onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                onCancel={handleCancelForm}
                isSubmitting={viewModel.isCreating || viewModel.isUpdating}
                submitLabel={editingProject ? 'Update Project' : 'Create Project'}
              />
            </div>
          </div>
        ) : (
          /* Projects Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Projects</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {viewModel.projects.length} project{viewModel.projects.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {viewModel.projects.length === 0 ? (
              /* Empty State */
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No projects yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  Get started by creating your first project. Projects help you organize different applications and environments.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Project
                </button>
              </div>
            ) : (
              /* Projects Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {viewModel.projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`
                      bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer
                      ${viewModel.activeProject?.id === project.id
                        ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg'
                      }
                    `}
                    title={`Click to ${viewModel.activeProject?.id === project.id ? 'keep active' : 'activate'} ${project.name}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {project.name}
                            </h3>
                            {viewModel.activeProject?.id === project.id && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Active
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            ID: {project.appId}
                          </p>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      {viewModel.activeProject?.id !== project.id && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
                          Click to activate this project
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            setEditingProject(project.id);
                          }}
                          className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 rounded-lg transition-colors"
                          title="Edit project"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading overlay when selecting project */}
        {isSelectingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Selecting Project
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Please wait while we set up your project...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}