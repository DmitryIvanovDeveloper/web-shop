'use client';

import { useEffect, useState } from 'react';
import { container } from '@/infrastructure/bootstrap/container';
import { UI_BUILDER_TYPES } from '@/modules/ui-builder/infrastructure/bootstrap/types';
import type { TemplatesGrapePresenter } from '@/modules/ui-builder/interface-adapters/presenters/templates-grape.presenter';
import type { TemplatesGrapeViewModel } from '@/modules/ui-builder/interface-adapters/presenters/templates-grape.presenter';

export function TemplatesGrapeList() {
  const [vm, setVm] = useState<TemplatesGrapeViewModel | null>(null);
  const [presenter] = useState(() =>
    container.get<TemplatesGrapePresenter>(UI_BUILDER_TYPES.TemplatesGrapePresenter)
  );

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setVm);
    presenter.loadTemplates();
    return unsubscribe;
  }, [presenter]);

  if (!vm) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (vm.isLoadingList) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{vm.error}</p>
          <button
            onClick={() => presenter.loadTemplates()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GrapeJS Templates</h2>
          <p className="text-gray-600 mt-1">Browse and select templates for your store</p>
        </div>
        <button
          onClick={() => presenter.loadTemplates()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {vm.templates.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vm.templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-5 cursor-pointer transition-all ${
                vm.selectedTemplateId === template.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => presenter.selectTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 flex-1">{template.name}</h3>
                {vm.selectedTemplateId === template.id && (
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {template.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
              )}
              {template.updatedAt && (
                <p className="text-gray-400 text-xs">
                  Updated: {template.updatedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {vm.selectedTemplate && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Selected: {vm.selectedTemplate.name}
            </h3>
            <button
              onClick={() => presenter.clearSelection()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {vm.isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading template details...</span>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-700 mb-2">Template Data:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Pages: {vm.selectedTemplate.templateData.pages?.length ?? 0} | 
                  Styles: {vm.selectedTemplate.templateData.styles?.length ?? 0}
                </p>
              </div>
              <details className="group">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium mb-2">
                  View JSON
                </summary>
                <pre className="bg-white border rounded p-4 overflow-auto max-h-96 text-xs">
                  {JSON.stringify(vm.selectedTemplate.templateData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
